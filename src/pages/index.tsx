import io, {Socket} from "socket.io-client";
import React, {useCallback, useEffect, useRef, useState} from "react";
import styled from "styled-components";
import Select from "react-select";
import dynamic from 'next/dynamic'
import {
  colourPalettes,
  defaultJuliaPlane,
  defaultMandelbrotPlane,
  generateJulia,
  generateMandelbrot,
  FractalPlane,
  getScalingFactors,
  OptionType,
  renderOptions,
} from "@/utils/fractal";

const Knob = dynamic(() => import("el-vis-audio").then((mod) => mod.KnobParamLabel),
  { ssr: false }
)

const palettes: OptionType[] = colourPalettes.map((color, index) => {
  return { value: index.toString(), label: index.toString() };
});

let socket: Socket;

export default function Home() {
  const [renderOption, setRenderOption] = useState<OptionType>(
    renderOptions[renderOptions?.findIndex((o: OptionType) => o?.value === 'lsm')]
  );
  const [paletteNumber, setPaletteNumber] = useState<OptionType>(palettes[16]);
  const [maxIterations, setMaxIterations] = useState<number>(100);
  const [lsmThreshold, setLsmThreshold] = useState<number>(100);
  const [demThreshold, setDemThreshold] = useState<number>(0.2);
  const [overflow, setOverflow] = useState<number>(100000000000)
  const [canvasHeight, setCanvasHeight] = useState<number>(256);
  const [canvasWidth, setCanvasWidth] = useState<number>(256);
  const [mandelbrotWindow, setMandelbrotWindow] = useState<FractalPlane>(defaultMandelbrotPlane)
  const [juliaWindow, setJuliaWindow] = useState<FractalPlane>(defaultJuliaPlane)
  const [mandelbrot2DArray, setMandelbrot2DArray] = useState<number[][]>([]);
  const [julia2DArray, setJulia2DArray] = useState<number[][]>([]);
  const [mandelbrotMouseDown, setMandelbrotMouseDown] = useState<boolean>(false);
  const [msBetweenRows, setMsBetweenRows] = useState<number>(100);
  const [cx, setCx] = useState<number>(-0.7);
  const [cy, setCy] = useState<number>(0.27015);
  const [volume, setVolume] = useState<number>(0);

  const mandelbrotCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const juliaCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    socketInitializer();
  }, []);

  useEffect(() => {
    console.log("volume", volume);
    socket?.emit("volume", volume );
  }, [volume]);

  useEffect(() => {
    julia();
  }, [cx, cy, maxIterations, paletteNumber, lsmThreshold, demThreshold, canvasHeight, canvasWidth, juliaWindow, renderOption]);

  useEffect(() => {
    mandelbrot();
  }, [maxIterations, paletteNumber, lsmThreshold, demThreshold, canvasHeight, canvasWidth, mandelbrotWindow, renderOption]);

  useEffect(() => {
    sendMandelbrot(mandelbrot2DArray)
  }, [mandelbrot2DArray]);

  useEffect(() => {
    sendJulia(julia2DArray)
  }, [julia2DArray]);

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
    const threshold = renderOption.value === 'dem' ? demThreshold : lsmThreshold;
    if (mandelbrotCanvasRef.current) {
      const mandelbrotArray: number[][] = generateMandelbrot(
        mandelbrotCanvasRef.current,
        mandelbrotWindow,
        canvasWidth,
        canvasHeight,
        renderOption.value,
        maxIterations,
        threshold,
        overflow,
        parseInt(paletteNumber.value)
      );
      setMandelbrot2DArray(mandelbrotArray);
    }
  };

  const julia = () => {
    if (juliaCanvasRef.current) {
      const juliaArray: number[][] = generateJulia(
        juliaCanvasRef.current,
        juliaWindow,
        canvasWidth,
        canvasHeight,
        renderOption.value,
        maxIterations,
        lsmThreshold,
        cx,
        cy,
        overflow,
        parseInt(paletteNumber.value)
      );
      setJulia2DArray(juliaArray);
    }
  };

  const sendMandelbrot = useCallback((fractal2DArray: number[][]) => {
    fractal2DArray.forEach((row: number[], index: number) => {
      setTimeout(function() {
         socket?.emit("fractalMandelbrotRow", row);
      }, msBetweenRows * index);
    });
  }, [msBetweenRows]);

  const sendJulia = useCallback((fractal2DArray: number[][]) => {
    fractal2DArray.forEach((row: number[], index: number) => {
      setTimeout(function() {
         socket?.emit("fractalJuliaRow", row);
      }, msBetweenRows * index);
    });
  }, [msBetweenRows]);

  const setJuliaComplexNumberByClick = useCallback((e: any) => {
    if(mandelbrotCanvasRef.current) {
       const rect = mandelbrotCanvasRef.current.getBoundingClientRect();
        const pos = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        };
        const scalingFactors = getScalingFactors(mandelbrotWindow, canvasWidth, canvasHeight);
        const newCx = mandelbrotWindow.x_min + pos.x * scalingFactors.x;
        const newCy = mandelbrotWindow.y_min + pos.y * scalingFactors.y;
        setCx(newCx);
        setCy(newCy);
    }
  }, [canvasHeight, canvasWidth, mandelbrotWindow]);

  const setJuliaComplexNumber = useCallback((e: any) => {
    if(mandelbrotCanvasRef.current && mandelbrotMouseDown) {
       const rect = mandelbrotCanvasRef.current.getBoundingClientRect();
        const pos = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        };
        const scalingFactors = getScalingFactors(mandelbrotWindow, canvasWidth, canvasHeight);
        const newCx = mandelbrotWindow.x_min + pos.x * scalingFactors.x;
        const newCy = mandelbrotWindow.y_min + pos.y * scalingFactors.y;
        setCx(newCx);
        setCy(newCy);
    }
  }, [canvasHeight, canvasWidth, mandelbrotWindow, mandelbrotMouseDown]);

  function setDownForMandelbrotMouseDown() {
    setMandelbrotMouseDown(true);
  }
  function setUpForMandelbrotMouseDown() {
    setMandelbrotMouseDown(false);
  }

  const zoomMandelbrot = (value: string) => () => {
    if (value === 'reset') {
      setMandelbrotWindow({
        x_min: -2.5,
        y_min: -1.25,
        x_max: 0.8,
        y_max: 1.25
      });
    }
    if (value === 'ul') {
      const tempWindow = mandelbrotWindow;
      tempWindow.x_max = tempWindow.x_max * 0.75;
      tempWindow.y_max = tempWindow.y_max * 0.75;
      setMandelbrotWindow({...tempWindow});
    }
    if (value === 'l') {
      const tempWindow = mandelbrotWindow;
      tempWindow.x_max = tempWindow.x_max * 0.75;
      tempWindow.y_max = tempWindow.y_max * 0.885;
      tempWindow.y_min = tempWindow.y_min * 0.885;
      setMandelbrotWindow({...tempWindow});
    }
    if (value === 'r') {
      const tempWindow = mandelbrotWindow;
      tempWindow.x_min = tempWindow.x_min * 0.75;
      tempWindow.y_max = tempWindow.y_max * 0.885;
      tempWindow.y_min = tempWindow.y_min * 0.885;
      setMandelbrotWindow({...tempWindow});
    }
    else if (value === 'ur') {
      const tempWindow = mandelbrotWindow;
      tempWindow.x_min = tempWindow.x_min * 0.75;
      tempWindow.y_max = tempWindow.y_max * 0.75;
      setMandelbrotWindow({...tempWindow});
    }
    else if (value === 'll') {
      const tempWindow = mandelbrotWindow;
      tempWindow.x_max = tempWindow.x_max * 0.75;
      tempWindow.y_min = tempWindow.y_min * 0.75;
      setMandelbrotWindow({...tempWindow});
    }
    else if (value === 'lr') {
      const tempWindow = mandelbrotWindow;
      tempWindow.x_min = tempWindow.x_min * 0.75;
      tempWindow.y_min = tempWindow.y_min * 0.75;
      setMandelbrotWindow({...tempWindow});
    }
    if (value === 'up') {
      const tempWindow = mandelbrotWindow;
      tempWindow.y_max = tempWindow.y_max * 0.75;
      tempWindow.x_max = tempWindow.x_max * 0.885;
      tempWindow.x_min = tempWindow.x_min * 0.885;
      setMandelbrotWindow({...tempWindow});
    }
    if (value === 'd') {
      const tempWindow = mandelbrotWindow;
      tempWindow.y_min = tempWindow.y_min * 0.75;
      tempWindow.x_max = tempWindow.x_max * 0.885;
      tempWindow.x_min = tempWindow.x_min * 0.885;
      setMandelbrotWindow({...tempWindow});
    }
    else if (value === 'in') {
      const tempWindow = mandelbrotWindow;
      tempWindow.x_min = tempWindow.x_min * 0.92;
      tempWindow.y_min = tempWindow.y_min * 0.92;
      tempWindow.x_max = tempWindow.x_max * 0.92;
      tempWindow.y_max = tempWindow.y_max * 0.92;
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
    if (value === 'l') {
      const tempWindow = juliaWindow;
      tempWindow.x_max = tempWindow.x_max * 0.75;
      tempWindow.y_max = tempWindow.y_max * 0.885;
      tempWindow.y_min = tempWindow.y_min * 0.885;
      setJuliaWindow({...tempWindow});
    }
    if (value === 'r') {
      const tempWindow = juliaWindow;
      tempWindow.x_min = tempWindow.x_min * 0.75;
      tempWindow.y_max = tempWindow.y_max * 0.885;
      tempWindow.y_min = tempWindow.y_min * 0.885;
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
    if (value === 'up') {
      const tempWindow = juliaWindow;
      tempWindow.y_max = tempWindow.y_max * 0.75;
      tempWindow.x_max = tempWindow.x_max * 0.885;
      tempWindow.x_min = tempWindow.x_min * 0.885;
      setJuliaWindow({...tempWindow});
    }
    if (value === 'd') {
      const tempWindow = juliaWindow;
      tempWindow.y_min = tempWindow.y_min * 0.75;
      tempWindow.x_max = tempWindow.x_max * 0.885;
      tempWindow.x_min = tempWindow.x_min * 0.885;
      setJuliaWindow({...tempWindow});
    }
    else if (value === 'in') {
      const tempWindow = juliaWindow;
      tempWindow.x_min = tempWindow.x_min * 0.92;
      tempWindow.y_min = tempWindow.y_min * 0.92;
      tempWindow.x_max = tempWindow.x_max * 0.92;
      tempWindow.y_max = tempWindow.y_max * 0.92;
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
        <ButtonRow>
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
      /></Label></ButtonRow>
      <Label>Iterations{" "}
      <Input
        type="number"
        min={25}
        max={5000}
        value={maxIterations}
        step={25}
        onChange={(value) => setMaxIterations(value.target.valueAsNumber)}
      /></Label>
      {renderOption.value && renderOption.value !== 'dem' && (
        <Label>Threshold{"   "}
        <Input
          type="number"
          value={lsmThreshold}
          step={100}
          min={100}
          max={10000}
          onChange={(value) => setLsmThreshold(value.target.valueAsNumber)}
        /></Label>
      )}
        {renderOption.value && renderOption.value === 'dem' && (
          <>
        <Label>Threshold{"   "}
        <Input
          type="number"
          value={demThreshold}
          step={0.01}
          min={0}
          max={3}
          onChange={(value) => setDemThreshold(value.target.valueAsNumber)}
        /></Label>
            <Label>Threshold{"   "}
        <Input
          type="number"
          value={overflow}
          step={100000000000}
          min={0}
          max={100000000000000}
          onChange={(value) => setOverflow(value.target.valueAsNumber)}
        /></Label>
            </>
      )}
        <Label>ms speed{"   "}
        <Input
          type="number"
          value={msBetweenRows}
          step={0.01}
          min={5}
          max={1000}
          onChange={(value) => setMsBetweenRows(value.target.valueAsNumber)}
        />
        </Label>
        <Knob
          id={"speed"}
          label={"Speed (ms)"}
          knobValue={msBetweenRows}
          step={0.01}
          min={5}
          max={1000}
          onKnobInput={setMsBetweenRows}
        />
        <Knob
          id={"volume"}
          label={"Volume (OSC)"}
          knobValue={volume}
          step={0.01}
          min={0}
          max={1}
          onKnobInput={setVolume}
        />
      </ButtonContainer>
      <ButtonContainer>
        <ButtonColumn>
        <Label>Zoom Mandelbrot</Label>
         <StyledButton onClick={zoomMandelbrot('reset')}>RESET</StyledButton>
          </ButtonColumn>
        <ButtonColumn>
          <ButtonRow>
            <StyledButton onClick={zoomMandelbrot('ul')}>Upper-Left</StyledButton>
            <StyledButton onClick={zoomMandelbrot('up')}>Up</StyledButton>
          <StyledButton onClick={zoomMandelbrot('ur')}>Upper-Right</StyledButton>
          </ButtonRow>
          <ButtonRow>
            <StyledButton onClick={zoomMandelbrot('l')}>Left</StyledButton>
            <StyledButton onClick={zoomMandelbrot('in')}>In</StyledButton>
            <StyledButton onClick={zoomMandelbrot('r')}>Right</StyledButton>
          </ButtonRow>
          <ButtonRow>
            <StyledButton onClick={zoomMandelbrot('ll')}>Lower-Left</StyledButton>
            <StyledButton onClick={zoomMandelbrot('d')}>Down</StyledButton>
            <StyledButton onClick={zoomMandelbrot('lr')}>Lower-Right</StyledButton>
          </ButtonRow>
        </ButtonColumn>
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
        <Label>Julia Complex Number (click and Drag over Mandelbrot)</Label>
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
          onMouseDown={setDownForMandelbrotMouseDown}
          onMouseUp={setUpForMandelbrotMouseDown}
          onMouseMove={setJuliaComplexNumber}
          onClick={setJuliaComplexNumberByClick}
        />
        <Scroller>
          <ScrollDiv>
            {JSON.stringify(
              mandelbrot2DArray.map(
                function(subArray: number[]){
                  return subArray.map(function(elem: number) {
                    return Number(elem.toFixed(2));
                  });
                }))
            }
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
            {JSON.stringify(
              julia2DArray.map(
                function(subArray: number[]){
                  return subArray.map(function(elem: number) {
                    return Number(elem.toFixed(2));
                  });
                }))
            }
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
  padding-left: .5rem;
  font-size: 0.85rem; 
  max-width: 512px; 
  `;

const Label = styled.label`
  display: flex;
  flex-direction: row;
  font-size: .85rem;
  padding: .5rem;
  height: 100%;
  align-items: center;
`;

const Input = styled.input`
  min-height: 30px;
  padding: 0.5rem;
  margin-left: .5rem ;
  font-size: 0.85rem;
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
    font-family: monospace;
    border: 1px solid #DDDDDD;
    border-radius: 4px 0 4px 0;
    color: #3B3C3E;
    font-size: 7px;
    font-weight: bold;
    left: -1px;
    padding: 10px 7px 5px;
`;

const Scroller = styled.div`
  background-color: #F5F5F5;
  height: 256px;
    overflow:scroll;
`;
const ButtonContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
`;

const ButtonRow = styled.div`
  display: flex; 
  flex-direction: row;
  align-items: center;
`;

const ButtonColumn = styled.div`
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StyledButton = styled.button`
  font-size: 0.7rem;
  width: 80px;  
  min-height: 22px;  
`;