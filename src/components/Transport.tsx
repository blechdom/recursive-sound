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
  height?: string;
  width?: string;
  color?: string;
  loopColor?: string;
  setTransport: (transport: string) => void;
  setLoop: (loop: boolean) => void;
}

const Transport: React.FC<TransportProps> = ({
                                               transport,
                                               loop,
                                               setTransport,
                                               setLoop,
                                               height = '2rem',
                                               width = '4rem',
                                               color = '#FF0000',
                                               loopColor = '#000'
                                             }) => {
  return (
    <>
      <ControlRow>
        <ControlButton onClick={() => setTransport('play')} selected={(transport === 'play' || transport === 'replay')}
                       bottom={true} height={height} width={width} color={color}>
          <FontAwesomeIcon icon={faPlay}/>
        </ControlButton>
        <ControlButton onClick={() => setTransport('stop')} selected={transport === 'stop'} bottom={true}
                       height={height} width={width} color={color}>
          <FontAwesomeIcon icon={faStop}/>
        </ControlButton>
        <ControlButton onClick={() => setTransport('pause')} selected={transport === 'pause'} bottom={true}
                       height={height} width={width} color={color}>
          <FontAwesomeIcon icon={faPause}/>
        </ControlButton>
        <ControlButton onClick={() => setLoop(!loop)} selected={loop} bottom={true} height={height} width={width}
                       color={loopColor}>
          <FontAwesomeIcon icon={faArrowsRotate}/>
        </ControlButton>
      </ControlRow>
    </>
  );
};

export default Transport;