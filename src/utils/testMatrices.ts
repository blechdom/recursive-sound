import { OptionType } from "@/utils/fractal";

export interface TwoDimensions {
    height: number;
    width: number;
}

export const testOptions: OptionType[] = [
  { value: "ascendingLine", label: "Ascending Line" },
  { value: "descendingLine", label: "Descending Line" },
  { value: "horizonDrawingMode", label: "Horizon Drawing Mode" },
  { value: "firstHalfOn", label: "First Half On" },
  { value: "firstHalfOff", label: "First Half Off" },
  { value: "checkerboard", label: "Checkerboard" },
  { value: "bigX", label: "Big X" },
];

export const defaultMatrix = ({ height, width }: TwoDimensions): number[][] => {
    const matrix = [...Array(height)].map(() => Array(width).fill(0));
    return matrix;
}

export const ascendingLine = ({ height, width }: TwoDimensions): number[][] => {
    const matrix: number[][] = [];
    for (let i = 0; i < height; i++) {
        const row = Array(width).fill(0);
        for (let j = 0; j < width; j++) {
            row[j] = (width-i) === j ? 1 : 0;
        }
        matrix.push(row);
    }
    return matrix;
}


export const descendingLine = ({ height, width }: TwoDimensions): number[][] => {
    const matrix: number[][] = [];
    for (let i = 0; i < height; i++) {
        const row = Array(width).fill(0);
        for (let j = 0; j < width; j++) {
            row[j] = i === j ? 1 : 0;
        }
        matrix.push(row);
    }
    return matrix;
}

export const firstHalfOn = ({ height, width }: TwoDimensions): number[][] => {
    const matrix: number[][] = [];
    for (let i = 0; i < height; i++) {
        const row = [];
        for (let j = 0; j < width; j++) {
            row[j] = i < width/2 ? 1 : 0;
        }
        matrix.push(row);
    }
    return matrix;
}

export const firstHalfOff = ({ height, width }: TwoDimensions): number[][] => {
    const matrix: number[][] = [];
    for (let i = 0; i < height; i++) {
        const row = Array(width).fill(0);
        for (let j = 0; j < width; j++) {
            row[j] = i > width/2 ? 1 : 0;
        }
        matrix.push(row);
    }
    return matrix;
}