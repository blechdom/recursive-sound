import {DataOptionType} from "@/utils/matrixGenerator";

export interface TransformMatrix {
  matrix: number[][];
  transform: string;
  options?: {}
}

export const transforms: DataOptionType[] = [
  {value: "none", label: "None"},
  {value: "invert", label: "Invert"},
  {value: "flipX", label: "Flip X"},
  {value: "flipY", label: "Flip Y"},
  {value: "rotate180", label: "Rotate 180"},
  {value: "rotateCw90", label: "Rotate CW 90"},
  {value: "log", label: "Log-ish (1 - 1/(1+x)) * 2"},
  {value: "exponent", label: "Exponent"},
  {value: "modulo", label: "Modulo(%) 0.25"},
];

export const transformMatrix = ({transform, matrix, options}: TransformMatrix): number[][] => {
  switch (transform) {
    case 'none':
      return matrix;
    case 'invert':
      return invert(matrix);
    case 'scale':
      return invert(matrix);
    case 'rotate':
      return invert(matrix);
    case 'flipX':
      return flipX(matrix);
    case 'flipY':
      return flipY(matrix);
    case 'rotate180':
      return rotate180(matrix);
    case 'rotateCw90':
      return rotateCw90(matrix);
    case 'log':
      return log(matrix);
    case 'exponent':
      return exponent(matrix);
    case 'modulo':
      return modulo(matrix, 0.25);
    default:
      return matrix;
  }
}

const invert = (matrix: number[][]): number[][] => {
  return matrix.map((row) => row.map((point) => 1 - point));
}

const flipX = (matrix: number[][]): number[][] => {
  return matrix.map((row) => row.reverse());
}

const flipY = (matrix: number[][]): number[][] => {
  return matrix.map(row => row).reverse()
}

const rotate180 = (matrix: number[][]): number[][] => {
  return flipX(flipY(matrix));
}

const modulo = (matrix: number[][], modNum: number): number[][] => {
  return matrix.map(row => row.map(point => (point % modNum) * 1 / modNum));
}

const log = (matrix: number[][]): number[][] => {
  return matrix.map(row => row.map(point => (1 - 1 / (1 + point)) * 2));
}

const exponent = (matrix: number[][]): number[][] => {
  return matrix.map(row => row.map(point => (point * point)));
}

export const rotateCw90 = (matrix: number[][]): number[][] => {
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