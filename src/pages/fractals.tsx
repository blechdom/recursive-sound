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
  const [mandelbrot2DArray, setMandelbrot2DArray] = useState<string>("");
  const [julia2DArray, setJulia2DArray] = useState<string>("");
  const [cx, setCx] = useState<number>(-0.7);
  const [cy, setCy] = useState<number>(0.27015);

  const mandelbrotCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const juliaCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    socketInitializer();
  }, []);

  useEffect(() => {
    console.log('rendering julia')
    julia();
  }, [cx, cy, iterations, paletteNumber, threshold, canvasHeight, canvasWidth, juliaWindow, juliaCanvasRef.current]);

  useEffect(() => {
    console.log('rendering mandelbrot', mandelbrotWindow)
    mandelbrot();
  }, [iterations, paletteNumber, threshold, canvasHeight, canvasWidth, mandelbrotWindow, mandelbrotCanvasRef.current]);

  const socketInitializer = async () => {
    await fetch("/api/socket");

    socket = io();

    socket.on("newIncomingMessage", (msg) => {
      console.log(msg);
    });
    mandelbrot();
    julia();
  };

  const mandelbrot = () => {
    if (mandelbrotCanvasRef.current) {
      let ctx = mandelbrotCanvasRef.current.getContext("2d");

      if (ctx !== null) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
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
            setColourUsingLevelSetMethod(theIterations, ctx);
            manXArray.push(theIterations);
            ctx.fillRect(ix, iy, 1, 1)
          }
          manYArray.push(manXArray);
        }
        const stringMan = JSON.stringify(manYArray);
        const mystring = stringMan.replace(/\[/g, '(').replace(/]/g, ')').replace(/,/g,' ');
        sendMandelbrotMessage(mystring);
        setMandelbrot2DArray('MANDELBROT: ' + mystring);
      }
    }
  };

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
        ctx.fillStyle = colourPalettes[index][theIterations % colourPalettes[index].length]
    }
  }
  const julia = () => {
    if (juliaCanvasRef.current) {
      const ctx = juliaCanvasRef.current.getContext("2d");
      if (ctx !== null) {
        // @ts-ignore
        ctx.reset();

        const scalingFactor = getScalingFactors(juliaWindow);
        const juliaYArray = [];
        for (let iy = 0; iy < canvasHeight; iy++) {
          const y = juliaWindow.y_min + iy * scalingFactor.y
          const juliaXArray = [];
          for (let ix = 0; ix < canvasWidth; ix++) {
            const currentPoint = {x: juliaWindow.x_min + ix * scalingFactor.x, y: y}
            const theIterations = computePoint(currentPoint, cx, cy)
            setColourUsingLevelSetMethod(theIterations, ctx);
            juliaXArray.push(theIterations);
            ctx.fillRect(ix, iy, 1, 1)
          }
          juliaYArray.push(juliaXArray);
        }
        const stringMan = JSON.stringify(juliaYArray);
        const mystring = stringMan.replace(/\[/g, '(').replace(/]/g, ')').replace(/,/g,' ');
        sendJuliaMessage(mystring);
        setJulia2DArray('JULIA: ' + mystring);
      }
    }
  };

  const sendMandelbrotMessage = (fractal2DArray: string) => {
    socket?.emit("fractalMandelbrotString", fractal2DArray );
  };

  const sendJuliaMessage = (fractal2DArray: string) => {
    socket?.emit("fractalJuliaString", fractal2DArray );
  };

  const setJuliaComplexNumber = useCallback((e: any) => {
    console.log(e);
    if(mandelbrotCanvasRef.current) {
       const rect = mandelbrotCanvasRef.current.getBoundingClientRect();
        const pos = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        };
        const scalingFactors = getScalingFactors(mandelbrotWindow);
        const newCx = mandelbrotWindow.x_min + pos.x * scalingFactors.x;
        const newCy = mandelbrotWindow.y_min + pos.y * scalingFactors.y;
        console.log('new complex cx, cy', newCx, newCy)
        setCx(newCx);
        setCy(newCy);
    }
  }, [mandelbrotCanvasRef.current]);

  const zoomMandelbrot = (value: number) => () => {
    if (value === 0) {
      setMandelbrotWindow({
        x_min: -2.5,
        y_min: -1.25,
        x_max: 0.8,
        y_max: 1.25
      });
    }
    if (value === 1) {
      const tempWindow = mandelbrotWindow;
      tempWindow.x_max = tempWindow.x_max * 0.75;
      tempWindow.y_max = tempWindow.y_max * 0.75;
      setMandelbrotWindow({...tempWindow});
    }
    else if (value === 2) {
      const tempWindow = mandelbrotWindow;
      tempWindow.x_min = tempWindow.x_min * 0.75;
      tempWindow.y_max = tempWindow.y_max * 0.75;
      setMandelbrotWindow({...tempWindow});
    }
    else if (value === 3) {
      const tempWindow = mandelbrotWindow;
      tempWindow.x_max = tempWindow.x_max * 0.75;
      tempWindow.y_min = tempWindow.y_min * 0.75;
      setMandelbrotWindow({...tempWindow});
    }
    else if (value === 4) {
      const tempWindow = mandelbrotWindow;
      tempWindow.x_min = tempWindow.x_min * 0.75;
      tempWindow.y_min = tempWindow.y_min * 0.75;
      setMandelbrotWindow({...tempWindow});
    }
  }

  const zoomJulia = (value: string) => () => {
    if (value === 'reset') {
      setJuliaWindow({
        x_min: -2.0,
        y_min: -1.5,
        x_max: 2.0,
        y_max: 1.5
      });
    }
    if (value === 'ul') {
      const tempWindow = juliaWindow;
      tempWindow.x_max = tempWindow.x_max * 0.75;
      tempWindow.y_max = tempWindow.y_max * 0.75;
      setJuliaWindow({...tempWindow});
    }
    else if (value === 'ur') {
      const tempWindow = juliaWindow;
      tempWindow.x_min = tempWindow.x_min * 0.75;
      tempWindow.y_max = tempWindow.y_max * 0.75;
      setJuliaWindow({...tempWindow});
    }
    else if (value === 'll') {
      const tempWindow = juliaWindow;
      tempWindow.x_max = tempWindow.x_max * 0.75;
      tempWindow.y_min = tempWindow.y_min * 0.75;
      setJuliaWindow({...tempWindow});
    }
    else if (value === 'lr') {
      const tempWindow = juliaWindow;
      tempWindow.x_min = tempWindow.x_min * 0.75;
      tempWindow.y_min = tempWindow.y_min * 0.75;
      setJuliaWindow({...tempWindow});
    }
  }

  return (
    <Page>
      <ButtonContainer>
      <Label>Render Algorithm{" "}
      <FractalSelect
        options={renderOptions}
        value={renderOption}
        onChange={(option) => {
          setRenderOption((option ?? renderOptions[1]) as OptionType);
        }}
      /></Label>
      <Label>Color Palette{" "}
      <FractalSelect
        options={palettes}
        value={paletteNumber}
        onChange={(option) => {
          setPaletteNumber((option ?? palettes[0]) as OptionType);
        }}
      /></Label>
      </ButtonContainer>
      <ButtonContainer>
      <Label>Height{" "}
      <Input
        type="number"
        min={16}
        max={1024}
        value={canvasHeight}
        step={1}
        onChange={(value) => setCanvasHeight(value.target.valueAsNumber)}
      /></Label>
      <Label>Width{" "}
      <Input
        type="number"
        min={16}
        max={1024}
        value={canvasWidth}
        step={1}
        onChange={(value) => setCanvasWidth(value.target.valueAsNumber)}
      /></Label></ButtonContainer>
      <ButtonContainer>
      <Label>Iterations{" "}
      <Input
        type="number"
        min={25}
        max={5000}
        value={iterations}
        step={25}
        onChange={(value) => setIterations(value.target.valueAsNumber)}
      /></Label>
      {renderOption.value && renderOption.value === 'lsm' && (
        <Label>Threshold{"   "}
        <Input
          type="number"
          value={threshold}
          step={100}
          min={100}
          max={10000}
          onChange={(value) => setThreshold(value.target.valueAsNumber)}
        /></Label>
      )}</ButtonContainer>
      <ButtonContainer>
        <Label>Zoom Mandelbrot</Label>
        <StyledButton onClick={zoomMandelbrot(1)}>Upper-Left</StyledButton>
        <StyledButton onClick={zoomMandelbrot(2)}>Upper-Right</StyledButton>
        <StyledButton onClick={zoomMandelbrot(3)}>Lower-Left</StyledButton>
        <StyledButton onClick={zoomMandelbrot(4)}>Lower-Right</StyledButton>
        <StyledButton onClick={zoomMandelbrot(0)}>RESET</StyledButton>
      </ButtonContainer>
      <ButtonContainer>
        <ButtonColumn>
        <Label>Zoom Julia</Label>
         <StyledButton onClick={zoomJulia('reset')}>RESET</StyledButton>
          </ButtonColumn>
        <ButtonColumn>
          <ButtonRow>
            <StyledButton onClick={zoomJulia('ul')}>Upper-Left</StyledButton>
            <StyledButton onClick={zoomJulia('up')}>Up</StyledButton>
          <StyledButton onClick={zoomJulia('ur')}>Upper-Right</StyledButton>
          </ButtonRow>
          <ButtonRow>
            <StyledButton onClick={zoomJulia('l')}>Left</StyledButton>
            <StyledButton onClick={zoomJulia('in')}>In</StyledButton>
            <StyledButton onClick={zoomJulia('r')}>Right</StyledButton>
          </ButtonRow>
          <ButtonRow>
            <StyledButton onClick={zoomJulia('ll')}>Lower-Left</StyledButton>
            <StyledButton onClick={zoomJulia('d')}>Down</StyledButton>
            <StyledButton onClick={zoomJulia('lr')}>Lower-Right</StyledButton>
          </ButtonRow>
        </ButtonColumn>
      </ButtonContainer>
      <ButtonContainer>
        <Label>Julia Complex Number (click on Mandelbrot)</Label>
        <Label>cx
        <ComplexInput
          type="number"
          value={cx}
          min={-2.0}
          max={2.0}
          onChange={(value) => setCx(value.target.valueAsNumber)}
        /></Label>
        <Label>cy
        <ComplexInput
          type="number"
          value={cy}
          min={-2.0}
          max={2.0}
          onChange={(value) => setCy(value.target.valueAsNumber)}
        /></Label>
      </ButtonContainer>
      <FractalContainer>
        <MandelbrotCanvas
          ref={mandelbrotCanvasRef}
          width={canvasWidth}
          height={canvasHeight}
          onClick={setJuliaComplexNumber}
        />
        <Scroller>
          <ScrollDiv>
            {mandelbrot2DArray}
          </ScrollDiv>
        </Scroller>
      </FractalContainer>
      <br />
      <FractalContainer>
        <JuliaCanvas
          ref={juliaCanvasRef}
          width={canvasWidth}
          height={canvasHeight}
        />
        <Scroller>
          <ScrollDiv>
            {julia2DArray}
          </ScrollDiv>
        </Scroller>
      </FractalContainer>
    </Page>
  );
}

