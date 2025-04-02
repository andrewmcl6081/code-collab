const { WebSocketServer } = require("ws");
const { setupWSConnection } = require("y-websocket/bin/utils");
const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");

const client = jwksClient({
  jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, key.getPublicKey());
    }
  });
}

function setupYjsServer(server) {
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (req, socket, head) => {
    if (req.url.startsWith("/yjs")) {
      // Extract Bearer token from Authorization header
      const authHeader = req.headers["authorization"];
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
        socket.destroy();
        return;
      }

      const token = authHeader.split(" ")[1];

      jwt.verify(token, getKey, {
        audience: process.env.AUTH0_AUDIENCE,
        issuer: `https://${process.env.AUTH0_DOMAIN}/`,
        algorithms: ["RS256"],
      }, (err, decoded) => {
        if (err) {
          console.error("Yjs auth failed:", err.message);
          socket.write("HTTP/1.1 403 Forbidden\r\n\r\n");
          socket.destroy();
        } else {
          console.log("Yjs auth success:", decoded.sub);
          wss.handleUpgrade(req, socket, head, (ws) => {
            ws.user = decoded;
            wss.emit("connection", ws, req);
          });
        }
      });
    }
  });

  wss.on("connection", (ws, req) => {
    setupWSConnection(ws, req);
  });

  return wss;
}

module.exports = setupYjsServer;