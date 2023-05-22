import { DataOptionType } from "@/utils/matrixGenerator";

export interface InterpretationMatrix {
  matrix: number[][];
  interpretation: string;
  options?: {

  }
}

export const interpretations: DataOptionType[] = [
  { value: "1:1", label: "1:1" },
  { value: "expand", label: "Expand" },
  { value: "interpolate", label: "Interpolate" },
  { value: "truncate", label: "Truncate" },
  { value: "squish", label: "Squish" },
  { value: "log", label: "Log" },
  { value: "convert", label: "Convert" },
  { value: "addBoundaries", label: "Add Boundaries" },
];

export const interpretMatrix = ({ interpretation, matrix, options }: InterpretationMatrix): number[][] => {
  switch (interpretation) {
    case '1:1':
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