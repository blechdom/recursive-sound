import {ControlRow, ButtonText} from "@/components/FractalPlayer";
import {ControlButton} from "@/components/FractalPlayer";
import React from "react";

type TransportProps = {
  program: string;
  setProgram: (program: string) => void;
  color: string;
  height?: string;
}

const PlayheadProgram: React.FC<TransportProps> = ({program, setProgram, color, height = '4rem'}) => {
  return (
    <>
      <ControlRow>
        <ControlButton onClick={() => setProgram('lsm-binary')} selected={program === 'lsm-binary'} color={color}
                       bottom={true} height={height}>
          <ButtonText>Modulo</ButtonText>
        </ControlButton>
        <ControlButton onClick={() => setProgram('lsm-outline')} selected={program === 'lsm-outline'}
                       color={color}
                       bottom={true} height={height}>
          <ButtonText>Outline</ButtonText>
        </ControlButton>
        <ControlButton onClick={() => setProgram('lsm-difference')} selected={program === 'lsm-difference'}
                       color={color}
                       bottom={true} height={height}>
          <ButtonText>Difference</ButtonText>
        </ControlButton>
        <ControlButton onClick={() => setProgram('lsm-raw')} selected={program === 'lsm-raw'}
                       color={color}
                       bottom={true} height={height}>
          <ButtonText>Gradient</ButtonText>
        </ControlButton>
        <ControlButton onClick={() => setProgram('dem')} selected={program === 'dem'}
                       color={color}
                       bottom={true} height={height}>
          <ButtonText>Dem</ButtonText>
        </ControlButton>
        <ControlButton onClick={() => setProgram('dem-raw')} selected={program === 'dem-raw'}
                       color={color}
                       bottom={true} height={height}>
          <ButtonText>Dem-Gradient</ButtonText>
        </ControlButton>
      </ControlRow>
    </>
  );
};

export default PlayheadProgram;