import useDevice from "@/hooks/useDevice";
import dynamic from "next/dynamic";
import React, {useEffect, useState} from "react";
import compute from "@/shaders/threeOhThree/compute.wgsl";
import {audioContext} from "@/utils/audio/audioTools";
import styled from "styled-components";

const KnobParamLabel = dynamic(() => import("el-vis-audio").then((mod) => mod.KnobParamLabel), {ssr: false});

const chunkDurationSeconds = 0.15;
const numChannels = 2; // currently only two channels allowed (shader uses vec2)
const workgroupSize = 256;
const maxBufferedChunks = 1;

const ThreeOhThree = () => {
  const [playing, setPlaying] = useState(false);
  const [audioParamBuffer, setAudioParamBuffer] = useState<GPUBuffer>();
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
  const {adapter, device} = useDevice()

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
  }

  if (numChannels !== 2) {
    throw new Error('Currently the number of channels has to be 2, sorry :/');
  }

  useEffect(() => {
    if (!audioContext || !adapter || !device) return;
    const audioCtx = audioContext;

    async function playSound() {

      const chunkNumSamplesPerChannel = audioCtx.sampleRate * chunkDurationSeconds;
      const chunkNumSamples = numChannels * chunkNumSamplesPerChannel;
      const chunkBufferSize = Float32Array.BYTES_PER_ELEMENT * chunkNumSamples;
      const chunkBuffer = device.createBuffer({
        size: chunkBufferSize,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
      });

      const chunkMapBuffer = device.createBuffer({
        size: chunkBufferSize,
        usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
      });

      const timeInfoBuffer = device.createBuffer({
        size: Float32Array.BYTES_PER_ELEMENT * 1,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
      });

      const audioParamBuffer = device.createBuffer({
        size: Float32Array.BYTES_PER_ELEMENT * 10,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
      });

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
            SAMPLING_RATE: audioCtx.sampleRate,
            WORKGROUP_SIZE: workgroupSize,
          }
        }
      });

      const bindGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [
          {binding: 0, resource: {buffer: timeInfoBuffer}},
          {binding: 1, resource: {buffer: chunkBuffer}},
          {binding: 2, resource: {buffer: audioParamBuffer}},
        ]
      });

      setAudioParamBuffer(audioParamBuffer);

      const startTime = performance.now() / 1000.0;
      let nextChunkOffset = 0.0;

      async function createSongChunk() {
        const bufferedSeconds = (startTime + nextChunkOffset) - (performance.now() / 1000.0);
        const numBufferedChunks = Math.floor(bufferedSeconds / chunkDurationSeconds);
        if (numBufferedChunks > maxBufferedChunks) {
          const timeout = chunkDurationSeconds * 0.9;
          setTimeout(createSongChunk, timeout * 1000.0);
          return;
        }

        device.queue.writeBuffer(timeInfoBuffer, 0, new Float32Array([nextChunkOffset]));

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

        const audioBuffer = audioCtx.createBuffer(
          numChannels,
          chunkNumSamplesPerChannel,
          audioCtx.sampleRate
        );

        const channels = [];
        for (let i = 0; i < numChannels; ++i) {
          channels.push(audioBuffer.getChannelData(i));
        }

        for (let i = 0; i < audioBuffer.length; ++i) {
          for (const [offset, channel] of channels.entries()) {
            channel[i] = chunkData[i * numChannels + offset];
          }
        }

        const audioSource = audioCtx.createBufferSource();
        audioSource.buffer = audioBuffer;
        audioSource.connect(audioCtx.destination);

        audioSource.start(nextChunkOffset);

        nextChunkOffset += audioSource.buffer.duration;
        await createSongChunk();
      }

      createSongChunk();
    }
    if (playing) {
     audioCtx.resume().then(() => {
       playSound();
     })
    } else {
      audioCtx.suspend();
    }

  }, [audioContext, device, adapter, playing])

  useEffect(() => {
    if (!audioParamBuffer || !device) return;
    device.queue.writeBuffer(audioParamBuffer, 0, new Float32Array([partials, frequency, timeMod, timeScale, gain, dist, dur, ratio, sampOffset, fundamental]));
  }, [device, audioParamBuffer, partials, frequency, timeScale, timeMod, gain, dist, dur, ratio, sampOffset, fundamental]);

  return (
    <>
      <button onClick={() => setPlaying(!playing)}>{playing ? "STOP" : "PLAY"} 303 EMULATOR FROM WEBGPU</button>
      <KnobsFlexBox>
        <KnobParamLabel
          id={"gain"}
          label={"gain"}
          knobValue={gain}
          step={0.01}
          min={0.0}
          max={1.0}
          onKnobInput={setGain}
        />
        <KnobParamLabel
          id={"fundamental"}
          label={"fundamental"}
          knobValue={fundamental}
          step={0.01}
          min={1}
          max={1000}
          onKnobInput={setFundamental}
        />
        <KnobParamLabel
          id={"frequencyScale"}
          label={"frequencyScale"}
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
          id={"dur"}
          label={"dur"}
          knobValue={dur}
          step={0.001}
          min={0.001}
          max={2}
          onKnobInput={setDur}
        />
        <KnobParamLabel
          id={"timeScale"}
          label={"timeScale"}
          knobValue={timeScale}
          step={0.01}
          min={0.01}
          max={24}
          onKnobInput={setTimeScale}
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
      </KnobsFlexBox>
      <br/>
      <button onClick={handleReset}>RESET PARAMS</button>
    </>
  )
}

const KnobsFlexBox = styled.div`
  justify-content: space-evenly;
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  padding: 10px;
  border: 2px solid #ff0000;
`;

export default ThreeOhThree