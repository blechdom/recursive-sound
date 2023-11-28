
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
fn synthesize(@builtin(global_invocation_id) global_id: vec3<u32>) {
    let sample = global_id.x;

    if sample >= arrayLength(&song_chunk) {
        return;
    }

    let t = f32(sample) / SAMPLING_RATE;

    song_chunk[sample] = mainSound(time_info.offset + t);
}

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

// number of synthesized harmonics (tune for quality/preformance)
const NSPC: u32 = 256u;

const pi2: f32 = 6.283185307179586476925286766559;

fn dist(s: f32, d: f32) -> f32 {
	return clamp(s * d, -1.0, 1.0);
}

fn distVec(s: vec2<f32>, d: f32) -> vec2<f32> {
    let distClamp: vec2<f32> = vec2(s * d);
    let distSig: vec2<f32> = clamp(distClamp, vec2<f32>(-1.0), vec2<f32>(1.0));
    return distClamp;
}

fn quan(s: f32, c: f32) -> f32 {
	return floor(s / c) * c;
}

fn _filter(h: f32, cut: f32, res: f32) -> f32 {
	let cutted: f32 = cut - 20.0;
	let df: f32 = max(h - cutted, 0.0);
	let df2: f32 = abs(h - cutted);
	return exp(-0.005 * df * df) * 0.5 + exp(df2 * df2 * -0.1) * 2.2;
}

fn nse(x: f32) -> f32 {
	return fract(sin(x * 110.082) * 19871.8972);
}

fn nse_slide(x: f32) -> f32 {
    let fl: f32 = floor(x);
	return mix(nse(fl), nse(fl + 1.0), smoothstep(0.0, 1.0, fract(x)));
}

fn ntof(n: f32) -> f32 {
	return 440.0 * pow(2.0, (n - 69.0) / 12.0);
}

fn synth(tseq: f32, t: f32) -> vec2<f32> {
    var v: vec2<f32> = vec2(0.0);
    let tnote: f32 = fract(tseq);
    let dr: f32 = 0.26;
    let amp: f32 = smoothstep(0.05, 0.0, abs(tnote - dr - 0.05) - dr) * exp(tnote * -1.0);
    let seqn: f32 = nse(floor(tseq));
    let n: f32 = 20.0 + floor(seqn * 38.0);
    let f: f32 = ntof(n);
    let sqr: f32 = smoothstep(0.0, 0.01, abs((t*9.0)%64.0 - 20.0) - 20.0);
    let base: f32 = f;
    let flt: f32 = exp(tnote * -1.5) * 50.0 + pow(cos(t * 1.0) * 0.5 + 0.5, 4.0) * 80.0 - 0.0;

    for (var i = 0u; i < NSPC; i += 1) {
        var h: f32 = f32(i + 1);
        var inten: f32 = 1.0 / h;
        inten = mix(inten, inten * (h%2.0), sqr);
        inten *= exp(-1.0 * max(2.0 - h, 0.0));
        inten *= _filter(h, flt, 4.0);

        var vx = v.x + (inten * sin((pi2 + 0.01) * (t * base * h)));
        var vy = v.y + (inten * sin(pi2 * (t * base * h)));
        v = vec2(vx, vy);
    }

    let o: f32 = v.x * amp;

    return vec2(distVec(v * amp, 2.0));
}

fn gate1(t: f32) -> f32
{
	const stp: f32 = 0.0625;
	var v: f32 = abs(t - 0.00 - 0.015) - 0.015;
	v = min(v, abs(t - stp*1. - 0.015) - 0.015);
	v = min(v, abs(t - stp*2. - 0.015) - 0.015);
	v = min(v, abs(t - stp*4. - 0.015) - 0.015);
	v = min(v, abs(t - stp*6. - 0.015) - 0.015);
	v = min(v, abs(t - stp*8. - 0.05) - 0.05);
	v = min(v, abs(t - stp*11. - 0.05) - 0.05);
	v = min(v, abs(t - stp*14. - 0.05) - 0.05);

	return smoothstep(0.001, 0.0, v);
}

