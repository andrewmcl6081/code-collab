const { Server } = require("socket.io");
const authenticateSocket = require("./authMiddleware");

/**
 * Sets up the Socket.io server for chat functionality
 * @param {http.server} server - HTTP server instance
 */
function setupSocketIO(server) {
  // Create Socket.io server
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Use auth middleware
  io.use(authenticateSocket);

  // Handle Socket.io connections
  io.on("connection", (socket) => {
    console.log("New Socket.io connection established");

    // Join a room
    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
      console.log(`User joined room: ${roomId}`);

      // Notify others in the room
      socket.to(roomId).emit("userJoined", { id: socket.id });
    });

    // Handle chat messages
    socket.on("chatMessage", (data) => {
      console.log(`Message in room ${data.roomId}: ${data.message}`);
      const { roomId, message } = data;
      const senderId = socket.user?.sub;
      const displayName = socket.user?.name || socket.user?.email;
      const timestamp = new Date().toISOString();

      io.to(roomId).emit("chatMessage", {
        roomId,
        message,
        senderId,
        displayName,
        timestamp
      });
    });

    // Handle disconnects
    socket.on("disconnect", () => {
      console.log("User disconnected from chat");
    });
  });

  return io;
}

module.exports = setupSocketIO;