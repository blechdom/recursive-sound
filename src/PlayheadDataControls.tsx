import dynamic from "next/dynamic";
import React from "react";
import styled from "styled-components";
import {ButtonText, ControlButton, KnobRow} from "@/components/FractalPlayer";

type PlayheadAudioControlsProps = {
  fractal: string;
  color: string;
  colorScheme: string;
  size: number;
  speed: number;
  numShades: number;
  shadeOffset: number;
  setColorScheme: (colorScheme: string) => void;
  cx?: number;
  cy?: number;
  setCx?: (cx: number) => void;
  setCy?: (cy: number) => void;
  setNumShades: (numShades: number) => void;
  setShadeOffset: (shadeOffset: number) => void;
  setSize: (size: number) => void;
  setSpeed: (speed: number) => void;
}

const PlayheadAudioControls: React.FC<PlayheadAudioControlsProps> = (
  {
    fractal,
    color,
    colorScheme,
    numShades,
    shadeOffset,
    size,
    speed,
    cx,
    cy,
    setColorScheme,
    setCx,
    setCy,
    setNumShades,
    setShadeOffset,
    setSpeed,
    setSize
  }) => {

  return (
    <>
      <KnobRow>
        <ControlButton onClick={() => setColorScheme(colorScheme === 'color' ? 'grayscale' : 'color')}
                       height={'2rem'}
                       width={'50px'}>
          <ButtonText>{colorScheme}</ButtonText>
        </ControlButton>
        <ControlKnob>
          <Knob
            id={`${fractal}-size`}
            label={"size"}
            color={color}
            diameter={30}
            labelWidth={30}
            fontSize={11}
            tooltip={"size of width and height of generated fractal data"}
            knobValue={size}
            step={1}
            min={32}
            max={384}
            onKnobInput={setSize}
          />
        </ControlKnob>
        <ControlKnob>
          <Knob
            id={`${fractal}-speed`}
            label={"speed"}
            color={color}
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
            id={`${fractal}-numShades`}
            label={"areas"}
            color={color}
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
            color={color}
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
        {fractal === 'julia' &&
          <>
            <ControlKnob>
              <Knob
                id={`${fractal}-cx`}
                label={"cx"}
                color={color}
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
                label={"cy"}
                color={color}
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