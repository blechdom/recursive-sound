import {ButtonRow} from "@/pages/juliasPlayheads";
import dynamic from "next/dynamic";
import React from "react";
import styled from "styled-components";

type PlayheadControlsProps = {
  name: string;
  speed: number;
  volume: number;
  threshold: number;
  interval: number;
  setSpeed: (speed: number) => void;
  setVolume: (volume: number) => void;
  setThreshold: (threshold: number) => void;
  setInterval: (interval: number) => void;
}

const PlayheadControls: React.FC<PlayheadControlsProps> = ({
                                                             name,
                                                             speed,
                                                             volume,
                                                             threshold,
                                                             interval,
                                                             setSpeed,
                                                             setVolume,
                                                             setThreshold,
                                                             setInterval
                                                           }) => {
  return (
    <ButtonRow>
      <ControlKnob>
        <Knob
          id={`${name}-speed`}
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
          id={`${name}-volume`}
          label={"Volume (OSC)"}
          knobValue={volume}
          step={0.01}
          min={0}
          max={1}
          onKnobInput={setVolume}
        />
      </ControlKnob>
      <ControlKnob>
        <Knob
          id={`${name}-threshold`}
          label={"Threshold"}
          knobValue={threshold}
          step={0.01}
          min={0}
          max={1}
          onKnobInput={setThreshold}
        />
      </ControlKnob>
      <ControlKnob>
        <Knob
          id={`${name}-interval`}
          label={"Interval"}
          knobValue={interval}
          step={0.01}
          min={0}
          max={1}
          onKnobInput={setInterval}
        />
      </ControlKnob>
    </ButtonRow>
  );
};

const Knob = dynamic(() => import("el-vis-audio").then((mod) => mod.KnobParamLabel),
  {ssr: false}
)

const ControlKnob = styled.div`
  margin: 0.5rem;
`;

export default PlayheadControls;