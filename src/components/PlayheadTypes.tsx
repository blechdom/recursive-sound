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
import styled from "styled-components";

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

const ControlButton = styled.div<{
  onClick: () => void;
  selected: boolean;
  bottom?: boolean;
}>`
  background-color: ${props => props.selected ? '#FF0000' : '#EEE'};
  border: 1px solid #000;
  color: ${props => props.selected ? '#FFF' : '#FF0000'};
  font-size: 3rem;
  width: 4rem;
  height: 4rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  ${prop => prop.bottom && `border-top: none`};

  :not(:last-child) {
    border-right: none;
  }

  :after {
    content: "";
    clear: both;
    display: table;
  }

  :hover {
    background-color: ${props => props.selected ? '#FF0000' : '#DDD'};
  }
`;

export const ControlRow = styled.div`
  display: flex;
  flex-flow: row wrap;
`;

export default PlayheadTypes;