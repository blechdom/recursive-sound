import {ControlRow} from "@/components/FractalPlayer";
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
  transport: string;
  loop: boolean;
  setTransport: (transport: string) => void;
  setLoop: (loop: boolean) => void;
}

const Transport: React.FC<TransportProps> = ({transport, loop, setTransport, setLoop}) => {
  return (
    <>
      <ControlRow>
        <ControlButton onClick={() => setTransport('play')} selected={(transport === 'play' || transport === 'replay')}
                       bottom={true}>
          <FontAwesomeIcon icon={faPlay}/>
        </ControlButton>
        <ControlButton onClick={() => setTransport('stop')} selected={transport === 'stop'} bottom={true}>
          <FontAwesomeIcon icon={faStop}/>
        </ControlButton>
        <ControlButton onClick={() => setTransport('pause')} selected={transport === 'pause'} bottom={true}>
          <FontAwesomeIcon icon={faPause}/>
        </ControlButton>
        <ControlButton onClick={() => setLoop(!loop)} selected={loop} bottom={true}>
          <FontAwesomeIcon icon={faArrowsRotate}/>
        </ControlButton>
      </ControlRow>
    </>
  );
};

export default Transport;