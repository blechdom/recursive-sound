import {ControlRow, ButtonText} from "@/components/FractalPlayer";
import {ControlButton} from "@/components/FractalPlayer";
import React from "react";

type PlayheadSizesProps = {
  size: number;
  setSize: (size: number) => void;
  color: string;
  height?: string;
  width?: string;
}

const PlayheadSizes: React.FC<PlayheadSizesProps> = ({size, setSize, color, height = '2rem', width = '2rem'}) => {
  return (
    <>
      <ControlRow>
        <ControlButton onClick={() => setSize(32)} selected={size === 32} color={color} height={height} width={width}>
          <ButtonText>32</ButtonText>
        </ControlButton>
        <ControlButton onClick={() => setSize(48)} selected={size === 48} color={color} height={height} width={width}>
          <ButtonText>48</ButtonText>
        </ControlButton>
        <ControlButton onClick={() => setSize(64)} selected={size === 64} color={color} height={height} width={width}>
          <ButtonText>64</ButtonText>
        </ControlButton>
        <ControlButton onClick={() => setSize(96)} selected={size === 96} color={color} height={height} width={width}>
          <ButtonText>96</ButtonText>
        </ControlButton>
        <ControlButton onClick={() => setSize(128)} selected={size === 128} color={color} height={height} width={width}>
          <ButtonText>128</ButtonText>
        </ControlButton>
        <ControlButton onClick={() => setSize(192)} selected={size === 192} color={color} height={height} width={width}>
          <ButtonText>192</ButtonText>
        </ControlButton>
        <ControlButton onClick={() => setSize(256)} selected={size === 256} color={color} height={height} width={width}>
          <ButtonText>256</ButtonText>
        </ControlButton>
        <ControlButton onClick={() => setSize(384)} selected={size === 384} color={color} height={height} width={width}>
          <ButtonText>384</ButtonText>
        </ControlButton>
      </ControlRow>
    </>
  );
};

export default PlayheadSizes;