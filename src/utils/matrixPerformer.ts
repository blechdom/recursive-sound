import {DataOptionType} from "@/utils/matrixGenerator";

export interface PerformMatrix {
  matrix: number[] | number[][];
  performanceType: string;
  uiOptions?: {}
}

export const performanceTypes: DataOptionType[] = [
  {value: "WebAudio", label: "WebAudio"},
  {value: "WebMIDI", label: "WebMIDI"},
  {value: "OSC", label: "OSC"},
];

export const mappings1D: DataOptionType[] = [
  {value: "frequency1D", label: "Array to Frequency"},
  {value: "amplitude1D", label: "Array of Amplitudes"},
  {value: "timeDelay1D", label: "Array to Time Delay"},
  {value: "filter1D", label: "Array to Filter"},
];

export const mappings2D: DataOptionType[] = [
  {value: "oscBankAmplitudes", label: "Oscillator Bank of Frequencies, Array to amplitudes"},
  {value: "waveshapes", label: "Array defines Waveshape, Oscillate waveshape"},
  {value: "oscBankFrequencies", label: "Oscillator Bank of equal Amplitudes, Array to frequencies"},
  {value: "oscBankTimeDelays", label: "Oscillator Bank of Frequencies, Array to Time Delays"},
];

export const playMethods2D: DataOptionType[] = [
  {value: "rows", label: "Play By Row"},
  {value: "columns", label: "Play By Column"},
  {value: "insideOut", label: "Play from Inside Out"},
  {value: "outsideIn", label: "Play from Outside In"},
];

export const performMatrix = ({performanceType, matrix, uiOptions}: PerformMatrix): any => {
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