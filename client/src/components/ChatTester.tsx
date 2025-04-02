"use client";

import { useState, useEffect } from "react";
import { useSocket } from "@/context/SocketContext";

const ChatTester = () => {
  const { socket, isConnected, joinRoom } = useSocket();
  const [roomId, setRoomId] = useState("test-room");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    if (!socket) return;

    joinRoom(roomId);

    socket.on("chatMessage", (data: any) => {
      setMessages((prev) => [...prev, `${data.id}: ${data.message}`]);
    });

    return () => {
      socket.off("chatMessage");
    };
  }, [socket, joinRoom, roomId]);

  const sendMessage = () => {
    if (socket && message.trim()) {
      socket.emit("chatMessage", { roomId, message });
      setMessage("");
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 border rounded-lg shadow-md bg-white dark:bg-gray-800">
      <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Socket.IO Chat Tester</h2>
      <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
        Status: <span className={isConnected ? "text-green-500" : "text-red-500"}>
          {isConnected ? "Connected" : "Disconnected"}
        </span>
      </p>

      <div className="mb-4">
        <label className=""></label>
      </div>
    </div>
  );
}

export default ChatTester;