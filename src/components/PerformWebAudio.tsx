import useMemoizedState from "@/hooks/useMemoizedState";
import {el, NodeRepr_t} from "@elemaudio/core";
import dynamic from 'next/dynamic'
import React, {useCallback, useEffect, useMemo, useState} from "react";
import styled from "styled-components";

const Knob = dynamic(() => import("el-vis-audio").then((mod) => mod.KnobParamLabel), {ssr: false});
const PlayMonoScopeAndGain = dynamic(() => import("el-vis-audio").then((mod) => mod.PlayMonoScopeAndGain), {ssr: false});

require("events").EventEmitter.defaultMaxListeners = 0;

type PerformWebAudioProps = {
  performMatrixData: number[] | number[][];
  mapping: string;
}

const PerformWebAudio: React.FC<PerformWebAudioProps> = ({performMatrixData, mapping}) => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  useEffect(() => {
    window.AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    setAudioContext(new AudioContext() as AudioContext);
  }, []);


  const [playing, setPlaying] = useMemoizedState<boolean>(false);
  const [offset, setOffset] = useMemoizedState<number>(200); // hz
  const [scaleBy, setScaleBy] = useMemoizedState<number>(500); // hz
  const [msBetweenEvents, setMsBetweenEvents] = useMemoizedState<number>(50);
  const [freq, setFreq] = useState<NodeRepr_t | null>(null);

  const freqList = useMemo(() => {
    const list: number[] = Array.isArray(performMatrixData[0]) ? performMatrixData[0] as number[] : performMatrixData as number[];
    return list.map((val) => (val * scaleBy) + offset);
  }, [offset, scaleBy, performMatrixData]);

  let intervalId: NodeJS.Timeout | null = null;

  useEffect(() => {
    if (playing) {
      let i = 0;
      let frequency: NodeRepr_t = el.sm(el.const({key: `freq-{i}`, value: freqList[i]}));
      if (intervalId) clearInterval(intervalId);
      intervalId = setInterval(() => {
        console.log("i: ", i, "freq: ", freqList[i]);
        i++;
        frequency = el.sm(el.const({key: `freq-{i}`, value: freqList[i]}));
        setFreq(frequency);
        if (i === freqList.length - 1) i = 0;
      }, msBetweenEvents);
    } else if (intervalId) clearInterval(intervalId);
    return () => {
      if (intervalId) clearInterval(intervalId)
    };
  }, [playing, freqList, msBetweenEvents, intervalId]);

  const performWebAudioDataSynth = useCallback(() => {
    return el.cycle(freq ? freq : el.const({key: "freq", value: 440}));
  }, [freq]);

  return (
    <><br/>
      <PlayMonoScopeAndGain
        signal={playing ? (performWebAudioDataSynth() as NodeRepr_t) : null}
        isPlaying={setPlaying}
      />
      <br/>
      <KnobsFlexBox>
        <Knob
          id={"offset"}
          label={"offset"}
          knobValue={offset}
          step={1}
          min={0}
          max={1000}
          onKnobInput={setOffset}
        />
        <Knob
          id={"scaleBy"}
          label={"scaleBy"}
          knobValue={scaleBy}
          step={0.001}
          min={0.01}
          max={1200}
          onKnobInput={setScaleBy}
        />
        <Knob
          id={"msBetweenEvents"}
          label={"msBetweenEvents"}
          knobValue={msBetweenEvents}
          step={0.001}
          min={1}
          log={1}
          max={1000}
          onKnobInput={setMsBetweenEvents}
        />
      </KnobsFlexBox>
    </>
  );
}

const KnobsFlexBox = styled.div`
  justify-content: space-evenly;
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  padding: 10px;
  border: 2px solid #ff0000;
`;

export default PerformWebAudio;