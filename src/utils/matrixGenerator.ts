export interface TwoDimensions {
  height: number;
  width: number;
}

export interface GeneratePattern extends TwoDimensions {
  pattern: string;
}

export type DataOptionType = {
  value: string;
  label: string;
  options?: {}
}

export const dimensionsList: DataOptionType[] = [
  {value: "oneDimension", label: "1D"},
  {value: "twoDimensions", label: "2D"},
  {value: "threeDimensions", label: "3D"},
];

export const patterns1D: DataOptionType[] = [
  {value: "ascendingLine", label: "Ascending Line"},
  {value: "descendingLine", label: "Descending Line"},
  {value: "randomWalkX", label: "Random Walk X"},
  {value: "randomX", label: "Random X"},
  {value: "firstHalfOn", label: "First Half On"},
  {value: "firstHalfOff", label: "First Half Off"},
  {value: "verticalStripes", label: "Vertical Stripes"},
  {value: "horizontalGradient", label: "Horizontal Gradient"},
];

export const patterns2D: DataOptionType[] = [
  {value: "bigX", label: "Big X"},
  {value: "randomGrays", label: "Random Grays"},
  {value: "randomWalkY", label: "Random Walk Y"},
  {value: "randomY", label: "Random Y"},
  {value: "firstHalfOn", label: "First Half On"},
  {value: "firstHalfOff", label: "First Half Off"},
  {value: "topOn", label: "Top On"},
  {value: "bottomOn", label: "Bottom On"},
  {value: "horizontalStripes", label: "Horizontal Stripes"},
  {value: "verticalStripes", label: "Vertical Stripes"},
  {value: "checkerboard", label: "Checkerboard"},
  {value: "horizontalGradient", label: "Horizontal Gradient"},
  {value: "horizonDrawingMode", label: "Horizon Drawing Mode"},
];

export const patterns3D: DataOptionType[] = [
  {value: "zoomIn", label: "Zoom In"},
  {value: "zoomOut", label: "Zoom Out"},
];

export const generatePattern = ({pattern, height, width}: GeneratePattern): number[][] => {
  switch (pattern) {
    case 'ascendingLine':
      return ascendingLine({height, width});
    case 'descendingLine':
      return descendingLine({height, width});
    case 'bigX':
      return bigX({height, width});
    case 'firstHalfOn':
      return firstHalfOn({height, width});
    case 'firstHalfOff':
      return firstHalfOff({height, width});
    case 'topOn':
      return topOn({height, width});
    case 'bottomOn':
      return bottomOn({height, width});
    case 'horizontalStripes':
      return horizontalStripes({height, width});
    case 'verticalStripes':
      return verticalStripes({height, width});
    case 'checkerboard':
      return checkerboard({height, width});
    case 'randomGrays':
      return randomGrays({height, width});
    case 'randomWalkX':
      return randomWalkX({height, width});
    case 'randomWalkY':
      return randomWalkY({height, width});
    case 'randomX':
      return randomX({height, width});
    case 'randomY':
      return randomY({height, width});
    case 'horizontalGradient':
      return horizontalGradient({height, width});
    default:
      return defaultMatrix({height, width});
  }
}

const defaultMatrix = ({height, width}: TwoDimensions): number[][] => {
  return [...Array(height)].map(() => Array(width).fill(0));
}

const ascendingLine = ({height, width}: TwoDimensions): number[][] => {
  const matrix: number[][] = [];
  for (let i = 0; i < height; i++) {
    matrix[i] = [];
    for (let j = 0; j < width; j++) {
      matrix[i][j] = (width - i - 1) === j ? 1 : 0;
    }
  }
  return matrix;
}

const descendingLine = ({height, width}: TwoDimensions): number[][] => {
  const matrix: number[][] = [];
  for (let i = 0; i < height; i++) {
    matrix[i] = [];
    for (let j = 0; j < width; j++) {
      matrix[i][j] = i === j ? 1 : 0;
    }
  }
  return matrix;
}

const bigX = ({height, width}: TwoDimensions): number[][] => {
  const matrix: number[][] = [];
  for (let i = 0; i < height; i++) {
    matrix[i] = [];
    for (let j = 0; j < width; j++) {
      matrix[i][j] = ((width - i) === j || i === j) ? 1 : 0;
    }
  }
  return matrix;
}

