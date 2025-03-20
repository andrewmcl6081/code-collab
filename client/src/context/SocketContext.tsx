"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { getAccessToken, useUser } from "@auth0/nextjs-auth0";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinRoom: (roomId: string) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  joinRoom: () => {}
});

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    const initializeSocket = async () => {
      if (!user) return;

      try {
        const token = await getAccessToken();
        const socketInstance = io(process.env.PUBLIC_SOCKET_URL || "http://localhost:4000", {
          auth: { token },
          autoConnect: true,
        });

        socketInstance.on("connect", () => setIsConnected(true));
        socketInstance.on("disconnect", () => setIsConnected(false));

        setSocket(socketInstance);
      } catch (error) {
        console.error("Error fetching token:", error);
      }
    };

    initializeSocket();

    return () => {
      socket?.disconnect();
    };
  }, [user, socket]);

  const joinRoom = (roomId: string) => {
    if (socket) socket.emit("joinRoom", roomId);
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected, joinRoom }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);