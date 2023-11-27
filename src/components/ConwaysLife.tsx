import {useEffect, useRef, useState} from "react";
import compute from "@/shaders/conwaysLife/compute.wgsl";
import vert from "@/shaders/conwaysLife/vert.wgsl";
import frag from "@/shaders/conwaysLife/frag.wgsl";
import useWebGPU from "@/hooks/useWebGPU";
import DatGui, {DatFolder, DatNumber, DatSelect} from "react-dat-gui";
import GPUData from "@/components/GPUData";
import styled from "styled-components";

interface GameData {
  width: number;
  height: number;
  timestep: number;
  workgroupSize: number;
}

const gameDataInit: GameData = {
  width: 128,
  height: 128,
  timestep: 4,
  workgroupSize: 8,
};
const squareVertices = new Uint32Array([0, 0, 0, 1, 1, 0, 1, 1]);

const ConwaysLife = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const {adapter, device, canvas, context, format} = useWebGPU(canvasRef.current)
  const [playing, setPlaying] = useState(false);
  const [reset, setReset] = useState(true);
  const [gameData, setGameData] = useState<GameData>(gameDataInit)
  const [gpuData, setGpuData] = useState<Float32Array>(new Float32Array());
  const [computeShader, setComputeShader] = useState<GPUShaderModule>();
  const [vertexShader, setVertexShader] = useState<GPUShaderModule>();
  const [fragmentShader, setFragmentShader] = useState<GPUShaderModule>();
  const [bindGroupLayoutCompute, setBindGroupLayoutCompute] = useState<GPUBindGroupLayout>();
  const [bindGroupLayoutRender, setBindGroupLayoutRender] = useState<GPUBindGroupLayout>();
  const [uniformBindGroup, setUniformBindGroup] = useState<GPUBindGroup>();
  const [bindGroup0, setBindGroup0] = useState<GPUBindGroup>();
  const [bindGroup1, setBindGroup1] = useState<GPUBindGroup>();
  const [computePipeline, setComputePipeline] = useState<GPUComputePipeline>();
  const [renderPipeline, setRenderPipeline] = useState<GPURenderPipeline>();
  const [squareBuffer, setSquareBuffer] = useState<GPUBuffer>();
  const [squareStride, setSquareStride] = useState<GPUVertexBufferLayout>();
  const [cellsStride, setCellsStride] = useState<GPUVertexBufferLayout>();
  const [buffer0, setBuffer0] = useState<GPUBuffer>();
  const [buffer1, setBuffer1] = useState<GPUBuffer>();
  const [wholeTime, setWholeTime] = useState<number>(0);
  const [loopTimes, setLoopTimes] = useState<number>(0);

  useEffect(() => {
    if(!device || !format || !context) return;
    initializeLife();
  }, [device, format, context]);

  useEffect(() => {
    if (reset) {
      resetGameData();
      setReset(false);
    }
  }, [reset]);

  useEffect(() => {
    if(playing) {
      let timerId: number;

      const f = () => {
        setWholeTime(x => x + 1)
        timerId = requestAnimationFrame(f)
      }

      timerId = requestAnimationFrame(f)

      return () => cancelAnimationFrame(timerId)
    }
  }, [playing, context, buffer0, buffer1, renderPipeline, computePipeline, squareBuffer, uniformBindGroup, bindGroup0, bindGroup1]);

  useEffect(() => {
    if (wholeTime % gameData.timestep === 0) {
      setLoopTimes(1 - loopTimes);
      renderLife();
    }
  }, [wholeTime, gameData.timestep]);

  useEffect(() => {
    if (!device || !computeShader || !vertexShader || !fragmentShader || !bindGroupLayoutCompute || !bindGroupLayoutRender || !cellsStride || !squareStride) return;
    resetGameData();
  }, [gameData, device, computeShader, vertexShader, fragmentShader, bindGroupLayoutCompute, bindGroupLayoutRender, cellsStride, squareStride]);

  async function initializeLife() {
    if (!context || !device || !format) return;
    const canvasConfig: GPUCanvasConfiguration = {
      device,
      format,
      alphaMode: 'premultiplied'
    }
    context.configure(canvasConfig)

    setComputeShader(device.createShaderModule({code: compute}));
    setBindGroupLayoutCompute(device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.COMPUTE,
          buffer: {
            type: 'read-only-storage',
          },
        },
        {
          binding: 1,
          visibility: GPUShaderStage.COMPUTE,
          buffer: {
            type: 'read-only-storage',
          },
        },
        {
          binding: 2,
          visibility: GPUShaderStage.COMPUTE,
          buffer: {
            type: 'storage',
          },
        },
      ],
    }));

    const squareBufferInit = device.createBuffer({
      size: squareVertices.byteLength,
      usage: GPUBufferUsage.VERTEX,
      mappedAtCreation: true,
    });

    new Uint32Array(squareBufferInit.getMappedRange()).set(squareVertices);
    squareBufferInit.unmap();
    setSquareBuffer(squareBufferInit);

    setSquareStride({
      arrayStride: 2 * squareVertices.BYTES_PER_ELEMENT,
      stepMode: 'vertex',
      attributes: [
        {
          shaderLocation: 1,
          offset: 0,
          format: 'uint32x2',
        },
      ],
    });

    setVertexShader(device.createShaderModule({code: vert}));
    setFragmentShader(device.createShaderModule({code: frag}));

    setBindGroupLayoutRender(device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.VERTEX,
          buffer: {
            type: 'uniform',
          },
        },
      ],
    }));

    setCellsStride({
      arrayStride: Uint32Array.BYTES_PER_ELEMENT,
      stepMode: 'instance',
      attributes: [
        {
          shaderLocation: 0,
          offset: 0,
          format: 'uint32',
        },
      ],
    });
    setWholeTime(0);
    setLoopTimes(0);
  }

  function resetGameData() {
   if (!device || !computeShader || !vertexShader || !fragmentShader || !bindGroupLayoutCompute || !bindGroupLayoutRender || !cellsStride || !squareStride) return;
    setComputePipeline(device.createComputePipeline({
      layout: device.createPipelineLayout({
        bindGroupLayouts: [bindGroupLayoutCompute],
      }),
      compute: {
        module: computeShader,
        entryPoint: 'main',
        constants: {
          blockSize: gameData.workgroupSize,
        },
      },
    }));
    const sizeBuffer = device.createBuffer({
      size: 2 * Uint32Array.BYTES_PER_ELEMENT,
      usage:
        GPUBufferUsage.STORAGE |
        GPUBufferUsage.UNIFORM |
        GPUBufferUsage.COPY_DST |
        GPUBufferUsage.VERTEX,
      mappedAtCreation: true,
    });
    new Uint32Array(sizeBuffer.getMappedRange()).set([
      gameData.width,
      gameData.height,
    ]);
    sizeBuffer.unmap();
    const length = gameData.width * gameData.height;
    const cells = new Uint32Array(length);
    for (let i = 0; i < length; i++) {
      cells[i] = Math.random() < 0.25 ? 1 : 0;
    }

    const bufferZero = device.createBuffer({
      size: cells.byteLength,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.VERTEX,
      mappedAtCreation: true,
    });
    new Uint32Array(bufferZero.getMappedRange()).set(cells);
    bufferZero.unmap();

    const bufferOne = device.createBuffer({
      size: cells.byteLength,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.VERTEX,
    });

    setBindGroup0(device.createBindGroup({
      layout: bindGroupLayoutCompute,
      entries: [
        {binding: 0, resource: {buffer: sizeBuffer}},
        {binding: 1, resource: {buffer: bufferZero}},
        {binding: 2, resource: {buffer: bufferOne}},
      ],
    }));

    setBindGroup1(device.createBindGroup({
      layout: bindGroupLayoutCompute,
      entries: [
        {binding: 0, resource: {buffer: sizeBuffer}},
        {binding: 1, resource: {buffer: bufferOne}},
        {binding: 2, resource: {buffer: bufferZero}},
      ],
    }));

    const renderPipelineInit = device.createRenderPipeline({
      layout: device.createPipelineLayout({
        bindGroupLayouts: [bindGroupLayoutRender],
      }),
      primitive: {
        topology: 'triangle-strip',
      },
      vertex: {
        module: vertexShader,
        entryPoint: 'main',
        buffers: [cellsStride, squareStride],
      },
      fragment: {
        module: fragmentShader,
        entryPoint: 'main',
        targets: [
          {
            format: format,
          },
        ],
      },
    });
    setUniformBindGroup(device.createBindGroup({
      layout: renderPipelineInit.getBindGroupLayout(0),
      entries: [
        {
          binding: 0,
          resource: {
            buffer: sizeBuffer,
            offset: 0,
            size: 2 * Uint32Array.BYTES_PER_ELEMENT,
          },
        },
      ],
    }));
    setBuffer0(bufferZero);
    setBuffer1(bufferOne);
    setRenderPipeline(renderPipelineInit);
    setLoopTimes(0);
  }

  const renderLife = () => {
    if (!context || !buffer0 || !buffer1 || !renderPipeline || !computePipeline || !squareBuffer || !uniformBindGroup || !bindGroup0 || !bindGroup1) return;
    const view = context.getCurrentTexture().createView();
    const renderPass: GPURenderPassDescriptor = {
      colorAttachments: [
        {
          view,
          loadOp: 'clear',
          clearValue: {r: 0, g: 0, b: 0, a: 0},
          storeOp: 'store',
        },
      ],
    };
    const commandEncoder: GPUCommandEncoder = device.createCommandEncoder();
    const length = gameData.width * gameData.height;
    // compute
    const passEncoderCompute = commandEncoder.beginComputePass();
    passEncoderCompute.setPipeline(computePipeline);
    passEncoderCompute.setBindGroup(0, loopTimes ? bindGroup1 : bindGroup0);
    passEncoderCompute.dispatchWorkgroups(
      gameData.width / gameData.workgroupSize,
      gameData.height / gameData.workgroupSize
    );
    passEncoderCompute.end();
    // render
    const passEncoderRender = commandEncoder.beginRenderPass(renderPass);
    passEncoderRender.setPipeline(renderPipeline);
    passEncoderRender.setVertexBuffer(0, loopTimes ? buffer1 : buffer0);
    passEncoderRender.setVertexBuffer(1, squareBuffer);
    passEncoderRender.setBindGroup(0, uniformBindGroup);
    passEncoderRender.draw(4, length);
    passEncoderRender.end();

    device.queue.submit([commandEncoder.finish()]);
  };

  return (
    <>
      <button onClick={() => setPlaying(!playing)}>{playing ? "STOP" : "START"} WEBGPU RENDERING</button>
      <br/>
      <button onClick={() => setReset(true)}>RESET DATA</button>
      <br/>
      <canvas ref={canvasRef} width={1024} height={1024} tabIndex={0}/>
      <DataDiv><GPUData title={'game of life gpu data:'} matrixData={gpuData} color={'#0066FF'}/></DataDiv>
      <DatGui style={{top: '120px'}} data={gameData} onUpdate={(newData) => setGameData(newData)}>
        <DatFolder title="game of life" closed={false}>
          <DatNumber path='width' label='width' min={8} max={1024} step={8}/>
          <DatNumber path='height' label='height' min={8} max={1024} step={8}/>
          <DatNumber path='timestep' label='timestep' min={1} max={60} step={1}/>
          <DatSelect path='workgroupSize' label='workgroupSize' options={[4, 8, 16]}/>
        </DatFolder>
      </DatGui>
    </>
  )
}
export const DataDiv = styled.div`
  width: 1024px;
`;

export default ConwaysLife