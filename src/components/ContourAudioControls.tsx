import ContourAudioEngine from "@/components/ContourAudioEngine";
import WebRenderer from "@elemaudio/web-renderer";
import dynamic from "next/dynamic";
import React, {useEffect, useState} from "react";
import styled from "styled-components";
import {AudioParamsType, KnobRow} from "@/components/FractalPlayer";

type ContourAudioControlsProps = {
  contour: { angle: number; duration: number }[];
  audioContext: AudioContext | null;
  core: WebRenderer;
  playing: boolean;
}

const ContourAudioControls: React.FC<ContourAudioControlsProps> = (
  {
    contour,
    audioContext,
    core,
    playing,
  }) => {

  const [volume, setVolume] = useState<number>(0);
  const [threshold, setThreshold] = useState<number>(0.09);
  const [freqScaling, setFreqScaling] = useState<number>(1);
  const [highest, setHighest] = useState<number>(6000);
  const [duration, setDuration] = useState<number>(5);
  const [audioParams, setAudioParams] = useState<AudioParamsType>({
    volume: 0,
    threshold: 0,
    highest: 0,
    freqScaling: 0,
    duration: 0,
  });

  useEffect(() => {
    setAudioParams({volume, freqScaling, highest, threshold, duration});
  }, [volume, freqScaling, highest, threshold, duration, setAudioParams]);

  return (<>
      <KnobRow>
        <ContourAudioEngine
          contour={contour}
          audioContext={audioContext}
          core={core}
          playing={playing}
          audioParams={audioParams}
        />
        <ControlKnob>
          <Knob
            id={`contour-volume`}
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
      </KnobRow>
      <KnobRow>
        <ControlKnob>
          <Knob
            id={`freqScaling`}
            label={"freqScale"}
            diameter={30}
            labelWidth={30}
            fontSize={11}
            tooltip={"scale Frequency by this value"}
            knobValue={freqScaling}
            step={0.01}
            min={0}
            max={10}
            onKnobInput={setFreqScaling}
          />
        </ControlKnob>
        {/*<ControlKnob>
          <Knob
            id={`contour-highest`}
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
            id={`contour-threshold`}
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
        </ControlKnob>*/}
        <ControlKnob>
          <Knob
            id={`contour-duration`}
            label={"durScale"}
            diameter={30}
            labelWidth={30}
            fontSize={11}
            tooltip={"duration of frequency when changing (0.02 = 20ms)"}
            knobValue={duration}
            step={0.1}
            min={0}
            max={100}
            onKnobInput={setDuration}
          />
        </ControlKnob>
      </KnobRow>
    </>
  );
};

const Knob = dynamic(() => import("el-vis-audio").then((mod) => mod.KnobParamLabel),
  {ssr: false}
)

const ControlKnob = styled.div`
  margin: -0.5rem 0.4rem 0 0.4rem;
`;

export default ContourAudioControls;