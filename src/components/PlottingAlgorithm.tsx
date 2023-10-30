import {ControlRow, ButtonText} from "@/components/FractalPlayer";
import {ControlButton} from "@/components/FractalPlayer";
import React from "react";

type TransportProps = {
  plottingAlgorithm: string;
  color: string;
  height?: string;
  width?: string;
  setPlottingAlgorithm: (plottingAlgorithm: string) => void;
}

const PlottingAlgorithm: React.FC<TransportProps> = ({
                                                       plottingAlgorithm,
                                                       color,
                                                       height = '1.5rem',
                                                       width = '8rem',
                                                       setPlottingAlgorithm,
                                                     }) => {
  return (
    <ControlRow>
      <ControlButton onClick={() => setPlottingAlgorithm('escape')} selected={plottingAlgorithm === 'escape'}
                     color={color}
                     bottom={true} height={height} width={width}>
        <ButtonText>escape</ButtonText>
      </ControlButton>
      <ControlButton onClick={() => setPlottingAlgorithm('distance')} selected={plottingAlgorithm === 'distance'}
                     color={color}
                     bottom={true} height={height} width={width}>
        <ButtonText>distance</ButtonText>
      </ControlButton>
    </ControlRow>
  );
};

export default PlottingAlgorithm;