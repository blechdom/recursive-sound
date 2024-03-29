/*
                    Initialize Fractal (Size, Type, MaxIterations, Threshold, Overflow)
                               |
                    Select Plotting Method (Escape (LSM), Distance (DEM))
                               |
                    Generate Fractal Data (Zoom-Window Parameters, Julia-Cx/Cy): plotData
                               |
                   Select Point Coloring Scheme (Modulo, Raw, Decomp1, Decomp2): colorData (generated at the point level)
                                |
                Select Transform Scheme(s) (Outline, Outlines, Difference, Density, Inverse, Log, Scale): transformData (generated at the row or matrix level)
                    /                   \
              Draw Fractal        Generate Audio Data  (Scale to 0 - 1.0) --> audioData
          (Greyscale & Color)             |
              drawData            Select Playhead  (Up, Down, Left, Right, In, Out, Random, All-At-Once, Border-Follower)
                                          |
                                  Generate Playhead Data  (Rotation, Transform, Scale to 0 - 1.0)
                                          |
                                  Play Audio / OSC  (OscillatorBanks, Filters, Effects, Rhythms, RissetResynth, etc)
                                          |
                                  Manipulate Playback in real-time
                                          |
                                  Program Animations (Animate Zooms, Rotations, Timings)


                                  **** TODO ****
                                  * Convert to class
                                  * Add data input field for copy/pasting any 2d array in and sonifying
                                  * Isolate Data Ranges or Areas to be assigned to different types of interpretations
 */

import {colourPalettes} from "@/utils/fractal";

export const enum FractalType {
  Mandelbrot = "mandelbrot",
  Julia = "julia",
}

export type FractalPlane = {
  x_min: number;
  y_min: number;
  x_max: number;
  y_max: number;
};

export const defaultMandelbrotPlane: FractalPlane = {
  x_min: -2.5,
  y_min: -1.25,
  x_max: 0.8,
  y_max: 1.25
};

export const defaultJuliaPlane: FractalPlane = {
  x_min: -2.0,
  y_min: -1.5,
  x_max: 2.0,
  y_max: 1.5
};

export type Point = { x: number; y: number };

export function getScalingFactors(plane: FractalPlane, size: number) {
  return {x: (plane.x_max - plane.x_min) / (size - 1), y: (plane.y_max - plane.y_min) / (size - 1)}
}

function computePoint(point: Point, cx: number, cy: number, maxIterations: number, threshold: number): number {
  let x2 = point.x * point.x
  let y2 = point.y * point.y
  let iterations = 0
  while ((iterations < maxIterations) && ((x2 + y2) < threshold)) {
    let temp = x2 - y2 + cx
    point.y = 2 * point.x * point.y + cy
    point.x = temp
    x2 = point.x * point.x
    y2 = point.y * point.y
    iterations++
  }
  return iterations
}

function computePointDem(point: Point, cx: number, cy: number, maxIterations: number, overflow: number) {
  const huge = 100000.0
  let x = point.x, y = point.y, x2 = 0.0, y2 = 0.0, dist = 0.0, xorbit = [], yorbit = []
  xorbit[0] = 0.0
  yorbit[0] = 0.0

  let iterations = 0
  while ((iterations < maxIterations) && ((x2 + y2) < huge)) {
    let temp = x2 - y2 + cx
    y = 2 * x * y + cy
    x = temp
    x2 = x * x
    y2 = y * y
    iterations++
    xorbit[iterations] = x
    yorbit[iterations] = y
  }
  if ((x2 + y2) > huge) {
    let xder = 0.0, yder = 0.0
    let i = 0
    let flag = false
    while ((i < iterations) && !flag) {
      let temp = 2 * (xorbit[i] * xder - yorbit[i] * yder) + 1
      yder = 2 * (yorbit[i] * xder + xorbit[i] * yder)
      xder = temp
      flag = Math.max(Math.abs(xder), Math.abs(yder)) > overflow
      i++
    }
    if (!flag) {
      dist = (Math.log(x2 + y2) * Math.sqrt(x2 + y2)) / Math.sqrt(xder * xder + yder * yder)
    }
  }
  return dist
}

