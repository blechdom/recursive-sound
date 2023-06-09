import { el } from 'https://cdn.skypack.dev/@elemaudio/core';
import WebRenderer from 'https://cdn.skypack.dev/@elemaudio/web-renderer';
const audioContext = new window.AudioContext();
let coreLoaded = false;

const core = new WebRenderer();

function sineTone(t) {
  return el.sin(el.mul(2 * Math.PI, t));
}

(async function main() {
  let node = await core.initialize(audioContext, {
    numberOfInputs: 0,
    numberOfOutputs: 1,
    outputChannelCount: [2],
  });
  node.connect(audioContext.destination);
})();

core.on('load', function() {
  "use strict";
  coreLoaded = true;
});

export default class AudioTesselator {
  volume = 0;
  pitchRange = 440;
  ms = 100;
  constructor(volume, pitchRange, ms) {
    this.volume = volume;
    this.pitchRange = pitchRange;
    this.timeoutIdList = [];
    this.ms = ms;
    this.voice = null;
    this.render = this.render.bind(this);
    this.updateVoices = this.updateVoices.bind(this);
    this.sineTone = this.sineTone.bind(this);
    this.addMany = this.addMany.bind(this);
  }

  render() {
    if(this.voice !== null){
      const volumeConst = el.sm(el.const({key: 'volume', value: (this.volume !== undefined) ? this.volume : 0 }));
      const scaledOut = el.mul(volumeConst, this.voice);
      if (audioContext.state !== 'running') {
        audioContext.resume();
      }
      if(coreLoaded){
        core.render(scaledOut, scaledOut);
      }
    }
  }

  sineTone(t) {
    return el.sin(el.mul(2 * Math.PI, t));
  }

  updateVoices(lines) {
    console.log('lines: ', JSON.stringify(lines, null, 4));
    const activeVoices = lines.filter(note => note.status === "starting");
    if(this.pitchRange !== undefined){
      this.pitchRange = 200;
    }
    if (activeVoices.length > 0) {
      const allVoices = activeVoices.map((note, i) => {
        const rampLengthHz = el.const({ key: `rampLengthHz-${i}`, value: (1 / ((note.end.x - note.start.x) * 100)) * 1000 });
        const freqDistance = el.const({ key: `freqDistance-${i}`, value: (note.end.y - note.start.y) * 1000 });
        const freq = el.sm(el.const({key: note.key, value: note.start.y * 1000}));

        return el.mul(
          this.sineTone(
            el.phasor(
              el.add(
                freq,
                el.mul(
                  freqDistance,
                  el.phasor(rampLengthHz, 0)
                )
              ),
              0
            )
          ),
          el.sm(el.const({key: `scale-amp-by-numVoices`, value: 0.1 }))
        );
      });

      const addedVoices = this.addMany(allVoices);
      this.voice = addedVoices;
      this.render();
    }
  }

  addMany(ins) {
    if (ins.length < 9) {
      return el.add(...ins);
    }
    return el.add(...ins.slice(0, 7), this.addMany(ins.slice(8)));
  }

  setVolume(value) {
    this.volume = value;
    this.render();
  }

  setPitchRange(value) {
    this.pitchRange = (value * 1000) + 100;
    this.render();
  }

  setMsScale(value) {
    this.ms = (value * 100) + 1;
    this.render();
  }

  setLines(lines) {
    if(this.timeoutIdList.length > 0){
      this.timeoutIdList.forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });
    }
    this.timeoutIdList = [];

    let ms = this.ms;
    if (ms === undefined) ms = 100;
    this.ms = ms;
    const thisTimeoutIdList = this.timeoutIdList;
    const thisUpdateVoices = this.updateVoices;

    lines.forEach((note)=> {
      const timeoutId = setTimeout(function() {

        // SOUND START
        note.status = "starting";
        thisUpdateVoices(lines);

        const timeoutEndSoundId = setTimeout(function() {

          // SOUND END
          note.status = "ending";
          thisUpdateVoices(lines);

        }, (note.end.x - note.start.x) * ms);

        thisTimeoutIdList.push(timeoutEndSoundId);

      }, note.start.x * ms);
      this.timeoutIdList.push(timeoutId);
    });
  }
}