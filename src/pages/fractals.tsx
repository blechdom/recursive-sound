import io, {Socket} from "socket.io-client";
import React, {useCallback, useEffect, useRef, useState} from "react";
import styled from "styled-components";
import Select from "react-select";
import {
  colourPalettes,
} from "@/utils/fractal";

type OptionType = {
  value: string;
  label: string;
};

type FractalPlane = {
  x_min: number;
  y_min: number;
  x_max: number;
  y_max: number;
}

const renderOptions: OptionType[] = [
  { value: "lsm", label: "Level Set Method (LSM)" },
  { value: "dem", label: "Distance Estimator Method (DEM)" },
  { value: "bdm", label: "Binary Decomposition Method (BDM)" },
  { value: "tdm", label: "Trinary Decomposition Method (TDM)" },
  { value: "bdm2", label: "Binary Decomposition Method II (BDM2)" },
];

const palettes: OptionType[] = colourPalettes.map((color, index) => {
  return { value: index.toString(), label: index.toString() };
});

let socket: Socket;

type Message = {
  author: string;
  message: string;
};

export default function Home() {
  const [renderOption, setRenderOption] = useState<OptionType>(
    renderOptions[renderOptions?.findIndex((o: OptionType) => o?.value === 'lsm')]
  );
  const [paletteNumber, setPaletteNumber] = useState<OptionType>(palettes[0]);
  const [iterations, setIterations] = useState<number>(100);
  const [threshold, setThreshold] = useState<number>(100);
  const [canvasHeight, setCanvasHeight] = useState<number>(256);
  const [canvasWidth, setCanvasWidth] = useState<number>(256);
  const [mandelbrotWindow, setMandelbrotWindow] = useState<FractalPlane>({
    x_min: -2.5,
    y_min: -1.25,
    x_max: 0.8,
    y_max: 1.25
  })
  const [juliaWindow, setJuliaWindow] = useState<FractalPlane>({
    x_min: -2.0,
    y_min: -1.5,
    x_max: 2.0,
    y_max: 1.5
  })
  const [zoomWindow, setZoomWindow] = useState<[number, number, number, number]>([160, 120, 320, 240]);
  //const [fractal2DArray, setFractal2DArray] = useState<number[][]>([]);

  const mandelbrotCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const juliaCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    socketInitializer();
  }, []);

  /*const paletteArray: string[] = useMemo(
    () => {
    return colourPalettes[parseInt(paletteNumber.value)];
    }, [paletteNumber]);*/

  const socketInitializer = async () => {
    // We just call it because we don't need anything else out of it
    await fetch("/api/socket");

    socket = io();

    socket.on("newIncomingMessage", (msg) => {
      console.log(msg);
    });
    mandelbrot();
  };

  const mandelbrot = useCallback(() => {
    //drawSet(mandelbrotCanvasRef, mandelbrotDrawingFuncLsm, mandelbrotWindow);
    if (mandelbrotCanvasRef.current) {
      const ctx = mandelbrotCanvasRef.current.getContext("2d");
      if (ctx !== null) {
        // @ts-ignore
        ctx.reset();
        const scalingFactor = getScalingFactors(mandelbrotWindow);
        const manYArray = [];
        for (let iy = 0; iy < canvasHeight; iy++) {
          const cy = mandelbrotWindow.y_min + iy * scalingFactor.y
          const manXArray = [];
          for (let ix = 0; ix < canvasWidth; ix++) {
            const cx = mandelbrotWindow.x_min + ix * scalingFactor.x
            const currentPoint = {x: 0.0, y: 0.0}
            const theIterations = computePoint(currentPoint, cx, cy)
            //console.log('the iterations are ', cx, ',', cy, ' = ', theIterations);
            setColourUsingLevelSetMethod(theIterations, ctx);
            manXArray.push(theIterations);
            ctx.fillRect(ix, iy, 1, 1)
          }
          manYArray.push(manXArray);
        }
        const stringMan = JSON.stringify(manYArray);
        const mystring = stringMan.replace(/\[/g, '(').replace(/]/g, ')').replace(/,/g,' ');
        console.log("CapyTalk MANDELBROT: ", mystring);
        sendMessage(mystring);
      }
        //mandelbrotDrawingFuncLsm(ctx, iterations, setColourUsingLevelSetMethod, mandelbrotWindow);
    }
  }, [mandelbrotWindow, iterations, paletteNumber, threshold, canvasHeight, canvasWidth, mandelbrotCanvasRef.current]);

  function computePoint(point: {x: number; y: number}, cx: number, cy: number) {
    let x2 = point.x * point.x
    let y2 = point.y * point.y
    let i = 0
    while ((i < iterations) && ((x2 + y2) < threshold)) {
        let temp = x2 - y2 + cx
        point.y = 2 * point.x * point.y + cy
        point.x = temp
        x2 = point.x * point.x
        y2 = point.y * point.y
        i++
    }
    return i
}

  function getScalingFactors(plane: FractalPlane) {
    return {x: (plane.x_max - plane.x_min) / (canvasWidth - 1), y: (plane.y_max - plane.y_min) / (canvasHeight - 1)}
  }
  function setColourUsingLevelSetMethod(theIterations: number, ctx: any) {
    if (theIterations == iterations) { // we are in the set
        ctx.fillStyle = "#000"
    } else {
      const index = parseInt(paletteNumber.value);
      //console.log('index is ', index, ' and palette is ', colourPalettes[index][iterations % colourPalettes[index].length]);
        // colour it according to the number of iterations it took to get to infinity
        ctx.fillStyle = colourPalettes[index][theIterations % colourPalettes[index].length]
    }
}
  const selectMethod = () => {
  //console.log('select method:');
    mandelbrot();
  }
  const sendMessage = async (fractal2DArray: string) => {
    socket.emit("fractalString", fractal2DArray );
  };

  return (
    <Page>
      <Label>Render Algorithm</Label>
      <Select
        options={renderOptions}
        value={renderOption}
        onChange={(option) => {
          setRenderOption((option ?? renderOptions[1]) as OptionType);
        }}
      /><br />
      <Label>Color Palette</Label>
      <Select
        options={palettes}
        value={paletteNumber}
        onChange={(option) => {
          setPaletteNumber((option ?? palettes[0]) as OptionType);
        }}
      /><br />
      <Label>Iterations</Label>
      <Input
        type="number"
        min={25}
        max={5000}
        value={iterations}
        step={25}
        onChange={(value) => setIterations(value.target.valueAsNumber)}
      /><br />
      {renderOption.value && renderOption.value === 'lsm' && (
        <><Label>Threshold</Label>
        <Input
          type="number"
          value={threshold}
          step={100}
          min={100}
          max={10000}
          onChange={(value) => setThreshold(value.target.valueAsNumber)}
        />
        <br />
        </>
      )}

      <MandelbrotCanvas
        ref={mandelbrotCanvasRef}
        width={canvasWidth}
        height={canvasHeight}
      />
      <JuliaCanvas
        ref={juliaCanvasRef}
        width={canvasWidth}
        height={canvasHeight}
      />
    </Page>
  );
}

const Page = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1rem;
  font-family: "Roboto", sans-serif;
  font-size: 1rem;
`;

const Label = styled.label`
  font-size: 1.5rem;
  padding: 0.5rem;
`;

const Input = styled.input`
  min-height: 38px;
  padding: 0.6rem;
  font-size: 1rem;
  transition: all 100ms;
  background-color: hsl(0, 0%, 100%);
  border-color: hsl(0, 0%, 80%);
  border-radius: 4px;
  border-style: solid;
  border-width: 1px;
  box-sizing: border-box;
  &:focus {
    border: 2px solid dodgerblue;
    transition: border-color 0.3s ease-in-out;
    outline: 0;
  }
`;

const MandelbrotCanvas = styled.canvas`
  float: left;
`;
const JuliaCanvas = styled.canvas`
`;