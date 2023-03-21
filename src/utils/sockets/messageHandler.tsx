import {Socket} from "socket.io";
import {Client, Server} from 'node-osc';


export default (io: any, socket: Socket, oscClient: Client, oscServer: Server) => {

  oscServer.on('/recursive-sound', function (msg) {
    console.log(`OSC message received: ${msg}`);
    //oscServer.close();
  });

  const createdMessage = (msg: { author: string, message: string}) => {
    socket.broadcast.emit("newIncomingMessage", msg);
    console.log("socket received: ", msg);
    sendOscMessage(oscClient, parseFloat(msg.message));
  };

  const sendOscMessage = (oscClient: Client, msg: number) => {
    if(oscClient){
      console.log('/fractal/float', msg);
      // @ts-ignore
      oscClient.send('/fractal/float', msg, () => {
      });
    }
  };

  const sendMandelbrotToKyma = (fractalString: Array<Array<number>>) => {
    if(oscClient) {
      console.log('sending mandelbrot to Kyma', fractalString);
      // @ts-ignore
      oscClient.send('/fractal/mandelbrot', fractalString, () => {
      });
    }
  };
  const sendJuliaToKyma = (fractalString: Array<Array<number>>) => {
    if(oscClient) {
      console.log('sending julia to Kyma', fractalString);
      // @ts-ignore
      oscClient.send('/fractal/julia', fractalString, () => {
      });
    }
  };

  socket.on("createdMessage", createdMessage);
  socket.on("fractalMandelbrotString", sendMandelbrotToKyma)
  socket.on("fractalJuliaString", sendJuliaToKyma)

};