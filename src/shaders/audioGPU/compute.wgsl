override WORKGROUP_SIZE: u32 = 256;
override SAMPLING_RATE: f32 = 44100.0;
const PI2: f32 = 6.283185307179586476925286766559;

struct TimeInfo {
    offset: f32,
}

@group(0) @binding(0) var<uniform> time_info: TimeInfo;
@group(0) @binding(1) var<storage, read_write> sound_chunk: array<vec2<f32>>; // 2 channel pcm data

@compute
@workgroup_size(WORKGROUP_SIZE)
fn synthesize(@builtin(global_invocation_id) global_id: vec3<u32>) {
    let sampleVec = global_id.x;

    if (sampleVec >= arrayLength(&sound_chunk)) {
        return;
    }

    let t = f32(sampleVec) / SAMPLING_RATE;

    sound_chunk[sampleVec] = sine(time_info.offset + t);
}

fn sine(time: f32) -> vec2<f32> {
    const freq: f32 = 440;
    var v: f32 = sin(time * freq * PI2);
    return vec2(v);
}