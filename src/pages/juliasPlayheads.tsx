import DataModal from "@/components/DataModal";
import PlayheadControls from "@/components/PlayheadControls";
import PlayheadTypes from "@/components/PlayheadTypes";
import Transport from "@/components/Transport";
import WindowZoomer from "@/components/WindowZoomer";
import React, {useCallback, useEffect, useRef, useState} from "react";
import io, {Socket} from "socket.io-client";
import styled from "styled-components";
import Select from "react-select";
import {
  colourPalettes,
  defaultJuliaPlane,
  defaultMandelbrotPlane,
  drawPlayhead,
  generateJulia,
  generateMandelbrot,
  FractalPlane,
  getScalingFactors,
  OptionType,
  renderOptions,
} from "@/utils/fractal";

const palettes: OptionType[] = colourPalettes.map((color, index) => {
  return {value: index.toString(), label: index.toString()};
});

let socket: Socket;

export default function JuliasPlayheads() {
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
  const [demColorModulo, setDemColorModulo] = useState<number>(100);
  const [cx, setCx] = useState<number>(-0.7);
  const [cy, setCy] = useState<number>(0.27015);

  const [mandelbrotWindow, setMandelbrotWindow] = useState<FractalPlane>(defaultMandelbrotPlane)
  const [mandelbrot2DArray, setMandelbrot2DArray] = useState<number[][]>([]);
  const [mandelbrotMouseDown, setMandelbrotMouseDown] = useState<boolean>(false);
  const [mandelbrotSpeed, setMandelbrotSpeed] = useState<number>(50);
  const [mandelbrotVolume, setMandelbrotVolume] = useState<number>(0);
  const [mandelbrotThreshold, setMandelbrotThreshold] = useState<number>(0);
  const [mandelbrotInterval, setMandelbrotInterval] = useState<number>(0);
  const [mandelbrotPlayheadType, setMandelbrotPlayheadType] = useState<string>('down');
  const [mandelbrotTransport, setMandelbrotTransport] = useState<string>('stop');
  const [mandelbrotLoop, setMandelbrotLoop] = useState<boolean>(false);

  const mandelbrotCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const mandelbrotPlayheadCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [juliaWindow, setJuliaWindow] = useState<FractalPlane>(defaultJuliaPlane)
  const [julia2DArray, setJulia2DArray] = useState<number[][]>([]);
  const [juliaSpeed, setJuliaSpeed] = useState<number>(50);
  const [juliaVolume, setJuliaVolume] = useState<number>(0);
  const [juliaThreshold, setJuliaThreshold] = useState<number>(0);
  const [juliaInterval, setJuliaInterval] = useState<number>(0);
  const [juliaPlayheadType, setJuliaPlayheadType] = useState<string>('down');
  const [juliaTransport, setJuliaTransport] = useState<string>('stop');
  const [juliaLoop, setJuliaLoop] = useState<boolean>(false);

  const juliaCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const juliaPlayheadCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const socketInitializer = async () => {
    await fetch("/recursive-sound/api/socket");

    socket = io();

    socket.on("newIncomingMessage", (msg) => {
      console.log(msg);
    });
  };

  useEffect(() => {
    socketInitializer();
  }, []);

  useEffect(() => {
    julia();
  }, [cx, cy, demColorModulo, maxIterations, paletteNumber, lsmThreshold, demThreshold, canvasHeight, canvasWidth, juliaWindow, renderOption]);

  useEffect(() => {
    mandelbrot();
  }, [maxIterations, demColorModulo, paletteNumber, lsmThreshold, demThreshold, canvasHeight, canvasWidth, mandelbrotWindow, renderOption]);

  useEffect(() => {
    console.log('mandelbrotPlayheadType', mandelbrotPlayheadType, ' juliaPlayheadType', juliaPlayheadType);
  }, [mandelbrotPlayheadType, juliaPlayheadType]);

  useEffect(() => {
    if (mandelbrotTransport === 'play') {
      playMandelbrot(mandelbrotTransport);
    }
  }, [mandelbrotTransport]);

  useEffect(() => {
    if (juliaTransport === 'play') {
      playJulia(juliaTransport);
    }
  }, [juliaTransport]);

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
        demColorModulo,
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
        demColorModulo,
        parseInt(paletteNumber.value)
      );
      setJulia2DArray(juliaArray);
    }
  };

  const playMandelbrot = (transport: string) => {
    mandelbrot2DArray.forEach((row: number[], index: number) => {
      setTimeout(function () {
        if (mandelbrotPlayheadCanvasRef.current) drawPlayhead(mandelbrotPlayheadCanvasRef.current, index);
        socket?.emit("fractalMandelbrotRow", row);
      }, mandelbrotSpeed * index);
    });
  };

  const playJulia = (transport: string) => {
    julia2DArray.forEach((row: number[], index: number) => {
      setTimeout(function () {
        if (juliaPlayheadCanvasRef.current) drawPlayhead(juliaPlayheadCanvasRef.current, index);
        socket?.emit("fractalJuliaRow", row);
      }, juliaSpeed * index);
    });
  };

  const setJuliaComplexNumberByClick = useCallback((e: any) => {
    if (mandelbrotCanvasRef.current) {
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
    if (mandelbrotCanvasRef.current && mandelbrotMouseDown) {
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

  return (
    <Page>
      <ButtonContainer>
        <ButtonRow>
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
        </ButtonRow>
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
            /></Label>
        </ButtonRow>
        <ButtonRow>
          <Label>Iterations{" "}
            <Input
              type="number"
              min={25}
              max={5000}
              value={maxIterations}
              step={25}
              onChange={(value) => setMaxIterations(value.target.valueAsNumber)}
            /></Label>
          {renderOption.value && renderOption.value !== 'dem' && renderOption.value !== 'dem-raw' && (
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
          {renderOption.value && (renderOption.value === 'dem' || renderOption.value === 'dem-raw') && (
            <>
              <Label>Threshold{"   "}
                <Input
                  type="number"
                  value={demThreshold}
                  step={0.01}
                  min={0}
                  max={3}
                  onChange={(value) => setDemThreshold(value.target.valueAsNumber)}
                />
              </Label>
              <Label>Threshold{"   "}
                <Input
                  type="number"
                  value={overflow}
                  step={100000000000}
                  min={0}
                  max={100000000000000}
                  onChange={(value) => setOverflow(value.target.valueAsNumber)}
                />
              </Label>
              <Label>Color Mod{"   "}
                <Input
                  type="number"
                  value={demColorModulo}
                  step={1}
                  min={1}
                  max={10000}
                  onChange={(value) => setDemColorModulo(value.target.valueAsNumber)}
                />
              </Label>
            </>
          )}
        </ButtonRow>
        <ButtonRow>
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
            />
          </Label>
        </ButtonRow>
      </ButtonContainer>
      <ButtonContainer>
        <ButtonRow>
          <FractalContainer>
            <ControlRows>
              <PlayheadTypes playheadType={mandelbrotPlayheadType} setPlayheadType={setMandelbrotPlayheadType}/>
              <Transport
                transport={mandelbrotTransport}
                setTransport={setMandelbrotTransport}
                loop={mandelbrotLoop}
                setLoop={setMandelbrotLoop}
              />
              <PlayheadControls
                name={"Mandelbrot"}
                speed={mandelbrotSpeed}
                setSpeed={setMandelbrotSpeed}
                volume={mandelbrotVolume}
                setVolume={setMandelbrotVolume}
                threshold={mandelbrotThreshold}
                setThreshold={setMandelbrotThreshold}
                interval={mandelbrotInterval}
                setInterval={setMandelbrotInterval}
              />
            </ControlRows>
            <WindowZoomer name={"Mandelbrot"} window={mandelbrotWindow} defaultWindow={defaultMandelbrotPlane}
                          setWindow={setMandelbrotWindow}/>
            <DataModal title={"Show Mandelbrot Data"} matrixData={mandelbrot2DArray}/>
            <CanvasContainer>
              <Canvas
                ref={mandelbrotCanvasRef}
                width={canvasWidth}
                height={canvasHeight}
              />
              <Canvas
                ref={mandelbrotPlayheadCanvasRef}
                width={canvasWidth}
                height={canvasHeight}
                onMouseDown={setDownForMandelbrotMouseDown}
                onMouseUp={setUpForMandelbrotMouseDown}
                onMouseMove={setJuliaComplexNumber}
                onClick={setJuliaComplexNumberByClick}
              />
            </CanvasContainer>
          </FractalContainer>
          <FractalContainer>
            <ControlRows>
              <PlayheadTypes playheadType={juliaPlayheadType} setPlayheadType={setJuliaPlayheadType}/>
              <Transport
                transport={juliaTransport}
                setTransport={setJuliaTransport}
                loop={juliaLoop}
                setLoop={setJuliaLoop}
              />
              <PlayheadControls
                name={"Julia"}
                speed={juliaSpeed}
                setSpeed={setJuliaSpeed}
                volume={juliaVolume}
                setVolume={setJuliaVolume}
                threshold={juliaThreshold}
                setThreshold={setJuliaThreshold}
                interval={juliaInterval}
                setInterval={setJuliaInterval}
              />
            </ControlRows>
            <WindowZoomer name={"Julia"} window={juliaWindow} defaultWindow={defaultJuliaPlane}
                          setWindow={setJuliaWindow}/>
            <DataModal title={"Show Julia Data"} matrixData={julia2DArray}/>
            <CanvasContainer>
              <Canvas
                ref={juliaCanvasRef}
                width={canvasWidth}
                height={canvasHeight}
              />
              <Canvas
                ref={juliaPlayheadCanvasRef}
                width={canvasWidth}
                height={canvasHeight}
              />
            </CanvasContainer>
          </FractalContainer>
        </ButtonRow>
      </ButtonContainer>
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

const ControlKnob = styled.div`
  margin: 0.5rem;
`;

const ControlButton = styled.div<{
  onClick: () => void;
  selected: boolean;
  bottom?: boolean;
}>`
  background-color: ${props => props.selected ? '#FF0000' : '#EEE'};
  border: 1px solid #000;
  color: ${props => props.selected ? '#FFF' : '#FF0000'};
  font-size: 3rem;
  width: 4rem;
  height: 4rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  ${prop => prop.bottom && `border-top: none`};

  :not(:last-child) {
    border-right: none;
  }

  :after {
    content: "";
    clear: both;
    display: table;
  }

  :hover {
    background-color: ${props => props.selected ? '#FF0000' : '#DDD'};
  }
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
  margin-left: .5rem;
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
  flex-direction: column;
  align-items: flex-start;
  margin: 1rem;
  padding: 1rem;
`;

const CanvasContainer = styled.div`
  width: 256px;
  height: 256px;
  position: relative;
`;

const Canvas = styled.canvas`
  position: absolute;
  margin: 0.5rem;
  border: 1px solid #DDDDDD;
`;

export const ButtonContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
`;

export const ButtonRow = styled.div`
  margin: 1rem 0 0 0;
  display: flex;
  flex-flow: row wrap;
`;

export const ControlRow = styled.div`
  display: flex;
  flex-flow: row wrap;
`;

export const ControlRows = styled.div`
  display: flex;
  flex-direction: column;
`;