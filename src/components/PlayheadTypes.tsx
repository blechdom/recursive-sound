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
import {ControlButton, ControlRow} from "./PlayheadFractal";

type PlayheadTypesProps = {
  playheadType: string;
  setPlayheadType: (playheadType: string) => void;
}

const PlayheadTypes: React.FC<PlayheadTypesProps> = ({playheadType, setPlayheadType}) => {
  return (
    <>
      <ControlRow>
        <ControlButton onClick={() => setPlayheadType('left')} selected={playheadType === 'left'}>
          <FontAwesomeIcon icon={faArrowLeft}/>
        </ControlButton>
        <ControlButton onClick={() => setPlayheadType('right')} selected={playheadType === 'right'}>
          <FontAwesomeIcon icon={faArrowRight}/>
        </ControlButton>
        <ControlButton onClick={() => setPlayheadType('up')} selected={playheadType === 'up'}>
          <FontAwesomeIcon icon={faArrowUp}/>
        </ControlButton>
        <ControlButton onClick={() => setPlayheadType('down')} selected={playheadType === 'down'}>
          <FontAwesomeIcon icon={faArrowDown}/>
        </ControlButton>
      </ControlRow>
      <ControlRow>
        <ControlButton onClick={() => setPlayheadType('ccw')} selected={playheadType === 'ccw'} bottom={true}>
          <FontAwesomeIcon icon={faRotateLeft}/>
        </ControlButton>
        <ControlButton onClick={() => setPlayheadType('cw')} selected={playheadType === 'cw'} bottom={true}>
          <FontAwesomeIcon icon={faRotateRight}/>
        </ControlButton>
        <ControlButton onClick={() => setPlayheadType('in')} selected={playheadType === 'in'} bottom={true}>
          <FontAwesomeIcon icon={faMinimize}/>
        </ControlButton>
        <ControlButton onClick={() => setPlayheadType('out')} selected={playheadType === 'out'} bottom={true}>
          <FontAwesomeIcon icon={faMaximize}/>
        </ControlButton>
      </ControlRow>
    </>
  );
};

export default PlayheadTypes;