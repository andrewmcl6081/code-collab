const express = require("express");
const { WebSocketServer } = require("ws");
const { setupWSConnection } = require("y-websocket/bin/utils");
const cors = require("cors");

const app = express();
const PORT = 4000;

app.use(cors());

const wss = new WebSocketServer({ noServer: true });

const server = app.listen(PORT, () => {
  console.log(`WebSocket Server running on port ${PORT}`);
});

server.on("upgrade", (req, socket, head) => {
  if (req.url.startsWith("/yjs")) {
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  } else {
    socket.destroy();
  }
});

// Handle new WebSocket connection
wss.on("connection", (ws, req) => {
  console.log("New Y.js WebSocket connection established");
  setupWSConnection(ws, req);
});