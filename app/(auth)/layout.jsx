import {
  Calendar,
  Home,
  Inbox,
  Search,
  Settings,
  Plus,
  UserRoundPlus,
} from "lucide-react";
import { headers } from "next/headers";
import { SidebarProvider } from "@/components/ui/sidebar";
import AuthSync from "@/components/auth-sync";

import { AppSidebar } from "@/components/app-sidebar";
import ChatWrapper from "@/components/chat-wrapper";
import OnlineUsersSync from "@/components/online-users-sync";
import { VideoCallProvider } from "@/components/VideoCallProvider";

export default async function AuthLayout({ children }) {
  const headersList = await headers();
  const userHeader = headersList.get("x-user");
  const isAuthenticated = headersList.get("x-authenticated") === "true";

  let user = null;
  if (userHeader) {
    try {
      user = JSON.parse(userHeader);
    } catch (err) {
      console.error("Failed to parse x-user header:", err);
    }
  } else {
    console.warn("x-user header not found.");
  }

  const items = [
    { title: "Home", url: "/dashboard", icon: Home },
    { title: "Inbox", url: "#", icon: Inbox },
    { title: "Calendar", url: "#", icon: Calendar },
    { title: "Search Friends", url: "/search-friends", icon: UserRoundPlus },
  ];

  if (user.role === "admin") {
    items.push({ title: "Settings", url: "#", icon: Settings });
  }
  return (
    <VideoCallProvider>
      <SidebarProvider>
        <AppSidebar user={user}>{children}</AppSidebar>
        <AuthSync isAuthenticated={isAuthenticated} user={user} />
        <OnlineUsersSync />
        <ChatWrapper />
      </SidebarProvider>
    </VideoCallProvider>
  );
}
