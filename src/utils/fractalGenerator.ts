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

function drawLSMBinary(
  iterations: number,
  maxIterations: number,
  ctx: CanvasRenderingContext2D,
): number {
  let a: number = 0;
  if (iterations == maxIterations) { // we are in the set
    a = 0;
    ctx.fillStyle = "#000"
  } else {
    a = iterations % 2;
    ctx.fillStyle = a === 0 ? "#000" : "#FFF";
  }
  return a;
}

function drawLSMRaw(
  iterations: number,
  maxIterations: number,
  ctx: CanvasRenderingContext2D,
): number {
  const value = iterations / maxIterations;
  let shade = value * 255;
  ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
  return value;
}

function generateLSMBinary(
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

export function generateFractal(
  fractal: string,
  canvas: HTMLCanvasElement,
  fractalWindow: FractalPlane,
  size: number,
  program: string,
  maxIterations: number,
  threshold: number,
  cx: number,
  cy: number,
): { fractalData: number[][], audioData: number[][], min: number, max: number, aMin: number, aMax: number } {
  const ctx = canvas.getContext("2d");
  let min = 0, max = 0, aMin = 0, aMax = 0;
  if (ctx !== null) {
    // @ts-ignore
    ctx.reset();
    const scalingFactor = getScalingFactors(fractalWindow, size);
    const fractalYArray: number[][] = [];
    const audioYArray: number[][] = [];
    for (let iy = 0; iy < size; iy++) {
      const y = fractalWindow.y_min + iy * scalingFactor.y
      if (fractal === 'mandelbrot') cy = y;
      const fractalXArray = [];
      const audioXArray = [];
      for (let ix = 0; ix < size; ix++) {
        const x = fractalWindow.x_min + ix * scalingFactor.x;
        if (fractal === 'mandelbrot') cx = x;
        const currentPoint = fractal === 'mandelbrot' ? {
          x: 0.0,
          y: 0.0
        } : {x: x, y: y};
        let i = 0;
        let a = 0;
        i = computePoint(currentPoint, cx, cy, maxIterations, threshold);
        if (program === 'lsm-raw') {
          a = parseFloat(String((drawLSMRaw(i, maxIterations, ctx) + 0.001)).toString());
        } else if (program === 'lsm-binary') {
          a = drawLSMBinary(i, maxIterations, ctx);
        } else if (program === 'lsm-outline') {
          a = generateLSMBinary(i, maxIterations);
        } else if (program === 'lsm-difference') {
          a = i / maxIterations;
        }
        if (i > max) max = i;
        if (i < min) min = i;
        fractalXArray.push(i);
        ctx.fillRect(ix, iy, 1, 1);

        if (a > aMax) aMax = a;
        if (a < aMin) aMin = a;
        audioXArray.push(a);
        ctx.fillRect(ix, iy, 1, 1);
      }
      fractalYArray.push(fractalXArray);
      audioYArray.push(audioXArray);
    }
    let audioData: number[][] = audioYArray;
    if (program === 'lsm-outline') {
      audioData = createOutlinesMatrix(audioYArray, ctx);
    }
    if (program === 'lsm-difference') {
      audioData = createDifferencesMatrix(audioYArray, ctx);
    }
    return {
      fractalData: fractalYArray,
      audioData,
      min,
      max,
      aMin,
      aMax
    };
  }
  return {
    fractalData: [],
    audioData: [],
    min: 0,
    max: 0,
    aMin: 0,
    aMax: 0,
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

export function createDifferencesMatrix(matrix: number[][], ctx: CanvasRenderingContext2D): number[][] {
  const transformedMatrix = [matrix[0]];
  for (let i = 1; i < matrix.length - 1; i++) {
    const transformedRow = [];
    for (let j = 0; j < matrix[i].length; j++) {
      const difference = matrix[i][j] - matrix[i - 1][j];
      const value = parseFloat((Math.sqrt(difference < 0 ? -difference : difference).toString()));
      transformedRow.push(value + 0.001);
      ctx.fillStyle = `rgb(${value * 255}, ${value * 255}, ${value * 255})`
      ctx.fillRect(j, i, 1, 1);
    }
    transformedMatrix.push(transformedRow);
  }
  transformedMatrix.push(matrix[matrix.length - 1]);
  return transformedMatrix;
}