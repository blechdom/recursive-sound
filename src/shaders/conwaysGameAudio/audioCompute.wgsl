override WORKGROUP_SIZE: u32 = 256;
override SAMPLING_RATE: f32 = 44100.0;

struct TimeInfo {
    offset: f32,
}

struct AudioParam {
    freq: f32,
}

@binding(0) @group(0) var<uniform> time_info: TimeInfo;
@binding(1) @group(0) var<storage, read_write> song_chunk: array<vec2<f32>>; // 2 channel pcm data
@binding(2) @group(0) var<storage, read> audio_param: AudioParam;

@compute
@workgroup_size(WORKGROUP_SIZE)
fn synthesize(@builtin(global_invocation_id) global_id: vec3<u32>) {
    let sample = global_id.x;

    if sample >= arrayLength(&song_chunk) {
        return;
    }

    let t = f32(sample) / SAMPLING_RATE;

    //song_chunk[sample] = song(time_info.offset + t, 120);
    song_chunk[sample] = song(time_info.offset + t, audio_param.freq);
}

// -------------------------------------------------------------------------------------------------
// The rest of the shader is copied & ported from https://www.shadertoy.com/view/7lyfWR
// -------------------------------------------------------------------------------------------------

const PI: f32 = 3.141592654;
const TAU: f32 = 6.283185307179586476925286766559;

// length of string (approx 25 inches, standard guitar string length)
const L: f32 = 0.635;

// height of pluck (12.5 cm, just a random number to make it clearly audible)
const h: f32 = 0.125;
// position of pluck along string (5 inches from lower bridge)
const d: f32 = 0.15;

// Damping coefficient (bigger = shorter)
const GAMMA: f32 = 2.5;

// String stiffness coefficient
const b: f32 = 0.008;

const MAX_HARMONICS: u32 = 50u;

fn song(time: f32, freq: f32) -> vec2<f32> {
    var sig = 0.0;

    for (var n = 0u; n < MAX_HARMONICS; n += 1) {
        let a_n: f32 = ((2. * h * L * L) / (PI * PI * d * (L - d) * f32(n+1u) * f32(n+1u))) * sin((f32(n+1u) * PI * d) / L );
        let f_n = f32(n+1u) * freq * sqrt(1. + b * b * f32(n+1u) * f32(n+1u));
        sig += a_n * sin(TAU * f_n * time) * exp(-f32(n+1u) * GAMMA * freq/200.0 * time);
    }
    //}

    // x = left channel, y = right channel
    return vec2(sig);
}