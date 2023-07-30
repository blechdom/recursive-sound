import {
  faArrowDown,
  faArrowLeft,
  faArrowRight,
  faArrowUp,
  faMaximize,
  faMinimize,
  faRotateLeft,
  faRotateRight
} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import React from "react";
import {ControlButton, ControlRow} from "./FractalPlayer";

type PlayheadTypesProps = {
  playheadType: string;
  setPlayheadType: (playheadType: string) => void;
}

const Playheads: React.FC<PlayheadTypesProps> = ({playheadType, setPlayheadType}) => {
  return (
    <>
      <ControlRow>
        <ControlButton onClick={() => setPlayheadType('left')} selected={playheadType === 'left'} bottom={true}
                       color={"#663399"}>
          <FontAwesomeIcon icon={faArrowLeft}/>
        </ControlButton>
        <ControlButton onClick={() => setPlayheadType('right')} selected={playheadType === 'right'} bottom={true}
                       color={"#663399"}>
          <FontAwesomeIcon icon={faArrowRight}/>
        </ControlButton>
        <ControlButton onClick={() => setPlayheadType('up')} selected={playheadType === 'up'} bottom={true}
                       color={"#663399"}>
          <FontAwesomeIcon icon={faArrowUp}/>
        </ControlButton>
        <ControlButton onClick={() => setPlayheadType('down')} selected={playheadType === 'down'} bottom={true}
                       color={"#663399"}>
          <FontAwesomeIcon icon={faArrowDown}/>
        </ControlButton>
      </ControlRow>
      <ControlRow>
        <ControlButton onClick={() => setPlayheadType('ccw')} selected={playheadType === 'ccw'} bottom={true}
                       color={"#663399"}>
          <FontAwesomeIcon icon={faRotateLeft}/>
        </ControlButton>
        <ControlButton onClick={() => setPlayheadType('cw')} selected={playheadType === 'cw'} bottom={true}
                       color={"#663399"}>
          <FontAwesomeIcon icon={faRotateRight}/>
        </ControlButton>
        <ControlButton onClick={() => setPlayheadType('in')} selected={playheadType === 'in'} bottom={true}
                       color={"#663399"}>
          <FontAwesomeIcon icon={faMinimize}/>
        </ControlButton>
        <ControlButton onClick={() => setPlayheadType('out')} selected={playheadType === 'out'} bottom={true}
                       color={"#663399"}>
          <FontAwesomeIcon icon={faMaximize}/>
        </ControlButton>
      </ControlRow>
    </>
  );
};

export default Playheads;