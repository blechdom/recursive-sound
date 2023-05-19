import io, {Socket} from "socket.io-client";
import React, {useCallback, useEffect, useRef, useState} from "react";
import styled from "styled-components";
import Select from "react-select";
import dynamic from 'next/dynamic'
import {
  OptionType
} from "@/utils/fractal";

import {
  ascendingLine,
  descendingLine,
  defaultMatrix,
  firstHalfOn,
  firstHalfOff,
  testOptions
} from "@/utils/testMatrices";

const Knob = dynamic(() => import("el-vis-audio").then((mod) => mod.KnobParamLabel),
  { ssr: false }
)

let socket: Socket;

export default function DataTuner() {
  const [testOption, setTestOption] = useState<OptionType>(testOptions[0]);
  const [canvasHeight, setCanvasHeight] = useState<number>(256);
  const [canvasWidth, setCanvasWidth] = useState<number>(256);
  const [matrixData, setMatrixData] = useState<number[][]>([]);
  const [msBetweenRows, setMsBetweenRows] = useState<number>(50);
  const [volume, setVolume] = useState<number>(0);

  const dataCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    socketInitializer().then(() => console.log('socket initialized'));
  }, []);

  useEffect(() => {
    socket?.emit("volume", volume );
  }, [volume]);

  useEffect(() => {
    generateMatrix();
  }, [canvasHeight, canvasWidth, matrixData, testOption]);

  useEffect(() => {
    console.log('matrixData', JSON.stringify(matrixData));
    sendMandelbrot(matrixData)
  }, [matrixData]);

  useEffect(() => {
    switch (testOption.value) {
      case 'ascendingLine':
        setMatrixData(ascendingLine({ height: canvasHeight, width: canvasWidth }));
        break;
      case 'descendingLine':
        setMatrixData(descendingLine({ height: canvasHeight, width: canvasWidth }));
        break;
      case 'firstHalfOn':
        setMatrixData(firstHalfOn({ height: canvasHeight, width: canvasWidth }));
        break;
      case 'firstHalfOff':
        setMatrixData(firstHalfOff({ height: canvasHeight, width: canvasWidth }));
        break;
      default:
        setMatrixData(defaultMatrix({ height: canvasHeight, width: canvasWidth }));
        break;
    }
  }, [testOption])

  const socketInitializer = async () => {
    await fetch("/recursive-sound/api/socket");

    socket = io();

    socket.on("newIncomingMessage", (msg) => {
      console.log(msg);
    });
    generateMatrix();
  };

  const generateMatrix = () => {
    //const threshold = testOption.value === 'dem' ? demThreshold : lsmThreshold;
    if (dataCanvasRef.current) {
      const ctx = dataCanvasRef.current.getContext("2d");
      if(ctx) {
        for (let y = 0; y < matrixData.length; y++) {
          for (let x = 0; x < matrixData[0].length; x++) {
            const colorValue = (1-matrixData[x][y]) * 255;
            ctx.fillStyle = `rgb(${colorValue}, ${colorValue}, ${colorValue})`;
            ctx.fillRect(x, y, 1, 1)
          }
        }
      }
    }
  };

  const sendMandelbrot = useCallback((fractal2DArray: number[][]) => {
    fractal2DArray.forEach((row: number[], index: number) => {
      setTimeout(function() {
         socket?.emit("fractalMandelbrotRow", row);
      }, msBetweenRows * index);
    });
  }, [msBetweenRows]);

  function setDownForMandelbrotMouseDown() {
    setMandelbrotMouseDown(true);
  }
  function setUpForMandelbrotMouseDown() {
    setMandelbrotMouseDown(false);
  }

  const zoomMandelbrot = (value: string) => () => {
    if (value === 'reset') {
      setMatrixData({
        x_min: -2.5,
        y_min: -1.25,
        x_max: 0.8,
        y_max: 1.25
      });
    }
    if (value === 'ul') {
      const tempWindow = dataWindow;
      tempWindow.x_max = tempWindow.x_max * 0.75;
      tempWindow.y_max = tempWindow.y_max * 0.75;
      setMatrixData({...tempWindow});
    }
    if (value === 'l') {
      const tempWindow = dataWindow;
      tempWindow.x_max = tempWindow.x_max * 0.75;
      tempWindow.y_max = tempWindow.y_max * 0.885;
      tempWindow.y_min = tempWindow.y_min * 0.885;
      setMatrixData({...tempWindow});
    }
    if (value === 'r') {
      const tempWindow = dataWindow;
      tempWindow.x_min = tempWindow.x_min * 0.75;
      tempWindow.y_max = tempWindow.y_max * 0.885;
      tempWindow.y_min = tempWindow.y_min * 0.885;
      setMatrixData({...tempWindow});
    }
    else if (value === 'ur') {
      const tempWindow = dataWindow;
      tempWindow.x_min = tempWindow.x_min * 0.75;
      tempWindow.y_max = tempWindow.y_max * 0.75;
      setMatrixData({...tempWindow});
    }
    else if (value === 'll') {
      const tempWindow = dataWindow;
      tempWindow.x_max = tempWindow.x_max * 0.75;
      tempWindow.y_min = tempWindow.y_min * 0.75;
      setMatrixData({...tempWindow});
    }
    else if (value === 'lr') {
      const tempWindow = dataWindow;
      tempWindow.x_min = tempWindow.x_min * 0.75;
      tempWindow.y_min = tempWindow.y_min * 0.75;
      setMatrixData({...tempWindow});
    }
    if (value === 'up') {
      const tempWindow = dataWindow;
      tempWindow.y_max = tempWindow.y_max * 0.75;
      tempWindow.x_max = tempWindow.x_max * 0.885;
      tempWindow.x_min = tempWindow.x_min * 0.885;
      setMatrixData({...tempWindow});
    }
    if (value === 'd') {
      const tempWindow = dataWindow;
      tempWindow.y_min = tempWindow.y_min * 0.75;
      tempWindow.x_max = tempWindow.x_max * 0.885;
      tempWindow.x_min = tempWindow.x_min * 0.885;
      setMatrixData({...tempWindow});
    }
    else if (value === 'in') {
      const tempWindow = dataWindow;
      tempWindow.x_min = tempWindow.x_min * 0.92;
      tempWindow.y_min = tempWindow.y_min * 0.92;
      tempWindow.x_max = tempWindow.x_max * 0.92;
      tempWindow.y_max = tempWindow.y_max * 0.92;
      setMatrixData({...tempWindow});
    }
  }

  return (
    <Page>
      <h1>Data Tuner (Matrices)</h1>
      <ButtonContainer>
        <ButtonRow>
          <Label>Test Matrices{" "}
            <DataSelect
              options={testOptions}
              value={testOption}
              onChange={(option) => {
                setTestOption((option ?? testOptions[1]) as OptionType);
              }}
            />
          </Label>
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
            />
          </Label>
          <Label>Width{" "}
            <Input
              type="number"
              min={16}
              max={1024}
              value={canvasWidth}
              step={1}
              onChange={(value) => setCanvasWidth(value.target.valueAsNumber)}
            />
          </Label>
        </ButtonRow>
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
        <ButtonColumn>
        <Label>Zoom</Label>
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

      <DataContainer>
        <DataCanvas
          ref={dataCanvasRef}
          width={canvasWidth}
          height={canvasHeight}
          onMouseDown={setDownForMandelbrotMouseDown}
          onMouseUp={setUpForMandelbrotMouseDown}
        />
        <Scroller height={canvasHeight}>
          <ScrollDiv>
            {JSON.stringify(
              matrixData.map(
                function(subArray: number[]){
                  return subArray.map(function(elem: number) {
                    return Number(elem.toFixed(2));
                  });
                }))
            }
          </ScrollDiv>
        </Scroller>
      </DataContainer>
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

const DataSelect = styled(Select)`
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

const DataContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const DataCanvas = styled.canvas`
  border: 1px solid #DDDDDD;
  border-radius: 4px 0 4px 0;
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

const Scroller = styled.div<{ height: number }>`
  background-color: #F5F5F5;
  height: ${({ height }) => height}px;
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
