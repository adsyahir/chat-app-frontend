import { io } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
let socket = null;

export const socketAPI = {
  connect: () => {
    if (!socket) {
      socket = io(SOCKET_URL);
      
      socket.on("connect", () => {
        console.log("Connected to the server");

        socket.on("getOnlineUsers", (userIds) => {
          console.log("👥 Online users:", userIds);
          // You can handle online users here, e.g., update state or store
        });
      });

      socket.on("disconnect", () => {
        console.log("Disconnected from the server");
      });
    }
    
    return socket;
  },

  disconnect: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  getSocket: () => socket,

  emit: (event, data) => {
    if (socket) {
      socket.emit(event, data);
    } else {
      console.warn("Socket not connected. Call connect() first.");
    }
  },

  on: (event, callback) => {
    if (socket) {
      socket.on(event, callback);
    } else {
      console.warn("Socket not connected. Call connect() first.");
    }
  },

  off: (event, callback) => {
    if (socket) {
      socket.off(event, callback);
    }
  },
};