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
  fractalRow: number[];
  audioContext: AudioContext | null;
  core: WebRenderer;
  playing: boolean;
  audioParams: AudioParamsType;
}


const AudioEngine: React.FC<AudioEngineProps> = ({
                                                   fractal,
                                                   fractalRow,
                                                   audioContext,
                                                   core,
                                                   playing,
                                                   audioParams: {volume, threshold, interval, lowest}
                                                 }) => {

  const [audioVizData, setAudioVizData] = useState<any>();
  const [fftVizData, setFftVizData] = useState<any>();

  useEffect(() => {
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
      const allVoices = [...Array(fractalRow.length)].map((_, i) => {
        const key = `osc-freq-${i}`;
        accum += fractalRow[i];
        const freq = el.sm(el.const({key, value: lowest * (2 ** ((i * interval) / 12))}));
        return el.mul(el.cycle(freq), el.sm(el.const({key: `osc-amp-${i}`, value: fractalRow[i]})));
      });

      const addMany = (ins: NodeRepr_t[]): NodeRepr_t => {
        return el.add(...ins) as NodeRepr_t;
      };
      const rowMult = accum !== 0 ? 1 / accum : 0;
      console.log('rowMult', rowMult);
      return el.mul(addMany(allVoices as NodeRepr_t[]), el.sm(el.const({
        key: "row-gain",
        value: rowMult
      }))) as NodeRepr_t;
    }

    if (audioContext) {
      if (playing) {
        audioContext.resume();
        SignalSynth(Resynth());
      } else {
        audioContext.suspend();
      }
    }

  }, [playing, volume, threshold, interval, lowest, fractalRow, audioContext, core]);

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

  return (<StyledOscilloscopeSpectrogram>
      <OscilloscopeSpectrogram
        audioVizData={audioVizData}
        fftVizData={fftVizData}
        width={256}
        height={50}
      />
      <br/><br/><br/><br/><br/>
    </StyledOscilloscopeSpectrogram>
  );
};

const StyledOscilloscopeSpectrogram = styled.div`
  border: 1px solid #FF0000;
  font-size: 1.5rem;
  width: 256px;
  height: 50px;
  cursor: pointer;
`;
export default AudioEngine;