const Page = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0.5rem;
  font-family: "Roboto", sans-serif;
  font-size: 0.5rem;
`;

const FractalSelect = styled(Select)`
  padding-left: 1rem; 
  font-size: 1rem; 
  max-width: 512px; 
  `;

const Label = styled.label`
  display: flex;
  flex-direction: row;
  font-size: 1rem;
  padding: 1rem;
  height: 100%;
  align-items: center;
`;

const Input = styled.input`
  min-height: 38px;
  padding: 0.6rem;
  margin-left: 1rem ;
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

const ComplexInput = styled(Input)`
  width: 200px;
`;

const FractalContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const MandelbrotCanvas = styled.canvas`
`;
const JuliaCanvas = styled.canvas`
`;

const ScrollDiv = styled.div`   
    background-color: #F5F5F5;
    border: 1px solid #DDDDDD;
    border-radius: 4px 0 4px 0;
    color: #3B3C3E;
    font-size: 12px;
    font-weight: bold;
    left: -1px;
    padding: 10px 7px 5px;
`;

const Scroller = styled.div`
  height: 256px;
    overflow:scroll;
    overflow-x:hidden;
`;
const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const ButtonRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const ButtonColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StyledButton = styled.button`
  width: 80px;  
  min-height: 28px;  
`;