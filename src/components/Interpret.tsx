import {
  ButtonContainer,
  ButtonRow,
  DataCanvas,
  DataContainer,
  DataSelect,
  Label,
  StyledHead,
  StyledProcessButton,
} from "@/pages/dataTuner";
import {draw2DMatrix, drawArrayAs2DMatrix} from "@/utils/dataDrawing";
import {DataOptionType,} from "@/utils/matrixGenerator";
import {interpretations, interpretMatrix,} from "@/utils/matrixInterpreter";
import DataModal from "./DataModal";
import React, {useEffect, useRef, useState} from "react";

type InterpretProps = {
  transformedMatrixData: number[][];
  setInterpretedMatrixData: (matrixData: number[] | number[][]) => void;
}

const Interpret: React.FC<InterpretProps> = ({transformedMatrixData, setInterpretedMatrixData}) => {
  const [interpretation, setInterpretation] = useState<DataOptionType>(interpretations[0]);
  const [interpretationType, setInterpretationType] = useState<string>("averageRows");
  const [dataToInterpret, setDataToInterpret] = useState<number[][]>(transformedMatrixData);
  const [canvasHeight, setCanvasHeight] = useState<number>(256);
  const [canvasWidth, setCanvasWidth] = useState<number>(256);
  const [dataHeight, setDataHeight] = useState<number>(256);
  const [dataWidth, setDataWidth] = useState<number>(256);
  const [matrixData, setMatrixData] = useState<number[] | number[][]>([]);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);

  const dataCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (dataCanvasRef.current) {
      setCtx(dataCanvasRef.current.getContext("2d"));
    }
  }, []);

  useEffect(() => {
    if (Array.isArray(matrixData[0])) {
      if (matrixData.length > 0 && matrixData[0].length > 0 && ctx) {
        setCanvasHeight(matrixData[0].length);
        setCanvasWidth(matrixData.length);
        draw2DMatrix(matrixData as number[][], ctx);
      } else {
        setMatrixData(transformedMatrixData);
      }
    } else {
      if (matrixData.length > 0) {
        setCanvasHeight(matrixData.length);
        setCanvasWidth(matrixData.length);
        setDataHeight(1);
        setDataWidth(matrixData.length);
        if (ctx) {
          drawArrayAs2DMatrix(matrixData as number[], ctx);
        }
      } else {
        setMatrixData(transformedMatrixData);
      }
    }
    setInterpretedMatrixData(matrixData);
  }, [matrixData, ctx, setInterpretedMatrixData, transformedMatrixData]);

  useEffect(() => {
    if (dataToInterpret.length > 0 && dataToInterpret[0].length > 0) {
      setMatrixData(interpretMatrix({matrix: dataToInterpret, interpretation: interpretationType}));
    }
  }, [dataToInterpret, interpretationType]);

  function doInterpretation() {
    setInterpretationType(interpretation.value);
    setDataToInterpret(transformedMatrixData);
  }

  return (
    <>
      <StyledHead>Interpret</StyledHead>
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
          <StyledProcessButton onClick={doInterpretation}>Interpret</StyledProcessButton>
        </ButtonRow>
        <ButtonRow>
          <Label>Height: {dataHeight}</Label>
          <Label>Width: {dataWidth}</Label>
        </ButtonRow>
        <DataModal title={"Show Data"} matrixData={matrixData}/>
      </ButtonContainer>

      <DataContainer>
        <DataCanvas
          ref={dataCanvasRef}
          width={canvasWidth}
          height={canvasHeight}
        />
      </DataContainer>
    </>
  );
}

export default Interpret;
