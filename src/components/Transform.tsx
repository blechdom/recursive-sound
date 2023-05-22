import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import Select from "react-select";
import {
  DataOptionType,
} from "@/utils/matrixGenerator";
import {
  transformMatrix,
  transforms,
} from "@/utils/matrixTransformer";

type TransformProps = {
  generatedMatrixData: number[][];
  setTransformedMatrixData: (matrixData: number[][]) => void;
}

const Transform: React.FC<TransformProps> = ({ generatedMatrixData, setTransformedMatrixData }) => {
  const [transform, setTransform] = useState<DataOptionType>(transforms[0]);
  const [transformType, setTransformType] = useState<string>("none");
  const [transformData, setTransformData] = useState<boolean>(false);
  const [dataToTransform, setDataToTransform] = useState<number[][]>(generatedMatrixData);
  const [canvasHeight, setCanvasHeight] = useState<number>(256);
  const [canvasWidth, setCanvasWidth] = useState<number>(256);
  const [matrixData, setMatrixData] = useState<number[][]>(generatedMatrixData);
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
    else {
      setMatrixData(generatedMatrixData);
    }
    setTransformedMatrixData(matrixData);
  }, [matrixData, ctx, setTransformedMatrixData, generatedMatrixData]);

  useEffect(() => {
    if(dataToTransform.length > 0 && dataToTransform[0].length > 0) {
      setCanvasHeight(dataToTransform.length);
      setCanvasWidth(dataToTransform[0].length);
      setMatrixData(transformMatrix({matrix: dataToTransform, transform: transformType}));
    }
  }, [dataToTransform, transformType]);

  function doTransform() {
    setTransformType(transform.value);
    setDataToTransform(transformData ? matrixData : generatedMatrixData);
  }

  function setMouseDownTrue() {
    setMouseDown(true);
  }
  function setMouseDownFalse() {
    setMouseDown(false);
  }

  /*const zoomMandelbrot = (value: string) => () => {
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
  }*/

  return (
    <>
    <StyledHead>2. Transform</StyledHead>
      <ButtonContainer>
        <ButtonRow>
          <DataSelect
            options={transforms}
            value={transform}
            onChange={(option) => {
              setTransform((option ?? transforms[0]) as DataOptionType);
            }}
          />
        </ButtonRow>
        <ButtonRow>
          <input
            type="checkbox"
            id="transform_checkbox"
            onChange={(event) => setTransformData(event.target.checked)}
          />
          <label htmlFor="transform_checkbox">use current transform data</label>
          <StyledTransformButton onClick={doTransform}>TRANSFORM</StyledTransformButton>
        </ButtonRow>
         <ButtonRow>
          <Label>Height: {canvasHeight}</Label>
          <Label>Width: {canvasWidth}</Label>
        </ButtonRow>
      </ButtonContainer>
      {/*<ButtonContainer>
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
      </ButtonContainer>*/}
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

const StyledTransformButton = styled.button`
  margin: 1rem;
  font-size: 1rem;
  min-height: 24px;  
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

export default Transform;