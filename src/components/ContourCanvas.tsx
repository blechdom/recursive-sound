import React, {useRef, useEffect} from 'react';
import {MarchingSquares} from '@/utils/MarchingSquares';

type ContourCanvasProps = {
  matrixData: number[] | number[][];
}


const ContourCanvas: React.FC<ContourCanvasProps> = ({matrixData}) => {
  let canvasRef = useRef<HTMLCanvasElement | null>(null);
  let canvasCtxRef = React.useRef<CanvasRenderingContext2D | null>(null);

  console.log("in contourData ", matrixData);

  useEffect(() => {
    // Initialize
    if (canvasRef.current) {
      canvasCtxRef.current = canvasRef.current.getContext('2d');
      let ctx = canvasCtxRef.current;
      new MarchingSquares(ctx, {inputValues: matrixData});
    }
  }, []);

  return <canvas ref={canvasRef} width={1200} height={1200}></canvas>;
};

export default ContourCanvas;