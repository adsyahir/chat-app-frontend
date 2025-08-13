"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  UserRoundX, 
  UserPlus, 
  Loader2, 
  Search,
  Users,
  CheckCircle,
  Clock,
  UserCheck
} from "lucide-react";
import {
  SidebarHeader,
  SidebarInput,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function SearchFriends() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(handler);
  }, [search]);

  // Fetch users from API
  useEffect(() => {
    getUsers();
  }, [debouncedSearch]);

  const getUsers = async () => {
    try {
      setIsLoading(!!debouncedSearch);

      const query = debouncedSearch
        ? `?search=${encodeURIComponent(debouncedSearch)}`
        : "";

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users${query}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const users = await response.json();
      setUsers(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addFriend = async (toUserId) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/friends/add`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ to: toUserId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add friend");
      }

      await getUsers();
    } catch (error) {
      console.error("Add friend error:", error);
    }
  };

  const cancelFriendRequest = async (toUserId) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/friends/delete`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ to: toUserId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to cancel friend request");
      }

      await getUsers();
    } catch (error) {
      console.error("Cancel friend request error:", error);
    }
  };

  const getFriendStatusInfo = (friendStatus) => {
    switch (friendStatus) {
      case "pending":
        return {
          icon: Clock,
          text: "Pending",
          variant: "secondary",
          color: "text-yellow-600"
        };
      case "accepted":
        return {
          icon: UserCheck,
          text: "Friends",
          variant: "success",
          color: "text-green-600"
        };
      default:
        return null;
    }
  };

  const getInitials = (username) => {
    return username
      .split(" ")
      .map(name => name.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <SidebarHeader className="gap-4 border-b p-4 bg-gray-50 dark:bg-gray-900/50">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <Users className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </div>
            <div>
              <div className="text-foreground text-lg font-semibold">
                Find Friends
              </div>
              <div className="text-sm text-muted-foreground">
                Connect with new people
              </div>
            </div>
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <SidebarInput
            placeholder="Search by username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
          />
        </div>
        
        {isLoading && (
          <div className="flex items-center justify-center py-3 px-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <Loader2 className="w-4 h-4 animate-spin mr-2 text-gray-600 dark:text-gray-400" />
            <span className="text-sm text-muted-foreground">Searching users...</span>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="px-2">
            <div className="space-y-2">
              {users.length > 0 ? (
                users.map((user) => {
                  const friendStatus = getFriendStatusInfo(user.friend_status);
                  
                  return (
                    <div
                      key={user._id}
                      className="group p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 hover:shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10 ring-2 ring-gray-200 dark:ring-gray-700 group-hover:ring-gray-400 dark:group-hover:ring-gray-500 transition-all duration-200">
                            <AvatarImage src={user.avatar} alt={user.username} />
                            <AvatarFallback className="bg-gradient-to-br from-gray-600 to-gray-800 text-white font-medium">
                              {getInitials(user.username)}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">
                              {user.username}
                            </span>
                            {user.email && (
                              <span className="text-xs text-muted-foreground">
                                {user.email}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {friendStatus && (
                            <Badge 
                              variant={friendStatus.variant}
                              className="text-xs px-2 py-1 gap-1"
                            >
                              <friendStatus.icon className="w-3 h-3" />
                              {friendStatus.text}
                            </Badge>
                          )}
                          
                          {!user.friend_status ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => addFriend(user._id)}
                              className="gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                            >
                              <UserPlus className="w-4 h-4" />
                              <span className="hidden sm:inline">Add</span>
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => cancelFriendRequest(user._id)}
                              className="gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                            >
                              <UserRoundX className="w-4 h-4" />
                              <span className="hidden sm:inline">Cancel</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : !isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    {search ? "No users found" : "Start your search"}
                  </h3>
                  <p className="text-sm text-muted-foreground text-center max-w-sm">
                    {search
                      ? `No users found matching "${search}". Try a different search term.`
                      : "Type in the search box above to find friends and connect with them."}
                  </p>
                </div>
              ) : null}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </>
  );
}