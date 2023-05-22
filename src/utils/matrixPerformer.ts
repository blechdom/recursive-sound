import { DataOptionType } from "@/utils/matrixGenerator";

export interface PerformMatrix {
  matrix: number[][];
  performanceType: string;
  uiOptions?: {
  }
}

export const performanceTypes: DataOptionType[] = [
  { value: "OSC", label: "OSC" },
  { value: "WebMIDI", label: "WebMIDI" },
  { value: "WebAudio", label: "WebAudio" },
];

export const playMethods: DataOptionType[] = [
  { value: "rows", label: "Play By Row" },
  { value: "columns", label: "Play By Column" },
  { value: "insideOut", label: "Play from Inside Out" },
  { value: "outsideIn", label: "Play from Outside In" },
];

export const performMatrix = ({ performanceType, matrix, uiOptions }: PerformMatrix): number[][] => {
  switch (performanceType) {
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