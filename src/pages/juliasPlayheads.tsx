import DataModal from "@/components/DataModal";
import WindowZoomer from "@/components/WindowZoomer";
import {ButtonRow} from "@/pages/dataTuner";
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
  {ssr: false}
)

const palettes: OptionType[] = colourPalettes.map((color, index) => {
  return {value: index.toString(), label: index.toString()};
});

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
  const [mandelbrotWindow, setMandelbrotWindow] = useState<FractalPlane>(defaultMandelbrotPlane)
  const [juliaWindow, setJuliaWindow] = useState<FractalPlane>(defaultJuliaPlane)
  const [mandelbrot2DArray, setMandelbrot2DArray] = useState<number[][]>([]);
  const [julia2DArray, setJulia2DArray] = useState<number[][]>([]);
  const [mandelbrotMouseDown, setMandelbrotMouseDown] = useState<boolean>(false);
  const [msBetweenRows, setMsBetweenRows] = useState<number>(50);
  const [demColorModulo, setDemColorModulo] = useState<number>(100);
  const [cx, setCx] = useState<number>(-0.7);
  const [cy, setCy] = useState<number>(0.27015);
  const [volume, setVolume] = useState<number>(0);

  const mandelbrotCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const juliaCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    mandelbrot();
    julia();
  }, []);

  useEffect(() => {
    julia();
  }, [cx, cy, demColorModulo, maxIterations, paletteNumber, lsmThreshold, demThreshold, canvasHeight, canvasWidth, juliaWindow, renderOption]);

  useEffect(() => {
    mandelbrot();
  }, [maxIterations, demColorModulo, paletteNumber, lsmThreshold, demThreshold, canvasHeight, canvasWidth, mandelbrotWindow, renderOption]);

  useEffect(() => {
    playMandelbrot(mandelbrot2DArray)
  }, [mandelbrot2DArray]);

  useEffect(() => {
    playJulia(julia2DArray)
  }, [julia2DArray]);

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

  const playMandelbrot = useCallback((fractal2DArray: number[][]) => {
    fractal2DArray.forEach((row: number[], index: number) => {
      setTimeout(function () {
        // socket?.emit("fractalMandelbrotRow", row);
      }, msBetweenRows * index);
    });
  }, [msBetweenRows]);

  const playJulia = useCallback((fractal2DArray: number[][]) => {
    fractal2DArray.forEach((row: number[], index: number) => {
      setTimeout(function () {
        // socket?.emit("fractalJuliaRow", row);
      }, msBetweenRows * index);
    });
  }, [msBetweenRows]);

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
        <Label>ms speed{"   "}
          <Input
            type="number"
            value={msBetweenRows}
            step={0.01}
            min={1}
            max={250}
            onChange={(value) => setMsBetweenRows(value.target.valueAsNumber)}
          />
        </Label>
        <Knob
          id={"speed"}
          label={"Speed (ms)"}
          knobValue={msBetweenRows}
          step={0.01}
          min={1}
          max={250}
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
      </ButtonContainer>
      <ButtonContainer>
        <FractalContainer>
          <WindowZoomer name={"Mandelbrot"} window={mandelbrotWindow} defaultWindow={defaultMandelbrotPlane}
                        setWindow={setMandelbrotWindow}/>
          <DataModal title={"Show Mandelbrot Data"} matrixData={mandelbrot2DArray}/>
          <MandelbrotCanvas
            ref={mandelbrotCanvasRef}
            width={canvasWidth}
            height={canvasHeight}
            onMouseDown={setDownForMandelbrotMouseDown}
            onMouseUp={setUpForMandelbrotMouseDown}
            onMouseMove={setJuliaComplexNumber}
            onClick={setJuliaComplexNumberByClick}
          />
        </FractalContainer>
        <FractalContainer>
          <WindowZoomer name={"Julia"} window={juliaWindow} defaultWindow={defaultJuliaPlane}
                        setWindow={setJuliaWindow}/>
          <DataModal title={"Show Julia Data"} matrixData={julia2DArray}/>
          <JuliaCanvas
            ref={juliaCanvasRef}
            width={canvasWidth}
            height={canvasHeight}
          />
        </FractalContainer>
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
`;

const MandelbrotCanvas = styled.canvas`
  margin: 0.5rem;
  border: 1px solid #DDDDDD;
  border-radius: 4px 0 4px 0;
`;

const JuliaCanvas = styled.canvas`
  margin: 0.5rem;
  border: 1px solid #DDDDDD;
  border-radius: 4px 0 4px 0;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
`;
