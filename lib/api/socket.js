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
    if (!currentSocket) {
      socketAPI.connect();
    }
    currentSocket?.on(event, callback);
  },

  disconnect: () => {
    if (currentSocket) {
      currentSocket.disconnect();
      currentSocket = null;
    }
  },
};