function playAudio( audioLines ) {
  'use strict';
  console.log('new lines received');

}

function updateAudioVolume( volume ) {
  'use strict';
  console.log('volume received: ', volume);
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