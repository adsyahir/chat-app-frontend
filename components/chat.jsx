"use client";

import { useChatStore } from "@/lib/stores";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { chatAPI, socketAPI, userAPI, friendsAPI } from "@/lib/api";
import { useEncryptionStore } from "@/lib/stores/encryptionStore";
import { encryptMessage, decryptMessage } from "@/lib/crypto/encryption";
import { useVideoCallStore } from "@/lib/stores/videoCallStore";
import { useAuthStore } from "@/lib/stores/authStore";
import { Video, TestTube2 } from "lucide-react";
import { CameraTest } from "@/components/CameraTest";

export default function Chat() {
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [decryptedMessages, setDecryptedMessages] = useState(new Map());
  const [isCameraTestOpen, setIsCameraTestOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const chatStoreResult = useChatStore();
  const contact = chatStoreResult?.selectedContact ?? null;
  const userId = chatStoreResult?.userId ?? null;
  const onlineUsers = Array.isArray(chatStoreResult?.onlineUsers)
    ? chatStoreResult.onlineUsers
    : [];

  // Encryption store
  const encryptionStore = useEncryptionStore();
  const {
    isEncryptionEnabled,
    getPrivateKey,
    getRecipientPublicKey,
    canEncryptFor
  } = encryptionStore;

  // Video call store
  const { startCall } = useVideoCallStore();

  // Auth store
  const { user } = useAuthStore();

  // Handle video call
  const handleVideoCall = async () => {
    if (!contact?.friendId || !user?.id) return;

    try {
      await startCall(
        contact.friendId,
        contact.username || 'Unknown',
        user.id,
        user.username || 'You'
      );
    } catch (error) {
      console.error('Error starting video call:', error);
      alert('Failed to start video call. Please check camera/microphone permissions.');
    }
  };

  // Decrypt message content
  const decryptMessageContent = async (msg) => {
    // Return cached if available
    if (decryptedMessages.has(msg._id)) {
      return decryptedMessages.get(msg._id);
    }

    // Don't decrypt unencrypted messages
    if (!msg.encrypted) {
      return msg.text;
    }

    try {
      const myPrivateKey = getPrivateKey();
      if (!myPrivateKey) {
        return '[Encryption keys not available]';
      }

      // Determine sender/receiver for key lookup
      const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      const otherPublicKey = await getRecipientPublicKey(otherUserId);

      if (!otherPublicKey) {
        return '[Unable to decrypt - missing public key]';
      }

      const decrypted = decryptMessage(
        msg.text, // ciphertext
        msg.nonce,
        otherPublicKey,
        myPrivateKey
      );

      // Cache result
      setDecryptedMessages(prev => new Map(prev).set(msg._id, decrypted));

      return decrypted;
    } catch (error) {
      console.error('Decryption failed:', error);
      return '[Decryption failed]';
    }
  };

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!message.trim() || !contact?.friendId) return;

    try {
      let messageToSend = message.trim();
      let encryptionData = null;

      // Check if we can encrypt
      const canEncrypt = await canEncryptFor(contact.friendId);
      console.log('🔐 Encryption check:', {
        canEncrypt,
        contactId: contact.friendId,
        isEncryptionEnabled,
      });

      if (canEncrypt) {
        // Encrypt message
        const recipientPublicKey = await getRecipientPublicKey(contact.friendId);
        const myPrivateKey = getPrivateKey();
        console.log('🔑 Keys retrieved:', {
          hasRecipientKey: !!recipientPublicKey,
          hasMyPrivateKey: !!myPrivateKey,
        });

        const { ciphertext, nonce } = encryptMessage(
          messageToSend,
          recipientPublicKey,
          myPrivateKey
        );

        messageToSend = ciphertext;
        encryptionData = { nonce, encrypted: true };
      }

      // Optimistic UI update
      const newMessage = {
        senderId: userId,
        receiverId: contact.friendId,
        text: messageToSend,
        encrypted: !!encryptionData,
        nonce: encryptionData?.nonce,
        timestamp: new Date().toISOString(),
      };

      setChatMessages((prev) => [...prev, newMessage]);
      setMessage("");

      // Send to server
      await chatAPI.sendMessage(contact.friendId, messageToSend, null, encryptionData);
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

  // Decrypt encrypted messages
  useEffect(() => {
    if (!isEncryptionEnabled) return;

    const decryptAll = async () => {
      for (const msg of chatMessages) {
        if (msg.encrypted && !decryptedMessages.has(msg._id)) {
          await decryptMessageContent(msg);
        }
      }
    };

    decryptAll();
  }, [chatMessages, isEncryptionEnabled]);

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
            {chatStoreResult.selectedContact?.username ?? "Unknown User"}
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span>
              Status:{" "}
              {onlineUsers && onlineUsers.includes(contact?.friendId)
                ? "🟢 Online"
                : "⚪ Offline"}
            </span>
            {isEncryptionEnabled && (
              <span className="text-green-600 dark:text-green-400">
                🔒 Encrypted
              </span>
            )}
            <span>{onlineUsers.length} users online</span>
          </div>
        </div>

        {/* Camera Test Button */}
        <button
          onClick={() => setIsCameraTestOpen(true)}
          className="px-3 h-9 border border-white/10 hover:border-white/20 text-sm font-light tracking-wide transition-all"
          title="Test camera"
        >
          <TestTube2 className="w-4 h-4 inline mr-2" />
          Test Camera
        </button>

        {/* Video Call Button */}
        <button
          onClick={handleVideoCall}
          className="px-4 h-9 border border-white/30 bg-white/10 hover:border-white/40 hover:bg-white/20 text-sm font-light tracking-wide transition-all"
          title="Start video call"
        >
          <Video className="w-4 h-4 inline mr-2" />
          Video Call
        </button>
      </header>

      {/* Camera Test Modal */}
      <CameraTest
        isOpen={isCameraTestOpen}
        onClose={() => setIsCameraTestOpen(false)}
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/5">
        {chatMessages.length === 0 ? (
          <div className="text-center text-gray-500">
            <p className="text-sm">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          chatMessages.map((msg, i) => {
            const displayText = msg.encrypted
              ? decryptedMessages.get(msg._id) || 'Decrypting...'
              : msg.text;

            return (
              <div
                key={i}
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  msg.senderId === userId
                    ? "ml-auto bg-black text-white"
                    : "mr-auto bg-white text-black border border-gray-300"
                }`}
              >
                <p className="text-sm">{displayText}</p>
                <div className="flex items-center gap-2 mt-1">
                  {msg.encrypted && (
                    <span className="text-xs opacity-50">🔒</span>
                  )}
                  <span className="text-xs opacity-70">
                    {msg.senderId === userId ? "You" : contact?.username || "User"}
                  </span>
                </div>
              </div>
            );
          })
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
