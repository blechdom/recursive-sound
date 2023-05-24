import { DataOptionType } from "@/utils/matrixGenerator";

export interface PerformMatrix {
  matrix: number[] | number[][];
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

export const performMatrix = ({ performanceType, matrix, uiOptions }: PerformMatrix): any => {
  switch (performanceType) {
    case 'none':
      return matrix;
    case 'invert':
      return invert(matrix);
    case 'scale':
      return invert(matrix);
    case 'rotate':
      return invert(matrix);
    default:
      return matrix;
  }
}

const invert = (matrix: number[] | number[][]): number[] | number[][] => {
  return matrix;
}