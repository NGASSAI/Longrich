import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:4000";

export function SocketProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  // Liste des callbacks abonnes a des evenements specifiques (ex. nouveau
  // message de chat) — permet a d'autres composants de s'abonner sans
  // recreer une connexion, via useSocketEvent ci-dessous.
  const listenersRef = useRef({});

  useEffect(() => {
    if (!isAuthenticated) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      return;
    }

    // withCredentials : le cookie JWT httpOnly est envoye au handshake,
    // verifie cote backend dans sockets/index.js.
    const socket = io(SOCKET_URL, { withCredentials: true });
    socketRef.current = socket;

    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));

    // Redirige chaque evenement recu vers les listeners abonnes dynamiquement.
    const forwardEvent = (eventName) => (payload) => {
      (listenersRef.current[eventName] || []).forEach((cb) => cb(payload));
    };
    socket.onAny((eventName, payload) => forwardEvent(eventName)(payload));

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [isAuthenticated]);

  const subscribe = useCallback((eventName, callback) => {
    if (!listenersRef.current[eventName]) listenersRef.current[eventName] = [];
    listenersRef.current[eventName].push(callback);
    return () => {
      listenersRef.current[eventName] = listenersRef.current[eventName].filter((cb) => cb !== callback);
    };
  }, []);

  const emit = useCallback((eventName, payload) => {
    socketRef.current?.emit(eventName, payload);
  }, []);

  const value = { isConnected, subscribe, emit };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket doit etre utilise a l'interieur d'un SocketProvider");
  }
  return context;
}

// Hook pratique : s'abonne a un evenement socket pendant la duree de vie du
// composant, se desabonne automatiquement au demontage.
export function useSocketEvent(eventName, callback) {
  const { subscribe } = useSocket();
  useEffect(() => {
    const unsubscribe = subscribe(eventName, callback);
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventName, subscribe]);
}