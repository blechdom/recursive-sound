import dynamic from "next/dynamic";
import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {el, NodeRepr_t} from "@elemaudio/core";
import styled from "styled-components";
import useMemoizedState from "../hooks/useMemoizedState";

const KnobParamLabel = dynamic(() => import("el-vis-audio").then((mod) => mod.KnobParamLabel), {ssr: false});
const PlayMonoScopeAndGain = dynamic(() => import("el-vis-audio").then((mod) => mod.PlayMonoScopeAndGain), {ssr: false});
const Presets = dynamic(() => import("el-vis-audio").then((mod) => mod.Presets), {ssr: false});

require("events").EventEmitter.defaultMaxListeners = 0;

type RecursiveFMPreset = {
  steps: number;
  carrierFreq: number;
  offset: number;
  modAmp: number;
  modAmpDiv: number;
};

const RecursiveFMAudio: React.FC = () => {

  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  useEffect(() => {
    window.AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    setAudioContext(new AudioContext() as AudioContext);
  }, []);

  const [playing, setPlaying] = useMemoizedState<boolean>(false);
  const [steps, setSteps] = useMemoizedState<number>(1);
  const [modAmp, setModAmp] = useState<number>(9583);
  const [carrierFreq, setCarrierFreq] = useState<number>(3.32);
  const [offset, setOffset] = useState<number>(6335);
  const [modAmpDiv, setModAmpDiv] = useState<number>(2.48);
  const [presetList, setPresetList] =
    useMemoizedState<RecursiveFMPreset[]>(defaultPresets);
  const [currentSetting, setCurrentSetting] =
    useMemoizedState<RecursiveFMPreset>(presetList[1]);

  let lastSetting: RecursiveFMPreset | {} = {};
  let lastSettingRef = useRef(lastSetting);

  const recursiveModulatedCycle = (
    signal: NodeRepr_t,
    amp: number,
    modAmpDiv: number,
    count: number
  ): NodeRepr_t => {
    return audioContext && count > 0
      ? recursiveModulatedCycle(
        el.cycle(
          el.mul(signal, el.sm(el.const({key: `mod-amp-${count}`, value: amp})))
        ) as NodeRepr_t,
        amp / modAmpDiv,
        modAmpDiv,
        count - 1,
      )
      : signal;
  };

  const recursiveFMSynth = useCallback(() => {
    if (JSON.stringify(currentSetting) !== JSON.stringify(lastSettingRef.current)) {
      lastSettingRef.current = currentSetting;
      const smoothCarrierFreq: NodeRepr_t = el.sm(
        el.const({key: `carrierFreq`, value: currentSetting?.carrierFreq})
      );

      const carrier = el.cycle(smoothCarrierFreq) as NodeRepr_t;

      const firstMod = el.cycle(
        el.add(
          el.mul(
            carrier,
            el.sm(el.const({key: `start-amp`, value: currentSetting?.modAmp}))
          ),
          el.sm(el.const({key: `start-amp-offset`, value: currentSetting?.offset}))
        )
      );

      return recursiveModulatedCycle(
        firstMod,
        currentSetting?.modAmp,
        currentSetting?.modAmpDiv,
        currentSetting?.steps,
      );
    }
  }, [currentSetting]);

  useEffect(() => {
    if (playing) {
      updateCurrentPreset(0);
    }
  }, [playing]);

  useMemo(() => {
    if (audioContext) {
      setCurrentSetting({
        steps,
        carrierFreq,
        modAmp,
        modAmpDiv,
        offset
      });
    }
  }, [audioContext, steps, carrierFreq, modAmp, modAmpDiv, offset]);

  function updatePresetList(presetList: RecursiveFMPreset[]) {
    setPresetList(presetList);
  }

  function updateCurrentPreset(presetNumber: number) {
    const preset = presetList[presetNumber];
    console.log("preset ", preset);
    setSteps(preset?.steps);
    setCarrierFreq(preset?.carrierFreq);
    setModAmp(preset?.modAmp);
    setModAmpDiv(preset?.modAmpDiv);
    setOffset(preset?.offset);
  }

  return (
    <>
      <PlayMonoScopeAndGain
        signal={playing ? (recursiveFMSynth() as NodeRepr_t) : null}
        isPlaying={setPlaying}
      />
      <br/>
      <KnobsFlexBox>
        <KnobParamLabel
          id={"recursions"}
          label={"recursions"}
          knobValue={steps}
          step={1}
          min={0}
          max={10}
          onKnobInput={setSteps}
        />
        <KnobParamLabel
          id={"carrierFreq"}
          label={"carrierFreq"}
          knobValue={carrierFreq}
          step={0.001}
          min={0.01}
          max={4800}
          log={1}
          onKnobInput={setCarrierFreq}
        />
        <KnobParamLabel
          id={"offset"}
          label={"offset"}
          knobValue={offset}
          step={0.01}
          min={0}
          max={4800}
          onKnobInput={setOffset}
        />
        <KnobParamLabel
          id={"modAmp"}
          label={"modAmp"}
          knobValue={modAmp}
          step={0.01}
          min={0}
          max={4800}
          onKnobInput={setModAmp}
        />
        <KnobParamLabel
          id={"modAmpDiv"}
          label={"modAmpDiv"}
          knobValue={modAmpDiv}
          min={0.001}
          step={0.01}
          max={8}
          onKnobInput={setModAmpDiv}
        />
      </KnobsFlexBox>
      <br/>
      <Presets
        allowAdd
        allowEdit
        allowLocalStorage
        presetsName="recursive-fm-nextjs"
        currentSetting={currentSetting}
        presetList={presetList}
        onUpdateCurrentPreset={updateCurrentPreset}
        onUpdatePresetList={updatePresetList}
      />
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

const defaultPresets: RecursiveFMPreset[] = [
  {
    steps: 3,
    carrierFreq: 3.32,
    offset: 0,
    modAmp: 7307,
    modAmpDiv: 3.68,
  },
  {
    steps: 3,
    carrierFreq: 5.25,
    offset: 5057,
    modAmp: 6508,
    modAmpDiv: 5.56,
  },
  {
    steps: 3,
    carrierFreq: 0.06,
    offset: 0,
    modAmp: 1650,
    modAmpDiv: 0.18,
  },
  {
    steps: 3,
    carrierFreq: 0.18,
    offset: 4000,
    modAmp: 4236,
    modAmpDiv: 1.53,
  },
  {
    steps: 3,
    carrierFreq: 7,
    offset: 2000,
    modAmp: 2340,
    modAmpDiv: 0.75,
  },
];

export default RecursiveFMAudio;