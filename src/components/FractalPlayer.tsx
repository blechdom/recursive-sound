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
  clearCanvas,
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
  threshold: number;
  highest: number;
  lowest: number;
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
  const [currentFractalRow, setCurrentFractalRow] = useState<number[]>(Array(size).fill(0));

  const [fractalSpeed, setFractalSpeed] = useState<number>(50);
  const [playing, setPlaying] = useState<boolean>(false);

  const [playType, setPlayType] = useState<string>('audio');

  const [fractalPlayheadType, setFractalPlayheadType] = useState<string>('down');
  const [fractalTransport, setFractalTransport] = useState<string>('stop');
  const [fractalTimeouts, setFractalTimeouts] = useState<any[]>([]);
  const [rowIndex, setRowIndex] = useState<number>(0);
  const [fractalLoop, setFractalLoop] = useState<boolean>(true);

  const [audioParams, setAudioParams] = useState<AudioParamsType>({
    volume: 0,
    threshold: 0,
    highest: 0,
    lowest: 0,
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
    setFractalTransport('stop');
  }, [fractalPlayheadType, fractalLoop, program]);

  useEffect(() => {
    getFractal();
  }, [cx, cy, size, fractalWindow, program]);

  useEffect(() => {
    if (fractalTransport === 'play') {
      setPlaying(true);
      playFractal();
    } else if (fractalTransport === 'stop') {
      setPlaying(false);
      stopFractal();
    } else if (fractalTransport === 'pause') {
      setPlaying(false);
      pauseFractal();
    } else if (fractalTransport === 'replay') {
      setFractalTransport('play');
    }
  }, [fractalTransport]);

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

  const stopFractal = () => {
    fractalTimeouts.forEach(async (timeoutId) => {
      await clearTimeout(timeoutId);
    });
    setRowIndex(-1);
    //setCurrentFractalRow(Array(size).fill(0));
    if (fractalPlayheadCanvasRef.current) clearCanvas(fractalPlayheadCanvasRef.current);
    //setFractalPauseTimeElapsed(0);
  }

  const pauseFractal = () => {
    console.log('pause Fractal');
    setFractalTransport('stop');
    // setFractalPauseTimeElapsed(fractalPauseTimeElapsed + timeSince);
  }

  const playFractal = async () => {
    const timeoutIds: any[] = [];
    for (let i = 0; i < playheadFractalData.length; i++) {
      let index = i;
      if (fractalPlayheadType === 'up' || fractalPlayheadType === 'left' || fractalPlayheadType === 'in' || fractalPlayheadType === 'ccw') {
        index = playheadFractalData.length - 1 - i;
      }
      const timeoutId = setTimeout(function () {
        if (fractalPlayheadCanvasRef.current) {
          drawPlayhead(fractalPlayheadCanvasRef.current, fractalPlayheadType, index);
        }
        setRowIndex(index);
        //setCurrentFractalRow(playheadFractalData[index]);
        if (i >= playheadFractalData.length - 1) {
          if (fractalLoop) {
            setFractalTransport('replay');
          } else {
            setFractalTransport('stop');
          }
        }
      }, (fractalSpeed * i));
      timeoutIds.push(timeoutId);
      setFractalTimeouts(timeoutIds);
    }
  };

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
              transport={fractalTransport}
              setTransport={setFractalTransport}
              loop={fractalLoop}
              setLoop={setFractalLoop}
            />
            {playType === 'osc' ? (
              <PlayheadOSCControls
                fractal={fractal}
                fractalRow={rowIndex === -1 ? Array(size).fill(0) : playheadFractalData[rowIndex]}
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
                  rowIndex={rowIndex}
                  fractalRow={rowIndex === -1 ? Array(size).fill(0) : playheadFractalData[rowIndex]}
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