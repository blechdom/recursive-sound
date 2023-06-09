import {Socket} from "socket.io";
import {Client, Server} from 'node-osc';

export default (io: any, socket: Socket, oscClient: Client, oscServer: Server) => {

  oscServer.on('/recursive-sound', function (msg) {
    console.log(`OSC message received: ${msg}`);
    //oscServer.close();
  });

  const sendMandelbrotToKyma = (fractalRow: number[]) => {
    if(oscClient) {
      console.log("sending fractal/mandelbrot row");
      const sliced: number[] = fractalRow.slice(0, 255);
      // @ts-ignore
      oscClient.send('/fractal/mandelbrot', sliced);
    }
  };
  const sendJuliaToKyma = (fractalRow: number[]) => {
    if(oscClient) {
      //console.log("sending fractal/julia row");
      const sliced: number[] = fractalRow.slice(0, 255);
      // @ts-ignore
      //oscClient.send('/fractal/julia', sliced);
    }
  };

  const sendVolume = (volumeAmount: number) => {
    if(oscClient) {
      console.log("/fractal/volume", volumeAmount);
      // @ts-ignore
      oscClient.send("/fractal/volume", volumeAmount);
    }
  };

  socket.on("fractalMandelbrotRow", sendMandelbrotToKyma)
  socket.on("fractalJuliaRow", sendJuliaToKyma)
  socket.on("volume", sendVolume);

};