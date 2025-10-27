import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    console.log("🔌 Criando conexão Socket.IO única");
    const newSocket = io();

    newSocket.on("connect", () => {
      console.log("✅ Socket conectado:", newSocket.id);
    });

    newSocket.on("disconnect", () => {
      console.log("❌ Socket desconectado");
    });

    setSocket(newSocket);

    return () => {
      console.log("🔌 Fechando conexão Socket.IO");
      newSocket.close();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};
