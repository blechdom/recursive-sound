import AudioEngine from "@/components/AudioEngine";
import PlayheadOSCControls from "@/components/PlayheadOSCControls";
import PlayheadAudioControls from "@/components/PlayheadAudioControls";
import PlayheadData from "@/components/PlayheadData";
import PlayheadProgram from "@/components/PlayheadProgram";
import PlayheadSizes from "@/components/PlayheadSizes";
import Playheads from "@/components/Playheads";
import Transport from "@/components/Transport";
import WindowZoomer from "@/components/WindowZoomer";
import WebRenderer from "@elemaudio/web-renderer";
import React, {useCallback, useEffect, useRef, useState} from "react";
import styled from "styled-components";
import {
  defaultJuliaPlane,
  defaultMandelbrotPlane,
  drawPlayhead,
  generateFractal,
  FractalPlane,
  getScalingFactors,
  rotateMatrixCW90,
} from "@/utils/fractalGenerator";

type FractalPlayerProps = {
  fractal: string;
  audioContext: AudioContext | null;
  core: WebRenderer;
  cx?: number;
  cy?: number;
  setCx: (cx: number) => void;
  setCy: (cy: number) => void;
}

export type AudioParamsType = {
  volume: number;
  lowest: number;
  highest: number;
  threshold: number;
  smoothing: number;
}

const FractalPlayer: React.FC<FractalPlayerProps> = ({
                                                       fractal,
                                                       cx = -0.7,
                                                       cy = 0.27015,
                                                       audioContext,
                                                       core,
                                                       setCx,
                                                       setCy
                                                     }) => {
  const maxIterations = 100;
  const lsmThreshold = 100;

  const plane: FractalPlane = fractal === 'mandelbrot' ? defaultMandelbrotPlane : defaultJuliaPlane;
  const [size, setSize] = useState<number>(256);
  const [program, setProgram] = useState<string>('lsm-binary');

  const [mandelbrotMouseDown, setMandelbrotMouseDown] = useState<boolean>(false);

  const [fractalWindow, setFractalWindow] = useState<FractalPlane>(plane)
  const [rawFractalData, setRawFractalData] = useState<number[][]>([]);
  const [audioFractalData, setAudioFractalData] = useState<number[][]>([]);
  const [playheadFractalData, setPlayheadFractalData] = useState<number[][]>([]);
  const [rowIndex, setRowIndex] = useState<number>(-1);
  const [playheadRowIndex, setPlayheadRowIndex] = useState<number>(-1);

  const [fractalSpeed, setFractalSpeed] = useState<number>(50);
  const [playing, setPlaying] = useState<boolean>(false);

  const [playType, setPlayType] = useState<string>('audio');

  const [fractalPlayheadType, setFractalPlayheadType] = useState<string>('down');

  const [audioParams, setAudioParams] = useState<AudioParamsType>({
    volume: 0,
    lowest: 0,
    highest: 0,
    threshold: 0,
    smoothing: 0,
  });

  const fractalCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fractalPlayheadCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (fractalPlayheadType === 'left' || fractalPlayheadType === 'right') {
      setPlayheadFractalData(rotateMatrixCW90(audioFractalData));
    } else {
      setPlayheadFractalData(audioFractalData);
    }
  }, [fractalPlayheadType, audioFractalData]);

  useEffect(() => {
    getFractal();
  }, [cx, cy, size, fractalWindow, program]);


  const getFractal = () => {
    if (fractalCanvasRef.current) {
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
        size,
        program,
        maxIterations,
        lsmThreshold, // or demThreshold
        cx,
        cy
      );
      setRawFractalData(fractalArray.fractalData);
      setAudioFractalData(fractalArray.audioData);
      setPlayheadFractalData(fractalArray.audioData);
    }
  };

  useEffect(() => {
    if (rowIndex < 0) {
      setPlayheadRowIndex(-1);
    } else {
      let index = rowIndex;
      if (fractalPlayheadType === 'up' || fractalPlayheadType === 'left' || fractalPlayheadType === 'in' || fractalPlayheadType === 'ccw') {
        index = playheadFractalData.length - 1 - rowIndex;
      }
      if (fractalPlayheadCanvasRef.current) {
        drawPlayhead(fractalPlayheadCanvasRef.current, fractalPlayheadType, index);
      }
      setPlayheadRowIndex(index);
    }
  }, [rowIndex, playheadFractalData, fractalPlayheadType, size]);

  const setJuliaComplexNumberByClick = useCallback((e: any) => {
    setComplex(e);
  }, [size, size, fractalWindow]);

  const setJuliaComplexNumber = useCallback((e: any) => {
    if (mandelbrotMouseDown) setComplex(e);
  }, [size, size, fractalWindow, mandelbrotMouseDown]);

  function setComplex(e: any) {
    if (fractalCanvasRef.current) {
      const rect = fractalCanvasRef.current.getBoundingClientRect();
      const pos = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      const scalingFactors = getScalingFactors(fractalWindow, size);
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
            <ControlRow>
              <ControlButton onClick={() => setPlayType(playType === 'osc' ? 'audio' : 'osc')} height={'2rem'}
                             width={'6rem'}>
                <ButtonText>{playType}</ButtonText>
              </ControlButton>
            </ControlRow>
            <PlayheadSizes size={size} setSize={setSize} color={'#005dd7'} height={'2rem'}/>
            <PlayheadProgram
              program={program}
              setProgram={setProgram}
              color={'#3d8c40'}
              height={'2rem'}
            />
            <Playheads playheadType={fractalPlayheadType} setPlayheadType={setFractalPlayheadType}/>
            <Transport
              playing={playing}
              rowIndex={rowIndex}
              size={size}
              speed={fractalSpeed}
              setPlaying={setPlaying}
              setRowIndex={setRowIndex}
            />
            {playType === 'osc' ? (
              <PlayheadOSCControls
                fractal={fractal}
                fractalRow={playheadRowIndex === -1 ? Array(size).fill(0) : playheadFractalData[playheadRowIndex]}
                speed={fractalSpeed}
                cx={cx}
                cy={cy}
                setCx={setCx}
                setCy={setCy}
                setSpeed={setFractalSpeed}
              />
            ) : (<>
                <PlayheadAudioControls
                  fractal={fractal}
                  cx={cx}
                  cy={cy}
                  speed={fractalSpeed}
                  setCx={setCx}
                  setCy={setCy}
                  setSpeed={setFractalSpeed}
                  setAudioParams={setAudioParams}
                />
                <AudioEngine
                  fractal={fractal}
                  rowIndex={playheadRowIndex}
                  fractalRow={playheadRowIndex === -1 ? Array(size).fill(0) : playheadFractalData[playheadRowIndex]}
                  audioContext={audioContext}
                  core={core}
                  playing={playing}
                  audioParams={audioParams}
                />

              </>
            )}
          </ControlRows>
          <WindowZoomer name={fractal} window={fractalWindow} defaultWindow={plane}
                        setWindow={setFractalWindow}/>
          <Label>generate julia: click and drag over mandelbrot</Label>
          <CanvasContainer>
            <Canvas
              ref={fractalCanvasRef}
              width={size}
              height={size}
            />
            {fractal === 'mandelbrot' ? (
              <Canvas
                ref={fractalPlayheadCanvasRef}
                width={size}
                height={size}
                onMouseDown={setDownForMandelbrotMouseDown}
                onMouseUp={setUpForMandelbrotMouseDown}
                onMouseMove={setJuliaComplexNumber}
                onClick={setJuliaComplexNumberByClick}
              />
            ) : (
              <Canvas
                ref={fractalPlayheadCanvasRef}
                width={size}
                height={size}
              />
            )}
          </CanvasContainer>
          <ControlRows>
            <ControlRow>
              <PlayheadData title={"Fractal Data"} matrixData={rawFractalData}/>
              <PlayheadData title={"Audio Data"} matrixData={audioFractalData}/>
              <PlayheadData title={"Playhead Data"} matrixData={playheadFractalData}/>
            </ControlRow>
          </ControlRows>
        </FractalContainer>
      </ButtonContainer>
    </Page>
  );
}

