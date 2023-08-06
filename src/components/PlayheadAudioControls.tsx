import dynamic from "next/dynamic";
import React, {useEffect, useState} from "react";
import styled from "styled-components";
import {el, NodeRepr_t} from "@elemaudio/core";
import useMemoizedState from "../hooks/useMemoizedState";

const PlayMonoScopeAndGain = dynamic(() => import("el-vis-audio").then((mod) => mod.PlayMonoScopeAndGain), {ssr: false});

require("events").EventEmitter.defaultMaxListeners = 0;

type PlayheadAudioControlsProps = {
  name: string;
  fractalRow: number[];
  speed: number;
  setSpeed: (speed: number) => void;
}

const PlayheadControls: React.FC<PlayheadAudioControlsProps> = ({name, fractalRow, speed, setSpeed}) => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  useEffect(() => {
    window.AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    setAudioContext(new AudioContext() as AudioContext);
  }, []);

  const [playing, setPlaying] = useMemoizedState<boolean>(false);

  const [volume, setVolume] = useState<number>(1.0);
  const [threshold, setThreshold] = useState<number>(0);
  const [interval, setInterval] = useState<number>(0);
  const [lowest, setLowest] = useState<number>(.125);

  const Resynth = () => {
    let accum = 0;
    console.log('fractalRow ', fractalRow);
    const allVoices = [...Array(fractalRow.length)].map((_, i) => {
      const key = `osc-freq-${i}`;
      accum += fractalRow[i];
      const freq = el.sm(el.const({key, value: lowest * (2 ** ((i * interval) / 12))}));
      return el.mul(el.cycle(freq), el.sm(el.const({key: `osc-amp-${i}`, value: fractalRow[i]})));
    });

    const addMany = (ins: NodeRepr_t[]): NodeRepr_t => {
      if (ins.length < 9) {
        return el.add(...ins) as NodeRepr_t;
      }
      return el.add(...ins.slice(0, 7), addMany(ins.slice(8))) as NodeRepr_t;
    };

    console.log('accum ', accum);

    return el.mul(addMany(allVoices as NodeRepr_t[]), el.sm(el.const({
      key: "row-gain",
      value: 1 / accum
    }))) as NodeRepr_t;
  };

  return (
    <>
      <PlayMonoScopeAndGain
        signal={playing ? (Resynth() as NodeRepr_t) : null}
        isPlaying={setPlaying}
      />
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
      </ButtonRow>
      <ButtonRow>
        <ControlKnob>
          <Knob
            id={`${name}-threshold`}
            label={"Threshold (OSC)"}
            knobValue={threshold}
            step={0.001}
            min={0}
            max={1}
            onKnobInput={setThreshold}
          />
        </ControlKnob>
        <ControlKnob>
          <Knob
            id={`${name}-interval`}
            label={"Interval (OSC)"}
            knobValue={interval}
            step={0.01}
            min={0}
            max={12}
            onKnobInput={setInterval}
          />
        </ControlKnob>
        <ControlKnob>
          <Knob
            id={`${name}-lowest`}
            label={"Lowest (OSC)"}
            knobValue={lowest}
            step={0.01}
            min={0}
            max={500}
            onKnobInput={setLowest}
          />
        </ControlKnob>
      </ButtonRow>
    </>
  );
};

const Knob = dynamic(() => import("el-vis-audio").then((mod) => mod.KnobParamLabel),
  {ssr: false}
)

const ControlKnob = styled.div`
  margin: 0 0.4rem 0 0.4rem;
`;

export const ButtonRow = styled.div`
  margin: 1rem 0 0 0;
  display: flex;
  flex-direction: row;
`;

export default PlayheadControls;