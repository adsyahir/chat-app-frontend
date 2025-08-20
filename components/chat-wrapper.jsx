"use client";

import { useChatStore } from "@/lib/stores";
import { Loader2 } from "lucide-react";
import Chat from "./chat";

export default function ChatWrapper() {
  const chatStoreResult = useChatStore();
  const hasHydrated = chatStoreResult?._hasHydrated ?? false;

  // Show loading screen while chat store is hydrating
  if (!hasHydrated) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin mx-auto mb-6 text-primary" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Loading Chat
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
            Please wait while we prepare your chat...
          </p>
          <div className="w-64 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto">
            <div className="h-1 bg-primary rounded-full animate-pulse w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return <Chat />;
}