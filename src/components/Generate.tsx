import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import Select from "react-select";
import {
  DataOptionType,
  generatePattern,
  patterns
} from "@/utils/matrixGenerator";

type GenerateProps = {
  setGeneratedMatrixData: (matrixData: number[][]) => void;
}

const Generate: React.FC<GenerateProps> = ({ setGeneratedMatrixData }) => {
  const [pattern, setPattern] = useState<DataOptionType>(patterns[0]);
  const [canvasHeight, setCanvasHeight] = useState<number>(256);
  const [canvasWidth, setCanvasWidth] = useState<number>(256);
  const [matrixData, setMatrixData] = useState<number[][]>([]);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [mouseDown, setMouseDown] = useState<boolean>(false);

  const dataCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (dataCanvasRef.current) {
      setCtx(dataCanvasRef.current.getContext("2d"));
    }
  }, []);

 useEffect(() => {
  if(matrixData.length > 0 && matrixData[0].length > 0) {
    if (ctx) {
      for (let y = 0; y < matrixData.length; y++) {
        for (let x = 0; x < matrixData[0].length; x++) {
          const colorValue = (1 - matrixData[y][x]) * 255;
          ctx.fillStyle = `rgb(${colorValue}, ${colorValue}, ${colorValue})`;
          ctx.fillRect(x, y, 1, 1)
        }
      }
    }
  }
  setGeneratedMatrixData(matrixData);
}, [matrixData, ctx, setGeneratedMatrixData]);

  useEffect(() => {
    const newPattern = generatePattern({ height: canvasHeight, width: canvasWidth, pattern: pattern.value });
    setMatrixData(newPattern);
  }, [pattern.value, canvasHeight, canvasWidth])

  function setMouseDownTrue() {
    setMouseDown(true);
  }
  function setMouseDownFalse() {
    setMouseDown(false);
  }

  return (
    <>
      <StyledHead>1. Generate</StyledHead>
      <ButtonContainer>
        <ButtonRow>
          <DataSelect
            options={patterns}
            value={pattern}
            onChange={(option) => {
              setPattern((option ?? patterns[1]) as DataOptionType);
            }}
          />
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
      </ButtonContainer>
      <DataContainer>
        <DataCanvas
          ref={dataCanvasRef}
          width={canvasWidth}
          height={canvasHeight}
          onMouseDown={setMouseDownTrue}
          onMouseUp={setMouseDownFalse}
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
    </>
  );
}

const StyledHead = styled.h2`
  margin: 1rem 0 0 0;
`;

const DataSelect = styled(Select)`
  padding-left: .5rem;
  font-size: 0.85rem; 
  max-width: 512px; 
  min-width: 200px;
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

export default Generate;