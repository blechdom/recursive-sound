import {ControlRow, ButtonText} from "@/components/FractalPlayer";
import {ControlButton} from "@/components/FractalPlayer";
import React from "react";

type PlayheadSizesProps = {
  size: number;
  setSize: (size: number) => void;
  color: string;
  height?: string;
}

const PlayheadSizes: React.FC<PlayheadSizesProps> = ({size, setSize, color, height = '4rem'}) => {
  return (
    <>
      <ControlRow>
        <ControlButton onClick={() => setSize(32)} selected={size === 32} color={color} height={height}>
          <ButtonText>32</ButtonText>
        </ControlButton>
        <ControlButton onClick={() => setSize(64)} selected={size === 64} color={color} height={height}>
          <ButtonText>64</ButtonText>
        </ControlButton>
        <ControlButton onClick={() => setSize(128)} selected={size === 128} color={color} height={height}>
          <ButtonText>128</ButtonText>
        </ControlButton>
        <ControlButton onClick={() => setSize(256)} selected={size === 256} color={color} height={height}>
          <ButtonText>256</ButtonText>
        </ControlButton>
      </ControlRow>
    </>
  );
};

export default PlayheadSizes;