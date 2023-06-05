import {
  ButtonContainer,
  ButtonRow,
  DataCanvas,
  DataContainer,
  DataSelect,
  Label,
  ScrollDiv,
  Scroller,
  StyledHead,
  StyledProcessButton,
} from "@/pages/dataTuner";
import {draw2DMatrix} from "@/utils/dataDrawing";
import {DataOptionType,} from "@/utils/matrixGenerator";
import {transformMatrix, transforms,} from "@/utils/matrixTransformer";
import DataModal from "./DataModal";
import React, {useEffect, useRef, useState} from "react";


type TransformProps = {
  generatedMatrixData: number[][];
  setTransformedMatrixData: (matrixData: number[][]) => void;
}

const Transform: React.FC<TransformProps> = ({generatedMatrixData, setTransformedMatrixData}) => {
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
    if (matrixData.length > 0 && matrixData[0].length > 0 && ctx) {
      setCanvasHeight(matrixData.length);
      setCanvasWidth(matrixData[0].length);
      draw2DMatrix(matrixData, ctx);
    } else {
      setMatrixData(generatedMatrixData);
    }
    setTransformedMatrixData(matrixData);
  }, [matrixData, ctx, setTransformedMatrixData, generatedMatrixData]);

  useEffect(() => {
    if (dataToTransform.length > 0 && dataToTransform[0].length > 0) {
      setMatrixData(transformMatrix({matrix: dataToTransform, transform: transformType}));
    }
  }, [generatedMatrixData, dataToTransform, transformType]);

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
      <StyledHead>Transform</StyledHead>
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
          <StyledProcessButton onClick={doTransform}>TRANSFORM</StyledProcessButton>
        </ButtonRow>
        <ButtonRow>
          <Label>Height: {canvasHeight}</Label>
          <Label>Width: {canvasWidth}</Label>
        </ButtonRow>
        <DataModal title={"Show Data"} matrixData={matrixData}/>
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
      </DataContainer>
    </>
  );
}

export default Transform;