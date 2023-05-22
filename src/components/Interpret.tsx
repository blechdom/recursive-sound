import Transform from "@/components/Transform";
import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import Select from "react-select";
import {
  DataOptionType,
} from "@/utils/matrixGenerator";
import {
  interpretMatrix,
  interpretations,
} from "@/utils/matrixInterpreter";

type InterpretProps = {
  transformedMatrixData: number[][];
  setInterpretedMatrixData: (matrixData: number[][]) => void;
}

const Interpret: React.FC<InterpretProps> = ({ transformedMatrixData, setInterpretedMatrixData }) => {
  const [interpretation, setInterpretation] = useState<DataOptionType>(interpretations[0]);
  const [interpretationType, setInterpretationType] = useState<string>("1:1");
  const [dataToInterpret, setDataToInterpret] = useState<number[][]>(transformedMatrixData);
  const [canvasHeight, setCanvasHeight] = useState<number>(256);
  const [canvasWidth, setCanvasWidth] = useState<number>(256);
  const [matrixData, setMatrixData] = useState<number[][]>([]);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);

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
    else {
      setMatrixData(transformedMatrixData);
    }
    setInterpretedMatrixData(matrixData);
  }, [matrixData, ctx, setInterpretedMatrixData, transformedMatrixData]);

  useEffect(() => {
    if(dataToInterpret.length > 0 && dataToInterpret[0].length > 0) {
      setCanvasHeight(dataToInterpret.length);
      setCanvasWidth(dataToInterpret[0].length);
      setMatrixData(interpretMatrix({matrix: dataToInterpret, interpretation: interpretationType}));
    }
  }, [dataToInterpret, interpretationType]);

  function doInterpretation() {
    setInterpretationType(interpretation.value);
    setDataToInterpret(transformedMatrixData);
  }

  return (
    <>
      <StyledHead>3. Interpret</StyledHead>
      <ButtonContainer>
        <ButtonRow>
            <DataSelect
              options={interpretations}
              value={interpretation}
              onChange={(option) => {
                setInterpretation((option ?? interpretations[0]) as DataOptionType);
              }}
            />
        </ButtonRow>
        <ButtonRow>
        <StyledButton onClick={doInterpretation}>Interpret</StyledButton>
        </ButtonRow>
         <ButtonRow>
          <Label>Height: {canvasHeight}</Label>
          <Label>Width: {canvasWidth}</Label>
        </ButtonRow>
      </ButtonContainer>

      <DataContainer>
        <DataCanvas
          ref={dataCanvasRef}
          width={canvasWidth}
          height={canvasHeight}
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
  margin: 1.5rem 0 0 0;
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
const StyledButton = styled.button`
  margin: 1rem;
  font-size: 1rem;
  min-height: 24px;  
`;

export default Interpret;
