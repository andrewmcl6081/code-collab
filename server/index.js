require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const setupYjsServer = require("./yjsServer");
const setupSocketIO = require("./socketServer");

const app = express();
const PORT = process.env.PORT || 4000

// Configure Express
app.use(cors());
app.use(express.json());

// Create the HTTP server
const server = http.createServer(app);

// Setup Y.js Websocket connections
setupYjsServer(server);

// Setup Socket.io for chat
setupSocketIO(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`- Y.js WebSocket endpoint: ws://localhost:${PORT}/yjs`);
  console.log(`- Socket.io endpoint http://localhost:${PORT}`);
});