function computePointJuliaDem(point: Point, cx: number, cy: number, maxIterations: number) {
  let x = point.x,
    y = point.y,
    xp = 1.0,
    yp = 0.0,
    nz,
    nzp,
    a;

  for (let i = 1; i <= maxIterations; i++) {
    nz = 2 * (x * xp - y * yp);
    yp = 2 * (x * yp + y * xp);
    xp = nz;
    nz = x * x - y * y + cx;
    y = 2 * x * y + cy;
    x = nz;
    nz = x * x + y * y;
    nzp = xp * xp + yp * yp;
    if (nzp > 1e60 || nz > 1e60) {
      break;
    }
  }
  if (nz) {
    a = Math.sqrt(nz);
  }
  if (a && nzp) {
    return 2 * a * Math.log(a) / Math.sqrt(nzp);
  }
  return 0;
}

function drawLSMModulo(
  iterations: number,
  numShades: number,
  shadeOffset: number,
  colorScheme: string,
  maxIterations: number,
  ctx: CanvasRenderingContext2D,
): number {
  let a: number = 0;
  if (iterations == maxIterations) { // we are in the set
    a = 0;
    ctx.fillStyle = "#000"
  } else {
    a = (iterations + shadeOffset) % numShades;
    if (colorScheme === "grayscale") {
      const shade = Math.abs((a / numShades) - 0.5) * 2 * 255;
      ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
    } else {
      const shade = (a / (numShades - 1)) * 360;
      ctx.fillStyle = `hsl(${shade}, 100%, 50%)`;
    }
  }
  return a / (numShades - 1);
}

function transformModulo(
  fractalData: number[][],
  numShades: number,
  shadeOffset: number,
  colorScheme: string,
  size: number,
  canvas: HTMLCanvasElement,
): { audioData: number[][], aMin: number, aMax: number } | undefined {
  const ctx = canvas.getContext("2d");
  if (ctx !== null) {
    // @ts-ignore
    ctx.reset();
    let aMax: number = 0, aMin: number = 0, audioArray: number[][] = [];
    for (let iy = 0; iy < size; iy++) {
      const audioRow: number[] = [];
      for (let ix = 0; ix < size; ix++) {
        let a = fractalData[iy][ix];
        if (a === 0) {
          ctx.fillStyle = "#000";
        } else {
          a = (a + shadeOffset) % numShades;
          if (colorScheme === "grayscale") {
            const shade = Math.abs((a / numShades) - 0.5) * 2 * 255;
            ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
          } else {
            const shade = (a / (numShades - 1)) * 360;
            ctx.fillStyle = `hsl(${shade}, 100%, 50%)`;
          }
        }
        if (a > aMax) aMax = a;
        if (a < aMin) aMin = a;
        audioRow.push(a / (numShades - 1)); // scale to [0, 1] and push
        ctx.fillRect(ix, iy, 1, 1);
      }

      audioArray.push(audioRow);
    }
    return {audioData: audioArray, aMin, aMax};
  }
}

function transformOutline(
  fractalData: number[][],
  numShades: number,
  shadeOffset: number,
  colorScheme: string,
  size: number,
  canvas: HTMLCanvasElement,
  variation: boolean,
): { audioData: number[][], aMin: number, aMax: number } | undefined {
  console.log('VARIATION', variation);
  let tMax: number = 0, tMin: number = 0, tempArray: number[][] = [];
  for (let iy = 0; iy < size; iy++) {
    const tempRow: number[] = [];
    for (let ix = 0; ix < size; ix++) {
      let t = fractalData[iy][ix];
      t = (t + shadeOffset) % numShades;
      if (t > tMax) tMax = t;
      if (t < tMin) tMin = t;
      tempRow.push(t / (numShades - 1)); // scale to [0, 1] and push
    }
    tempArray.push(tempRow);
  }
  const ctx = canvas.getContext("2d");
  if (ctx !== null) {
    // @ts-ignore
    ctx.reset();
    let aMax: number = 0, aMin: number = 0, audioArray: number[][] = [];
    for (let i = 1; i < size - 1; i++) {
      const audioRow: number[] = [];
      for (let j = 1; j < size - 1; j++) {
        const left = tempArray[i - 1][j];
        const right = tempArray[i + 1][j];
        const above = tempArray[i][j - 1];
        const below = tempArray[i][j + 1];
        const defaultValue: number = variation ? tempArray[i][j] : 1;
        const a = (tempArray[i][j] === left && tempArray[i][j] === right && tempArray[i][j] === above && tempArray[i][j] === below) ? 0 : defaultValue;
        if (colorScheme === "grayscale") {
          const shade = 255 - (a * 255);
          ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
        } else {
          if (a === 0) {
            ctx.fillStyle = "#FFF";
          } else {
            const shade = ((a * 360 / 2) + shadeOffset) * numShades % 360;
            ctx.fillStyle = `hsl(${shade}, 100%, 50%)`;
          }
        }
        if (a > aMax) aMax = a;
        if (a < aMin) aMin = a;
        audioRow.push(a); // scale to [0, 1] and push
        ctx.fillRect(j, i, 1, 1);
      }
      audioArray.push(audioRow);
    }
    return {audioData: audioArray, aMin, aMax};
  }
}

