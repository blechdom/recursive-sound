import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";
import Generate from "@/components/Generate";
import Transform from "@/components/Transform";
import Interpret from "@/components/Interpret";
import Perform from "@/components/Perform";

const ArrowIcon = () => {
  return <FontAwesomeIcon
        icon={faArrowRight}
        style={{ fontSize: 18, color: "red" }}
      />
};

export default function DataTuner() {
  const [generatedMatrixData, setGeneratedMatrixData] = useState<number[][]>([]);
  const [transformedMatrixData, setTransformedMatrixData] = useState<number[][]>([]);
  const [interpretedMatrixData, setInterpretedMatrixData] = useState<number[] | number[][]>([]);

  return (
    <Page>
      <h2>Data Tuner 2D</h2>
      <StyledSubhead>Generate <ArrowIcon /> Transform <ArrowIcon /> Interpret <ArrowIcon /> Perform</StyledSubhead>
      <Generate setGeneratedMatrixData={setGeneratedMatrixData} />
      <Transform generatedMatrixData={generatedMatrixData} setTransformedMatrixData={setTransformedMatrixData}/>
      <Interpret transformedMatrixData={transformedMatrixData} setInterpretedMatrixData={setInterpretedMatrixData}/>
      <Perform interpretedMatrixData={interpretedMatrixData} />
    </Page>
  );
}

const Page = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0.5rem;
  font-family: "Roboto", sans-serif;
`;

const StyledSubhead = styled.h3`
  margin-top: -1rem;
`;