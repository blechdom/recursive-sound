import DataModal from "@/components/DataModal";
import PlayheadControls from "@/components/PlayheadControls";
import PlayheadTypes from "@/components/PlayheadTypes";
import Transport from "@/components/Transport";
import WindowZoomer from "@/components/WindowZoomer";
import {FlexColumn, Input, Label} from "@/pages/fractalPlayheads";
import React, {useCallback, useEffect, useRef, useState} from "react";
import io, {Socket} from "socket.io-client";
import styled from "styled-components";
import Select from "react-select";
import {
  colourPalettes,
  defaultJuliaPlane,
  defaultMandelbrotPlane,
  drawPlayhead,
  generateFractal,
  FractalPlane,
  getScalingFactors,
  OptionType,
  renderOptions,
  lsmAudioOptions,
  rotateMatrixCW90,
  clearCanvas,
} from "@/utils/playheadFractals";

const palettes: OptionType[] = colourPalettes.map((color, index) => {
  return {value: index.toString(), label: index.toString()};
});

let socket: Socket;

type PlayheadFractalProps = {
  fractal: string;
  cx?: number;
  cy?: number;
  setCx?: (cx: number) => void;
  setCy?: (cy: number) => void;
}

const PlayheadFractal: React.FC<PlayheadFractalProps> = ({fractal, cx = -0.7, cy = 0.27015, setCx, setCy}) => {
  const plane: FractalPlane = fractal === 'mandelbrot' ? defaultMandelbrotPlane : defaultJuliaPlane;

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

  const [mandelbrotMouseDown, setMandelbrotMouseDown] = useState<boolean>(false);

  const [fractalWindow, setFractalWindow] = useState<FractalPlane>(plane)
  const [fractal2DArray, setFractal2DArray] = useState<number[][]>([]);
  const [audio2DArray, setAudio2DArray] = useState<number[][]>([]);
  const [fractalTransformed, setFractalTransformed] = useState<number[][]>([]);
  const [fractalSpeed, setFractalSpeed] = useState<number>(50);
  const [fractalPlayheadType, setFractalPlayheadType] = useState<string>('down');
  const [fractalTransport, setFractalTransport] = useState<string>('stop');
  const [fractalTimeouts, setFractalTimeouts] = useState<any[]>([]);
  const [fractalPauseTimeElapsed, setFractalPauseTimeElapsed] = useState<number>(0);
  const [fractalLoop, setFractalLoop] = useState<boolean>(false);

  const fractalCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fractalPlayheadCanvasRef = useRef<HTMLCanvasElement | null>(null);


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
    if (fractalPlayheadType === 'left' || fractalPlayheadType === 'right') {
      setFractalTransformed(rotateMatrixCW90(audio2DArray));
    } else {
      setFractalTransformed(audio2DArray);
    }
  }, [fractalPlayheadType, audio2DArray]);

  useEffect(() => {
    setFractalTransport('stop');
  }, [fractalPlayheadType]);

  useEffect(() => {
    setFractalTransport('stop');
  }, [fractalLoop]);

  useEffect(() => {
    getFractal();
  }, [cx, cy, maxIterations, demColorModulo, paletteNumber, lsmThreshold, demThreshold, canvasHeight, canvasWidth, fractalWindow, renderOption]);

  useEffect(() => {
    if (fractalTransport === 'play') {
      playFractal();
    } else if (fractalTransport === 'stop') {
      stopFractal();
    } else if (fractalTransport === 'pause') {
      pauseFractal();
    } else if (fractalTransport === 'replay') {
      setFractalTransport('play');
    }
  }, [fractalTransport]);

  const getFractal = () => {
    if (fractalCanvasRef.current) {
      const threshold = renderOption.value === 'dem' ? demThreshold : lsmThreshold;
      let fractalArray: {
        fractalData: number[][],
        audioData: number[][],
        min: number,
        max: number,
        aMin: number,
        aMax: number
      } = generateFractal(
        fractal,
        fractalCanvasRef.current,
        fractalWindow,
        canvasWidth,
        canvasHeight,
        renderOption.value,
        maxIterations,
        threshold,
        cx,
        cy,
        overflow,
        demColorModulo,
        parseInt(paletteNumber.value)
      );
      setFractal2DArray(fractalArray.fractalData);
      setAudio2DArray(fractalArray.audioData);
    }
  };

  const stopFractal = () => {
    fractalTimeouts.forEach(async (timeoutId) => {
      await clearTimeout(timeoutId);
    });
    socket?.emit("fractalMandelbrotRow", fractalTransformed[0].fill(0));
    if (fractalPlayheadCanvasRef.current) clearCanvas(fractalPlayheadCanvasRef.current);
    setFractalPauseTimeElapsed(0);
  }

  const pauseFractal = () => {
    console.log('pause Fractal');
    setFractalTransport('stop');
    // setFractalPauseTimeElapsed(fractalPauseTimeElapsed + timeSince);
  }

  const playFractal = async () => {
    const timeoutIds: any[] = [];
    for (let i = 0; i < fractalTransformed.length; i++) {
      let index = i;
      if (fractalPlayheadType === 'up' || fractalPlayheadType === 'left' || fractalPlayheadType === 'in' || fractalPlayheadType === 'ccw') {
        index = fractalTransformed.length - 1 - i;
      }
      const timeoutId = setTimeout(function () {
        if (fractalPlayheadCanvasRef.current) {
          drawPlayhead(fractalPlayheadCanvasRef.current, fractalPlayheadType, index);
        }
        socket?.emit("fractalMandelbrotRow", fractalTransformed[index]);
        if (i >= fractalTransformed.length - 1) {
          if (fractalLoop) {
            setFractalTransport('replay');
          } else {
            setFractalTransport('stop');
          }
        }
      }, (fractalSpeed * i) - fractalPauseTimeElapsed);
      timeoutIds.push(timeoutId);
      setFractalTimeouts(timeoutIds);
    }
  };

  const setJuliaComplexNumberByClick = useCallback((e: any) => {
    setComplex(e);
  }, [canvasHeight, canvasWidth, fractalWindow]);

  const setJuliaComplexNumber = useCallback((e: any) => {
    if (mandelbrotMouseDown) setComplex(e);
  }, [canvasHeight, canvasWidth, fractalWindow, mandelbrotMouseDown]);

  function setComplex(e: any) {
    if (fractalCanvasRef.current) {
      const rect = fractalCanvasRef.current.getBoundingClientRect();
      const pos = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      const scalingFactors = getScalingFactors(fractalWindow, canvasWidth, canvasHeight);
      const newCx = fractalWindow.x_min + pos.x * scalingFactors.x;
      const newCy = fractalWindow.y_min + pos.y * scalingFactors.y;
      if (fractal == 'mandelbrot' && setCx && setCy) {
        setCx(newCx);
        setCy(newCy);
      }
    }
  }

  function setDownForMandelbrotMouseDown() {
    setMandelbrotMouseDown(true);
  }

  function setUpForMandelbrotMouseDown() {
    setMandelbrotMouseDown(false);
  }

  return (
    <Page>
      <ButtonContainer>
        <FractalContainer>
          <ControlRows>
            <PlayheadTypes playheadType={fractalPlayheadType} setPlayheadType={setFractalPlayheadType}/>
            <Transport
              transport={fractalTransport}
              setTransport={setFractalTransport}
              loop={fractalLoop}
              setLoop={setFractalLoop}
            />
            <PlayheadControls
              name={fractal}
              speed={fractalSpeed}
              setSpeed={setFractalSpeed}
              socket={socket}
            />
          </ControlRows>
          <WindowZoomer name={fractal} window={fractalWindow} defaultWindow={plane}
                        setWindow={setFractalWindow}/>
          <Label>generate julia: click and drag over mandelbrot</Label>
          <CanvasContainer>
            <Canvas
              ref={fractalCanvasRef}
              width={canvasWidth}
              height={canvasHeight}
            />
            {fractal === 'mandelbrot' ? (
              <Canvas
                ref={fractalPlayheadCanvasRef}
                width={canvasWidth}
                height={canvasHeight}
                onMouseDown={setDownForMandelbrotMouseDown}
                onMouseUp={setUpForMandelbrotMouseDown}
                onMouseMove={setJuliaComplexNumber}
                onClick={setJuliaComplexNumberByClick}
              />
            ) : (
              <Canvas
                ref={fractalPlayheadCanvasRef}
                width={canvasWidth}
                height={canvasHeight}
              />
            )}
          </CanvasContainer>

          <DataModal title={"Show Fractal Data"} matrixData={fractal2DArray}/>
          <DataModal title={"Show Playhead Data"} matrixData={fractalTransformed}/>
          <DataModal title={"Show Audio Data"} matrixData={audio2DArray}/>

        </FractalContainer>
      </ButtonContainer>
      <FlexColumn>
        <Label>Algorithm{" "}
          <FractalSelect
            options={renderOptions}
            value={renderOption}
            onChange={(option) => {
              setRenderOption((option ?? renderOptions[1]) as OptionType);
            }}
          /></Label>
        <Label>Colors{" "}
          <FractalSelect
            options={palettes}
            value={paletteNumber}
            onChange={(option) => {
              setPaletteNumber((option ?? palettes[0]) as OptionType);
            }}
          /></Label>
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
      </FlexColumn>
    </Page>
  );
}

const Page = styled.div`
  display: flex;
  flex-direction: column;
  font-family: "Roboto", sans-serif;
  font-size: 0.5rem;
`;

const FractalSelect = styled(Select)`
  padding-left: .5rem;
  font-size: 0.85rem;
  max-width: 512px;
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
  flex-direction: row;
`;

export const FlexRow = styled.div`
  display: flex;
  flex-direction: row;
`;

export const ControlRows = styled.div`
  display: flex;
  flex-direction: column;
`;

export const ControlRow = styled.div`
  display: flex;
  flex-flow: row wrap;
`;

export const ControlButton = styled.div<{
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

export default PlayheadFractal;