function transformDifference(
  data: { fractalData: number[][], min: number, max: number },
  numShades: number,
  shadeOffset: number,
  colorScheme: string,
  size: number,
  canvas: HTMLCanvasElement,
): { audioData: number[][], aMin: number, aMax: number } | undefined {
  const ctx = canvas.getContext("2d");
  if (ctx !== null) {
    // @ts-ignore
    ctx.reset();
    let a: number = 0, aMax: number = 0, aMin: number = 0, audioArray: number[][] = [];
    for (let iy = 0; iy < size; iy++) {
      const audioRow: number[] = [];
      for (let ix = 0; ix < size; ix++) {
        let a = data.fractalData[iy][ix];
        if (a === 0) {
          ctx.fillStyle = "#000";
        } else {
          a = (a + shadeOffset) % numShades;
          if (colorScheme === "grayscale") {
            const shade = Math.abs((a / numShades) - 0.5) * 2 * 255;
            ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
          } else {
            const shade = (a / (numShades - 1)) * 360;
            ctx.fillStyle = `hsl(${shade}, 100%, 50%)`;
          }
        }
        audioRow.push(a / (numShades - 1)); // scale to [0, 1] and push
      }
      audioArray.push(audioRow);
    }
    return {audioData: audioArray, aMin, aMax};
  }
}

function transformRaw(
  fractalData: number[][],
  min: number,
  max: number,
  colorScheme: string,
  size: number,
  canvas: HTMLCanvasElement,
): { audioData: number[][], aMin: number, aMax: number } | undefined {
  console.log("min ", min, "max ", max);
  const ctx = canvas.getContext("2d");
  if (ctx !== null) {
    // @ts-ignore
    ctx.reset();
    let aMax: number = 0, aMin: number = 0, audioArray: number[][] = [];
    for (let iy = 0; iy < size; iy++) {
      const audioRow: number[] = [];
      for (let ix = 0; ix < size; ix++) {
        let value = fractalData[iy][ix];
        let a = (value - min) / (max - min);
        if (value === 0) {
          ctx.fillStyle = "#000";
        } else {
          if (colorScheme === "grayscale") {
            const shade = (1 - a) * 255;
            ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
          } else {
            const shade = (1 - a) * 360;
            ctx.fillStyle = `hsl(${shade}, 100%, 50%)`;
          }
        }
        if (a > aMax) aMax = a;
        if (a < aMin) aMin = a;
        audioRow.push(a);
        ctx.fillRect(ix, iy, 1, 1);
      }

      audioArray.push(audioRow);
    }
    return {audioData: audioArray, aMin, aMax};
  }
}

