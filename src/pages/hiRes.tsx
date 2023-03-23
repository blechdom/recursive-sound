import io, {Socket} from "socket.io-client";
import React, {useCallback, useEffect, useRef, useState} from "react";
import styled from "styled-components";
import Select from "react-select";
import BigNumber from "bignumber.js";

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
} from "@/utils/fractalBigNumber";

const palettes: OptionType[] = colourPalettes.map((color, index) => {
  return { value: index.toString(), label: index.toString() };
});

let socket: Socket;

export default function HiRes() {
  const [renderOption, setRenderOption] = useState<OptionType>(
    renderOptions[renderOptions?.findIndex((o: OptionType) => o?.value === 'lsm')]
  );
  const [paletteNumber, setPaletteNumber] = useState<OptionType>(palettes[16]);
  const [maxIterations, setMaxIterations] = useState<number>(10);
  const [threshold, setThreshold] = useState<number>(10);
  const [canvasHeight, setCanvasHeight] = useState<number>(16);
  const [canvasWidth, setCanvasWidth] = useState<number>(16);
  const [mandelbrotWindow, setMandelbrotWindow] = useState<FractalPlane>(defaultMandelbrotPlane)
  const [juliaWindow, setJuliaWindow] = useState<FractalPlane>(defaultJuliaPlane)
  const [mandelbrot2DArray, setMandelbrot2DArray] = useState<string>("");
  const [julia2DArray, setJulia2DArray] = useState<string>("");
  const [mandelbrotMouseDown, setMandelbrotMouseDown] = useState<boolean>(false);
  const [cx, setCx] = useState<BigNumber>(BigNumber(-0.7));
  const [cy, setCy] = useState<BigNumber>(BigNumber(0.27015));

  const mandelbrotCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const juliaCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    socketInitializer();
  }, []);

  useEffect(() => {
    console.log("julia window ", juliaWindow);
    julia();
  }, [cx, cy, maxIterations, paletteNumber, threshold, canvasHeight, canvasWidth, juliaWindow]);

  useEffect(() => {
    mandelbrot();
  }, [maxIterations, paletteNumber, threshold, canvasHeight, canvasWidth, mandelbrotWindow]);

  useEffect(() => {
    sendMandelbrotMessage(mandelbrot2DArray)
  }, [mandelbrot2DArray]);

  useEffect(() => {
    sendJuliaMessage(julia2DArray)
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
    if (mandelbrotCanvasRef.current) {
      const mandelbrotString = generateMandelbrot(
        mandelbrotCanvasRef.current,
        mandelbrotWindow,
        canvasWidth,
        canvasHeight,
        maxIterations,
        threshold,
        parseInt(paletteNumber.value)
      );
      setMandelbrot2DArray(mandelbrotString);
    }
  };

  const julia = () => {
    if (juliaCanvasRef.current) {
      const juliaString: string = generateJulia(
        juliaCanvasRef.current,
        juliaWindow,
        canvasWidth,
        canvasHeight,
        maxIterations,
        threshold,
        cx,
        cy,
        parseInt(paletteNumber.value)
      );
      setJulia2DArray(juliaString);
    }
  };

  const sendMandelbrotMessage = (fractal2DArray: string) => {
    socket?.emit("fractalMandelbrotString", fractal2DArray );
  };

  const sendJuliaMessage = (fractal2DArray: string) => {
    socket?.emit("fractalJuliaString", fractal2DArray );
  };

  const setJuliaComplexNumberByClick = useCallback((e: any) => {
    if(mandelbrotCanvasRef.current) {
       const rect = mandelbrotCanvasRef.current.getBoundingClientRect();
        const pos = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        };
        const scalingFactors = getScalingFactors(mandelbrotWindow, canvasWidth, canvasHeight);
        const newCx = mandelbrotWindow.x_min.plus((scalingFactors.x).multipliedBy(pos.x));
        const newCy = mandelbrotWindow.y_min.plus((scalingFactors.y).multipliedBy(pos.y));
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
        const newCx = mandelbrotWindow.x_min.plus((scalingFactors.x).multipliedBy(pos.x));
        const newCy = mandelbrotWindow.y_min.plus((scalingFactors.y).multipliedBy(pos.y));
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
        x_min: BigNumber(-2.5),
        y_min: BigNumber(-1.25),
        x_max: BigNumber(0.8),
        y_max: BigNumber(1.25)
      });
    }
    else {
      const tempWindow: FractalPlane = mandelbrotWindow;
      if (value === 'ul') {
        tempWindow.x_max = tempWindow.x_max.multipliedBy(0.75);
        tempWindow.y_max = tempWindow.y_max.multipliedBy(0.75);
      }
      if (value === 'l') {
        tempWindow.x_max = tempWindow.x_max.multipliedBy(0.75);
        tempWindow.y_max = tempWindow.y_max.multipliedBy(0.885);
        tempWindow.y_min = tempWindow.y_min.multipliedBy(0.885);
      }
      if (value === 'r') {
        tempWindow.x_min = tempWindow.x_min.multipliedBy(0.75);
        tempWindow.y_max = tempWindow.y_max.multipliedBy(0.885);
        tempWindow.y_min = tempWindow.y_min.multipliedBy(0.885);
      } else if (value === 'ur') {
        tempWindow.x_min = tempWindow.x_min.multipliedBy(0.75);
        tempWindow.y_max = tempWindow.y_max.multipliedBy(0.75);
      } else if (value === 'll') {
        tempWindow.x_max = tempWindow.x_max.multipliedBy(0.75);
        tempWindow.y_min = tempWindow.y_min.multipliedBy(0.75);
      } else if (value === 'lr') {
        tempWindow.x_min = tempWindow.x_min.multipliedBy(0.75);
        tempWindow.y_min = tempWindow.y_min.multipliedBy(0.75);
      }
      if (value === 'up') {
        tempWindow.y_max = tempWindow.y_max.multipliedBy(0.75);
        tempWindow.x_max = tempWindow.x_max.multipliedBy(0.885);
        tempWindow.x_min = tempWindow.x_min.multipliedBy(0.885);
      }
      if (value === 'd') {
        tempWindow.y_min = tempWindow.y_min.multipliedBy(0.75);
        tempWindow.x_max = tempWindow.x_max.multipliedBy(0.885);
        tempWindow.x_min = tempWindow.x_min.multipliedBy(0.885);
      } else if (value === 'in') {
        tempWindow.x_min = tempWindow.x_min.multipliedBy(0.92);
        tempWindow.y_min = tempWindow.y_min.multipliedBy(0.92);
        tempWindow.x_max = tempWindow.x_max.multipliedBy(0.92);
        tempWindow.y_max = tempWindow.y_max.multipliedBy(0.92);

      }
      setMandelbrotWindow({...tempWindow});
    }
  }

  const zoomJulia = (value: string) => () => {
    if (value === 'reset') {
      setJuliaWindow({
        x_min: BigNumber(-2.0),
        y_min: BigNumber(-1.5),
        x_max: BigNumber(2.0),
        y_max: BigNumber(1.5)
      });
    }
    else {
      const tempWindow: FractalPlane = juliaWindow;
      if (value === 'ul') {
        tempWindow.x_max = tempWindow.x_max.multipliedBy(0.75);
        tempWindow.y_max = tempWindow.y_max.multipliedBy(0.75);
      }
      if (value === 'l') {
        tempWindow.x_max = tempWindow.x_max.multipliedBy(0.75);
        tempWindow.y_max = tempWindow.y_max.multipliedBy(0.885);
        tempWindow.y_min = tempWindow.y_min.multipliedBy(0.885);
      }
      if (value === 'r') {
        tempWindow.x_min = tempWindow.x_min.multipliedBy(0.75);
        tempWindow.y_max = tempWindow.y_max.multipliedBy(0.885);
        tempWindow.y_min = tempWindow.y_min.multipliedBy(0.885);
      } else if (value === 'ur') {
        tempWindow.x_min = tempWindow.x_min.multipliedBy(0.75);
        tempWindow.y_max = tempWindow.y_max.multipliedBy(0.75);
      } else if (value === 'll') {
        tempWindow.x_max = tempWindow.x_max.multipliedBy(0.75);
        tempWindow.y_min = tempWindow.y_min.multipliedBy(0.75);
      } else if (value === 'lr') {
        tempWindow.x_min = tempWindow.x_min.multipliedBy(0.75);
        tempWindow.y_min = tempWindow.y_min.multipliedBy(0.75);
      }
      if (value === 'up') {
        tempWindow.y_max = tempWindow.y_max.multipliedBy(0.75);
        tempWindow.x_max = tempWindow.x_max.multipliedBy(0.885);
        tempWindow.x_min = tempWindow.x_min.multipliedBy(0.885);
      }
      if (value === 'd') {
        tempWindow.y_min = tempWindow.y_min.multipliedBy(0.75);
        tempWindow.x_max = tempWindow.x_max.multipliedBy(0.885);
        tempWindow.x_min = tempWindow.x_min.multipliedBy(0.885);
      } else if (value === 'in') {
        tempWindow.x_min = tempWindow.x_min.multipliedBy(0.92);
        tempWindow.y_min = tempWindow.y_min.multipliedBy(0.92);
        tempWindow.x_max = tempWindow.x_max.multipliedBy(0.92);
        tempWindow.y_max = tempWindow.y_max.multipliedBy(0.92);

      }
      setJuliaWindow({...tempWindow});
    }
  }

  return (
    <Page>
      <ButtonContainer>
        {/*<Label>Render Algorithm{" "}
      <FractalSelect
        options={renderOptions}
        value={renderOption}
        onChange={(option) => {
          setRenderOption((option ?? renderOptions[1]) as OptionType);
        }}
      /></Label>*/}
      <Label>Color Palette{" "}
      <FractalSelect
        options={palettes}
        value={paletteNumber}
        onChange={(option) => {
          setPaletteNumber((option ?? palettes[0]) as OptionType);
        }}
      /></Label>
        {/*}  </ButtonContainer>
      <ButtonContainer>*/}
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
        value={maxIterations}
        step={25}
        onChange={(value) => setMaxIterations(value.target.valueAsNumber)}
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
        <Label>Julia Complex Number (click and Drag over Mandelbrot)</Label>
        <Label>cx
        <ComplexInput
          type="number"
          value={cx.toNumber()}
          min={-2.0}
          max={2.0}
          onChange={(value) => setCx(BigNumber(value.target.valueAsNumber))}
        /></Label>
        <Label>cy
        <ComplexInput
          type="number"
          value={cy.toNumber()}
          min={-2.0}
          max={2.0}
          onChange={(value) => setCy(BigNumber(value.target.valueAsNumber))}
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
  width: 100px;  
  min-height: 32px;  
`;