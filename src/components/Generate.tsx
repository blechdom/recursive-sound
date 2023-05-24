import {
  ButtonContainer,
  ButtonRow,
  DataCanvas,
  DataContainer,
  DataSelect,
  Input,
  Label,
  ScrollDiv,
  Scroller,
  StyledHead,
} from "@/pages/dataTuner";
import {draw2DMatrix} from "@/utils/dataDrawing";
import {DataOptionType, generatePattern, patterns} from "@/utils/matrixGenerator";
import React, {useEffect, useRef, useState} from "react";

type GenerateProps = {
  setGeneratedMatrixData: (matrixData: number[][]) => void;
}

const Generate: React.FC<GenerateProps> = ({setGeneratedMatrixData}) => {
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
                function (subArray: number[]) {
                  return subArray.map(function (elem: number) {
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

export default Generate;