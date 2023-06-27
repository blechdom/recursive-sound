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

type ChaoticPMPreset = {
  steps: number;
  carrierFreq: number;
  indexOfMod: number;
  startModFreq: number;
  freqDiv: number;
  indexDiv: number;
  filter: number;
};

const ChaoticPMAudio: React.FC = () => {

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
  const [filter, setFilter] = useState<number>(300);
  const [presetList, setPresetList] =
    useMemoizedState<ChaoticPMPreset[]>(defaultPresets);
  const [currentSetting, setCurrentSetting] =
    useMemoizedState<ChaoticPMPreset>(presetList[1]);

  let lastSetting: ChaoticPMPreset | {} = {};
  let lastSettingRef = useRef(lastSetting);

  const chaoticModulatedCycle = (
    signal: NodeRepr_t,
    modFreq: number,
    indexOfModulation: number,
    count: number,
    freqDiv: number,
    indexDiv: number,
    filter: number,
  ): NodeRepr_t => {
    const shaperMix = el.sm(el.const({key: `shaper:mix-${count}`, value: filter * 4}));
    const shaperGain = el.sm(el.const({key: `shaper:gain-${count}`, value: (1.2 - Math.sqrt(filter))}));
    const phaseModulator =
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
        ), 1);
    const modulator = el.mul(el.tanh(el.mul(phaseModulator, shaperMix)), shaperGain);
    return audioContext && count > 0 && modFreq < audioContext.sampleRate / 2
      ? chaoticModulatedCycle(
        cycleByPhasor(modulator) as NodeRepr_t,
        modFreq / freqDiv,
        indexOfModulation / indexDiv,
        count - 1,
        freqDiv,
        indexDiv,
        filter
      )
      : signal;
  };

  const chaoticPMSynth = useCallback(() => {
    if (JSON.stringify(currentSetting) !== JSON.stringify(lastSettingRef.current)) {
      lastSettingRef.current = currentSetting;
      const smoothCarrierFreq: NodeRepr_t = el.sm(
        el.const({key: `carrierFreq`, value: currentSetting?.carrierFreq})
      );

      const carrier = cycleByPhasor(
        el.phasor(smoothCarrierFreq, 0)
      ) as NodeRepr_t;

      return chaoticModulatedCycle(
        carrier,
        currentSetting?.startModFreq,
        currentSetting?.indexOfMod,
        currentSetting?.steps,
        currentSetting?.freqDiv,
        currentSetting?.indexDiv,
        currentSetting?.filter,
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
        filter,
      });
    }
  }, [audioContext, steps, carrierFreq, startModFreq, freqDiv, indexOfMod, indexDiv, filter]);

  function updatePresetList(presetList: ChaoticPMPreset[]) {
    setPresetList(presetList);
  }

  function updateCurrentPreset(presetNumber: number) {
    const preset = presetList[presetNumber];
    setSteps(preset?.steps);
    setCarrierFreq(preset?.carrierFreq);
    setStartModFreq(preset?.startModFreq);
    setFreqDiv(preset?.freqDiv);
    setIndexOfMod(preset?.indexOfMod);
    setIndexDiv(preset?.indexDiv);
    setFilter(preset?.filter);
  }

  return (
    <>
      <PlayMonoScopeAndGain
        signal={playing ? (chaoticPMSynth() as NodeRepr_t) : null}
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
          min={0.001}
          max={1200}
          log={1}
          onKnobInput={setCarrierFreq}
        />
        <KnobParamLabel
          id={"modFreq"}
          label={"modFreq"}
          knobValue={startModFreq}
          step={0.001}
          min={0.001}
          log={1}
          max={400}
          onKnobInput={setStartModFreq}
        />
        <KnobParamLabel
          id={"modDiv"}
          label={"modDiv"}
          knobValue={freqDiv}
          min={0.001}
          step={0.001}
          max={32}
          onKnobInput={setFreqDiv}
        />
        <KnobParamLabel
          id={"modIndex"}
          label={"index"}
          knobValue={indexOfMod}
          step={0.001}
          min={0}
          max={16}
          onKnobInput={setIndexOfMod}
        />
        <KnobParamLabel
          id={"indexDiv"}
          label={"indexDiv"}
          knobValue={indexDiv}
          min={0.001}
          step={0.001}
          max={32}
          onKnobInput={setIndexDiv}
        />
        <KnobParamLabel
          id={"filter"}
          label={"filter"}
          knobValue={filter}
          min={0.0}
          step={0.001}
          max={1}
          onKnobInput={setFilter}
        />
      </KnobsFlexBox>
      <br/>
      <Presets
        allowAdd
        allowEdit
        allowLocalStorage
        presetsName="chaotic-pm-v3-with-fix"
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

const defaultPresets: ChaoticPMPreset[] = [
  {
    steps: 2,
    indexOfMod: .625,
    carrierFreq: 0.06,
    startModFreq: 0.035,
    freqDiv: 22,
    indexDiv: 6,
    filter: .340,
  },
  {
    steps: 1,
    carrierFreq: 0.666,
    startModFreq: 40,
    freqDiv: 10,
    indexOfMod: 6.66,
    indexDiv: 6.5,
    filter: .512,
  },
  {
    steps: 4,
    carrierFreq: 0.002,
    startModFreq: 0.002,
    freqDiv: 1,
    indexOfMod: .365,
    indexDiv: 5.75,
    filter: .246,
  },
  {
    steps: 8,
    carrierFreq: 0.006,
    startModFreq: 0.05,
    freqDiv: .001,
    indexOfMod: .625,
    indexDiv: 4.75,
    filter: .666,
  },
  {
    steps: 5,
    carrierFreq: 1.41,
    startModFreq: 1.14,
    freqDiv: 1,
    indexOfMod: 0.864,
    indexDiv: 6.75,
    filter: .410,
  },
  {
    steps: 4,
    carrierFreq: 3,
    startModFreq: 0.08,
    freqDiv: 2.6,
    indexOfMod: .5,
    indexDiv: 7,
    filter: .90,
  },
  {
    steps: 4,
    carrierFreq: 1000,
    startModFreq: 0.02,
    freqDiv: 17.85,
    indexOfMod: 13.5,
    indexDiv: 6.75,
    filter: .130,
  },
  {
    steps: 6,
    carrierFreq: 0.144,
    startModFreq: 400,
    freqDiv: 10.247,
    indexOfMod: 64,
    indexDiv: 1.75,
    filter: .279,
  },
];

export default ChaoticPMAudio;