function transformDecomp(
  fractalData: number[][],
  pointsData: Point[][],
  min: number,
  max: number,
  colorScheme: string,
  size: number,
  canvas: HTMLCanvasElement,
  coloringAlgorithm: string,
): { audioData: number[][], aMin: number, aMax: number } | undefined {
  console.log("min ", min, "max ", max);
  const ctx = canvas.getContext("2d");
  if (ctx !== null) {
    // @ts-ignore
    ctx.reset();
    let aMax: number = 0, aMin: number = 0, audioArray: number[][] = [];
    for (let iy = 0; iy < size; iy++) {
      const audioRow: number[] = [];
      for (let ix = 0; ix < size; ix++) {
        let a = fractalData[iy][ix];
        let point = pointsData[iy][ix];
        let alpha = Math.atan2(point.y, point.x);
        if (coloringAlgorithm === 'decomp1') {
          if ((alpha >= 0) && (alpha < 2 * Math.PI)) {
            a = 0;
            ctx.fillStyle = "#000"
          } else {
            a = 1;
            ctx.fillStyle = "#fff"
          }
        } else {
          const alpha = Math.atan(Math.abs(point.y))
          if ((alpha > 0) && (alpha <= 1.5)) {
            ctx.fillStyle = '#000'
          } else {
            ctx.fillStyle = '#fff'
          }
        }
        if (a > aMax) aMax = a;
        if (a < aMin) aMin = a;
        audioRow.push(a);
        ctx.fillRect(ix, iy, 1, 1);
      }

      audioArray.push(audioRow);
    }
    return {audioData: audioArray, aMin, aMax};
  }
}

function drawDem(
  value: number,
  delta: number,
  numShades: number,
  shadeOffset: number,
  colorScheme: string,
  ctx: CanvasRenderingContext2D,
): number {
  let a: number = 0;
  if (value < delta) { // we are in the set
    a = 0;
    ctx.fillStyle = "#000"
  } else {
    const areas = 32 - (numShades - 2)
    a = ((value * 16) + (30 - shadeOffset)) % areas;
    if (colorScheme === "grayscale") {
      const shade = Math.abs((a / areas) - 0.5) * 2 * 255;
      ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
    } else {
      const shade = (a / (areas - 1)) * 360;
      ctx.fillStyle = `hsl(${shade}, 100%, 50%)`;
    }
  }
  return a;
}

function drawRaw(
  value: number,
  colorScheme: string,
  ctx: CanvasRenderingContext2D,
): number {
  if (colorScheme === "grayscale") {
    let shade = value * 255;
    ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
  } else {
    let shade = value * 360;
    ctx.fillStyle = `hsl(${shade}, 100%, 50%)`;
  }
  return value;
}

function drawDecomp1(
  iterations: number,
  maxIterations: number,
  colorScheme: string,
  numShades: number,
  point: Point,
  ctx: CanvasRenderingContext2D,
) {
  let a: number = 0;
  if (iterations == maxIterations) { // we are in the set
    ctx.fillStyle = "#000"
  } else {
    // color it depending on the angle of alpha
    if (numShades === 2) {
      const alpha = Math.atan2(point.y, point.x)
      if ((alpha >= 0) && (alpha < 2 * Math.PI)) {
        ctx.fillStyle = "#000";
        a = 0;
      } else {
        ctx.fillStyle = "#fff";
        a = 1;
      }
    } else if (numShades === 3) {
      const alpha = Math.atan2(point.y, point.x) * 180 / Math.PI
      if ((alpha > 0) && (alpha <= 90)) {
        ctx.fillStyle = "#000";
        a = 0;
      } else if ((alpha >= 90) && (alpha < 180)) {
        ctx.fillStyle = "#999";
        a = 0.5;
      } else {
        ctx.fillStyle = "#fff";
        a = 1;
      }
    } else {
      const alpha = Math.atan2(point.y, point.x) * 180 / Math.PI
      if ((alpha > 0) && (alpha <= 45)) {
        ctx.fillStyle = "#000";
        a = 0;
      } else if ((alpha > 45) && (alpha <= 90)) {
        ctx.fillStyle = "#333";
        a = 0.25;
      } else if ((alpha > 90) && (alpha <= 135)) {
        ctx.fillStyle = "#666";
        a = 0.5;
      } else if ((alpha > 135) && (alpha <= 180)) {
        ctx.fillStyle = "#999";
        a = 0.75;
      } else {
        ctx.fillStyle = "#fff";
        a = 1;
      }
    }
  }
  return a;
}

