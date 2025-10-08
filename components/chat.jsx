"use client";

import { useChatStore } from "@/lib/stores";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { chatAPI, socketAPI, userAPI, friendsAPI } from "@/lib/api";

export default function Chat() {
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const messagesEndRef = useRef(null);

  const chatStoreResult = useChatStore();
  const contact = chatStoreResult?.selectedContact ?? null;
  const userId = chatStoreResult?.userId ?? null;
  const onlineUsers = Array.isArray(chatStoreResult?.onlineUsers)
    ? chatStoreResult.onlineUsers
    : [];
  // console.log("Online Users:", onlineUsers);
  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!message.trim() || !contact?.friendId) return;

    const newMessage = {
      senderId: userId,
      receiverId: contact.friendId,
      text: message.trim(),
      timestamp: new Date().toISOString(),
    };

    setChatMessages((prev) => [...prev, newMessage]);
    setMessage("");

    try {
      await chatAPI.sendMessage(contact.friendId, message);
    } catch (error) {
      console.error("Error sending message:", error);
      setChatMessages((prev) => prev.slice(0, -1));
    }
  };

  useEffect(() => {
    if (chatStoreResult?.selectedContact?.friendId) {
      getMessages(chatStoreResult.selectedContact.friendId);
    }
  }, [chatStoreResult?.selectedContact, chatStoreResult?._hasHydrated]);

  useEffect(() => {
    if (chatStoreResult?._hasHydrated && userId) {
      // Ensure socket connection is established
      socketAPI.connect();
      getMessageViaSocket();
    }
    // Cleanup function to remove socket listener
    return () => {
      socketAPI.off("newMessage");
    };
  }, [chatStoreResult?._hasHydrated, userId]);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const getMessages = async (receiverId) => {
    try {
      const result = await chatAPI.getMessages(receiverId);
      setChatMessages(result);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const getUserById = async (id) => {
    try {
      const result = await userAPI.getUserById(id);
      chatStoreResult.setSelectedContact({
        ...result,
        friendId: result._id,
      });
      getMessages(id);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const getExistingChattedFriends =  async () => {
    try{
      const result = await friendsAPI.getExistingChattedFriends();
      return result;  
    }catch(error){ 
      console.error("Error fetching user data:", error);
    }
  }

  const getMessageViaSocket = () => {
    try {
      // Remove existing listener first to prevent duplicates
      socketAPI.off("newMessage");

      // Listen for new messages
      socketAPI.on("newMessage", (message) => {
        if (message.senderId !== userId) {
          setChatMessages((prevMessages) => [...prevMessages, message]);
        }
        if (
          message.senderId &&
          chatStoreResult?.selectedContact?._id !== message.senderId
        ) {
          getUserById(message.senderId);
        }
      });
    } catch (error) {
      console.error("Error setting up message listener:", error);
    }
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
            {chatStoreResult.selectedContact?.friendId ?? "Unknown User"}
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span>
              Status:{" "}
              {onlineUsers && onlineUsers.includes(contact?.friendId)
                ? "🟢 Online"
                : "⚪ Offline"}
              {chatStoreResult.socket.id}
            </span>
            <span>{onlineUsers.length} users online</span>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/5">
        {chatMessages.length === 0 ? (
          <div className="text-center text-gray-500">
            <p className="text-sm">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          chatMessages.map((msg, i) => (
            <div
              key={i}
              className={`max-w-xs px-4 py-2 rounded-lg ${
                msg.senderId === userId
                  ? "ml-auto bg-black text-white"
                  : "mr-auto bg-white text-black border border-gray-300"
              }`}
            >
              <p className="text-sm">{msg.text}</p>
              <span className="text-xs opacity-70">
                {msg.senderId === userId ? "You" : contact?.username || "User"}
              </span>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4 bg-background">
        <form onSubmit={sendMessage} className="flex items-center gap-2">
          <Textarea
            placeholder={`Type a message to ${contact?.username}...`}
            className="flex-1 resize-none"
            rows={2}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage(e);
              }
            }}
          />
          <Button className="h-full" type="submit">
            Send
          </Button>
        </form>
      </div>
    </SidebarInset>
  );
}
