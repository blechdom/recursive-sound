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
  height?: string;
  width?: string;
}

const Playheads: React.FC<PlayheadTypesProps> = ({playheadType, setPlayheadType, height = "2rem", width = "2rem"}) => {
  return (
    <>
      <ControlRow>
        <ControlButton onClick={() => setPlayheadType('left')} selected={playheadType === 'left'} bottom={true}
                       color={"#663399"} width={width} height={height}>
          <FontAwesomeIcon icon={faArrowLeft}/>
        </ControlButton>
        <ControlButton onClick={() => setPlayheadType('right')} selected={playheadType === 'right'} bottom={true}
                       color={"#663399"} width={width} height={height}>
          <FontAwesomeIcon icon={faArrowRight}/>
        </ControlButton>
        <ControlButton onClick={() => setPlayheadType('up')} selected={playheadType === 'up'} bottom={true}
                       color={"#663399"} width={width} height={height}>
          <FontAwesomeIcon icon={faArrowUp}/>
        </ControlButton>
        <ControlButton onClick={() => setPlayheadType('down')} selected={playheadType === 'down'} bottom={true}
                       color={"#663399"} width={width} height={height}>
          <FontAwesomeIcon icon={faArrowDown}/>
        </ControlButton>
        <ControlButton onClick={() => setPlayheadType('ccw')} selected={playheadType === 'ccw'} bottom={true}
                       color={"#663399"} width={width} height={height}>
          <FontAwesomeIcon icon={faRotateLeft}/>
        </ControlButton>
        <ControlButton onClick={() => setPlayheadType('cw')} selected={playheadType === 'cw'} bottom={true}
                       color={"#663399"} width={width} height={height}>
          <FontAwesomeIcon icon={faRotateRight}/>
        </ControlButton>
        <ControlButton onClick={() => setPlayheadType('in')} selected={playheadType === 'in'} bottom={true}
                       color={"#663399"} width={width} height={height}>
          <FontAwesomeIcon icon={faMinimize}/>
        </ControlButton>
        <ControlButton onClick={() => setPlayheadType('out')} selected={playheadType === 'out'} bottom={true}
                       color={"#663399"} width={width} height={height}>
          <FontAwesomeIcon icon={faMaximize}/>
        </ControlButton>
      </ControlRow>
    </>
  );
};

export default Playheads;