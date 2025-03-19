const { Server } = require("socket.io");

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

      io.to(data.roomId).emit("chatMessage", {
        id: socket.id,
        message: data.message,
        timestamp: new Date()
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