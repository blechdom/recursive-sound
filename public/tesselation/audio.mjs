import { ElementaryWebAudioRenderer as core, el } from 'https://cdn.skypack.dev/@nick-thompson/elementary@v0.10.8';
const audioContext = new window.AudioContext();
let coreLoaded = false;

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
  lines = [];
  constructor(volume, pitchRange, lines) {
    this.volume = volume;
    this.pitchRange = pitchRange;
    this.lines = lines;
    this.soundOut = this.soundOut.bind(this);
    this.render = this.render.bind(this);
  }

  soundOut(volume, pitch) {
    const volumeConst = el.sm(el.const({key: 'volume', value: volume}));
    const pitchConst = el.sm(el.const({key: 'pitch', value: (pitch*550) + 100}));
    return el.mul(volumeConst, el.cycle(pitchConst));
  }

  render() {
    if (audioContext.state !== 'running') {
      audioContext.resume();
    }
    if(coreLoaded){
      if(this.volume && this.pitchRange){
        core.render(this.soundOut(this.volume, this.pitchRange), this.soundOut(this.volume, this.pitchRange));
      }
    }
  }

  setVolume(value) {
    this.volume = value;

    this.render();
  }
  setPitchRange(value) {
    this.pitchRange = value;
    this.render();
  }
  setLines(lines) {
    console.log('new lines received', lines);
    this.lines = lines;
    lines.forEach((row, index) => {
      console.log('index: ', index, ' row', row);
      //setTimeout(function() {
      //   socket?.emit("fractalMandelbrotRow", row);
      //}, msBetweenRows * index);
    });
  }
}