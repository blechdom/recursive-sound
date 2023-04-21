import {ElementaryWebAudioRenderer as core, el} from 'https://cdn.skypack.dev/@nick-thompson/elementary@v0.10.8';

const audioContext = new window.AudioContext();
  let arp = [1, 5, 7, 8, 10, 12, 8, 7, 5].map(x => 440 * Math.pow(2, (x - 1) / 12));
  let env = el.adsr(0.008, 0.25, 0, 0, el.train(7));
  let volumeConst = el.const({ key: `main-amp`, value: 0 });
let volumeSound = el.mul(volumeConst, env, el.cycle(el.seq({seq: arp}, el.train(7))));

core.on('load', function() {
  core.render(
    el.mul(0.24, env, el.cycle(el.seq({seq: arp}, el.train(7)))),
    volumeSound,
  );
});



(async function main() {
  let node = await core.initialize(audioContext, {
    numberOfInputs: 0,
    numberOfOutputs: 1,
    outputChannelCount: [2],
  });

  node.connect(audioContext.destination);
})();



async function playAudio( audioLines ) {
  'use strict';
  console.log('new lines received');
  if (audioContext.state !== 'running') {
    await audioContext.resume();
  }
}

function updateAudioVolume( volumeControl ) {
  'use strict';
  volumeConst = el.const({ key: `main-amp`, value: 0 });
  volumeSound = el.mul(volumeConst, env, el.cycle(el.seq({seq: arp}, el.train(7))));
}

function updateAudioPitchRange( range ) {
  'use strict';
  console.log('pitch range received: ', range);
}

export
{
	playAudio,
	updateAudioVolume,
  updateAudioPitchRange
};