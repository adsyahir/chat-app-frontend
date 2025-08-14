"use client";

import { useChatStore } from "@/lib/stores";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { Loader2, MessageCircle } from "lucide-react";

export default function Chat({ user }) {
  const [message, setMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const socketRef = useRef(null);

  const chatStoreResult = useChatStore();
  // console.log("Online users :", chatStoreResult);
  // Destructure from store defensively
  const contact = chatStoreResult?.store?.selectedContact ?? null;
  const hasHydrated = chatStoreResult?.store?._hasHydrated ?? false;
  const userId = chatStoreResult?.store?.userId ?? null;
  const userName = chatStoreResult?.store?.userName ?? null;
  console.log("Chat store result:", chatStoreResult.selectedContact);


  // Setup socket connection effect
  // useEffect(() => {
  //   if (!userId) return;

  //   console.log("🔌 Connecting socket for user:", userId);

  //   const newSocket = io(process.env.NEXT_PUBLIC_BACKEND_URL, {
  //     query: { userId },
  //     forceNew: true,
  //   });

  //   newSocket.on("connect", () => {
  //     console.log("✅ Socket connected:", newSocket.id);
  //   });

  //   newSocket.on("disconnect", () => {
  //     console.log("❌ Socket disconnected");
  //   });

  //   newSocket.on("getOnlineUsers", (userIds) => {
  //     console.log("👥 Online users:", userIds);
  //     setOnlineUsers(userIds);
  //   });

  //   newSocket.on("error", (error) => {
  //     console.error("🚨 Socket error:", error);
  //   });

  //   setSocket(newSocket);
  //   socketRef.current = newSocket;

  //   return () => {
  //     console.log("🧹 Cleaning up socket connection");
  //     if (socketRef.current) {
  //       socketRef.current.disconnect();
  //       socketRef.current = null;
  //     }
  //     setSocket(null);
  //   };
  // }, [userId]);

  // Early returns after hooks (safe)
  // if (chatStoreResult.isLoading || !chatStoreResult.authReady) {
  //   return (
  //     <SidebarInset className="flex items-center justify-center h-screen">
  //       <div className="text-center">
  //         <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
  //         <p className="text-gray-600 dark:text-gray-400">Loading chat...</p>
  //         <p className="text-xs text-gray-500 mt-2">
  //           Auth ready: {chatStoreResult.authReady ? "✅" : "❌"} | Loading:{" "}
  //           {chatStoreResult.isLoading ? "✅" : "❌"}
  //         </p>
  //       </div>
  //     </SidebarInset>
  //   );
  // }

  // if (chatStoreResult.needsAuth) {
  //   return (
  //     <SidebarInset className="flex items-center justify-center h-screen">
  //       <div className="text-center">
  //         <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
  //         <p className="text-gray-600 dark:text-gray-400 mb-2">Authentication Required</p>
  //         <p className="text-sm text-gray-500">Please log in to access the chat.</p>
  //       </div>
  //     </SidebarInset>
  //   );
  // }

  // if (!chatStoreResult.isReady || !chatStoreResult.store) {
  //   return (
  //     <SidebarInset className="flex items-center justify-center h-screen">
  //       <div className="text-center">
  //         <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
  //         <p className="text-gray-600 dark:text-gray-400">Initializing chat store...</p>
  //       </div>
  //     </SidebarInset>
  //   );
  // }

  // if (!hasHydrated) {
  //   return (
  //     <SidebarInset className="flex items-center justify-center h-screen">
  //       <div className="text-center">
  //         <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
  //         <p className="text-gray-600 dark:text-gray-400">Loading your chat data...</p>
  //       </div>
  //     </SidebarInset>
  //   );
  // }

  // if (!contact) {
  //   return (
  //     <SidebarInset className="flex flex-col h-screen">
  //       <header className="bg-background sticky top-0 z-10 flex items-center gap-2 border-b p-4">
  //         <SidebarTrigger className="-ml-1" />
  //         <Separator
  //           orientation="vertical"
  //           className="mr-2 data-[orientation=vertical]:h-4"
  //         />
  //         <h1 className="text-lg font-semibold">Chat</h1>
  //       </header>

  //       <div className="flex-1 flex items-center justify-center">
  //         <div className="text-center">
  //           <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
  //           <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
  //             No chat selected
  //           </h2>
  //           <p className="text-gray-600 dark:text-gray-400">
  //             Select a contact from the sidebar to start chatting
  //           </p>
  //           <div className="mt-4 text-sm text-gray-500">
  //             <p>User: {userName || userId}</p>
  //             <p>Online users: {onlineUsers.length}</p>
  //             <p>Socket: {socket?.connected ? "✅ Connected" : "❌ Disconnected"}</p>
  //           </div>
  //         </div>
  //       </div>
  //     </SidebarInset>
  //   );
  // }

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !socket || !contact) return;

    const messageData = {
      recipientId: contact._id,
      message: message.trim(),
      timestamp: new Date().toISOString(),
    };

    console.log("📤 Sending message:", messageData);
    socket.emit("sendMessage", messageData);
    setMessage("");
  };

  return (
    <SidebarInset className="flex flex-col h-screen">
      <header className="bg-background sticky top-0 z-10 flex items-center gap-2 border-b p-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <div className="flex-1">
          <h1 className="text-lg font-semibold">
            {chatStoreResult.selectedContact?.username ?? "Unknown User"}
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span>
              Status: {onlineUsers.includes(contact?._id) ? "🟢 Online" : "⚪ Offline"}
            </span>
            <span>
              Socket: {socket?.connected ? "🟢 Connected" : "🔴 Disconnected"}
            </span>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className={`max-w-xs px-4 py-2 rounded-lg ${
              i % 2 === 0
                ? "ml-auto bg-primary text-primary-foreground"
                : "mr-auto bg-muted"
            }`}
          >
            {i % 2 === 0
              ? `You: Sample message ${i + 1}`
              : `${contact?.username ?? "User"}: Response ${i + 1}`}
          </div>
        ))}

        {!socket?.connected && (
          <div className="text-center py-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-full text-sm">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              Connecting to chat server...
            </div>
          </div>
        )}
      </div>

      <div className="border-t p-4 bg-background">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <Textarea
            placeholder={
              socket?.connected
                ? `Type a message to ${contact?.username}...`
                : "Connecting to chat server..."
            }
            className="flex-1 resize-none"
            rows={2}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={!socket?.connected}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
          />
          <Button
            className="h-full"
            type="submit"
            disabled={!message.trim() || !socket?.connected}
          >
            {!socket?.connected ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Send"
            )}
          </Button>
        </form>

        <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
          <span>User: {userName || userId}</span>
          <span>
            {socket?.connected ? "✅" : "❌"} Socket | {onlineUsers.length} online | To:{" "}
            {contact?.username}
          </span>
        </div>
      </div>
    </SidebarInset>
  );
}
