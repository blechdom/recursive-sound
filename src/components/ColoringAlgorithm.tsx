import {ControlRow, ButtonText} from "@/components/FractalPlayer";
import {ControlButton} from "@/components/FractalPlayer";
import React from "react";

type TransportProps = {
  coloringAlgorithm: string;
  setColoringAlgorithm: (coloringAlgorithm: string) => void;
  color: string;
  height?: string;
}

const ColoringAlgorithm: React.FC<TransportProps> = ({
                                                       coloringAlgorithm,
                                                       setColoringAlgorithm,
                                                       color,
                                                       height = '4rem'
                                                     }) => {
  return (
    <ControlRow>
      <ControlButton onClick={() => setColoringAlgorithm('modulo')} selected={coloringAlgorithm === 'modulo'}
                     color={color}
                     bottom={true} height={height}>
        <ButtonText>modulo</ButtonText>
      </ControlButton>
      <ControlButton onClick={() => setColoringAlgorithm('outline')} selected={coloringAlgorithm === 'outline'}
                     color={color}
                     bottom={true} height={height}>
        <ButtonText>outline</ButtonText>
      </ControlButton>
      <ControlButton onClick={() => setColoringAlgorithm('difference')} selected={coloringAlgorithm === 'difference'}
                     color={color}
                     bottom={true} height={height}>
        <ButtonText>difference</ButtonText>
      </ControlButton>
      <ControlButton onClick={() => setColoringAlgorithm('raw')} selected={coloringAlgorithm === 'raw'}
                     color={color}
                     bottom={true} height={height}>
        <ButtonText>raw</ButtonText>
      </ControlButton>
    </ControlRow>
  );
};

export default ColoringAlgorithm;