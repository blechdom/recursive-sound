import { Server, Socket} from "socket.io";
import messageHandler from "../../utils/sockets/messageHandler";
import {Client as OSCClient, Server as OSCServer} from "node-osc";

export default function SocketHandler(req: any, res: any) {
  // It means that socket server was already initialised
  if (res.socket.server.io) {
    console.log("Already set up");
    res.end();
    return;
  }

  const io = new Server(res.socket.server);
  res.socket.server.io = io;

  const oscClient: OSCClient = new OSCClient('pacamara-1111.local', 8000);

  const oscServer: OSCServer = new OSCServer(9000, '0.0.0.0', () => {
    console.log('OSC Server is listening on port 0.0.0.0:9000');
  });

  const onConnection = (socket: Socket) => {
    messageHandler(io, socket, oscClient, oscServer);
  };

  // Define actions inside
  io.on("connection", onConnection);

  console.log("Setting up socket");
  res.end();
}