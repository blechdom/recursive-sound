import useDevice from "@/hooks/useDevice";
import {useCallback, useEffect, useMemo, useState} from "react";
import compute from "@/shaders/shepard/compute.wgsl";

const numChannels = 2; //(shader uses vec2: x = left, y = right)

const SineTestGPU = () => {
  const [playing, setPlaying] = useState(false);
  const [chunkDurationInSeconds, setChunkDurationInSeconds] = useState(2);
  const [maxBufferedChunks, setMaxBufferedChunks] = useState(8);
  const [workgroupSize, setWorkgroupSize] = useState(256);
  const [sampleRate, setSampleRate] = useState(44100);
  const [startTime, setStartTime] = useState(0.0);
  const [nextChunkOffset, setNextChunkOffset] = useState(0.0);
  const {adapter, device} = useDevice();

  const audioContext: AudioContext | undefined = useMemo(() => {
    if (typeof window !== 'undefined') {
      return new AudioContext({sampleRate});
    }
  }, [sampleRate]);

  const chunkNumSamplesPerChannel: number | undefined = useMemo(() => {
    if (!audioContext || !chunkDurationInSeconds) return;
    return audioContext.sampleRate * chunkDurationInSeconds;
  }, [audioContext, chunkDurationInSeconds]);

  const chunkNumSamples: number | undefined = useMemo(() => {
    if (!chunkNumSamplesPerChannel) return;
    return numChannels * chunkNumSamplesPerChannel;
  }, [chunkNumSamplesPerChannel]);

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
          WORKGROUP_SIZE: workgroupSize,
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
    if (!audioContext) return;
    if (playing) {
      audioContext.resume().then(() => {
        setStartTime(performance.now() / 1000.0);
        setNextChunkOffset(0.0);
      })
    } else {
      audioContext.suspend();
    }

  }, [audioContext, device, adapter, playing, chunkBuffer, chunkMapBuffer, pipeline, timeInfoBuffer, bindGroup, chunkNumSamplesPerChannel, workgroupSize, chunkBufferSize, chunkNumSamples]);

  useEffect(() => {
    if (!audioContext) return;
    let startTime = performance.now() / 1000.0;
    let nextChunkOffset = 0.0;

      async function createSongChunk() {
        if (!audioContext || !playing || !chunkBuffer || !chunkMapBuffer || !timeInfoBuffer || !pipeline || !bindGroup || !chunkNumSamplesPerChannel || !chunkNumSamples) return;

        const bufferedSeconds = (startTime + nextChunkOffset) - (performance.now() / 1000.0);
        const numBufferedChunks = Math.floor(bufferedSeconds / chunkDurationInSeconds);
        if (numBufferedChunks > maxBufferedChunks) {
          const timeout = chunkDurationInSeconds * 0.9;
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
        console.log("is this where the sync is happening?");

        const chunkData = new Float32Array(chunkNumSamples);
        chunkData.set(new Float32Array(chunkMapBuffer.getMappedRange()));
        chunkMapBuffer.unmap();

        const audioBuffer = audioContext.createBuffer(
          numChannels,
          chunkNumSamplesPerChannel,
          audioContext.sampleRate
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

        const audioSource = audioContext.createBufferSource();
        audioSource.buffer = audioBuffer;
        audioSource.connect(audioContext.destination);

        audioSource.start(nextChunkOffset);

        nextChunkOffset += audioSource.buffer.duration;
        console.log("nextChunkOffset", nextChunkOffset);
        console.log('playing', playing);
        if (playing) await createSongChunk();
      }

    if (playing) {
     audioContext.resume().then(() => {
       startTime = performance.now() / 1000.0;
       nextChunkOffset = 0.0;
       createSongChunk();
     })
    } else {
      audioContext.suspend();
    }

  }, [audioContext, device, adapter, playing, chunkBuffer, chunkMapBuffer, pipeline, timeInfoBuffer, bindGroup, chunkNumSamplesPerChannel, workgroupSize, chunkBufferSize, chunkNumSamples]);

  return (
    <>
      <h3>This synth requires <a href="chrome://flags/#enable-webgpu-developer-features">chrome://flags/#enable-webgpu-developer-features</a> flag to be enabled</h3>
      You may need to copy/paste the chrome flags URL into the searchbar and restart chrome, then return to this page. If you lose control, refresh the page.<br /><br />
      <button onClick={() => setPlaying(!playing)}><h2>{playing ? "STOP" : "PLAY"} 303 EMULATOR FROM WEBGPU</h2></button>

    </>
  )
}

export default SineTestGPU;