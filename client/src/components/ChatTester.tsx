"use client";

import { useState, useEffect } from "react";
import { useSocket } from "@/context/SocketContext";
import type { ChatMessage } from "@/types/chat";

const ChatTester = () => {
  const { socket, isConnected, joinRoom } = useSocket();
  const [roomId, setRoomId] = useState("test-room");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (!socket) return;

    joinRoom(roomId);

    socket.on("chatMessage", (data: ChatMessage) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off("chatMessage");
    };
  }, [socket, roomId, joinRoom]);

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
        <label className="text-sm text-gray-700 dark:text-gray-300 mr-2">Room:</label>
        <input
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="px-2 py-1 border rounded w-full mt-1"
        />
      </div>

      <div className="flex gap-2 mb-4">
        <input
          placeholder="Your message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 px-2 py-1 border rounded"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition"
        >
          Send
        </button>
      </div>

      <ul className="space-y-1 text-sm text-gray-800 dark:text-gray-200 max-h-60 overflow-y-auto">
        {messages.map((msg, i) => (
          <li key={i} className="border-b pb-1">
            <span className="font-semibold">{msg.displayName}</span>: {msg.message}
            <br />
            <span className="text-xs text-gray-500">{new Date(msg.timestamp).toLocaleTimeString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatTester;