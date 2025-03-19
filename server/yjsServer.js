const { WebSocketServer } = require("ws");
const { setupWSConnection } = require("y-websocket/bin/utils");

/**
 * Sets up the Y.js WebSocket server
 * @param {http.Server} server - HTTP server instance
 */
function setupYjsServer(server) {
  // Create WebSocket server for Y.js
  const wss = new WebSocketServer({ noServer: true });

  // Handle new Y.js WebSocket connections
  wss.on("connection", (ws, req) => {
    console.log("New Y.js WebSocket connection established");
    setupWSConnection(ws, req);
  });

  server.on("upgrade", (req, socket, head) => {
    if (req.url.startsWith("/yjs")) {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit("connection", ws, req);
      });
    }
  });

  return wss;
}

module.exports = setupYjsServer;