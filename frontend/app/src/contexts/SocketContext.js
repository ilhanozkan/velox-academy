"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);

  if (!context)
    throw new Error("useSocket must be used within a SocketProvider");

  return context;
};

export const SocketProvider = ({ children, url }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    // Clean up existing socket if URL changes
    if (socketRef.current) {
      socketRef.current.disconnect();
      setSocket(null);
      setIsConnected(false);
    }

    if (!url) return;

    // Create new socket connection
    const newSocket = io(url);
    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on("connect", () => {
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
    });

    newSocket.on("connect_error", (error) => {
      console.error("SocketContext - Socket connection error:", error);
      setIsConnected(false);
    });

    return () => {
      newSocket.disconnect();
      setIsConnected(false);
    };
  }, [url]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
