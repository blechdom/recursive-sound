import {ButtonRow} from "@/pages/juliasPlayheads";
import {
  faArrowsRotate,
  faPause,
  faPlay,
  faStop
} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import React from "react";
import styled from "styled-components";

type TransportProps = {
  transport: string;
  loop: boolean;
  setTransport: (transport: string) => void;
  setLoop: (loop: boolean) => void;
}

const Transport: React.FC<TransportProps> = ({transport, loop, setTransport, setLoop}) => {
  return (
    <>
      <ButtonRow>
        <ControlButton onClick={() => setTransport('play')} selected={transport === 'play'}>
          <FontAwesomeIcon icon={faPlay}/>
        </ControlButton>
        <ControlButton onClick={() => setTransport('stop')} selected={transport === 'stop'}>
          <FontAwesomeIcon icon={faStop}/>
        </ControlButton>
        <ControlButton onClick={() => setTransport('pause')} selected={transport === 'pause'}>
          <FontAwesomeIcon icon={faPause}/>
        </ControlButton>
        <ControlButton onClick={() => setLoop(!loop)} selected={loop}>
          <FontAwesomeIcon icon={faArrowsRotate}/>
        </ControlButton>
      </ButtonRow>
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

export default Transport;