const firstHalfOn = ({height, width}: TwoDimensions): number[][] => {
  const matrix: number[][] = [];
  for (let i = 0; i < height; i++) {
    matrix[i] = [];
    for (let j = 0; j < width; j++) {
      matrix[i][j] = j < width / 2 ? 1 : 0;
    }
  }
  return matrix;
}

const firstHalfOff = ({height, width}: TwoDimensions): number[][] => {
  const matrix: number[][] = [];
  for (let i = 0; i < height; i++) {
    matrix[i] = [];
    for (let j = 0; j < width; j++) {
      matrix[i][j] = j > width / 2 ? 1 : 0;
    }
  }
  return matrix;
}

const topOn = ({height, width}: TwoDimensions): number[][] => {
  const matrix: number[][] = [];
  for (let i = 0; i < height; i++) {
    matrix[i] = [];
    for (let j = 0; j < width; j++) {
      matrix[i][j] = i < width / 2 ? 1 : 0;
    }
  }
  return matrix;
}

const bottomOn = ({height, width}: TwoDimensions): number[][] => {
  const matrix: number[][] = [];
  for (let i = 0; i < height; i++) {
    matrix[i] = [];
    for (let j = 0; j < width; j++) {
      matrix[i][j] = i > width / 2 ? 1 : 0;
    }
  }
  return matrix;
}
const horizontalStripes = ({height, width}: TwoDimensions): number[][] => {
  const matrix: number[][] = [];
  for (let i = 0; i < height; i++) {
    matrix[i] = [];
    for (let j = 0; j < width; j++) {
      matrix[i][j] = Math.floor(i * 8 / width) % 2;
    }
  }
  return matrix;
}

const verticalStripes = ({height, width}: TwoDimensions): number[][] => {
  const matrix: number[][] = [];
  for (let i = 0; i < height; i++) {
    matrix[i] = [];
    for (let j = 0; j < width; j++) {
      matrix[i][j] = Math.floor(j * 8 / height) % 2;
    }
  }
  return matrix;
}

const checkerboard = ({height, width}: TwoDimensions): number[][] => {
  const matrix: number[][] = [];
  for (let i = 0; i < height; i++) {
    matrix[i] = [];
    for (let j = 0; j < width; j++) {
      const vert = Math.floor(j * 8 / height) % 2;
      const horiz = Math.floor(i * 8 / width) % 2;
      matrix[i][j] = (vert + horiz) % 2;
    }
  }
  return matrix;
}

const randomGrays = ({height, width}: TwoDimensions): number[][] => {
  const matrix: number[][] = [];
  for (let i = 0; i < height; i++) {
    matrix[i] = [];
    for (let j = 0; j < width; j++) {
      matrix[i][j] = Math.random();
    }
  }
  return matrix;
}

const randomWalkX = ({height, width}: TwoDimensions): number[][] => {
  const matrix: number[][] = defaultMatrix({height, width});
  let point = height / 2;
  for (let i = 0; i < width; i++) {
    matrix[point][i] = 1;
    point += Math.random() > 0.5 ? 1 : -1;
    if (point < 0) point = 0;
    if (point > height) point = height;
  }
  return matrix;
}

const randomX = ({height, width}: TwoDimensions): number[][] => {
  const matrix: number[][] = defaultMatrix({height, width});
  for (let i = 0; i < width; i++) {
    const point = Math.floor(Math.random() * height);
    matrix[point][i] = 1;
  }
  return matrix;
}

const randomWalkY = ({height, width}: TwoDimensions): number[][] => {
  const matrix: number[][] = defaultMatrix({height, width});
  let point = width / 2;
  for (let i = 0; i < height; i++) {
    matrix[i][point] = 1;
    point += Math.random() > 0.5 ? 1 : -1;
    if (point < 0) point = 0;
    if (point > width) point = width;
  }
  return matrix;
}

const randomY = ({height, width}: TwoDimensions): number[][] => {
  const matrix: number[][] = defaultMatrix({height, width});
  for (let i = 0; i < height; i++) {
    const point = Math.floor(Math.random() * width);
    matrix[i][point] = 1;
  }
  return matrix;
}

const horizontalGradient = ({height, width}: TwoDimensions): number[][] => {
  const matrix: number[][] = [];
  for (let i = 0; i < height; i++) {
    matrix[i] = [];
    for (let j = 0; j < width; j++) {
      matrix[i][j] = j / width;
    }
  }
  return matrix;
}

const verticalGradient = ({height, width}: TwoDimensions): number[][] => {
  return [...Array(height)].map((_, index) => Array(width).fill(index / height));
}