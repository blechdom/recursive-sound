import {
  ButtonContainer,
  ButtonRow,
  DataSelect,
  StyledHead,
} from "@/pages/dataTuner";
import {DataOptionType,} from "@/utils/matrixGenerator";
import {performanceTypes, mappings1D, mappings2D, playMethods2D} from "@/utils/matrixPerformer";
import React, {useState} from "react";
import PerformWebAudio from "@/components/PerformWebAudio";
import PerformWebMidi from "@/components/PerformWebMidi";
import PerformOSC from "@/components/PerformOSC";

type PerformProps = {
  interpretedMatrixData: number[] | number[][];
}

const Perform: React.FC<PerformProps> = ({interpretedMatrixData}) => {
  const [performanceType, setPerformanceType] = useState<DataOptionType>(performanceTypes[0]);
  const [mapping1D, setMapping1D] = useState<DataOptionType>(mappings1D[0]);
  const [mapping2D, setMapping2D] = useState<DataOptionType>(mappings2D[0]);
  const [playMethod, setPlayMethod] = useState<DataOptionType>(playMethods2D[0]);

  return (
    <>
      <StyledHead>4. Perform</StyledHead>
      <br/>
      <ButtonContainer>
        <ButtonRow>
          <DataSelect
            options={performanceTypes}
            value={performanceType}
            onChange={(option) => {
              setPerformanceType((option ?? performanceTypes[0]) as DataOptionType);
            }}
          />
          {!Array.isArray(interpretedMatrixData[0]) ? (
            <DataSelect
              options={mappings1D}
              value={mapping1D}
              onChange={(option) => {
                setMapping1D((option ?? mappings1D[0]) as DataOptionType);
              }}
            />
          ) : (
            <>
              <DataSelect
                options={mappings2D}
                value={mapping2D}
                onChange={(option) => {
                  setMapping2D((option ?? mappings2D[0]) as DataOptionType);
                }}
              />
              <DataSelect
                options={playMethods2D}
                value={playMethod}
                onChange={(option) => {
                  setPlayMethod((option ?? playMethods2D[0]) as DataOptionType);
                }}
              />
            </>
          )}
        </ButtonRow>
      </ButtonContainer>
      {performanceType.value === "WebAudio" &&
        <PerformWebAudio performMatrixData={interpretedMatrixData} mapping={mapping1D.value}/>}
      {performanceType.value === "WebMIDI" && <PerformWebMidi/>}
      {performanceType.value === "OSC" && <PerformOSC/>}
    </>
  );
}

export default Perform;