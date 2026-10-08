"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);

  if (!context) throw new Error("useSocket must be used within a SocketProvider");

  return context;
};

// How long to wait for the first connection before reporting a failure.
const CONNECT_TIMEOUT_MS = 15000;

/**
 * Connection to the learner's sandbox. The sandbox requires the access token
 * returned by the API (socket.io `auth.token`).
 */
export const SocketProvider = ({ children, url, token }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectError, setConnectError] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!url) return;

    setConnectError(null);
    // socket.io keeps retrying (with backoff) after a drop: a limit used to
    // leave the workspace "reconnecting" forever after a long sleep.
    const newSocket = io(url, { auth: { token } });
    setSocket(newSocket);

    const timeout = setTimeout(() => {
      if (!newSocket.connected) setConnectError("Sanal makineye bağlanılamadı.");
    }, CONNECT_TIMEOUT_MS);

    newSocket.on("connect", () => {
      clearTimeout(timeout);
      setIsConnected(true);
      setConnectError(null);
    });
    newSocket.on("disconnect", () => setIsConnected(false));
    newSocket.on("connect_error", (error) => {
      // A wrong token is final; network errors are retried by socket.io.
      if (error?.message === "unauthorized") {
        clearTimeout(timeout);
        setConnectError("Sanal makine erişim anahtarını kabul etmedi.");
      }
    });

    return () => {
      clearTimeout(timeout);
      newSocket.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [url, token, attempt]);

  const reconnect = useCallback(() => setAttempt((n) => n + 1), []);

  return (
    <SocketContext.Provider value={{ socket, isConnected, connectError, reconnect, url, token }}>
      {children}
    </SocketContext.Provider>
  );
};
