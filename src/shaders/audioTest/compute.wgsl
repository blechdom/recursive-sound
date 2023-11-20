
override WORKGROUP_SIZE: u32 = 256;
override SAMPLING_RATE: f32 = 44100.0;

struct TimeInfo {
    // time since song start in seconds
    offset: f32,
}

@group(0) @binding(0) var<uniform> time_info: TimeInfo;
@group(0) @binding(1) var<storage, read_write> song_chunk: array<vec2<f32>>; // 2 channel pcm data

@compute
@workgroup_size(WORKGROUP_SIZE)
fn synthezise(@builtin(global_invocation_id) global_id: vec3<u32>) {
    let sample = global_id.x;

    if sample >= arrayLength(&song_chunk) {
        return;
    }

    let t = f32(sample) / SAMPLING_RATE;

    song_chunk[sample] = song(time_info.offset + t);
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

// fundamental frequencies of each string
// changing these will "tune" the guitar
const FUNDAMENTAL: array<f32, 6> = array<f32, 6>(
    329.63, // E4
    246.94, // B3
    196.00, // G3
    146.83, // D3
    110.00, // A2
    082.41  // E2
);

fn song(time: f32) -> vec2<f32> {
    var sig = 0.0;
    // for each string
    for (var s = 0u; s < 6u; s += 1) {
        // repeat at a different offset
        let t = (time + f32(s) / 6.) % (8./6.);

        // for each harmonic
        for (var n = 0u; n < MAX_HARMONICS; n += 1) {
            // amplitude for each harmonic
            let a_n: f32 = ((2. * h * L * L) / (PI * PI * d * (L - d) * f32(n+1u) * f32(n+1u))) * sin((f32(n+1u) * PI * d) / L );

            // frequency for each harmonic
            let f_n = f32(n+1u) * FUNDAMENTAL[s] * sqrt(1. + b * b * f32(n+1u) * f32(n+1u));

            // add value to total sound signal, with exponential falloff
            sig += a_n * sin(TAU * f_n * t) * exp(-f32(n+1u) * GAMMA * FUNDAMENTAL[s]/200.0 * t);
        }
    }

    // x = left channel, y = right channel
    return vec2(sig);
}