const Page = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  font-family: "Roboto", sans-serif;
  font-size: 0.5rem;
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
  margin: -0.25rem 0.5rem 0 0;
  border: 1px solid #DDDDDD;
`;

export const ButtonContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
`;

export const ControlRows = styled.div`
  display: flex;
  flex-direction: column;
`;

export const ControlRow = styled.div`
  display: flex;
  flex-flow: row wrap;
`;

export const ButtonText = styled.span`
  font-size: 0.8rem;
`;

export const ControlButton = styled.div<{
  onClick: () => void;
  selected?: boolean;
  bottom?: boolean;
  color?: string;
  width?: string;
  height?: string;
}>`
  background-color: ${props => props.selected ? props.color ?? '#FF0000' : '#EEE'};
  outline: 1px solid #000;
  color: ${props => props.selected ? '#FFF' : props.color ?? '#FF0000'};
  font-size: 1.5rem;
  width: ${props => props.width ?? '4rem'};
  height: ${props => props.height ?? '4rem'};
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
    background-color: ${props => props.selected ? props.color ?? '#FF0000' : '#DDD'};
  }
`;

export const Label = styled.label`
  display: flex;
  flex-direction: row;
  font-size: .85rem;
  padding: .5rem;
  height: 100%;
  align-items: center;
`;

export const KnobRow = styled.div`
  margin: 1rem 0 0 0;
  display: flex;
  flex-direction: row;
`;

export default FractalPlayer;