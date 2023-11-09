import {AudioParamsType} from "@/components/FractalPlayer";
import dynamic from "next/dynamic";
import React, {useCallback, useEffect, useState} from "react";
import {el, NodeRepr_t} from "@elemaudio/core";
import WebRenderer from "@elemaudio/web-renderer";
import styled from "styled-components";

const OscilloscopeSpectrogram = dynamic(() => import('el-vis-audio').then((mod) => mod.OscilloscopeSpectrogram), {ssr: false});

require("events").EventEmitter.defaultMaxListeners = 0;

type AudioEngineProps = {
  contour: { angle: number; duration: number }[];
  audioContext: AudioContext | null;
  core: WebRenderer;
  playing: boolean;
  audioParams: AudioParamsType;
}

const AudioEngine: React.FC<AudioEngineProps> = ({
                                                   contour,
                                                   audioContext,
                                                   core,
                                                   playing,
                                                   audioParams: {volume, freqScaling, highest, threshold, duration}
                                                 }) => {

  const [audioVizData, setAudioVizData] = useState<any>();
  const [fftVizData, setFftVizData] = useState<any>();
  const [frequency, setFrequency] = useState<number>(220);
  const [contourStarted, setContourStarted] = useState<boolean>(false);
  const [sequencerId, setSequencerId] = useState<any>();

  useEffect(() => {
    return () => {
      if (audioContext) {
        audioContext.suspend();
      }
    }
  }, [audioContext]);

  useEffect(() => {
    if (!contourStarted) startContour();
    if (audioContext) {
      const SignalSynth = (signal: NodeRepr_t) => {
        if (playing && signal && core) {
          let synth = el.mul(
            signal,
            el.sm(el.const({key: `main-amp`, value: volume}))
          ) as NodeRepr_t;
          synth = el.scope({name: `scope-contour`}, synth);
          synth = el.fft({name: `fft-contour`}, synth);
          core.render(synth, synth);
        }
      };
      const ContourSynth = el.cycle(el.sm(el.const({key: 'ex2:mix', value: frequency})));
      if (playing) {
        audioContext.resume();
        SignalSynth(ContourSynth);
      } else {
        setContourStarted(false);
        setFrequency(200);
        audioContext.suspend();
      }
    }
  }, [playing, volume, freqScaling, highest, threshold, contour, audioContext, core, frequency]);

  const startContour = useCallback(() => {
    if (!playing) {
      clearInterval(sequencerId)
      setContourStarted(false);
    } else {
      setContourStarted(true);
      let elapsedTime = 0;
      let freq = frequency;
      contour.forEach((segment, i) => {
        elapsedTime += (segment.duration * duration);
        setTimeout(() => {
          freq += ((segment.angle - 180) * freqScaling);
          setFrequency(freq);
        }, elapsedTime);
      });
    }
  }, [playing, contour]);


  core?.on("scope", function (e) {
    if (e.source === `scope-contour`) {
      e.data.length && setAudioVizData(e.data[0]);
    }
  });

  core?.on("fft", function (e) {
    if (e.source === `fft-contour`) {
      setFftVizData(e.data.real);
    }
  });

  return (
    <FlexColumn>
      <StyledOscilloscopeSpectrogram>
        <OscilloscopeSpectrogram
          audioVizData={audioVizData}
          fftVizData={fftVizData}
          width={156}
          height={38}
        />
        <br/><br/><br/><br/><br/>
      </StyledOscilloscopeSpectrogram>
    </FlexColumn>
  );
};

const FlexColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-left: 0.5rem;
`;

const StyledOscilloscopeSpectrogram = styled.div`
  outline: 1px solid #000000;
  font-size: 1.5rem;
  width: 156px;
  height: 38px;
  cursor: pointer;
`;
export default AudioEngine;