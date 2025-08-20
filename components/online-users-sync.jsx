"use client";

import { useEffect } from "react";
import { useChatStore } from "@/lib/stores";
import { socketAPI } from "@/lib/api";

export default function OnlineUsersSync() {
  const { userId, _hasHydrated, setOnlineUsers } = useChatStore();

  useEffect(() => {
    if (!_hasHydrated || !userId) return;

    // Setup online users listener
    const setupOnlineUsersListener = () => {
      try {
        // Remove existing listeners first to prevent duplicates
        socketAPI.off("getOnlineUsers");
        socketAPI.off("getDisconnectedUsers");
        
        // Listen for online users updates
        socketAPI.on("getOnlineUsers", (userIds) => {
          console.log("Online users updated:", userIds);
          setOnlineUsers(userIds || []);
        });

  
        // Ensure socket connection and request initial online users
        socketAPI.connect();
      } catch (error) {
        console.error("Error setting up online users listener:", error);
      }
    };

    setupOnlineUsersListener();

    // Cleanup function
    return () => {
      socketAPI.off("getOnlineUsers");
      socketAPI.off("getDisconnectedUsers");
    };
  }, [_hasHydrated, userId, setOnlineUsers]);

  socketAPI.on("getDisconnectedUsers", (disconnectedUserId) => {
    console.log("User disconnected:", disconnectedUserId);
    setOnlineUsers(prevUsers => 
      prevUsers.filter(userId => userId !== disconnectedUserId)
    );
  });

  // This component doesn't render anything
  return null;
}