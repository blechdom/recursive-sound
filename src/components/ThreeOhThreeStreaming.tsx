import useDevice from "@/hooks/useDevice";
import dynamic from "next/dynamic";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import compute from "@/shaders/threeOhThreeStreaming/compute.wgsl";
import styled from "styled-components";

const KnobParamLabel = dynamic(() => import("el-vis-audio").then((mod) => mod.KnobParamLabel), {ssr: false});

const chunkDurationInSeconds = 1;
const numChannels = 2; // currently only two channels allowed (shader uses vec2)
const workgroupSize = 256;
const maxBufferedChunks = 2;

const ThreeOhThreeStreaming = () => {
  const [audioContext, setAudioContext] = useState<AudioContext | undefined>(undefined);
  const [playing, setPlaying] = useState(false);
  const [startTime, setStartTime] = useState(0.0);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [partials, setPartials] = useState(256);
  const [frequency, setFrequency] = useState(38);
  const [timeMod, setTimeMod] = useState(16);
  const [timeScale, setTimeScale] = useState(9);
  const [gain, setGain] = useState(0.7);
  const [dist, setDist] = useState(0.5);
  const [dur, setDur] = useState(0.26);
  const [ratio, setRatio] = useState(2);
  const [sampOffset, setSampOffset] = useState(1);
  const [fundamental, setFundamental] = useState(440);
  const [stereo, setStereo] = useState(0.01);
  const [nse, setNse] = useState(19871.8972);
  const [res, setRes] = useState(2.2);
  const [lfo, setLfo] = useState(1);
  const [flt, setFlt] = useState(-1.5);
  const {device} = useDevice()

  function handleReset() {
    setPartials(256);
    setFrequency(38);
    setTimeMod(16);
    setTimeScale(9);
    setGain(0.7);
    setDist(0.5);
    setDur(0.26);
    setRatio(2);
    setSampOffset(1);
    setFundamental(440);
    setStereo(0.01);
    setNse(19871.8972);
    setRes(2.2);
    setLfo(1);
    setFlt(-1.5);
  }

  useEffect(() => {
    if (playing) {
      startMakingSound();
    } else {
      stopMakingSound();
    }

    async function startMakingSound() {
      if (typeof window !== 'undefined') {
        setAudioContext(await new AudioContext());
        setStartTime(performance.now() / 1000.0);
      }
    }

    async function stopMakingSound() {
      if (audioContext) await audioContext.suspend();
      if (audioContext) await audioContext.close();
      if (timeoutId) clearTimeout(timeoutId);
      setTimeoutId(null);
      setAudioContext(undefined);
    }
  }, [playing]);

  useEffect(() => {
    if(audioContext?.state === 'running') {
      createSoundChunk(0);
    }
  }, [audioContext]);

  const chunkNumSamplesPerChannel: number | undefined = useMemo(() => {
    if (!audioContext || !chunkDurationInSeconds) return;
    return audioContext.sampleRate * chunkDurationInSeconds;
  }, [audioContext, chunkDurationInSeconds]);


  const {chunkNumSamples, audioBuffer}: {
    chunkNumSamples: number | undefined;
    audioBuffer: AudioBuffer | undefined
  } = useMemo(() => {
    let buffer;
    let chunkSamps;
    if (audioContext && chunkNumSamplesPerChannel) {
      chunkSamps = numChannels * chunkNumSamplesPerChannel;
      buffer = audioContext.createBuffer(
        numChannels,
        chunkNumSamplesPerChannel,
        audioContext.sampleRate
      );
    }
    return {
      chunkNumSamples: chunkSamps,
      audioBuffer: buffer
    };
  }, [audioContext, chunkNumSamplesPerChannel]);

  const channels: Float32Array[] = useMemo(() => {
    if (!audioBuffer) return [];
    return [...Array(numChannels)].map((_, i) => audioBuffer.getChannelData(i));
  }, [audioBuffer]);

  const chunkBufferSize: number | undefined = useMemo(() => {
    if (!chunkNumSamples) return;
    return Float32Array.BYTES_PER_ELEMENT * chunkNumSamples;
  }, [chunkNumSamples]);

  const {chunkBuffer, chunkMapBuffer, timeInfoBuffer, audioParamBuffer}: {
    chunkBuffer: GPUBuffer | undefined;
    chunkMapBuffer: GPUBuffer | undefined;
    timeInfoBuffer: GPUBuffer | undefined;
    audioParamBuffer: GPUBuffer | undefined;
  } = useMemo(() => {
    if (!device || !chunkBufferSize) {
      return {chunkBuffer: undefined, chunkMapBuffer: undefined, timeInfoBuffer: undefined, audioParamBuffer: undefined};
    }
    return {
      chunkBuffer: device.createBuffer({
        size: chunkBufferSize,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
      }),
      chunkMapBuffer: device.createBuffer({
        size: chunkBufferSize,
        usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
      }),
      timeInfoBuffer: device.createBuffer({
        size: Float32Array.BYTES_PER_ELEMENT * 1,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
      }),
      audioParamBuffer: device.createBuffer({
        size: Float32Array.BYTES_PER_ELEMENT * 15,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
      })
    };
  }, [device, chunkBufferSize]);


  const {pipeline, bindGroup}: {
    pipeline: GPUComputePipeline | undefined;
    bindGroup: GPUBindGroup | undefined
  } = useMemo(() => {
    if (!device || !audioContext || !workgroupSize || !timeInfoBuffer || !chunkBuffer || !audioParamBuffer) {
      return {pipeline: undefined, bindGroup: undefined};
    }
    const audioShaderModule = device.createShaderModule({
      label: "Audio shader",
      code: compute
    });

    const pipeline = device.createComputePipeline({
      layout: 'auto',
      compute: {
        module: audioShaderModule,
        entryPoint: 'synthesize',
        constants: {
          SAMPLING_RATE: audioContext.sampleRate,
          WORKGROUP_SIZE: workgroupSize
        }
      }
    });

    const bindGroup = device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries: [
        {binding: 0, resource: {buffer: timeInfoBuffer}},
        {binding: 1, resource: {buffer: chunkBuffer}},
        {binding: 2, resource: {buffer: audioParamBuffer}}
      ]
    });
    return {pipeline, bindGroup};
  }, [device, audioContext, workgroupSize, timeInfoBuffer, chunkBuffer, audioParamBuffer]);

  const createSoundChunk = useCallback(async (chunkTime: number) => {

    if (!audioContext || audioContext.state === "closed" || !chunkBuffer || !chunkMapBuffer || !timeInfoBuffer || !pipeline || !bindGroup || !chunkNumSamplesPerChannel || !chunkNumSamples || !chunkBufferSize) return;
    const bufferedSeconds = (startTime + chunkTime) - (performance.now() / 1000.0);
    const numBufferedChunks = Math.floor(bufferedSeconds / chunkDurationInSeconds);
    if (numBufferedChunks > maxBufferedChunks) {
      setTimeoutId(setTimeout(async function () {
        await createSoundChunk(chunkTime)
      }, chunkDurationInSeconds * 1000.0));
      return;
    }
    device.queue.writeBuffer(timeInfoBuffer, 0, new Float32Array([chunkTime]));

    const commandEncoder = device.createCommandEncoder();

    const pass = commandEncoder.beginComputePass();
    pass.setPipeline(pipeline);
    pass.setBindGroup(0, bindGroup);
    pass.dispatchWorkgroups(
      Math.ceil(chunkNumSamplesPerChannel / workgroupSize)
    );
    pass.end();

    commandEncoder.copyBufferToBuffer(chunkBuffer, 0, chunkMapBuffer, 0, chunkBufferSize);

    device.queue.submit([commandEncoder.finish()]);

    await chunkMapBuffer.mapAsync(GPUMapMode.READ, 0, chunkBufferSize);

    const chunkData = new Float32Array(chunkNumSamples);
    chunkData.set(new Float32Array(chunkMapBuffer.getMappedRange()));
    chunkMapBuffer.unmap();

    await playChunk(chunkTime, chunkData);
  }, [audioContext, device, chunkBuffer, chunkBufferSize, chunkMapBuffer, pipeline, timeInfoBuffer, bindGroup, chunkNumSamplesPerChannel, workgroupSize, chunkNumSamples]);

  async function playChunk(chunkTime: number, chunkData: Float32Array) {
    if (!audioBuffer || audioContext?.state === "closed" || !chunkData || !audioContext) return;
    for (let i = 0; i < audioBuffer.length; ++i) {
      for (const [offset, channel] of channels.entries()) {
        channel[i] = chunkData[i * numChannels + offset];
      }
    }
    let audioSource = audioContext.createBufferSource();
    audioSource.buffer = audioBuffer;

    // if(chunkTime !== 0.0) { // start playing on 2nd chunk to avoid 2nd chunk glitch...
    audioSource.connect(audioContext.destination);
    audioSource.start(chunkTime);
    audioSource.onended = () => {
      audioSource.disconnect();
    }
    await createSoundChunk(chunkTime + audioSource.buffer.duration);
  }

  useEffect(() => {
    if (!audioParamBuffer || !device) return;
    device.queue.writeBuffer(audioParamBuffer, 0, new Float32Array([partials, frequency, timeMod, timeScale, gain, dist, dur, ratio, sampOffset, fundamental, stereo, nse, res, lfo, flt]));
  }, [device, audioParamBuffer, partials, frequency, timeScale, timeMod, gain, dist, dur, ratio, sampOffset, fundamental, stereo, nse, res, lfo, flt]);


  return (
    <>
      <h3>This synth requires <a
        href="chrome://flags/#enable-webgpu-developer-features">chrome://flags/#enable-webgpu-developer-features</a> flag
        to be enabled</h3>
      You may need to copy/paste the chrome flags URL into the searchbar and restart chrome, then return to this page.
      If you lose control, refresh the page.<br/><br/>
      <button onClick={() => setPlaying(!playing)}><h2>{playing ? "STOP" : "PLAY"} 303 EMULATOR FROM WEBGPU</h2>
      </button>
      <KnobsFlexBox>
        <KnobParamLabel
          label={"gain"}
          knobValue={gain}
          step={0.01}
          min={0.0}
          max={1.0}
          onKnobInput={setGain}
        />
        <KnobParamLabel
          id={"fundamental"}
          label={"fund"}
          knobValue={fundamental}
          step={0.01}
          min={1}
          max={1000}
          onKnobInput={setFundamental}
        />
        <KnobParamLabel
          id={"frequencyScale"}
          label={"freqScale"}
          knobValue={frequency}
          step={0.01}
          min={.2}
          max={100}
          onKnobInput={setFrequency}
        />
        <KnobParamLabel
          id={"partials"}
          label={"partials"}
          knobValue={partials}
          step={1}
          min={1}
          max={256}
          onKnobInput={setPartials}
        />
        <KnobParamLabel
          id={"ratio"}
          label={"ratio"}
          knobValue={ratio}
          step={0.1}
          min={1}
          max={32}
          onKnobInput={setRatio}
        />
        <KnobParamLabel
          id={"sampOffset"}
          label={"sampOffset"}
          knobValue={sampOffset}
          step={1}
          min={1}
          max={32}
          onKnobInput={setSampOffset}
        />
        <KnobParamLabel
          id={"dist"}
          label={"dist"}
          knobValue={dist}
          step={0.01}
          min={0.01}
          max={5}
          onKnobInput={setDist}
        />
        <KnobParamLabel
          id={"lfo"}
          label={"lfo"}
          knobValue={lfo}
          step={0.01}
          min={0}
          max={64}
          onKnobInput={setLfo}
        />
        <KnobParamLabel
          id={"flt"}
          label={"flt"}
          knobValue={flt}
          step={0.01}
          min={-64}
          max={64}
          onKnobInput={setFlt}
        />
        <KnobParamLabel
          id={"res"}
          label={"res"}
          knobValue={res}
          step={0.01}
          min={0}
          max={15}
          onKnobInput={setRes}
        />
        <KnobParamLabel
          id={"dur"}
          label={"dur"}
          knobValue={dur}
          step={0.001}
          min={0.001}
          max={2}
          onKnobInput={setDur}
        />
        <KnobParamLabel
          id={"timeMod"}
          label={"timeMod"}
          knobValue={timeMod}
          step={1}
          min={1}
          max={32}
          onKnobInput={setTimeMod}
        />
        <KnobParamLabel
          id={"nse"}
          label={"nse"}
          knobValue={nse}
          step={0.001}
          min={0}
          max={40000}
          onKnobInput={setNse}
        />
        <KnobParamLabel
          id={"stereo"}
          label={"stereo"}
          knobValue={stereo}
          step={0.001}
          min={-8}
          max={8}
          onKnobInput={setStereo}
        />
        <KnobParamLabel
          id={"timeScale"}
          label={"timeScale"}
          knobValue={timeScale}
          step={0.01}
          min={0.01}
          max={48}
          onKnobInput={setTimeScale}
        />
      </KnobsFlexBox>
      <br/>
      <button onClick={handleReset}>RESET PARAMS</button>

    </>
  )
}

const KnobsFlexBox = styled.div`
  // justify-content: space-evenly;
  display: flex;
  flex-wrap: wrap;
  gap: 25px;
  flex-direction: row;
  margin: 15px;
  padding: 15px;
  border: 2px solid #ff0000;
`;

export default ThreeOhThreeStreaming;


