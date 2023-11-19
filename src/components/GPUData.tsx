import React, {useState} from "react";
import styled from "styled-components";


type GPUDataProps = {
  title: string;
  matrixData: Float32Array;
  color?: string;
}

const GPUData: React.FC<GPUDataProps> = ({title, matrixData}) => {
  return (
    <>
      <h3>{title}</h3>
      <ScrollDiv>
        {(JSON.stringify(Array.from(matrixData))).slice(0, 4096) + '...'}
      </ScrollDiv>
    </>);
}

export const ScrollDiv = styled.div`
  font-family: monospace;
  border: 1px solid #DDDDDD;
  border-radius: 4px 0 4px 0;
  wrap-option: wrap;
  overflow-wrap: anywhere;
  color: #3B3C3E;
  font-size: 10px;
  font-weight: bold;
  left: -1px;
  padding: 10px 7px 5px;
`;

export default GPUData;