"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
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
    let socketInstance: Socket;

    const initializeSocket = async () => {
      if (!user) return;
      console.log("USER:", user);

      try {
        const accessToken = await getAccessToken();
        socketInstance = io(process.env.PUBLIC_SOCKET_URL || "http://localhost:4000", {
          auth: {
            token: accessToken,
          },
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
      socketInstance?.disconnect();
    };
  }, [user]);

  const joinRoom = useCallback((roomId: string) => {
    if (socket) {
      socket.emit("joinRoom", roomId);
    }
  }, [socket]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, joinRoom }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);