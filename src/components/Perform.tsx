import {transforms} from "@/utils/matrixTransformer";
import io, {Socket} from "socket.io-client";
import React, { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import Select from "react-select";
import dynamic from 'next/dynamic'
import {
  DataOptionType,
} from "@/utils/matrixGenerator";
import {
  performMatrix,
  performanceTypes,
  playMethods,
} from "@/utils/matrixPerformer";

const Knob = dynamic(() => import("el-vis-audio").then((mod) => mod.KnobParamLabel),
  { ssr: false }
)

let socket: Socket;

type PerformProps = {
  interpretedMatrixData: number[][];
}

const Perform: React.FC<PerformProps> = ({ interpretedMatrixData }) => {
  const [performanceType, setPerformanceType] = useState<DataOptionType>(performanceTypes[0]);
  const [playMethod, setPlayMethod] = useState<DataOptionType>(playMethods[0]);
  const [matrixData, setMatrixData] = useState<number[][]>([]);
  const [msBetweenRows, setMsBetweenRows] = useState<number>(50);
  const [volume, setVolume] = useState<number>(0);

  useEffect(() => {
    socketInitializer().then(() => console.log('socket initialized'));
  }, []);

  useEffect(() => {
    socket?.emit("volume", volume );
  }, [volume]);

 useEffect(() => {
  //sendMandelbrot(matrixData)
}, [matrixData]);

  function doPerformance() {
    setMatrixData(performMatrix({ matrix: matrixData, performanceType: performanceType.value }));
  }

  const socketInitializer = async () => {
    await fetch("/recursive-sound/api/socket");

    socket = io();

    socket.on("newIncomingMessage", (msg) => {
    });
  };

  const sendMandelbrot = useCallback((performMatrix: number[][]) => {
    performMatrix.forEach((row: number[], index: number) => {
      setTimeout(function() {
         socket?.emit("fractalMandelbrotRow", row);
      }, msBetweenRows * index);
    });
  }, [msBetweenRows]);

  return (
    <>
      <StyledHead>4. Perform</StyledHead>
      <ButtonContainer>
        <ButtonRow>
          <DataSelect
            options={performanceTypes}
            value={performanceType}
            onChange={(option) => {
              setPerformanceType((option ?? performanceTypes[0]) as DataOptionType);
            }}
          />
          <DataSelect
            options={playMethods}
            value={playMethod}
            onChange={(option) => {
              setPlayMethod((option ?? playMethods[0]) as DataOptionType);
            }}
          />
        </ButtonRow>
        <ButtonRow>
        <Knob
          id={"speed"}
          label={"Speed (ms)"}
          knobValue={msBetweenRows}
          step={0.01}
          min={1}
          max={250}
          onKnobInput={setMsBetweenRows}
        />
        <Knob
          id={"volume"}
          label={"Volume (OSC)"}
          knobValue={volume}
          step={0.01}
          min={0}
          max={1}
          onKnobInput={setVolume}
        />
        </ButtonRow>
        <ButtonRow>
           <StyledButton onClick={doPerformance}>PERFORM</StyledButton>
        </ButtonRow>
      </ButtonContainer>
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

export default Perform;