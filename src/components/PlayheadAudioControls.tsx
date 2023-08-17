import dynamic from "next/dynamic";
import React, {useEffect, useState} from "react";
import styled from "styled-components";
import {AudioParamsType, KnobRow} from "@/components/FractalPlayer";

type PlayheadAudioControlsProps = {
  fractal: string;
  setAudioParams: (params: AudioParamsType) => void;
}

const PlayheadAudioControls: React.FC<PlayheadAudioControlsProps> = (
  {
    fractal,
    setAudioParams
  }) => {

  const [volume, setVolume] = useState<number>(0);
  const [threshold, setThreshold] = useState<number>(0.09);
  const [lowest, setLowest] = useState<number>(200);
  const [highest, setHighest] = useState<number>(6000);
  const [smoothing, setSmoothing] = useState<number>(0.02);

  useEffect(() => {
    setAudioParams({volume, lowest, highest, threshold, smoothing});
  }, [volume, lowest, highest, threshold, smoothing, setAudioParams]);

  return (
    <KnobRow>
      <ControlKnob>
        <Knob
          id={`${fractal}-volume`}
          label={"volume"}
          diameter={30}
          labelWidth={30}
          fontSize={11}
          tooltip={"main volume of this sonified fractal"}
          knobValue={volume}
          step={0.01}
          min={0}
          max={1}
          onKnobInput={setVolume}
        />
      </ControlKnob>
      <ControlKnob>
        <Knob
          id={`${fractal}-lowest`}
          label={"lowest"}
          diameter={30}
          labelWidth={30}
          fontSize={11}
          tooltip={"lowest frequency of the oscillator bank (hz)"}
          knobValue={lowest}
          step={0.01}
          min={0}
          max={500}
          onKnobInput={setLowest}
        />
      </ControlKnob>
      <ControlKnob>
        <Knob
          id={`${fractal}-highest`}
          label={"highest"}
          diameter={30}
          labelWidth={30}
          fontSize={11}
          tooltip={"highest frequency of the oscillator bank (hz)"}
          knobValue={highest}
          step={0.01}
          min={20}
          max={20000}
          onKnobInput={setHighest}
        />
      </ControlKnob>
      <ControlKnob>
        <Knob
          id={`${fractal}-threshold`}
          label={"thresh"}
          diameter={30}
          labelWidth={30}
          fontSize={11}
          tooltip={"values below this threshold will be ignored during playback"}
          knobValue={threshold}
          step={0.001}
          min={0}
          max={1}
          onKnobInput={setThreshold}
        />
      </ControlKnob>
      <ControlKnob>
        <Knob
          id={`${fractal}-smoothing`}
          label={"smooth"}
          diameter={30}
          labelWidth={30}
          fontSize={11}
          tooltip={"smoothing of frequency when changing (0.02 = 20ms)"}
          knobValue={smoothing}
          step={0.01}
          min={0}
          max={0.5}
          onKnobInput={setSmoothing}
        />
      </ControlKnob>
    </KnobRow>
  );
};

const Knob = dynamic(() => import("el-vis-audio").then((mod) => mod.KnobParamLabel),
  {ssr: false}
)

const ControlKnob = styled.div`
  margin: 0 0.4rem 0 0.4rem;
`;

export default PlayheadAudioControls;