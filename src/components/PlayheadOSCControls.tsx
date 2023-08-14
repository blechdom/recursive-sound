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
  speed: number;
  cx?: number;
  cy?: number;
  setCx?: (cx: number) => void;
  setCy?: (cy: number) => void;
  setSpeed: (speed: number) => void;
}

const PlayheadOSCControls: React.FC<PlayheadOSCControlsProps> = ({
                                                                   fractal,
                                                                   fractalRow,
                                                                   speed,
                                                                   cx,
                                                                   cy,
                                                                   setCx,
                                                                   setCy,
                                                                   setSpeed
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

  return (<>
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
            id={`${fractal}-threshold`}
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
            id={`${fractal}-interval`}
            label={"Interval (OSC)"}
            knobValue={interval}
            step={0.01}
            min={0}
            max={1}
            onKnobInput={setInterval}
          />
        </ControlKnob>
      </KnobRow>
      <KnobRow>
        <ControlKnob>
          <Knob
            id={`${fractal}-lowest`}
            label={"Lowest (OSC)"}
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
            label={"Range (OSC)"}
            knobValue={range}
            step={0.01}
            min={0}
            max={1}
            onKnobInput={setRange}
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

const ControlKnob = styled.div`
  margin: 0 0.4rem 0 0.4rem;
`;

export default PlayheadOSCControls;