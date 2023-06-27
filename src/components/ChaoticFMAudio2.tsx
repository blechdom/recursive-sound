import dynamic from "next/dynamic";
import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {el, NodeRepr_t} from "@elemaudio/core";
import styled from "styled-components";
import useMemoizedState from "../hooks/useMemoizedState";

const KnobParamLabel = dynamic(() => import("el-vis-audio").then((mod) => mod.KnobParamLabel), {ssr: false});
const PlayMonoScopeAndGain = dynamic(() => import("el-vis-audio").then((mod) => mod.PlayMonoScopeAndGain), {ssr: false});
const Presets = dynamic(() => import("el-vis-audio").then((mod) => mod.Presets), {ssr: false});

require("events").EventEmitter.defaultMaxListeners = 0;

type ChaoticFMPreset = {
  steps: number;
  carrierFreq: number;
  offset: number;
  modAmp: number;
  modAmpDiv: number;
  filter: number;
};

const ChaoticFMAudio2: React.FC = () => {

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
  const [filter, setFilter] = useState<number>(0.5);
  const [presetList, setPresetList] =
    useMemoizedState<ChaoticFMPreset[]>(defaultPresets);
  const [currentSetting, setCurrentSetting] =
    useMemoizedState<ChaoticFMPreset>(presetList[1]);

  let lastSetting: ChaoticFMPreset | {} = {};
  let lastSettingRef = useRef(lastSetting);

  const chaoticModulatedCycle = (
    signal: NodeRepr_t,
    amp: number, //220
    modAmpDiv: number, //2
    filter: number,  //0.5
    offset: number,
    count: number,
  ): NodeRepr_t => {
    const shaperMix = el.sm(el.const({key: `shaper:mix-${count}`, value: filter * 4}));
    const shaperGain = el.sm(el.const({key: `shaper:gain-${count}`, value: (1.2 - Math.sqrt(filter))}));
    const normalizedOffset = el.sm(el.const({key: `shaper:offset-${count}`, value: offset + (amp / 2)}));
    const halfAmp = el.sm(el.const({key: `half-amp-${count}`, value: amp / 2}));
    const normalizedSignal = el.div(el.sub(signal, normalizedOffset), halfAmp);
    const filteredSignal = el.mul(el.tanh(el.mul(normalizedSignal, shaperMix)), shaperGain);
    const scaledSignal = el.add(el.mul(filteredSignal, halfAmp), normalizedOffset);
    let modulator = el.mul(scaledSignal, el.sm(el.const({key: `mod-amp-${count}`, value: amp / modAmpDiv})));

    return audioContext && count > 0
      ? chaoticModulatedCycle(
        el.cycle(modulator) as NodeRepr_t,
        amp / modAmpDiv,
        modAmpDiv,
        filter,
        offset,
        count - 1,
      )
      : signal;
  };

  const chaoticFMSynth = useCallback(() => {
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
            el.sm(el.const({key: `start-amp`, value: (currentSetting?.modAmp / 2)}))
          ),
          el.sm(el.const({key: `start-amp-offset`, value: currentSetting?.offset + (currentSetting?.modAmp / 2)}))
        )
      );

      return chaoticModulatedCycle(
        firstMod,
        currentSetting?.modAmp,
        currentSetting?.modAmpDiv,
        currentSetting?.filter,
        currentSetting?.offset,
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
        filter,
        offset
      });
    }
  }, [audioContext, steps, carrierFreq, modAmp, modAmpDiv, filter, offset]);

  function updatePresetList(presetList: ChaoticFMPreset[]) {
    setPresetList(presetList);
  }

  function updateCurrentPreset(presetNumber: number) {
    const preset = presetList[presetNumber];
    setSteps(preset?.steps);
    setCarrierFreq(preset?.carrierFreq);
    setModAmp(preset?.modAmp);
    setModAmpDiv(preset?.modAmpDiv);
    setFilter(preset?.filter);
    setOffset(preset?.offset);
  }

  return (
    <>
      <PlayMonoScopeAndGain
        signal={playing ? (chaoticFMSynth() as NodeRepr_t) : null}
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
        <KnobParamLabel
          id={"filter"}
          label={"filter"}
          knobValue={filter}
          min={0}
          step={0.01}
          max={1}
          onKnobInput={setFilter}
        />
      </KnobsFlexBox>
      <br/>
      <Presets
        allowAdd
        allowEdit
        allowLocalStorage
        presetsName="chaotic-fm-next"
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

const defaultPresets: ChaoticFMPreset[] = [
  {
    steps: 1,
    carrierFreq: 10.5,
    offset: 0,
    modAmp: 350,
    modAmpDiv: 0.4,
    filter: 256,
  },
  {
    steps: 4,
    carrierFreq: 1.798,
    offset: 100,
    modAmp: 4200,
    modAmpDiv: 4,
    filter: 375,
  },
  {
    steps: 5,
    carrierFreq: 0.129,
    offset: 637,
    modAmp: 2737,
    modAmpDiv: 5.8,
    filter: 531,
  },
  {
    steps: 2,
    carrierFreq: 0.143,
    offset: 637,
    modAmp: 4762,
    modAmpDiv: 7.611,
    filter: 1024,
  },
  {
    steps: 1,
    carrierFreq: 11,
    offset: 787,
    modAmp: 125,
    modAmpDiv: 4.3,
    filter: 725,
  },
];

export default ChaoticFMAudio2;