import {ControlRow, ButtonText} from "@/components/FractalPlayer";
import {ControlButton} from "@/components/FractalPlayer";
import React from "react";

type TransportProps = {
  plottingAlgorithm: string;
  setPlottingAlgorithm: (plottingAlgorithm: string) => void;
  color: string;
  height?: string;
}

const PlottingAlgorithm: React.FC<TransportProps> = ({
                                                       plottingAlgorithm,
                                                       setPlottingAlgorithm,
                                                       color,
                                                       height = '4rem'
                                                     }) => {
  return (
    <ControlRow>
      <ControlButton onClick={() => setPlottingAlgorithm('escape')} selected={plottingAlgorithm === 'escape'}
                     color={color}
                     bottom={true} height={height}>
        <ButtonText>escape</ButtonText>
      </ControlButton>
      <ControlButton onClick={() => setPlottingAlgorithm('distance')} selected={plottingAlgorithm === 'distance'}
                     color={color}
                     bottom={true} height={height}>
        <ButtonText>distance</ButtonText>
      </ControlButton>
      <ControlButton onClick={() => setPlottingAlgorithm('decomp1')} selected={plottingAlgorithm === 'decomp1'}
                     color={color}
                     bottom={true} height={height}>
        <ButtonText>decomp 1</ButtonText>
      </ControlButton>
      <ControlButton onClick={() => setPlottingAlgorithm('decomp2')} selected={plottingAlgorithm === 'decomp2'}
                     color={color}
                     bottom={true} height={height}>
        <ButtonText>decomp 2</ButtonText>
      </ControlButton>
    </ControlRow>
  );
};

export default PlottingAlgorithm;