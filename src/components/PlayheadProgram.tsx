import {ControlRow, ButtonText} from "@/components/FractalPlayer";
import {ControlButton} from "@/components/FractalPlayer";
import {
  faArrowsRotate,
  faPause,
  faPlay,
  faStop
} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import React from "react";

type TransportProps = {
  program: string;
  setProgram: (program: string) => void;
}

const PlayheadProgram: React.FC<TransportProps> = ({program, setProgram}) => {
  return (
    <>
      <ControlRow>
        <ControlButton onClick={() => setProgram('lsm-binary')} selected={program === 'lsm-binary'} color={'#3d8c40\t'}>
          <ButtonText>LSM<br/>Binary</ButtonText>
        </ControlButton>
        <ControlButton onClick={() => setProgram('lsm-tirnary')} selected={program === 'lsm-tirnary'}
                       color={'#3d8c40\t'}>
          <ButtonText>LSM<br/>Tirnary</ButtonText>
        </ControlButton>
        <ControlButton onClick={() => setProgram('lsm-outline')} selected={program === 'lsm-outline'}
                       color={'#3d8c40\t'}>
          <ButtonText>LSM<br/>Outline</ButtonText>
        </ControlButton>
        <ControlButton onClick={() => setProgram('lsm-difference')} selected={program === 'lsm-difference'}
                       color={'#3d8c40\t'}>
          <ButtonText>LSM<br/>Difference</ButtonText>
        </ControlButton>
      </ControlRow>
    </>
  );
};

export default PlayheadProgram;