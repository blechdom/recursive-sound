import dynamic from "next/dynamic";
import React, {useEffect, useState} from "react";
import styled from "styled-components";
import {AudioParamsType, KnobRow} from "@/components/FractalPlayer";

type PlayheadAudioControlsProps = {
  fractal: string;
  speed: number;
  numShades: number;
  shadeOffset: number;
  cx?: number;
  cy?: number;
  setCx?: (cx: number) => void;
  setCy?: (cy: number) => void;
  setNumShades: (numShades: number) => void;
  setShadeOffset: (shadeOffset: number) => void;
  setSpeed: (speed: number) => void;
  setAudioParams: (params: AudioParamsType) => void;
}

const PlayheadAudioControls: React.FC<PlayheadAudioControlsProps> = (
  {
    fractal,
    numShades,
    shadeOffset,
    speed,
    cx,
    cy,
    setCx,
    setCy,
    setNumShades,
    setShadeOffset,
    setSpeed,
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
    <>
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
            id={`${fractal}-speed`}
            label={"speed"}
            diameter={30}
            labelWidth={30}
            fontSize={11}
            tooltip={"speed of playback in milliseconds between rows"}
            knobValue={speed}
            step={0.01}
            min={1}
            max={250}
            onKnobInput={setSpeed}
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
      </KnobRow>
      <KnobRow>
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
        <ControlKnob>
          <Knob
            id={`${fractal}-numShades`}
            label={"areas"}
            diameter={30}
            labelWidth={30}
            fontSize={11}
            tooltip={"number of value areas to divide the values into for coloring and sonifying (modulo)"}
            knobValue={numShades}
            step={1}
            min={2}
            max={32}
            onKnobInput={setNumShades}
          />
        </ControlKnob>
        <ControlKnob>
          <Knob
            id={`${fractal}-shadeOffset`}
            label={"offset"}
            diameter={30}
            labelWidth={30}
            fontSize={11}
            tooltip={"number to offset modulo by for animating the colors and sonification areas"}
            knobValue={shadeOffset}
            step={1}
            min={0}
            max={30}
            onKnobInput={setShadeOffset}
          />
        </ControlKnob>
      </KnobRow>
      {fractal === 'julia' &&
        <>
          <KnobRow>
            <ControlKnob>
              <Knob
                id={`${fractal}-cx`}
                label={"Complex X"}
                diameter={30}
                labelWidth={30}
                fontSize={11}
                tooltip={"complex X for julia set"}
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
                diameter={30}
                labelWidth={30}
                fontSize={10}
                tooltip={"Complex Y for julia set"}
                knobValue={cy}
                step={0.00001}
                min={-2}
                max={2}
                onKnobInput={setCy}
              />
            </ControlKnob>
          </KnobRow>
        </>
      }
    </>
  );
};

const Knob = dynamic(() => import("el-vis-audio").then((mod) => mod.KnobParamLabel),
  {ssr: false}
)

const ControlKnob = styled.div`
  margin: 0 0.2rem 0 0.2rem;
`;

export default PlayheadAudioControls;