import dynamic from "next/dynamic";
import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {el, NodeRepr_t} from "@elemaudio/core";
import styled from "styled-components";
import useMemoizedState from "../hooks/useMemoizedState";
import {cycleByPhasor} from "@/utils/audio/audioTools";

const KnobParamLabel = dynamic(() => import("el-vis-audio").then((mod) => mod.KnobParamLabel), {ssr: false});
const PlayMonoScopeAndGain = dynamic(() => import("el-vis-audio").then((mod) => mod.PlayMonoScopeAndGain), {ssr: false});
const Presets = dynamic(() => import("el-vis-audio").then((mod) => mod.Presets), {ssr: false});

require("events").EventEmitter.defaultMaxListeners = 0;

type RecursivePMPreset = {
  steps: number;
  carrierFreq: number;
  indexOfMod: number;
  startModFreq: number;
  freqDiv: number;
  indexDiv: number;
};

const RecursivePMAudio: React.FC = () => {

  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  useEffect(() => {
    window.AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    setAudioContext(new AudioContext() as AudioContext);
  }, []);

  const [playing, setPlaying] = useMemoizedState<boolean>(false);
  const [steps, setSteps] = useMemoizedState<number>(1);
  const [indexOfMod, setIndexOfMod] = useMemoizedState<number>(1);
  const [carrierFreq, setCarrierFreq] = useMemoizedState<number>(400);
  const [startModFreq, setStartModFreq] = useMemoizedState<number>(1);
  const [freqDiv, setFreqDiv] = useMemoizedState<number>(1);
  const [indexDiv, setIndexDiv] = useMemoizedState<number>(1);
  const [presetList, setPresetList] =
    useMemoizedState<RecursivePMPreset[]>(defaultPresets);
  const [currentSetting, setCurrentSetting] =
    useMemoizedState<RecursivePMPreset>(presetList[1]);

  let lastSetting: RecursivePMPreset | {} = {};
  let lastSettingRef = useRef(lastSetting);

  const recursiveModulatedCycle = (
    signal: NodeRepr_t,
    modFreq: number,
    indexOfModulation: number,
    count: number,
    freqDiv: number,
    indexDiv: number
  ): NodeRepr_t => {
    return audioContext && count > 0 && modFreq < audioContext.sampleRate / 2
      ? recursiveModulatedCycle(
        cycleByPhasor(
          el.mod(
            el.add(
              el.phasor(
                el.sm(el.const({key: `modFreq-${count}`, value: modFreq})),
                0
              ),
              el.mul(
                signal,
                el.sm(
                  el.const({
                    key: `index-${count}`,
                    value: indexOfModulation,
                  })
                )
              )
            ),
            1
          )
        ) as NodeRepr_t,
        modFreq / freqDiv,
        indexOfModulation / indexDiv,
        count - 1,
        freqDiv,
        indexDiv
      )
      : signal;
  };

  const recursivePMSynth = useCallback(() => {
    if (JSON.stringify(currentSetting) !== JSON.stringify(lastSettingRef.current)) {
      lastSettingRef.current = currentSetting;
      const smoothCarrierFreq: NodeRepr_t = el.sm(
        el.const({key: `carrierFreq`, value: currentSetting?.carrierFreq})
      );

      const carrier = cycleByPhasor(
        el.phasor(smoothCarrierFreq, 0)
      ) as NodeRepr_t;

      return recursiveModulatedCycle(
        carrier,
        currentSetting?.startModFreq,
        currentSetting?.indexOfMod,
        currentSetting?.steps,
        currentSetting?.freqDiv,
        currentSetting?.indexDiv
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
        startModFreq,
        freqDiv,
        indexOfMod,
        indexDiv,
      });
    }
  }, [audioContext, steps, carrierFreq, startModFreq, freqDiv, indexOfMod, indexDiv]);

  function updatePresetList(presetList: RecursivePMPreset[]) {
    setPresetList(presetList);
  }

  function updateCurrentPreset(presetNumber: number) {
    const preset = presetList[presetNumber];
    console.log("preset ", preset);
    setSteps(preset?.steps);
    setCarrierFreq(preset?.carrierFreq);
    setStartModFreq(preset?.startModFreq);
    setFreqDiv(preset?.freqDiv);
    setIndexOfMod(preset?.indexOfMod);
    setIndexDiv(preset?.indexDiv);
  }

  return (
    <>
      <PlayMonoScopeAndGain
        signal={playing ? (recursivePMSynth() as NodeRepr_t) : null}
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
          max={1200}
          log={1}
          onKnobInput={setCarrierFreq}
        />
        <KnobParamLabel
          id={"modFreq"}
          label={"modFreq"}
          knobValue={startModFreq}
          step={0.001}
          min={0.01}
          log={1}
          max={400}
          onKnobInput={setStartModFreq}
        />
        <KnobParamLabel
          id={"modDiv"}
          label={"modDiv"}
          knobValue={freqDiv}
          min={0.01}
          step={0.01}
          max={8}
          onKnobInput={setFreqDiv}
        />
        <KnobParamLabel
          id={"modIndex"}
          label={"index"}
          knobValue={indexOfMod}
          step={0.01}
          min={0}
          max={20}
          onKnobInput={setIndexOfMod}
        />
        <KnobParamLabel
          id={"indexDiv"}
          label={"indexDiv"}
          knobValue={indexDiv}
          min={0.01}
          step={0.01}
          max={8}
          onKnobInput={setIndexDiv}
        />
      </KnobsFlexBox>
      <br/>
      <Presets
        allowAdd
        allowEdit
        allowLocalStorage
        presetsName="recursive-pm-v3-with-fix"
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

const defaultPresets: RecursivePMPreset[] = [
  {
    steps: 3,
    indexOfMod: 3,
    carrierFreq: 22,
    startModFreq: 0.16,
    freqDiv: 1.4,
    indexDiv: 1.46,
  },
  {
    steps: 3,
    carrierFreq: 7.29,
    startModFreq: 372.64,
    freqDiv: 4.98,
    indexOfMod: 5.14,
    indexDiv: 6.25,
  },
  {
    steps: 4,
    carrierFreq: 1.82,
    startModFreq: 10.94,
    freqDiv: 7.16,
    indexOfMod: 4.29,
    indexDiv: 2.44,
  },
  {
    steps: 4,
    carrierFreq: 182,
    startModFreq: 12,
    freqDiv: 3.14,
    indexOfMod: 1.5,
    indexDiv: 2.67,
  },
  {
    steps: 4,
    carrierFreq: 3,
    startModFreq: 0.488,
    freqDiv: 0.34,
    indexOfMod: 7.18,
    indexDiv: 5.26,
  },
];

export default RecursivePMAudio;