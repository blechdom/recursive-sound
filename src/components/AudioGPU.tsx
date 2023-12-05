import useDevice from "@/hooks/useDevice";
import {useCallback, useEffect, useMemo, useState} from "react";
import compute from "@/shaders/audioGPU/compute.wgsl";
import { AudioGPUEngine } from "@/utils/AudioGPUEngine";

const numChannels = 2; //(shader uses vec2: x = left, y = right)
const workgroupSize = 256;
const chunkDurationInSeconds = .15;
const maxBufferedChunks = 1;

const AudioGPU = () => {
  const [audioContext, setAudioContext] = useState<AudioContext | undefined>(undefined);
  const [playing, setPlaying] = useState(false);
  const [sampleRate, setSampleRate] = useState(44100);
  const [startTime, setStartTime] = useState(0.0);
  const [nextChunkOffset, setNextChunkOffset] = useState(-1);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [engine, setEngine] = useState<any>();
  const {device} = useDevice();

  useEffect(() => {
    if (playing) {
      startMakingSound();
    } else {
      stopMakingSound();
    }

    async function startMakingSound() {
      if (typeof window !== 'undefined') {
        setAudioContext(await new AudioContext({sampleRate}));
        setEngine(new AudioGPUEngine(
          2,
          sampleRate,
          workgroupSize,
          chunkDurationInSeconds,
          device,
          compute,
          'synthesize'
        ));
        setStartTime(performance.now() / 1000.0);
        setNextChunkOffset(0);
      }
    }

    async function stopMakingSound() {
      if (audioContext) await audioContext.suspend();
      if (audioContext) await audioContext.close();
      if (timeoutId) clearTimeout(timeoutId);
      setTimeoutId(null);
      setAudioContext(undefined);
      setEngine(undefined);
    }
  }, [playing, sampleRate]);

  const audioBuffer: AudioBuffer | undefined = useMemo(() => {
    if (audioContext && engine?.chunkNumSamplesPerChannel) {
      return audioContext.createBuffer(
        numChannels,
        engine.chunkNumSamplesPerChannel,
        audioContext.sampleRate
      );
    }
  }, [audioContext, engine]);

  const channels: Float32Array[] = useMemo(() => {
    if (!audioBuffer) return [];
    return [...Array(numChannels)].map((_, i) => audioBuffer.getChannelData(i));
  }, [audioBuffer]);

  useEffect(() => {
    if(nextChunkOffset >= 0.0) {
      const chunkTime = nextChunkOffset;
      const bufferedSeconds = (startTime + nextChunkOffset) - (performance.now() / 1000.0);
      const numBufferedChunks = Math.floor(bufferedSeconds / chunkDurationInSeconds);
      if (numBufferedChunks > maxBufferedChunks) {
        setTimeoutId(setTimeout(async function () {
          await createSoundChunk(chunkTime)
        }, chunkDurationInSeconds * 1000.0));
        return;
      }
      createSoundChunk(chunkTime);
    }
  }, [nextChunkOffset])

  const createSoundChunk = useCallback(async(chunkTime: number) => {
    console.log("chunktime ", chunkTime);
    console.log('audioContext', audioContext);
    if (!audioContext || audioContext.state === "closed" || !engine?.chunkBuffer || !engine?.chunkMapBuffer || !engine?.timeInfoBuffer || !engine?.pipeline || !engine?.bindGroup || !engine?.chunkNumSamplesPerChannel || !engine?.chunkNumSamples || !engine?.chunkBufferSize) return;
    console.log("past the check");
    device.queue.writeBuffer(engine?.timeInfoBuffer, 0, new Float32Array([chunkTime]));

    const commandEncoder = device.createCommandEncoder();

    const pass = commandEncoder.beginComputePass();
    pass.setPipeline(engine.pipeline);
    pass.setBindGroup(0, engine.bindGroup);
    console.log("dispatching workgroups", engine.chunkNumSamplesPerChannel, workgroupSize, Math.ceil(engine.chunkNumSamplesPerChannel / workgroupSize));
    pass.dispatchWorkgroups(
      Math.ceil(engine.chunkNumSamplesPerChannel / workgroupSize)
    );
    pass.end();

    commandEncoder.copyBufferToBuffer(engine.chunkBuffer, 0, engine.chunkMapBuffer, 0, engine.chunkBufferSize);

    device.queue.submit([commandEncoder.finish()]);

    await engine.chunkMapBuffer.mapAsync(GPUMapMode.READ, 0, engine.chunkBufferSize);

    const chunkData = new Float32Array(engine?.chunkNumSamples);
    chunkData.set(new Float32Array(engine.chunkMapBuffer.getMappedRange()));
    engine.chunkMapBuffer.unmap();

    playChunk(chunkTime, chunkData);
  }, [audioContext, device, engine?.chunkBuffer, engine?.chunkBufferSize, engine?.chunkMapBuffer, engine?.pipeline, engine?.timeInfoBuffer, engine?.bindGroup, engine?.chunkNumSamplesPerChannel, workgroupSize, engine?.chunkNumSamples]);

  function playChunk(chunkTime: number, chunkData: Float32Array) {
    if (!audioBuffer || audioContext?.state === "closed" || !chunkData || !audioContext) return;
    for (let i = 0; i < audioBuffer.length; ++i) {
      for (const [offset, channel] of channels.entries()) {
        channel[i] = chunkData[i * numChannels + offset];
      }
    }
    let audioSource = audioContext.createBufferSource();
    audioSource.buffer = audioBuffer;

    setNextChunkOffset(chunkTime + audioSource.buffer.duration);
    if(chunkTime !== 0.0) { // start playing on 2nd chunk to avoid 2nd chunk glitch...
    audioSource.connect(audioContext.destination);
    audioSource.start(chunkTime);
    audioSource.onended = () => {
      audioSource.disconnect();
    }
      }
  }

  return (
    <>
      <h1>Audio GPU Demo</h1>
      <h3>This synth requires <a href="chrome://flags/#enable-webgpu-developer-features">chrome://flags/#enable-webgpu-developer-features</a> flag to be enabled</h3>
      You may need to copy/paste the chrome flags URL into the searchbar and restart chrome, then return to this page. If you lose control, refresh the page.<br /><br />
      <button onClick={() => setPlaying(!playing)}><h2>{playing ? "STOP" : "PLAY"} 303 EMULATOR FROM WEBGPU</h2></button>

    </>
  )
}

export default AudioGPU;


