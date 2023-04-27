import Head from "next/head";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <Head>
        <title>Morphisma</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1>MORPHISMA</h1>
      <h2>Recursive Sounds, Audio Experiments, and other Works-In-Progress...</h2>
      <ul>
        <li>
          <Link href={"./fractals"}>Fractals</Link>
          <p>WIP: Mandelbrot + Julia set: OSC controllers.
            Generate OSC messages from 256x256 fractal matrices.
            Data is sent row-by-row at a rate in ms.
            The 256-size arrays consist of numbers between 0 and 1.
            Requires local node-OSC server and Max/MSP proxy-OSC-server, to direct the OSC messages
            to a Kyma Pacamara. In Kyma, the 256 size arrays are interpreted as amplitudes in a 256 size oscillator bank.
            The frequencies and amplitudes are scalable. There is a threshold to mute oscillators below a certain amplitude.
            Click and drag on the mandelbrot to generate new versions of the Julia Fractal.
            Interface heavily borrows from <Link href={"https://github.com/mikebharris/javascript_mandelbrot_set_and_julia_set_explorer"}>Mike Harris&apos; work</Link>
          </p>
        </li>
        <li><Link href={"./tesselation-with-audio.html"}>Tesselations (with webAudio controls coming soon)</Link>
        <p>WIP: Currently just a copy of Craig S. Kaplan&apos;s tactile-js demo, with some console.log data for interesting parameters. Planning to add webaudio and OSC implementation.</p></li>
        <li><Link href={"./spirals.html"}>Spiral Tesselations</Link> <p>WIP: Currently just a copy of Craig S. Kaplan&apos;s tactile-js demo. Planning to add webaudio and OSC implementation.</p></li>
        <li><Link href={"https://blechdom.github.io/el-vis-audio"}>El-Vis-Audio</Link> - A collection of Audio experiments and UI elements using <Link href={"https://elementary.audio"}>Elementary Audio</Link> and Storybook:
          <p>Here are the recursive and more complex-function oriented demos: </p>
          <ul>
            <li><Link href={"https://blechdom.github.io/el-vis-audio/?path=/story/experiments-recursivepm3--default"}>Recursive PM</Link></li>
            <li><Link href={"https://blechdom.github.io/el-vis-audio/?path=/story/experiments-recursive-fm--default"}>Recursive FM</Link></li>
            <li><Link href={"https://blechdom.github.io/el-vis-audio/?path=/story/experiments-weierstrass-function--default"}>Weierstrass Function</Link></li>
            <li><Link href={"https://blechdom.github.io/el-vis-audio/?path=/story/experiments-weierstrass-function--default"}>Weierstrass Function FM</Link></li>
            <li><Link href={"https://blechdom.github.io/el-vis-audio/?path=/story/experiments-shepardrissetglissando2--default"}>Shepard-Risset Glissando</Link></li>
          </ul>
        </li>
      </ul>
    </div>
  );}