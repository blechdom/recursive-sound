import {
  ButtonContainer,
  ButtonRow,
  DataCanvas,
  DataContainer,
  DataSelect,
  Input,
  Label,
  StyledHead
} from "@/pages/dataTuner";
import {draw2DMatrix} from "@/utils/dataDrawing";
import {
  DataOptionType,
  dimensionsList,
  generatePattern,
  patterns1D,
  patterns2D,
} from "@/utils/matrixGenerator";
import DataModal from "./DataModal";
import React, {useEffect, useRef, useState} from "react";

type GenerateProps = {
  setGeneratedMatrixData: (matrixData: number[][]) => void;
}

const Generate: React.FC<GenerateProps> = ({setGeneratedMatrixData}) => {
  const [dimensions, setDimensions] = useState<DataOptionType>(dimensionsList[0]);
  const [pattern, setPattern] = useState<DataOptionType>(patterns1D[0]);
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
    if (matrixData.length > 0 && matrixData[0].length > 0) {
      if (ctx) {
        draw2DMatrix(matrixData, ctx);
      }
    }
    setGeneratedMatrixData(matrixData);
  }, [matrixData, ctx, setGeneratedMatrixData]);

  useEffect(() => {
    const newPattern = generatePattern({height: canvasHeight, width: canvasWidth, pattern: pattern.value});
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
      <StyledHead>Generate</StyledHead>
      <ButtonContainer>
        <ButtonRow>
          <DataSelect
            options={dimensionsList}
            value={dimensions}
            onChange={(option) => {
              setDimensions((option ?? dimensionsList[0]) as DataOptionType);
            }}
          />
          <DataSelect
            options={
              dimensions.value === "oneDimension" ? patterns1D : patterns2D}
            value={pattern}
            onChange={(option) => {
              setPattern(option as DataOptionType);
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
              onChange={(value: React.ChangeEvent<HTMLInputElement>) => setCanvasHeight(value.target.valueAsNumber)}
            />
          </Label>
          <Label>Width{" "}
            <Input
              type="number"
              min={16}
              max={1024}
              value={canvasWidth}
              step={1}
              onChange={(value: React.ChangeEvent<HTMLInputElement>) => setCanvasWidth(value.target.valueAsNumber)}
            />
          </Label>
          <DataModal title={"Show Data"} matrixData={matrixData}/>
        </ButtonRow>
        <DataContainer>
          <DataCanvas
            ref={dataCanvasRef}
            width={canvasWidth}
            height={canvasHeight}
            onMouseDown={setMouseDownTrue}
            onMouseUp={setMouseDownFalse}
          />
        </DataContainer>
      </ButtonContainer>
    </>
  );
}

export default Generate;