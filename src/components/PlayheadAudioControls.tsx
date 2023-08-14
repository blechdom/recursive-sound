import dynamic from "next/dynamic";
import React, {useEffect, useState} from "react";
import styled from "styled-components";
import {AudioParamsType, KnobRow} from "@/components/FractalPlayer";

type PlayheadAudioControlsProps = {
  fractal: string;
  speed: number;
  cx?: number;
  cy?: number;
  setCx?: (cx: number) => void;
  setCy?: (cy: number) => void;
  setSpeed: (speed: number) => void;
  setAudioParams: (params: AudioParamsType) => void;
}

const PlayheadAudioControls: React.FC<PlayheadAudioControlsProps> = (
  {
    fractal,
    speed,
    cx,
    cy,
    setCx,
    setCy,
    setSpeed,
    setAudioParams
  }) => {

  const [volume, setVolume] = useState<number>(0);
  const [threshold, setThreshold] = useState<number>(0);
  const [interval, setInterval] = useState<number>(1);
  const [lowest, setLowest] = useState<number>(75);

  useEffect(() => {
    setAudioParams({volume, threshold, interval, lowest});
  }, [volume, threshold, interval, lowest, setAudioParams]);

  return (
    <>
      <KnobRow>
        <ControlKnob>
          <Knob
            id={`${fractal}-speed`}
            label={"Speed (ms)"}
            knobValue={speed}
            step={0.01}
            min={1}
            max={250}
            onKnobInput={setSpeed}
          />
        </ControlKnob>
        <ControlKnob>
          <Knob
            id={`${fractal}-volume`}
            label={"Volume"}
            knobValue={volume}
            step={0.01}
            min={0}
            max={1}
            onKnobInput={setVolume}
          />
        </ControlKnob>
        <ControlKnob>
          <Knob
            id={`${fractal}-threshold`}
            label={"Threshold"}
            knobValue={threshold}
            step={0.001}
            min={0}
            max={1}
            onKnobInput={setThreshold}
          />
        </ControlKnob>
        <ControlKnob>
          <Knob
            id={`${fractal}-interval`}
            label={"Interval"}
            knobValue={interval}
            step={0.01}
            min={0.01}
            max={12}
            onKnobInput={setInterval}
          />
        </ControlKnob>
      </KnobRow>
      <KnobRow>
        <ControlKnob>
          <Knob
            id={`${fractal}-lowest`}
            label={"Lowest"}
            knobValue={lowest}
            step={0.01}
            min={0}
            max={500}
            onKnobInput={setLowest}
          />
        </ControlKnob>
        {fractal === 'julia' &&
          <>
            <ControlKnob>
              <Knob
                id={`${fractal}-cx`}
                label={"Complex X"}
                knobValue={cx}
                step={0.00001}
                min={-2}
                max={2}
                onKnobInput={setCx}
              />
            </ControlKnob>
            <ControlKnob>
              <Knob
                id={`${fractal}-cy`}
                label={"Complex Y"}
                knobValue={cy}
                step={0.00001}
                min={-2}
                max={2}
                onKnobInput={setCy}
              />
            </ControlKnob>
          </>
        }
      </KnobRow>
    </>
  );
};

const Knob = dynamic(() => import("el-vis-audio").then((mod) => mod.KnobParamLabel),
  {ssr: false}
)

const ControlKnob = styled.div`
  margin: 0 0.4rem 0 0.4rem;
`;

export default PlayheadAudioControls;