"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { clearAllUserStores } from "@/lib/stores";
import { socketAPI, authAPI } from "@/lib/api";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const handleLogout = async () => {
      console.log("Starting logout process...");
      
      try {
        // Use authAPI logout function
        console.log("Calling authAPI.logout()...");
         const response = await authAPI.logout();
        if(!response) {
          throw new Error("Logout failed");
        }
        console.log("Logout API successful");
      } catch (error) {
        console.error("Logout API error:", error);
      }

      // Disconnect socket and clear stores regardless of API result
      console.log("Disconnecting socket and clearing stores...");
      socketAPI.disconnect();
      clearAllUserStores();

      // Redirect to login
      console.log("Redirecting to login...");
      router.push("/login");
    };

    handleLogout();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-lg">Logging out...</p>
      </div>
    </div>
  );
}
