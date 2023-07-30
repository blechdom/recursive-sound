import {ControlButton} from "@/components/PlayheadFractal";
import {ButtonRow} from "@/pages/juliasPlayheadsOld";
import {
  faArrowsRotate,
  faPause,
  faPlay,
  faStop
} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import React from "react";

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
        <ControlButton onClick={() => setTransport('play')} selected={(transport === 'play' || transport === 'replay')}>
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

export default Transport;