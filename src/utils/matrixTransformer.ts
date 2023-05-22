import { DataOptionType } from "@/utils/matrixPatternGenerator";

export interface TransformMatrix {
  matrix: number[][];
  transform: string;
  options?: {

  }
}

export const transforms: DataOptionType[] = [
  { value: "invert", label: "Invert" },
  { value: "scale", label: "Scale" },
  { value: "rotate", label: "Rotate" },
  { value: "flipX", label: "Flip X" },
  { value: "flipY", label: "Flip Y" },
  { value: "rotate180", label: "Rotate 180" },
  { value: "translate", label: "Translate" },
  { value: "compose", label: "Compose" },
  { value: "applyToPoint", label: "Apply to Point" },
];

export const transformMatrix = ({ transform, matrix, options }: TransformMatrix): number[][] => {
  switch (transform) {
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
 return  matrix.map(row=>row).reverse()
}

const rotate180 = (matrix: number[][]): number[][] => {
  return flipX(flipY(matrix));
}