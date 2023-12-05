import useDevice from "@/hooks/useDevice";
import {useCallback, useEffect, useMemo, useState} from "react";
import compute from "@/shaders/sineTest/compute.wgsl";

const numChannels = 2; //(shader uses vec2: x = left, y = right)

const SineTestGPU = () => {
  const [audioContext, setAudioContext] = useState<AudioContext | undefined>(undefined);
  const [playing, setPlaying] = useState(false);
  const [chunkDurationInSeconds, setChunkDurationInSeconds] = useState(.05);
  const [maxBufferedChunks, setMaxBufferedChunks] = useState(4);
  const [workgroupSize, setWorkgroupSize] = useState({ x: 256, y: 1, z: 1 });
  const [sampleRate, setSampleRate] = useState(44100);
  const [startTime, setStartTime] = useState(0.0);
  const [nextChunkOffset, setNextChunkOffset] = useState(-1);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
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
    }
  }, [playing, sampleRate]);

  const chunkNumSamplesPerChannel: number | undefined = useMemo(() => {
    if (!audioContext || !chunkDurationInSeconds) return;
    return audioContext.sampleRate * chunkDurationInSeconds;
  }, [audioContext, chunkDurationInSeconds]);


  const { chunkNumSamples, audioBuffer }: { chunkNumSamples: number | undefined; audioBuffer: AudioBuffer | undefined } = useMemo(() => {
    let buffer; let chunkSamps;
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

  const { chunkBuffer, chunkMapBuffer, timeInfoBuffer }: { chunkBuffer: GPUBuffer | undefined; chunkMapBuffer: GPUBuffer | undefined; timeInfoBuffer: GPUBuffer | undefined } = useMemo(() => {
    if (!device || !chunkBufferSize) {
      return { chunkBuffer: undefined, chunkMapBuffer: undefined, timeInfoBuffer: undefined };
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
    };
  }, [device, chunkBufferSize]);


  const { pipeline, bindGroup }: { pipeline: GPUComputePipeline | undefined; bindGroup: GPUBindGroup | undefined } = useMemo(() => {
    if (!device || !audioContext || !workgroupSize || !timeInfoBuffer || !chunkBuffer) {
      return { pipeline: undefined, bindGroup: undefined };
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
          WORKGROUP_SIZE_X: workgroupSize.x,
          WORKGROUP_SIZE_Y: workgroupSize.y,
          WORKGROUP_SIZE_Z: workgroupSize.z,
        }
      }
    });

    const bindGroup = device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries: [
        {binding: 0, resource: {buffer: timeInfoBuffer}},
        {binding: 1, resource: {buffer: chunkBuffer}},
      ]
    });
    return { pipeline, bindGroup };
  }, [device, audioContext, workgroupSize, timeInfoBuffer, chunkBuffer]);

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
    if (!audioContext || audioContext.state === "closed" || !chunkBuffer || !chunkMapBuffer || !timeInfoBuffer || !pipeline || !bindGroup || !chunkNumSamplesPerChannel || !chunkNumSamples || !chunkBufferSize) return;
    device.queue.writeBuffer(timeInfoBuffer, 0, new Float32Array([chunkTime]));

    const commandEncoder = device.createCommandEncoder();

    const pass = commandEncoder.beginComputePass();
    pass.setPipeline(pipeline);
    pass.setBindGroup(0, bindGroup);
    pass.dispatchWorkgroups(
      Math.ceil(chunkNumSamplesPerChannel / workgroupSize.x)
    );
    pass.end();

    commandEncoder.copyBufferToBuffer(chunkBuffer, 0, chunkMapBuffer, 0, chunkBufferSize);

    device.queue.submit([commandEncoder.finish()]);

    await chunkMapBuffer.mapAsync(GPUMapMode.READ, 0, chunkBufferSize);

    const chunkData = new Float32Array(chunkNumSamples);
    chunkData.set(new Float32Array(chunkMapBuffer.getMappedRange()));
    chunkMapBuffer.unmap();

    playChunk(chunkTime, chunkData);
  }, [audioContext, device, chunkBuffer, chunkBufferSize, chunkMapBuffer, pipeline, timeInfoBuffer, bindGroup, chunkNumSamplesPerChannel, workgroupSize, chunkNumSamples]);

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
    // if(chunkTime !== 0.0) { // start playing on 2nd chunk to avoid 2nd chunk glitch...
    audioSource.connect(audioContext.destination);
    audioSource.start(chunkTime);
    audioSource.onended = () => {
      audioSource.disconnect();
    }
  }

  return (
    <>
      <h3>This synth requires <a href="chrome://flags/#enable-webgpu-developer-features">chrome://flags/#enable-webgpu-developer-features</a> flag to be enabled</h3>
      You may need to copy/paste the chrome flags URL into the searchbar and restart chrome, then return to this page. If you lose control, refresh the page.<br /><br />
      <button onClick={() => setPlaying(!playing)}><h2>{playing ? "STOP" : "PLAY"} 303 EMULATOR FROM WEBGPU</h2></button>

    </>
  )
}

export default SineTestGPU;


