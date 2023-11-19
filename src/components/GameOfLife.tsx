import {useEffect, useRef, useState} from "react";
import compute from "@/shaders/gameOfLife/compute.wgsl";
import vert from "@/shaders/gameOfLife/vert.wgsl";
import frag from "@/shaders/gameOfLife/frag.wgsl";
import useWebGPU from "@/hooks/useWebGPU";
import DatGui, {DatFolder, DatNumber} from "react-dat-gui";
import GPUData from "@/components/GPUData";
import styled from "styled-components";

interface LifeGuiData {
  size: number;
  speed: number;
}

const lifeGuiDataInit: LifeGuiData = {
  size: 64,
  speed: 100,
}

const GameOfLife = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const {adapter, device, canvas, context, format} = useWebGPU(canvasRef.current)
  const [lifeGuiData, setLifeGuiData] = useState<LifeGuiData>(lifeGuiDataInit)
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>();
  const [gpuData, setGpuData] = useState<Float32Array>(new Float32Array());

  const WORKGROUP_SIZE = 8;
  useEffect(() => {
    intervalId && clearInterval(intervalId);
    setIntervalId(null);
    if (!canvas || !context || !adapter || !device) return
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
    device.queue.writeBuffer(vertexBuffer, 0, vertices)

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

    for (let i = 0; i < cellStateArray.length; ++i) {
      cellStateArray[i] = Math.random() > 0.6 ? 1 : 0;
    }
    device.queue.writeBuffer(cellStateStorage[0], 0, cellStateArray);

    device.queue.writeBuffer(vertexBuffer, /*bufferOffset=*/0, vertices);

    const uniformArray = new Float32Array([lifeGuiData.size, lifeGuiData.size]);
    const uniformBuffer = device.createBuffer({
      label: "Grid Uniforms",
      size: uniformArray.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(uniformBuffer, 0, uniformArray);

    const simulationShaderModule = device.createShaderModule({
      label: "Life simulation shader",
      code: compute
    });

    const cellShaderModule = device.createShaderModule({
      label: 'Cell shader',
      code: vert + frag
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
      })
    ];

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
        setGpuData(new Float32Array(data));
        step++;
      }
    }

    // reset intervalId on change...
    setIntervalId(setInterval(updateGrid, lifeGuiData.speed));
    //updateGrid();
  }, [canvas, context, format, adapter, device, lifeGuiData.size, lifeGuiData.speed])

  return (
    <>
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


export default GameOfLife