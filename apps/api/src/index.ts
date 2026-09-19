import { createServer } from "node:http";
import { createApp } from "./app";
import { createRealtimeServer } from "./realtime";
import { seed } from "./data/seed";
import { env } from "./env";

seed();

const app = createApp();
const httpServer = createServer(app);
createRealtimeServer(httpServer);

httpServer.listen(env.port, () => {
  console.log(`ontime.ge API listening on http://127.0.0.1:${env.port}`);
  console.log(`  REST:      http://127.0.0.1:${env.port}/v1`);
  console.log(`  Health:    http://127.0.0.1:${env.port}/health`);
  console.log(`  Socket.IO: ws://127.0.0.1:${env.port}/socket.io`);
});
