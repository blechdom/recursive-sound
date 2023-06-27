import Generate from "@/components/Generate";
import Interpret from "@/components/Interpret";
import Perform from "@/components/Perform";
import Transform from "@/components/Transform";
import React, {useEffect, useState} from "react";
import Select from "react-select";
import styled from "styled-components";

export default function DataTuner() {
  const [generatedMatrixData, setGeneratedMatrixData] = useState<number[][]>([]);
  const [transformedMatrixData, setTransformedMatrixData] = useState<number[][]>([]);
  const [interpretedMatrixData, setInterpretedMatrixData] = useState<number[] | number[][]>([]);
  const [dimensionsToPerform, setDimensionsToPerform] = useState<1 | 2 | 3>(1);
  const [dataToPerform, setDataToPerform] = useState<number[] | number[][]>([]);

  useEffect(() => {
    if (Array.isArray(interpretedMatrixData[0])) setDimensionsToPerform(2);
    else setDimensionsToPerform(1);
    setDataToPerform(interpretedMatrixData);
  }, [interpretedMatrixData]);

  return (
    <Page>
      <h2>Data Tuner</h2>
      <Generate setGeneratedMatrixData={setGeneratedMatrixData}/>
      <Transform generatedMatrixData={generatedMatrixData} setTransformedMatrixData={setTransformedMatrixData}/>
      <Interpret transformedMatrixData={transformedMatrixData} setInterpretedMatrixData={setInterpretedMatrixData}/>
      <Perform dimensions={dimensionsToPerform} data={dataToPerform}/>
    </Page>
  );
}

const Page = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0.5rem;
  font-family: "Roboto", sans-serif;
`;

export const StyledHead = styled.h2`
  margin: 1.5rem 0 0 0;
`;

export const DataSelect = styled(Select)`
  padding-left: .5rem;
  font-size: 0.85rem;
  max-width: 512px;
  min-width: 200px;
`;

export const Label = styled.label`
  display: flex;
  flex-direction: row;
  font-size: .85rem;
  padding: .5rem;
  height: 100%;
  align-items: center;
`;

export const DataContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

export const DataCanvas = styled.canvas`
  border: 1px solid #DDDDDD;
  border-radius: 4px 0 4px 0;
`;

export const ScrollDiv = styled.div`
  font-family: monospace;
  border: 1px solid #DDDDDD;
  border-radius: 4px 0 4px 0;
  color: #3B3C3E;
  font-size: 7px;
  font-weight: bold;
  left: -1px;
  padding: 10px 7px 5px;
`;

export const Scroller = styled.div<{ height: number }>`
  background-color: #F5F5F5;
  height: ${({height}) => height}px;
  overflow: scroll;
`;

export const ButtonContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
`;

export const ButtonRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

export const StyledProcessButton = styled.button`
  margin: 1rem;
  font-size: 1rem;
  min-height: 24px;
`;

export const Input = styled.input`
  min-height: 30px;
  padding: 0.5rem;
  margin-left: .5rem;
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