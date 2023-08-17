import dynamic from "next/dynamic";
import React, {useEffect, useState} from "react";
import styled from "styled-components";
import io, {Socket} from "socket.io-client";
import {KnobRow} from "@/components/FractalPlayer";

const Knob = dynamic(() => import("el-vis-audio").then((mod) => mod.KnobParamLabel),
  {ssr: false}
)

let socket: Socket;

type PlayheadOSCControlsProps = {
  fractal: string;
  fractalRow: number[];
}

const PlayheadOSCControls: React.FC<PlayheadOSCControlsProps> = ({
                                                                   fractal,
                                                                   fractalRow
                                                                 }) => {
  const [volume, setVolume] = useState<number>(1.0);
  const [threshold, setThreshold] = useState<number>(0);
  const [interval, setInterval] = useState<number>(0);
  const [lowest, setLowest] = useState<number>(.125);
  const [range, setRange] = useState<number>(.75);

  const socketInitializer = async () => {
    await fetch("/recursive-sound/api/socket");
    socket = io();
  };

  useEffect(() => {
    socketInitializer();
  }, []);

  useEffect(() => {
    socket?.emit("fractalMandelbrotRow", fractalRow);
  }, [fractalRow]);


  useEffect(() => {
    socket?.emit("volume", volume);
  }, [volume, socket]);

  useEffect(() => {
    socket?.emit("interval", interval);
  }, [interval, socket]);

  useEffect(() => {
    socket?.emit("threshold", threshold);
  }, [threshold, socket]);

  useEffect(() => {
    socket?.emit("lowest", lowest);
  }, [lowest, socket]);

  useEffect(() => {
    socket?.emit("range", range);
  }, [range, socket]);

  return (
    <KnobRow>
      <ControlKnob>
        <Knob
          id={`${fractal}-volume`}
          label={"volume"}
          knobValue={volume}
          diameter={30}
          labelWidth={30}
          fontSize={11}
          tooltip={"OSC: main volume of this sonified fractal"}
          step={0.01}
          min={0}
          max={1}
          onKnobInput={setVolume}
        />
      </ControlKnob>
      <ControlKnob>
        <Knob
          id={`${fractal}-threshold`}
          label={"thresh"}
          diameter={30}
          labelWidth={30}
          fontSize={11}
          tooltip={"OSC: values below this threshold will be ignored during playback"}
          knobValue={threshold}
          step={0.01}
          min={0}
          max={1}
          onKnobInput={setThreshold}
        />
      </ControlKnob>
      <ControlKnob>
        <Knob
          id={`${fractal}-interval`}
          label={"interval"}
          diameter={30}
          labelWidth={30}
          fontSize={11}
          tooltip={"OSC: Interval Between Frequencies in Oscillator Bank"}
          knobValue={interval}
          step={0.01}
          min={0}
          max={1}
          onKnobInput={setInterval}
        />
      </ControlKnob>
      <ControlKnob>
        <Knob
          id={`${fractal}-lowest`}
          label={"lowest"}
          diameter={30}
          labelWidth={30}
          fontSize={11}
          tooltip={"OSC: lowest frequency of the oscillator bank (hz)"}
          knobValue={lowest}
          step={0.01}
          min={0}
          max={1}
          onKnobInput={setLowest}
        />
      </ControlKnob>
      <ControlKnob>
        <Knob
          id={`${fractal}-range`}
          label={"range"}
          diameter={30}
          labelWidth={30}
          fontSize={11}
          tooltip={"OSC: range from lowest to highest frequency of the oscillator bank"}
          knobValue={range}
          step={0.01}
          min={0}
          max={1}
          onKnobInput={setRange}
        />
      </ControlKnob>
    </KnobRow>
  );
};

const ControlKnob = styled.div`
  margin: 0 0.4rem 0 0.4rem;
`;

export default PlayheadOSCControls;