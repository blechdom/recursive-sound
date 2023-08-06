import dynamic from "next/dynamic";
import React, {useEffect, useState} from "react";
import styled from "styled-components";
import {Socket} from "socket.io-client";

type PlayheadOSCControlsProps = {
  name: string;
  speed: number;
  socket: Socket;
  setSpeed: (speed: number) => void;
}

const PlayheadOSCControls: React.FC<PlayheadOSCControlsProps> = ({name, socket, speed, setSpeed}) => {
  const [volume, setVolume] = useState<number>(1.0);
  const [threshold, setThreshold] = useState<number>(0);
  const [interval, setInterval] = useState<number>(0);
  const [range, setRange] = useState<number>(.75);
  const [lowest, setLowest] = useState<number>(.125);

  useEffect(() => {
    socket?.emit("volume", volume);
  }, [volume]);

  useEffect(() => {
    socket?.emit("interval", interval);
  }, [interval]);

  useEffect(() => {
    socket?.emit("threshold", threshold);
  }, [threshold]);

  useEffect(() => {
    socket?.emit("range", range);
  }, [range]);

  useEffect(() => {
    socket?.emit("lowest", lowest);
  }, [lowest]);

  return (<>
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
            step={0.01}
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
            max={1}
            onKnobInput={setInterval}
          />
        </ControlKnob>
        <ControlKnob>
          <Knob
            id={`${name}-range`}
            label={"Range (OSC)"}
            knobValue={range}
            step={0.01}
            min={0}
            max={1}
            onKnobInput={setRange}
          />
        </ControlKnob>
        <ControlKnob>
          <Knob
            id={`${name}-lowest`}
            label={"Lowest (OSC)"}
            knobValue={lowest}
            step={0.01}
            min={0}
            max={1}
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

export default PlayheadOSCControls;