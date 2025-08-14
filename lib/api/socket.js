import { io } from "socket.io-client";
import { getChatStore } from "@/lib/stores/chatStore";
const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
let socket = null;

export const socketAPI = {
  connect: (userId) => {

    if (!socket) {
      socket = io(SOCKET_URL, {
          query: { userId },
        }
      );
      socket.connect();
      socket.on("connect", () => {
        console.log("Connected to the server");

        socket.on("getOnlineUsers", (userIds) => {
          console.log("👥 Online users:", userIds);
          
          // Update the chat store directly
          const chatStore = getChatStore(userId);
          if (chatStore) {
            chatStore.getState().setOnlineUsers(userIds);
          }
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