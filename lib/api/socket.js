import { io } from "socket.io-client";
import { getChatStore } from "@/lib/stores/chatStore";
import { useAuthStore } from "@/lib/stores/authStore";

const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

let socket = null;
let connectedUserId = null;

const setupSocketListeners = (userId) => {
  if (!socket) return;

  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected");
    socket = null;
    connectedUserId = null;
  });

  socket.on("getOnlineUsers", (userIds) => {
    const chatStore = getChatStore(userId);
    chatStore?.getState().setOnlineUsers(userIds);
  });

  socket.on("getDisconnectedUsers", (disconnectedUserId) => {
    const chatStore = getChatStore(userId);
    const currentOnlineUsers = chatStore?.getState().onlineUsers;
    if (Array.isArray(currentOnlineUsers)) {
      const updatedOnlineUsers = currentOnlineUsers.filter(id => id !== disconnectedUserId);
      chatStore?.getState().setOnlineUsers(updatedOnlineUsers);
    }
  });
};

export const socketAPI = {
  connect: () => {
    const userId = useAuthStore.getState().userId;
    if (!userId) return null;

    // Reuse existing socket if connected and same user
    if (socket?.connected && connectedUserId === userId) {
      console.log("Reusing existing socket");
      return socket;
    }

    // Clean up old socket if user changed or disconnected
    if (socket && connectedUserId !== userId) {
      socket.disconnect();
      socket = null;
    }

    // Create new socket connection
    console.log("Creating new socket for user:", userId);
    socket = io(SOCKET_URL, {
      query: { userId },
      withCredentials: true
    });
    connectedUserId = userId;
    
    setupSocketListeners(userId);
    
    const chatStore = getChatStore(userId);
    chatStore?.getState().setSocket(socket);
    
    return socket;
  },

  emit: (event, data) => {
    if (socket?.connected) {
      socket.emit(event, data);
    } else {
      console.warn("Socket not connected");
    }
  },

  on: (event, callback) => {
    if (!socket) {
      socketAPI.connect();
    }
    socket?.on(event, callback);
  },

  off: (event, callback) => {
    if (socket) {
      callback ? socket.off(event, callback) : socket.off(event);
    }
  },

  disconnect: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
      connectedUserId = null;
      
      const userId = useAuthStore.getState().userId;
      if (userId) {
        const chatStore = getChatStore(userId);
        chatStore?.getState().setSocket(null);
      }
    }
  },
};