import {Socket} from "socket.io";
import {Client, Server} from 'node-osc';


export default (io: any, socket: Socket, oscClient: Client, oscServer: Server) => {

  oscServer.on('/pitft', function (msg) {
    console.log(`OSC message received: ${msg}`);
    //oscServer.close();
  });

  const createdMessage = (msg: string) => {
    socket.broadcast.emit("newIncomingMessage", msg);
    console.log("socket received: ", msg);
    sendOscMessage(oscClient, msg);
  };

  const sendOscMessage = (oscClient: Client, msg: string) => {
    if(oscClient){
      console.log('oscClient', oscClient);
      console.log('msg', msg);

      // @ts-ignore
      oscClient.send('/pitft/sine', '123 44', () => {
        //oscClient.close();
      });
    }
  };

  socket.on("createdMessage", createdMessage);

};