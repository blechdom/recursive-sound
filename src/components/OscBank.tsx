import dynamic from "next/dynamic";
import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {el, NodeRepr_t} from "@elemaudio/core";
import styled from "styled-components";
import useMemoizedState from "../hooks/useMemoizedState";

const KnobParamLabel = dynamic(() => import("el-vis-audio").then((mod) => mod.KnobParamLabel), {ssr: false});
const PlayMonoScopeAndGain = dynamic(() => import("el-vis-audio").then((mod) => mod.PlayMonoScopeAndGain), {ssr: false});
const Presets = dynamic(() => import("el-vis-audio").then((mod) => mod.Presets), {ssr: false});

require("events").EventEmitter.defaultMaxListeners = 0;

type OscBankPreset = {
  quantity: number;
  interval: number;
  lowest: number;
};

const OscBank: React.FC = () => {

  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  useEffect(() => {
    window.AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    setAudioContext(new AudioContext() as AudioContext);
  }, []);

  const [playing, setPlaying] = useMemoizedState<boolean>(false);
  const [quantity, setQuantity] = useMemoizedState<number>(64);
  const [interval, setInterval] = useState<number>(1);
  const [lowest, setLowest] = useState<number>(100);
  const [presetList, setPresetList] =
    useMemoizedState<OscBankPreset[]>(defaultPresets);
  const [currentSetting, setCurrentSetting] =
    useMemoizedState<OscBankPreset>(presetList[1]);

  let lastSetting: OscBankPreset | {} = {};
  let lastSettingRef = useRef(lastSetting);

  const OscBankSynth = useCallback(() => {
    if (JSON.stringify(currentSetting) !== JSON.stringify(lastSettingRef.current)) {
      lastSettingRef.current = currentSetting;

      const allVoices = [...Array(quantity)].map((_, i) => {
        const key = `osc-${i}`;
        const freq = el.sm(el.const({key, value: lowest * (2 ** ((i * interval) / 12))}));
        const osc = el.cycle(freq);
        return el.mul(
          osc,
          el.sm(el.const({key: `scale-amp-by-quantity`, value: 1 / quantity}))
        );
      });

      const addMany = (ins: NodeRepr_t[]): NodeRepr_t => {
        return el.add(...ins) as NodeRepr_t;
      };

      return addMany(allVoices as NodeRepr_t[]);
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
        quantity, interval, lowest
      });
    }
  }, [audioContext, quantity, interval, lowest]);

  function updatePresetList(presetList: OscBankPreset[]) {
    setPresetList(presetList);
  }

  function updateCurrentPreset(presetNumber: number) {
    const preset = presetList[presetNumber];
    setQuantity(preset?.quantity);
    setInterval(preset?.interval);
    setLowest(preset?.lowest);
  }

  return (
    <>
      <PlayMonoScopeAndGain
        signal={playing ? (OscBankSynth() as NodeRepr_t) : null}
        isPlaying={setPlaying}
      />
      <br/>
      <KnobsFlexBox>
        <KnobParamLabel
          id={"quantity"}
          label={"quantity"}
          knobValue={quantity}
          step={1}
          min={0}
          max={512}
          onKnobInput={setQuantity}
        />
        <KnobParamLabel
          id={"interval"}
          label={"interval"}
          knobValue={interval}
          step={0.001}
          min={0}
          max={12}
          onKnobInput={setInterval}
        />
        <KnobParamLabel
          id={"lowest"}
          label={"lowest"}
          knobValue={lowest}
          min={0}
          step={0.01}
          max={800}
          onKnobInput={setLowest}
        />
      </KnobsFlexBox>
      <br/>
      <Presets
        allowAdd
        allowEdit
        allowLocalStorage
        presetsName="osc-bank-presets"
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

const defaultPresets: OscBankPreset[] = [
  {
    quantity: 256,
    interval: 1,
    lowest: 100,
  }
];

export default OscBank;