function drawDecomp2(
  iterations: number,
  maxIterations: number,
  colorScheme: string,
  numShades: number,
  point: Point,
  ctx: CanvasRenderingContext2D,
) {
  let a: number = 0;
  if (iterations == maxIterations) { // we are in the set
    ctx.fillStyle = "#000"
  } else {
    // color it depending on the angle of alpha
    if (numShades === 2) {
      const alpha = Math.atan(Math.abs(point.y))
      if ((alpha > 0) && (alpha <= 1.5)) {
        ctx.fillStyle = "#000";
        a = 0;
      } else {
        ctx.fillStyle = "#fff";
        a = 1;
      }
    } else {
      const alpha = Math.atan(Math.abs(point.y));
      const shade = alpha / 2 * 255;
      ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
    }
  }
  return a;
}

function generateLSMModulo(
  iterations: number,
  maxIterations: number,
): number {
  let a: number = 0;
  if (iterations == maxIterations) { // we are in the set
    a = 0;
  } else {
    a = iterations % 2;
  }
  return a;
}

export function drawPlayhead(canvas: HTMLCanvasElement, playheadType: string, position: number) {
  const ctx = canvas.getContext("2d");
  if (ctx !== null) {
    ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
    ctx.fillStyle = "#FF0000";
    ctx.strokeStyle = "#FF0000";
    if (playheadType === 'down' || playheadType === 'up') {
      ctx.fillRect(0, position, ctx.canvas.clientWidth, 1);
    } else if (playheadType === 'right' || playheadType === 'left') {
      ctx.fillRect(position, 0, 1, ctx.canvas.clientHeight);
    } else if (playheadType === 'in' || playheadType === 'out') {
      ctx.beginPath();
      ctx.arc(ctx.canvas.clientWidth / 2, ctx.canvas.clientHeight / 2, position / 2, 0, 2 * Math.PI);
      ctx.stroke();
    } else if (playheadType === 'cw' || playheadType === 'ccw') {
      const radius = ctx.canvas.clientWidth / 2;
      ctx.translate(radius, radius);
      const angle = position * Math.PI / ctx.canvas.clientWidth;
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.moveTo(0, 0);
      ctx.rotate(angle);
      ctx.lineTo(0, -radius);
      ctx.stroke();
      ctx.closePath();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
  }
}

export function clearCanvas(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (ctx !== null) {
    ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
  }
}

export const rotateMatrixCW90 = (matrix: number[][]): number[][] => {
  const width = matrix.length;
  const height = matrix[0].length;
  let temp = new Array(height);
  for (let y = 0; y < height; y++) {
    temp[y] = new Array(width);
    for (let x = 0; x < width; x++) {
      temp[y][x] = matrix[width - 1 - x][y];
    }
  }
  return temp;
}

function generateEscape(
  fractal: string,
  cx: number,
  cy: number,
  size: number,
  fractalWindow: FractalPlane,
  maxIterations: number,
  threshold: number
): { fractalData: number[][], pointsData: Point[][], min: number, max: number } {
  let max: number = 0, min: number = 0, fractalArray: number[][] = [], pointsArray: Point[][] = [];
  const scalingFactor = getScalingFactors(fractalWindow, size);
  for (let iy = 0; iy < size; iy++) {
    const pointsRow: Point[] = [];
    const fractalRow: number[] = [];
    const y = fractalWindow.y_min + iy * scalingFactor.y
    if (fractal === 'mandelbrot') cy = y;
    for (let ix = 0; ix < size; ix++) {
      const x = fractalWindow.x_min + ix * scalingFactor.x;
      if (fractal === 'mandelbrot') cx = x;
      const currentPoint = fractal === 'mandelbrot' ? {
        x: 0.0,
        y: 0.0
      } : {x: x, y: y};
      pointsRow.push(currentPoint);
      let i = computePoint(currentPoint, cx, cy, maxIterations, threshold);
      if (i > max) max = i;
      if (i < min) min = i;
      fractalRow.push(i === maxIterations ? 0 : i);
    }
    pointsArray.push(pointsRow);
    fractalArray.push(fractalRow);
  }
  return {fractalData: fractalArray, pointsData: pointsArray, min: min, max: max};
}

function generateDistance(
  fractal: string,
  cx: number,
  cy: number,
  size: number,
  fractalWindow: FractalPlane,
  maxIterations: number
): { fractalData: number[][], pointsData: Point[][], min: number, max: number } {
  let max: number = 0, min: number = 0, fractalArray: number[][] = [], pointsArray: Point[][] = [];
  const scalingFactor = getScalingFactors(fractalWindow, size);
  const delta = 0.2 * scalingFactor.x;
  for (let iy = 0; iy < size; iy++) {
    const fractalRow: number[] = [];
    const pointsRow: Point[] = [];
    const y = fractalWindow.y_min + iy * scalingFactor.y
    if (fractal === 'mandelbrot') cy = y;
    for (let ix = 0; ix < size; ix++) {
      const x = fractalWindow.x_min + ix * scalingFactor.x;
      if (fractal === 'mandelbrot') cx = x;
      const currentPoint = fractal === 'mandelbrot' ? {
        x: 0.0,
        y: 0.0
      } : {x: x, y: y};
      let i: number;
      pointsRow.push(currentPoint);
      if (fractal === 'mandelbrot') {
        i = computePointDem(currentPoint, cx, cy, maxIterations, 100000000000);
      } else {
        i = computePointJuliaDem(currentPoint, cx, cy, maxIterations);
      }
      if (i > max) max = i;
      if (i < min) min = i;
      fractalRow.push(i < delta ? 0 : i);
    }
    pointsArray.push(pointsRow);
    fractalArray.push(fractalRow);
  }
  return {fractalData: fractalArray, pointsData: pointsArray, min: min, max: max};
}

function generateDecomp1(fractal: string, cx: number, cy: number, size: number, fractalWindow: FractalPlane, maxIterations: number, threshold: number): {
  fractalData: number[][],
  min: number,
  max: number
} {
  let max: number = 0, min: number = 0, fractalYArray: number[][] = [];
  const scalingFactor = getScalingFactors(fractalWindow, size);
  for (let iy = 0; iy < size; iy++) {
    const fractalXArray: number[] = [];
    const y = fractalWindow.y_min + iy * scalingFactor.y
    if (fractal === 'mandelbrot') cy = y;
    for (let ix = 0; ix < size; ix++) {
      const x = fractalWindow.x_min + ix * scalingFactor.x;
      if (fractal === 'mandelbrot') cx = x;
      const currentPoint = fractal === 'mandelbrot' ? {
        x: 0.0,
        y: 0.0
      } : {x: x, y: y};
      let i = computePoint(currentPoint, cx, cy, maxIterations, threshold);
      const alpha = Math.atan2(currentPoint.y, currentPoint.x)
      if (i > max) max = i;
      if (i < min) min = i;
      fractalXArray.push(i === maxIterations ? 0 : alpha);
    }
    fractalYArray.push(fractalXArray);
  }
  return {fractalData: fractalYArray, min: min, max: max};
}

function generateDecomp2(fractal: string, cx: number, cy: number, size: number, fractalWindow: FractalPlane, maxIterations: number, threshold: number): {
  fractalData: number[][],
  min: number,
  max: number
} {
  let max: number = 0, min: number = 0, fractalYArray: number[][] = [];
  const scalingFactor = getScalingFactors(fractalWindow, size);
  for (let iy = 0; iy < size; iy++) {
    const fractalXArray: number[] = [];
    const y = fractalWindow.y_min + iy * scalingFactor.y
    if (fractal === 'mandelbrot') cy = y;
    for (let ix = 0; ix < size; ix++) {
      const x = fractalWindow.x_min + ix * scalingFactor.x;
      if (fractal === 'mandelbrot') cx = x;
      const currentPoint = fractal === 'mandelbrot' ? {
        x: 0.0,
        y: 0.0
      } : {x: x, y: y};
      let i = computePoint(currentPoint, cx, cy, maxIterations, threshold);
      const alpha = Math.atan(Math.abs(currentPoint.y))
      if (i > max) max = i;
      if (i < min) min = i;
      fractalXArray.push(i === maxIterations ? 0 : alpha);
    }
    fractalYArray.push(fractalXArray);
  }
  return {fractalData: fractalYArray, min: min, max: max};
}

export function generateFractal(
  fractal: string,
  canvas: HTMLCanvasElement,
  fractalWindow: FractalPlane,
  size: number,
  plottingAlgorithm: string,
  coloringAlgorithm: string,
  maxIterations: number,
  numShades: number,
  shadeOffset: number,
  colorScheme: string,
  threshold: number,
  cx: number,
  cy: number,
): { fractalData: number[][], audioData: number[][], min: number, max: number, aMin: number, aMax: number } {

  let data: { fractalData: number[][], pointsData: Point[][], min: number, max: number } | undefined = undefined;
  switch (plottingAlgorithm) {
    case 'escape':
      data = generateEscape(fractal, cx, cy, size, fractalWindow, maxIterations, threshold);
      break;
    case 'distance':
      data = generateDistance(fractal, cx, cy, size, fractalWindow, maxIterations);
      break;
  }
  let audioData: { audioData: number[][], aMin: number, aMax: number } | undefined = undefined;
  if (data && data.fractalData !== undefined) {
    const {fractalData, pointsData, min, max} = data ?? undefined;
    switch (coloringAlgorithm) {
      case 'modulo':
        audioData = transformModulo(fractalData, numShades, shadeOffset, colorScheme, size, canvas);
        break;
      case 'outline':
      case 'outlines':
        audioData = transformOutline(fractalData, numShades, shadeOffset, colorScheme, size, canvas, coloringAlgorithm !== 'outline');
        break;
      case 'difference':
        //audioData = transformDifference(fractalData, numShades, shadeOffset, colorScheme, size, canvas);
        break;
      case 'raw':
        audioData = transformRaw(fractalData, min, max, colorScheme, size, canvas);
        break;
      case 'decomp1':
      case 'decomp2':
        audioData = transformDecomp(fractalData, pointsData, min, max, colorScheme, size, canvas, coloringAlgorithm);
        break;
    }
  }
  return {
    ...data ?? {fractalData: [], min: 0, max: 0},
    ...audioData ?? {audioData: [], aMin: 0, aMax: 0}
  };
}

export function scaleFractal(fractalArray: number[][], min: number, max: number): number[][] {
  return fractalArray.map((row) => {
    return row.map((value) => {
      return (value - min) / (max - min);
    })
  });
}

export function createOutlinesMatrix(matrix: number[][], ctx: CanvasRenderingContext2D): number[][] {
  const transformedMatrix = [matrix[0]];
  for (let i = 1; i < matrix.length - 1; i++) {
    const transformedRow = [0];
    for (let j = 1; j < matrix[i].length - 1; j++) {
      const left = matrix[i - 1][j];
      const right = matrix[i + 1][j];
      const above = matrix[i][j - 1];
      const below = matrix[i][j + 1];
      const value = (matrix[i][j] === left && matrix[i][j] === right && matrix[i][j] === above && matrix[i][j] === below) ? 0 : 1;
      transformedRow.push(value);
      ctx.fillStyle = value === 1 ? "#000" : "#fff";
      ctx.fillRect(j, i, 1, 1);
    }
    transformedRow.push(0);
    transformedMatrix.push(transformedRow);
  }
  transformedMatrix.push(matrix[matrix.length - 1]);
  return transformedMatrix;
}

export function createDifferencesMatrix(matrix: number[][], colorScheme: string, ctx: CanvasRenderingContext2D): number[][] {
  const transformedMatrix = [matrix[0]];
  for (let i = 1; i < matrix.length - 1; i++) {
    const transformedRow = [];
    for (let j = 0; j < matrix[i].length; j++) {
      const difference = matrix[i][j] - matrix[i - 1][j];
      const value = parseFloat((Math.sqrt(difference < 0 ? -difference : difference).toString()));
      transformedRow.push(value + 0.001);
      if (colorScheme === "grayscale") {
        let shade = value * 255;
        ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
      } else {
        let shade = value * 360;
        ctx.fillStyle = `hsl(${shade}, 100%, 50%)`;
      }
      ctx.fillRect(j, i, 1, 1);
    }
    transformedMatrix.push(transformedRow);
  }
  transformedMatrix.push(matrix[matrix.length - 1]);
  return transformedMatrix;
}