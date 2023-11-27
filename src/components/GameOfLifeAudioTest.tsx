import {useEffect, useRef, useState} from "react";
import compute from "@/shaders/gameOfLifeAudioTest/compute.wgsl";
import vert from "@/shaders/gameOfLifeAudioTest/vert.wgsl";
import frag from "@/shaders/gameOfLifeAudioTest/frag.wgsl";
import audioCompute from "@/shaders/gameOfLifeAudioTest/audioCompute.wgsl";
import useWebGPU from "@/hooks/useWebGPU";
import DatGui, {DatFolder, DatNumber} from "react-dat-gui";
import GPUData from "@/components/GPUData";
import styled from "styled-components";
import {audioContext} from "@/utils/audio/audioTools";

interface LifeGuiData {
  size: number;
  speed: number;
}

const lifeGuiDataInit: LifeGuiData = {
  size: 64,
  speed: 100,
}

const GameOfLifeAudioTest = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const {adapter, device, canvas, context, format} = useWebGPU(canvasRef.current)
  const [playing, setPlaying] = useState(false);
  const [lifeGuiData, setLifeGuiData] = useState<LifeGuiData>(lifeGuiDataInit)
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>();
  const [gpuData, setGpuData] = useState<Float32Array>(new Float32Array());

  const chunkDurationSeconds = 1;
  const numChannels = 2; // currently only two channels allowed (shader uses vec2)
  const workgroupSize = 256;
  const maxBufferedChunks = 1; // was 5
  const WORKGROUP_SIZE = 8;

  useEffect(() => {
    intervalId && clearInterval(intervalId);
    setIntervalId(null);
    if (!audioContext || !canvas || !context || !adapter || !device) return
    if (playing) {
      audioContext.resume();
    } else {
      audioContext.suspend();
    }
    let step = 0;
    const canvasConfig: GPUCanvasConfiguration = {
      device,
      format,
      alphaMode: 'opaque'
    }
    context.configure(canvasConfig)

    const vertices = new Float32Array([
      //   X,    Y,
      -0.8, -0.8, // Triangle 1 (Blue)
      0.8, -0.8,
      0.8, 0.8,

      -0.8, -0.8, // Triangle 2 (Red)
      0.8, 0.8,
      -0.8, 0.8,
    ]);
    const vertexBuffer = device.createBuffer({
      label: "Cell vertices",
      size: vertices.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });

    const cellStateArray = new Uint32Array(lifeGuiData.size * lifeGuiData.size);
    const BUFFER_SIZE = cellStateArray.byteLength;

    const cellStateStorage = [
      device.createBuffer({
        label: "Cell State A",
        size: cellStateArray.byteLength,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
      }),
      device.createBuffer({
        label: "Cell State B",
        size: cellStateArray.byteLength,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
      })
    ];

    const output = device.createBuffer({
      size: BUFFER_SIZE,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC
    });

    const stagingBuffer = device.createBuffer({
      size: BUFFER_SIZE,
      usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
    });

    const chunkNumSamplesPerChannel = audioContext.sampleRate * chunkDurationSeconds;
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

    for (let i = 0; i < cellStateArray.length; ++i) {
      cellStateArray[i] = Math.random() > 0.6 ? 1 : 0;
    }

    const uniformArray = new Float32Array([lifeGuiData.size, lifeGuiData.size]);
    const uniformBuffer = device.createBuffer({
      label: "Grid Uniforms",
      size: uniformArray.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    device.queue.writeBuffer(cellStateStorage[0], 0, cellStateArray);
    device.queue.writeBuffer(vertexBuffer, 0, vertices);
    device.queue.writeBuffer(uniformBuffer, 0, uniformArray);

    const simulationShaderModule = device.createShaderModule({
      label: "Life simulation shader",
      code: compute
    });

    const cellShaderModule = device.createShaderModule({
      label: 'Cell shader',
      code: vert + frag
    });

    const audioShaderModule = device.createShaderModule({
      label: "Audio shader",
      code: audioCompute
    });

    const bindGroupLayout = device.createBindGroupLayout({
      label: "Cell Bind Group Layout",
      entries: [{
        binding: 0,
        visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT | GPUShaderStage.COMPUTE,
        buffer: {}
      }, {
        binding: 1,
        visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT | GPUShaderStage.COMPUTE,
        buffer: {type: "read-only-storage"}
      }, {
        binding: 2,
        visibility: GPUShaderStage.COMPUTE,
        buffer: {type: "storage"}
      }, {
        binding: 3,
        visibility: GPUShaderStage.COMPUTE,
        buffer: {type: "storage"}
      }]
    });

    const pipelineLayout = device.createPipelineLayout({
      label: "Cell Pipeline Layout",
      bindGroupLayouts: [bindGroupLayout],
    });

    const cellPipeline = device.createRenderPipeline({
      label: "Cell pipeline",
      layout: pipelineLayout,
      vertex: {
        module: cellShaderModule,
        entryPoint: "vertexMain",
        buffers: [{
          arrayStride: 8,
          attributes: [{
            format: "float32x2",
            offset: 0,
            shaderLocation: 0, // Position, see vertex shader
          }],
        }]
      },
      fragment: {
        module: cellShaderModule,
        entryPoint: "fragmentMain",
        targets: [{
          format
        }]
      }
    });

    const simulationPipeline = device.createComputePipeline({
      label: "Simulation pipeline",
      layout: pipelineLayout,
      compute: {
        module: simulationShaderModule,
        entryPoint: "computeMain",
      }
    });

    const audioPipeline = device.createComputePipeline({
      layout: 'auto',
      compute: {
        module: audioShaderModule,
        entryPoint: 'synthezise',
        constants: {
          SAMPLING_RATE: audioContext.sampleRate,
          WORKGROUP_SIZE: workgroupSize,
        }
      }
    });

    const bindGroups = [
      device.createBindGroup({
        label: "Cell renderer bind group A",
        layout: bindGroupLayout,
        entries: [{
          binding: 0,
          resource: {buffer: uniformBuffer}
        }, {
          binding: 1,
          resource: {buffer: cellStateStorage[0]}
        }, {
          binding: 2,
          resource: {buffer: cellStateStorage[1]}
        }, {
          binding: 3,
          resource: {buffer: output}
        }],
      }),
      device.createBindGroup({
        label: "Cell renderer bind group B",
        layout: bindGroupLayout,
        entries: [{
          binding: 0,
          resource: {buffer: uniformBuffer}
        }, {
          binding: 1,
          resource: {buffer: cellStateStorage[1]}
        }, {
          binding: 2,
          resource: {buffer: cellStateStorage[0]}
        }, {
          binding: 3,
          resource: {buffer: output}
        }],
      }),
      device.createBindGroup({
        label: "Audio bind group",
        layout: audioPipeline.getBindGroupLayout(0),
        entries: [
          {binding: 0, resource: {buffer: timeInfoBuffer}},
          {binding: 1, resource: {buffer: chunkBuffer}},
        ]
      })
    ];

    const startTime = performance.now() / 1000.0;
    let nextChunkOffset = 0.0;

    async function updateGrid() {
      if (device && context) {
        const encoder = device.createCommandEncoder();

        const computePass = encoder.beginComputePass();

        computePass.setPipeline(simulationPipeline);
        computePass.setBindGroup(0, bindGroups[step % 2]);

        // New lines
        const workgroupCount = Math.ceil(lifeGuiData.size / WORKGROUP_SIZE);
        computePass.dispatchWorkgroups(workgroupCount, workgroupCount);

        computePass.end();

        const pass = encoder.beginRenderPass({
          colorAttachments: [{
            view: context.getCurrentTexture().createView(),
            loadOp: "clear",
            clearValue: {r: 0, g: 0, b: 0.4, a: 1.0},
            storeOp: "store",
          }]
        });

        pass.setPipeline(cellPipeline);
        pass.setBindGroup(0, bindGroups[step % 2]); // Updated!
        pass.setVertexBuffer(0, vertexBuffer);
        pass.draw(vertices.length / 2, lifeGuiData.size * lifeGuiData.size);

        pass.end();

        encoder.copyBufferToBuffer(
          output,
          0, // Source offset
          stagingBuffer,
          0, // Destination offset
          BUFFER_SIZE
        );

        device.queue.submit([encoder.finish()]);

        await stagingBuffer.mapAsync(
          GPUMapMode.READ,
          0,
          BUFFER_SIZE
        );
        const copyArrayBuffer =
          stagingBuffer.getMappedRange(0, BUFFER_SIZE);
        const data = copyArrayBuffer.slice(0, BUFFER_SIZE);
        stagingBuffer.unmap();
        let newGpuData = new Float32Array(data);
        setGpuData(newGpuData);

        createSongChunk();

        step++;
      }
    }

    // reset intervalId on change...
    setIntervalId(setInterval(updateGrid, lifeGuiData.speed));

    async function createSongChunk() {
      if (!audioContext) return;
      // if we've already scheduled `maxBufferedChunks` of sound data for playback, reschedule sound data creation for later
      const bufferedSeconds = (startTime + nextChunkOffset) - (performance.now() / 1000.0);
      const numBufferedChunks = Math.floor(bufferedSeconds / chunkDurationSeconds);
      if (numBufferedChunks > maxBufferedChunks) {
        const timeout = chunkDurationSeconds * 0.9;
       // setTimeout(createSongChunk, timeout * 1000.0);
        console.log(`buffered chunks ${numBufferedChunks} (${bufferedSeconds} seconds), next chunk creation starts in ${timeout} seconds`);
        return;
      }

      // update uniform buffer: set the new chunk's offset in seconds from t = 0
      console.log('writing nextChunkOffset', nextChunkOffset);
      device.queue.writeBuffer(timeInfoBuffer, 0, new Float32Array([nextChunkOffset]));

      const commandEncoder = device.createCommandEncoder();

      const pass = commandEncoder.beginComputePass();
      pass.setPipeline(audioPipeline);
      pass.setBindGroup(0, bindGroups[2]);
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

      // copy chunk data to audio buffer
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
    }
  }, [audioContext, playing, canvas, context, format, adapter, device, lifeGuiData.size, lifeGuiData.speed])

  return (
    <>
      <button onClick={() => setPlaying(!playing)}>{playing ? "STOP" : "PLAY"} AUDIO FROM GPU</button><br />
      <canvas ref={canvasRef} width={1024} height={1024} tabIndex={0}/>
      <DataDiv><GPUData title={'game of life gpu data:'} matrixData={gpuData} color={'#0066FF'}/></DataDiv>
      <DatGui style={{top: '120px'}} data={lifeGuiData} onUpdate={(newData) => setLifeGuiData(newData)}>
        <DatFolder title="game of life" closed={false}>
          <DatNumber path='size' label='size' min={4} max={1024} step={1}/>
          <DatNumber path='speed' label='speed' min={25} max={500} step={1}/>
        </DatFolder>
      </DatGui>
    </>
  )
}
export const DataDiv = styled.div`
  width: 1024px;
`;


export default GameOfLifeAudioTest