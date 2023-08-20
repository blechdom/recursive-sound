import {AudioParamsType} from "@/components/FractalPlayer";
import dynamic from "next/dynamic";
import React, {useEffect, useState} from "react";
import {el, NodeRepr_t} from "@elemaudio/core";
import WebRenderer from "@elemaudio/web-renderer";
import styled from "styled-components";

const OscilloscopeSpectrogram = dynamic(() => import('el-vis-audio').then((mod) => mod.OscilloscopeSpectrogram), {ssr: false});

require("events").EventEmitter.defaultMaxListeners = 0;

type AudioEngineProps = {
  fractal: string;
  rowIndex: number;
  fractalRow: number[];
  audioContext: AudioContext | null;
  core: WebRenderer;
  playing: boolean;
  audioParams: AudioParamsType;
}

const AudioEngine: React.FC<AudioEngineProps> = ({
                                                   fractal,
                                                   rowIndex,
                                                   fractalRow,
                                                   audioContext,
                                                   core,
                                                   playing,
                                                   audioParams: {volume, lowest, highest, threshold, smoothing}
                                                 }) => {

  const [audioVizData, setAudioVizData] = useState<any>();
  const [fftVizData, setFftVizData] = useState<any>();
  const [ampScale, setAmpScale] = useState<number>(0);

  useEffect(() => {
    return () => {
      if (audioContext) {
        audioContext.suspend();
      }
    }
  }, [audioContext]);

  useEffect(() => {
    if (audioContext) {
      const SignalSynth = (signal: NodeRepr_t) => {
        if (playing && signal && core) {
          let synth = el.mul(
            signal,
            el.sm(el.const({key: `main-amp`, value: volume}))
          ) as NodeRepr_t;
          synth = el.scope({name: `scope-${fractal}`}, synth);
          synth = el.fft({name: `fft-${fractal}`}, synth);
          core.render(synth, synth);
        }
      };

      const Resynth = () => {
        let accum = 0;
        const linearRange = Math.log10(highest) - Math.log10(lowest);
        const linearInterval = linearRange / fractalRow.length;

        const allVoices = [...Array(fractalRow.length)].map((_, i) => {
          const amplitude = fractalRow[i] > threshold ? fractalRow[i] : 0;
          const key = `osc-freq-${i}`;
          const linearFreq = Math.log10(lowest) + (i * linearInterval);
          const freq = 10 ** linearFreq;

          if (freq < audioContext.sampleRate / 2) {
            accum += amplitude;
            const freqSignal = el.const({key, value: freq});
            const ampSignal = el.const({key: `osc-amp-${i}`, value: amplitude});
            const smoothFreqSignal = el.smooth(el.tau2pole(smoothing), freqSignal);
            const smoothAmpSignal = el.smooth(el.tau2pole(smoothing), ampSignal);
            return el.mul(el.cycle(smoothFreqSignal), smoothAmpSignal);
          } else {
            return el.const({key, value: 0});
          }
        });

        const addMany = (ins: NodeRepr_t[]): NodeRepr_t => {
          return el.add(...ins) as NodeRepr_t;
        };
        const rowMult = accum !== 0 ? 1 / accum : 0;
        setAmpScale(rowMult);
        const rowAmp = el.const({key: "row-gain", value: rowMult});
        const smoothRowAmp = el.smooth(el.tau2pole(smoothing), rowAmp);
        return el.mul(addMany(allVoices as NodeRepr_t[]), smoothRowAmp) as NodeRepr_t;
      }

      if (playing) {
        audioContext.resume();
        if (fractalRow?.length > 0) SignalSynth(Resynth());
      } else {
        audioContext.suspend();
      }
    }
  }, [playing, volume, lowest, highest, threshold, fractalRow, audioContext, core, fractal, smoothing]);

  core?.on("scope", function (e) {
    if (e.source === `scope-${fractal}`) {
      e.data.length && setAudioVizData(e.data[0]);
    }
  });

  core?.on("fft", function (e) {
    if (e.source === `fft-${fractal}`) {
      setFftVizData(e.data.real);
    }
  });

  return (
    <FlexColumn>
      Row {rowIndex} - amp * {ampScale.toFixed(2)}
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