import { createContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { getToken } from '../utils/storage';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  const connect = useCallback((token) => {
    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    newSocket.on('connect', () => setConnected(true));
    newSocket.on('disconnect', () => setConnected(false));
    newSocket.on('connect_error', () => setConnected(false));

    setSocket(newSocket);
    return newSocket;
  }, []);

  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setConnected(false);
    }
  }, [socket]);

  useEffect(() => {
    const token = getToken();
    if (token) connect(token);
    return () => { if (socket) socket.disconnect(); };
  }, []);

  const joinModule = useCallback((module) => {
    if (socket) socket.emit('join:module', module);
  }, [socket]);

  const leaveModule = useCallback((module) => {
    if (socket) socket.emit('leave:module', module);
  }, [socket]);

  return (
    <SocketContext.Provider value={{ socket, connected, connect, disconnect, joinModule, leaveModule }}>
      {children}
    </SocketContext.Provider>
  );
}