import Head from "next/head";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <Head>
        <title>MORPHISMA</title>
        <link rel="icon" href="/favicon.ico"/>
      </Head>
      <h1>MORPHISMA</h1>
      <h2>WebGPU Expiriments</h2>
      * requires chrome://flags/#enable-unsafe-webgpu flag to be enabled
      <ul>
        <li><Link href={"./conwayGameAudio"}>Conway Game Audio</Link></li>
        <li><Link href={"./threeOhThree"}>303 acid jam ported from shadertoy sound</Link></li>
      </ul>
      <h2>Recursive Sounds, WebAudio Experiments, and other Works-In-Progress...</h2>
      <ul>
        <li><Link href={"./recursiveFM"}>Recursive FM</Link></li>
        <li><Link href={"./recursivePM"}>Recursive PM</Link></li>
        <li><Link href={"./chaoticFM"}>Chaotic FM</Link></li>
        <li><Link href={"./chaoticPM"}>Chaotic PM (WIP)</Link></li>
        <li>
          <Link href={"./dataTuner"}>Data Tuner 2D</Link>
          <p>WIP: Preview 2D Data Sets and experiment with a range of transformations, interpretations, and sonification
            possibilities.
            Generate OSC, WebMIDI, and WebAudio from matrices.
            Decide how you want to read through the data.
            Massage the data into the values you need.
            Data can be sent row-by-row or column-by-column at a rate in ms.
            Data can be converted between cartesian and polar coordinates.
            Data can be scaled exponentially or logarithmically.
            This is an opportunity to tune your instrument with standard patterns before feeding it live or chaotic
            data.
            Can you hear the important contours?
            Would it sound better if your data knew about its neighboring data and could change its quality accordingly?
            Maybe you need to set thresholds to focus on particular ranges of data.
            Maybe boundaries need to be drawn so different data can be interpreted in different time-scales?
            Where does time exist in a 2D Matrix?
          </p>
        </li>
        <li>
          <Link href={"./fractals"}>Fractals</Link>
          <p>WIP: Mandelbrot + Julia set: OSC controllers.
            Generate OSC messages from 256x256 fractal matrices.
            Data is sent row-by-row at a rate in ms.
            The 256-size arrays consist of numbers between 0 and 1.
            Requires local node-OSC server and Max/MSP proxy-OSC-server, to direct the OSC messages
            to a Kyma Pacamara. In Kyma, the 256 size arrays are interpreted as amplitudes in a 256 size oscillator
            bank.
            The frequencies and amplitudes are scalable. There is a threshold to mute oscillators below a certain
            amplitude.
            Click and drag on the mandelbrot to generate new versions of the Julia Fractal.
            Interface heavily borrows from <Link
              href={"https://github.com/mikebharris/javascript_mandelbrot_set_and_julia_set_explorer"}>Mike
              Harris&apos; work</Link>
          </p>
        </li>
        <li><Link href={"./fractalPlayheads"}>Fractal Playheads</Link>
          <p><Link href={"./juliasPlayheads"}>Julia&apos;s Playheads</Link></p>
          <p>
            Render a frame of the Julia Set in a 2D Matrix with values between 0 and 1. Using the principles
            of coloring algorithms that animate cyclically through the set using a modulo functions on each point,
            <i>color</i> the data using cyclic Risset Glissandi. Mapping notes within the glissandi to the values in
            each
            position. Time is represented by a 1D array playhead that moves through the data. This is the playhead.
            Possible playhead options:
            <ul>
              <li>Polar: CW & CCW</li>
              <li>Radiant: a circle grows or shrinks. Inside-out & Outside-in</li>
              <li>Linear: Left-to-Right, Right-to-Left, Top-to-Bottom, Bottom-to-Top</li>
              <li>All-Data: Use another data factor to envelope sound, making space for all points to be heard
                simultaneously
              </li>
            </ul>
          </p>
        </li>
        <li>
          <Link href={"./oscillatorBank"}>Oscillator Bank</Link>
        </li>
        <li><Link href={"./tesselation-with-audio.html"}>Tesselations (with webAudio controls coming soon)</Link>
          <p>WIP: Currently just a copy of Craig S. Kaplan&apos;s tactile-js demo, with some console.log data for
            interesting parameters. Planning to add webaudio and OSC implementation.</p></li>
        <li><Link href={"./spirals.html"}>Spiral Tesselations</Link> <p>WIP: Currently just a copy of Craig S.
          Kaplan&apos;s tactile-js demo. Planning to add webaudio and OSC implementation.</p></li>
        <li><Link href={"https://blechdom.github.io/el-vis-audio"}>El-Vis-Audio</Link> - A collection of Audio
          experiments and UI elements using <Link href={"https://elementary.audio"}>Elementary Audio</Link> and
          Storybook:
          <p>Here are the recursive and more complex-function oriented demos: </p>
          <ul>
            <li><Link
              href={"https://blechdom.github.io/el-vis-audio/?path=/story/experiments-weierstrass-function--default"}>Weierstrass
              Function</Link></li>
            <li><Link
              href={"https://blechdom.github.io/el-vis-audio/?path=/story/experiments-weierstrass-function--default"}>Weierstrass
              Function FM</Link></li>
            <li><Link
              href={"https://blechdom.github.io/el-vis-audio/?path=/story/experiments-shepardrissetglissando2--default"}>Shepard-Risset
              Glissando</Link></li>
          </ul>
        </li>
      </ul>
    </div>
  );
}