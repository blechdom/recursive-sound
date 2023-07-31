import {Server, Socket} from "socket.io";
import messageHandler from "./utils/messageHandler";
import {Client as OSCClient, Server as OSCServer} from "node-osc";

export default function SocketHandler(req: any, res: any) {
  if (res.socket.server.io) {
    console.log("Already set up");
    res.end();
    return;
  }

  const io = new Server(res.socket.server);
  res.socket.server.io = io;

  let oscClient: OSCClient;
  try {
    //oscClient= new OSCClient('pacamara-1111.local', 8000)
    oscClient = new OSCClient('127.0.0.1', 9000);
  } catch (e) {
    console.log(e)
  }

  const oscServer: OSCServer = new OSCServer(9999, '0.0.0.0', () => {
    console.log('OSC Server is listening on port 0.0.0.0:9999');
  });

  const onConnection = (socket: Socket) => {
    messageHandler(io, socket, oscClient, oscServer);
  };

  io.on("connection", onConnection);

  console.log("Setting up socket");
  res.end();
}