import React, {useRef, useEffect} from 'react';
import {MarchingSquares} from '@/utils/MarchingSquares';

type ContourCanvasProps = {
  matrixData: number[] | number[][];
  tolerance: number;
  cx: number;
  cy: number;
}

const ContourCanvas: React.FC<ContourCanvasProps> = ({matrixData, tolerance, cx, cy}) => {
  let canvasRef = useRef<HTMLCanvasElement | null>(null);
  let canvasCtxRef = React.useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      canvasCtxRef.current = canvasRef.current.getContext('2d');
      let ctx = canvasCtxRef.current;
      new MarchingSquares(ctx, {inputValues: matrixData, tolerance, cx, cy});
    }
  }, [tolerance]);

  return <canvas ref={canvasRef} width={matrixData.length} height={matrixData.length}></canvas>;
};

export default ContourCanvas;