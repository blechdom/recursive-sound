import {DataOptionType} from "@/utils/matrixGenerator";
import {rotateCw90} from "./matrixTransformer";

export interface InterpretationMatrix {
  matrix: number[][];
  interpretation: string;
  options?: {}
}

export const interpretations: DataOptionType[] = [
  {value: "none", label: "none"},
  {value: "averageRows", label: "1D: Average Rows"},
  {value: "averageColumns", label: "1D: Average Columns"},
  {value: "sumRows", label: "1D: Sum Rows Mod(1)"},
  {value: "sumColumns", label: "1D: Sum Columns Mod(1)"},
  {value: "twoDimensions", label: "2D to 2D"},
  {value: "otherDimensions", label: "2D to ND"},
];

export const interpretMatrix = ({interpretation, matrix, options}: InterpretationMatrix): number[] | number[][] => {
  switch (interpretation) {
    case 'none':
      return matrix;
    case 'averageRows':
      return averageRows(matrix);
    case 'averageColumns':
      return averageColumns(matrix);
    case 'sumRows':
      return averageRows(matrix);
    case 'sumColumns':
      return averageColumns(matrix);
    default:
      return matrix;
  }
}

const averageRows = (matrix: number[][]): number[] => {
  return matrix.map((row) => row.reduce((a, b) => a + b, 0) / row.length);
}

const averageColumns = (matrix: number[][]): number[] => {
  const rotatedMatrix = rotateCw90(matrix);
  return rotatedMatrix.map((row) => row.reduce((a, b) => a + b, 0) / row.length);
}

const sumRows = (matrix: number[][]): number[] => {
  return matrix.map((row) => row.reduce((a, b) => a + b, 0) % 1);
}

const sumColumns = (matrix: number[][]): number[] => {
  const rotatedMatrix = rotateCw90(matrix);
  return rotatedMatrix.map((row) => row.reduce((a, b) => a + b, 0) % 1);
}