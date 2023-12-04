import useDevice from "@/hooks/useDevice";
import {useEffect, useState} from "react";
import compute from "@/shaders/audioTest/compute.wgsl";
import {audioContext} from "@/utils/audio/audioTools";
import styled from "styled-components";

const AudioTest = () => {
  const [playing, setPlaying] = useState(false);
  const {adapter, device, gpu} = useDevice()

  useEffect(() => {
    if (!audioContext || !adapter || !device) return;
    const audioCtx = audioContext;
    async function playSound() {
      // CONFIG STUFF
      const chunkDurationSeconds = 1;
      const numChannels = 2; // currently only two channels allowed (shader uses vec2)
      const workgroupSize = 256;
      const maxBufferedChunks = 5;

      if (numChannels !== 2) {
        throw new Error('Currently the number of channels has to be 2, sorry :/');
      }

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

      const audioShaderModule = device.createShaderModule({
        label: "Audio shader",
        code: compute
      });
      const pipeline = device.createComputePipeline({
        layout: 'auto',
        compute: {
          module: audioShaderModule,
          entryPoint: 'synthezise',
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
        ]
      });

      const startTime = performance.now() / 1000.0;
      let nextChunkOffset = 0.0;

      // create sound data on the GPU, read back to CPU and schedule for playback
      async function createSongChunk() {
        // if we've already scheduled `maxBufferedChunks` of sound data for playback, reschedule sound data creation for later
        const bufferedSeconds = (startTime + nextChunkOffset) - (performance.now() / 1000.0);
        const numBufferedChunks = Math.floor(bufferedSeconds / chunkDurationSeconds);
        if (numBufferedChunks > maxBufferedChunks) {
          const timeout = chunkDurationSeconds * 0.9;
          setTimeout(createSongChunk, timeout * 1000.0);
          console.log(`buffered chunks ${numBufferedChunks} (${bufferedSeconds} seconds), next chunk creation starts in ${timeout} seconds`);
          return;
        }

        // update uniform buffer: set the new chunk's offset in seconds from t = 0
        console.log('writing nextChunkOffset', nextChunkOffset);
        device.queue.writeBuffer(timeInfoBuffer, 0, new Float32Array([nextChunkOffset]));

        const commandEncoder = device.createCommandEncoder();

        // encode compute pass, i.e., sound chunk creation
        const pass = commandEncoder.beginComputePass();
        pass.setPipeline(pipeline);
        pass.setBindGroup(0, bindGroup);
        pass.dispatchWorkgroups(
          Math.ceil(chunkNumSamplesPerChannel / workgroupSize)
        );
        pass.end();

        // copy sound chunk to map buffer
        commandEncoder.copyBufferToBuffer(chunkBuffer, 0, chunkMapBuffer, 0, chunkBufferSize);

        device.queue.submit([commandEncoder.finish()]);

        // after submitting(!) chunk creation & copy commands, map chunkMapBuffer's memory to CPU memory for reading
        // Note: a mapped buffer is not allowed to be used in a command encoder.
        // To avoid an illegal use of the map buffer in a command encoder (i.e., when copying the data from the storage buffer),
        // we wait for the buffer's memory to be mapped.
        // In this case, this is okay, because we have a couple of seconds of sound data cached in the audio context's destination,
        // so we can easily afford to wait for the GPU commands to finish and the buffer to be mapped.
        // However, doing this within the render loop of a real-time renderer is usually a bad idea, since it forces a CPU-GPU sync.
        // In such cases, it might be a good idea to have a ring buffer of map-buffers to not use the same map buffer in each frame.
        await chunkMapBuffer.mapAsync(GPUMapMode.READ, 0, chunkBufferSize);

        // when the buffer's memory is mapped, copy it to a JavaScript array and unmap the buffer
        const chunkData = new Float32Array(chunkNumSamples);
        chunkData.set(new Float32Array(chunkMapBuffer.getMappedRange()));
        chunkMapBuffer.unmap();

        // copy chunk data to audio buffer
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

        // create new audio source from audio buffer and schedule for execution
        const audioSource = audioCtx.createBufferSource();
        audioSource.buffer = audioBuffer;
        audioSource.connect(audioCtx.destination);
        // (there is some issue with the second chunk's offset - no idea why, music's hard I guess)
        audioSource.start(nextChunkOffset);

        console.log(`created new chunk, starts at ${startTime + nextChunkOffset}`);

        // schedule next chunk creation
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

  return (
    <>
      <button onClick={() => setPlaying(!playing)}>{playing ? "STOP" : "PLAY"} AUDIO FROM GPU</button>
    </>
  )
}
export const DataDiv = styled.div`
  width: 1024px;
`;


export default AudioTest