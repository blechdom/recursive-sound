import {ControlRow} from "@/components/FractalPlayer";
import {ControlButton} from "@/components/FractalPlayer";
import useInterval from "@/hooks/useInterval";
import {
  faArrowsRotate,
  faPause,
  faPlay,
  faStop
} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import React, {useEffect, useState} from "react";

type TransportProps = {
  playing: boolean;
  rowIndex: number;
  size: number;
  speed: number;
  height?: string;
  width?: string;
  color?: string;
  loopColor?: string;
  setPlaying: (playing: boolean) => void;
  setRowIndex: (rowIndex: number) => void;
}

const Transport: React.FC<TransportProps> = ({
                                               playing,
                                               rowIndex,
                                               size,
                                               speed,
                                               height = '2rem',
                                               width = '4rem',
                                               color = '#FF0000',
                                               loopColor = '#000',
                                               setPlaying,
                                               setRowIndex
                                             }) => {

  const [transport, setTransport] = useState<string>('stop');
  const [loop, setLoop] = useState<boolean>(true);

  useInterval(() => {
    rowIndex === size - 1 && loop ? setRowIndex(0) : setRowIndex(rowIndex + 1);
  }, playing ? speed : null);

  useEffect(() => {
    transport === 'play' ? setPlaying(true) : setPlaying(false);
    transport === 'stop' && setRowIndex(-1);
  }, [transport]);


  return (
    <>
      <ControlRow>
        <ControlButton onClick={() => setTransport('play')} selected={(transport === 'play')}
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