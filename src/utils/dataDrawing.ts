export const draw2DMatrix = (matrixData: number[][], ctx: CanvasRenderingContext2D): void => {
  for (let y = 0; y < matrixData.length; y++) {
    for (let x = 0; x < matrixData[0].length; x++) {
      const colorValue = (1 - matrixData[y][x]) * 255;
      ctx.fillStyle = `rgb(${colorValue}, ${colorValue}, ${colorValue})`;
      ctx.fillRect(x, y, 1, 1)
    }
  }
}

export const drawArrayAs2DMatrix = (matrixData: number[], ctx: CanvasRenderingContext2D): void => {
  for (let y = 0; y < matrixData.length; y++) {
    for (let x = 0; x < matrixData.length; x++) {
      const black = `rgb(255, 255, 255)`;
      const white = `rgb(0, 0, 0)`;
      const scaledVal = Math.floor(matrixData[x] as number * matrixData.length);
      ctx.fillStyle = (y === scaledVal) ? white : black;
      ctx.fillRect(x, y, 1, 1)
    }
  }
}