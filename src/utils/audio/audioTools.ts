import {el, NodeRepr_t} from "@elemaudio/core";
import WebRenderer from "@elemaudio/web-renderer";

export let audioContext: AudioContext | null = null;
if (typeof window !== 'undefined') {
  audioContext = new AudioContext();
}

export const core: WebRenderer = new WebRenderer();

export function cycleByPhasor(phasor: NodeRepr_t | number) {
  return el.sin(el.mul(2 * Math.PI, phasor));
}

export const exponentialScale = function (value: number): number {
  const a = 10;
  const b = Math.pow(a, 1 / a);
  return a * Math.pow(b, value);
};

export const toLog = function (
  value: number,
  min: number,
  max: number
): number {
  const exp = (value - min) / (max - min);
  return min * Math.pow(max / min, exp);
};

async function audioInit() {
  console.log("Initializing WebRenderer Core");
  if (typeof window !== 'undefined' && audioContext && core) {
    let node = await core.initialize(audioContext, {
      numberOfInputs: 0,
      numberOfOutputs: 1,
      outputChannelCount: [2],
    });
    node.connect(audioContext.destination);
  }
}

audioInit();

core.on("load", () => {
  console.log("Core Successfully Loaded");
});