fn synth2(time: f32) -> vec2<f32> {
	var tb: f32 = ((time * 9.0)%16.0) / 16.0;
    var f: f32 = time * pi2 * ntof(87.0 - 12.0 + (tb%4.0));
	var v: f32 = dist(sin(f + sin(f * 0.5)), 5.0) * gate1(tb);

	return vec2(v);
}
fn synth2_echo(time: f32, tb: f32) -> vec2<f32> {
    var mx: vec2<f32> = synth2(time) * 0.5;// + synth2(time) * 0.5;
    var ec: f32 = 0.3;
    var fb: f32 = 0.6;
    var et: f32 = 3.0 / 9.0;
    var tm: f32 = 2.0 / 9.0;
    mx += synth2(time - et) * ec * vec2(1.0, 0.2);
    ec *= fb;
    et += tm;
    mx += synth2(time - et) * ec * vec2(0.2, 1.0);
    ec *= fb;
    et += tm;
    mx += synth2(time - et) * ec * vec2(1.0, 0.2);
    ec *= fb;
    et += tm;
    mx += synth2(time - et) * ec * vec2(0.2, 1.0);
    ec *= fb;
    et += tm;
    return mx;
}

fn synth1_echo(tb: f32, time: f32) -> vec2<f32> {
    var v: vec2<f32>;
    v = synth(tb, time) * 0.5;
    var ec: f32 = 0.4;
    var fb: f32 = 0.6;
    var et: f32 = 2.0 / 9.0;
    var tm: f32 = 2.0 / 9.0;
    v += synth(tb, time - et) * ec * vec2(1.0, 0.5);
    ec *= fb;
    et += tm;
    v += synth(tb, time - et).yx * ec * vec2(0.5, 1.0);
    ec *= fb;
    et += tm;
    v += synth(tb, time - et) * ec * vec2(1.0, 0.5);
    ec *= fb;
    et += tm;
    v += synth(tb, time - et).yx * ec * vec2(0.5, 1.0);
    ec *= fb;
    et += tm;

    return v;
}

fn mainSound(time: f32) -> vec2<f32> {
    var mx: vec2<f32> = vec2(0.0);
    var tb: f32 = (time * 9.0)%16.0;
    mx = synth1_echo(tb, time) * 0.8 * smoothstep(0.0, 0.01, abs(((time * 9.0)%256.0) + 8.0 - 128.0) - 8.0);
    var hi: f32 = 1.0;
    var ki: f32 = smoothstep(0.01, 0.0, abs(((time * 9.0)%256.0) - 64.0 - 128.0) - 64.0);
    var s2i: f32 = 1.0 - smoothstep(0.01, 0.0, abs(((time * 9.0)%256.0) - 64.0 - 128.0) - 64.0);
    hi = ki;
    mx += vec2(synth2_echo(time, tb)) * 0.2 * s2i;

    mx = mix(mx, mx * (1.0 - fract(tb / 4.0) * 0.5), ki);
  	var sc: f32 = sin(pi2 * tb) * 0.4 + 0.6;

  	mx = distVec(mx, 1.00);

  	return vec2(mx);
}
    /*
fn mainSound(time: f32) -> vec2<f32>
{
	vec2 mx = vec2(0.0);

	float tb = mod(time * 9.0, 16.0);


	mx = synth1_echo(tb, time) * 0.8 * smoothstep(0.0, 0.01, abs(mod(time * 9.0, 256.0) + 8.0 - 128.0) - 8.0);

    float hi = 1.0;
    float ki = smoothstep(0.01, 0.0, abs(mod(time * 9.0, 256.0) - 64.0 - 128.0) - 64.0);
    float s2i = 1.0 - smoothstep(0.01, 0.0, abs(mod(time * 9.0, 256.0) - 64.0 - 128.0) - 64.0);
    hi = ki;

    mx += expl(mod(time * 9.0, 64.0) / 4.5) * 0.4 * s2i;

	mx += vec2(hat(tb) * 1.5) * hi;

	//mx += dist(fract(tb / 16.0) * sin(ntof(77.0 - 36.0) * pi2 * time), 8.0) * 0.2;
	//mx += expl(tb) * 0.5;

	mx += vec2(synth2_echo(time, tb)) * 0.2 * s2i;


	mx = mix(mx, mx * (1.0 - fract(tb / 4.0) * 0.5), ki);
	float sc = sin(pi2 * tb) * 0.4 + 0.6;
	float k = kick(tb, time) * 0.8 * sc * ki;// - kick(tb, time - 0.004) * 0.5 - kick(tb, time - 0.008) * 0.25);

	mx += vec2(k);



	mx = dist(mx, 1.00);

	return vec2(mx);
}*/