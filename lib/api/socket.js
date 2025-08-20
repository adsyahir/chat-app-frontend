import { io } from "socket.io-client";
import { getChatStore } from "@/lib/stores/chatStore";
import { useAuthStore } from "@/lib/stores/authStore";

const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// Keep reference to current socket
let currentSocket = null;

export const socketAPI = {
  connect: () => {
    const userId = useAuthStore.getState().userId;
    if (!userId) return null;

    // Create new socket if none exists or if disconnected
    if (!currentSocket || !currentSocket.connected) {
      currentSocket = io(SOCKET_URL, { query: { userId } });
      
      currentSocket.on("connect", () => {
        console.log("Connected");
      });

      currentSocket.on("getOnlineUsers", (userIds) => {
        const chatStore = getChatStore(userId);
        chatStore?.getState().setOnlineUsers(userIds);
      });

      currentSocket.on("disconnect", () => {
        console.log("Disconnected");
      });
    }

    return currentSocket;
  },

  emit: (event, data) => {
    if (currentSocket?.connected) {
      currentSocket.emit(event, data);
    } else {
      console.warn("Socket not connected");
    }
  },

  on: (event, callback) => {
    console.log("Current Socket:", currentSocket);

    if (!currentSocket) {
      console.log(currentSocket);
      socketAPI.connect();
    }
    currentSocket?.on(event, callback);
  },

  off: (event, callback) => {
    if (currentSocket) {
      if (callback) {
        currentSocket.off(event, callback);
      } else {
        currentSocket.off(event);
      }
    }
  },

  disconnect: () => {
    console.log("Disconnecting socket");
    console.log("Current Socket:", currentSocket);
    if (!currentSocket) {
      socketAPI.connect();
    }
    console.log("Current Socket:", currentSocket);

      currentSocket.disconnect();
      currentSocket = null;
  },
};