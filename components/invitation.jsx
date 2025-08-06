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
  UserCheck,
  X,
  Check,
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
import { authenticatedClientFetch } from "@/lib/clientFetch.js";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function Invitations({ pendingRequests = [] }) {
  const [requests, setRequests] = useState(pendingRequests);
  const [actionLoading, setActionLoading] = useState(null);
  const router = useRouter();

  useEffect(() => {
    setRequests(pendingRequests);
  }, [pendingRequests]);

  const getInitials = (username) => {
    return username
      .split(" ")
      .map((name) => name.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;

    return date.toLocaleDateString();
  };

  const handleFriendRequest = async (requestId, action) => {
    setActionLoading(requestId);

    try {
      const response = await authenticatedClientFetch(
        `/api/friends/update-friend-request`,
        {
          method: "PUT",
          body: JSON.stringify({
            _id: requestId,
            status: action === "accept" ? "accepted" : "rejected",
          }),
        }
      );

      if (response) {
        // Remove the request from the list
        setRequests((prev) =>
          prev.filter((request) => request._id !== requestId)
        );

        // Show success toast
        toast.success(
          action === "accept"
            ? "Friend request accepted!"
            : "Friend request rejected"
        );

        // Refresh the page to update other components
        router.refresh();
      }
    } catch (error) {
      console.error(`Error ${action}ing friend request:`, error);
      toast.error(`Failed to ${action} friend request`);
    } finally {
      setActionLoading(null);
    }
  };

  const acceptFriendRequest = (requestId) =>
    handleFriendRequest(requestId, "accept");
  const rejectFriendRequest = (requestId) =>
    handleFriendRequest(requestId, "reject");

  return (
    <>
      <SidebarHeader className="gap-4 border-b p-4 bg-white dark:bg-black border-gray-200 dark:border-gray-800">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gray-100 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <Users className="w-5 h-5 text-black dark:text-white" />
            </div>
            <div>
              <div className="text-black dark:text-white text-lg font-semibold">
                Friend Requests
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {requests.length} pending request
                {requests.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
          {requests.length > 0 && (
            <Badge
              variant="secondary"
              className="bg-black text-white dark:bg-white dark:text-black border border-gray-300 dark:border-gray-700"
            >
              {requests.length}
            </Badge>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="px-2">
            <div className="space-y-2">
              {requests.length > 0 ? (
                requests.map((request) => (
                  <div
                    key={request._id}
                    className="group p-3 rounded-xl border border-gray-300 dark:border-gray-700 hover:border-gray-500 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all duration-200 hover:shadow-sm bg-white dark:bg-black"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Avatar className="w-10 h-10 ring-2 ring-gray-300 dark:ring-gray-700 group-hover:ring-gray-500 dark:group-hover:ring-gray-500 transition-all duration-200 flex-shrink-0">
                          <AvatarImage
                            src={request.from.avatar}
                            alt={request.from.username}
                          />
                          <AvatarFallback className="bg-black text-white dark:bg-white dark:text-black font-medium border border-gray-300 dark:border-gray-700">
                            {getInitials(request.from.username)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="font-medium text-black dark:text-white group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors truncate">
                            {request.from.username}
                          </span>
                          {request.from.email && (
                            <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
                              {request.from.email}
                            </span>
                          )}
                          <span className="text-xs text-gray-500 dark:text-gray-500">
                            {formatDate(request.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <Badge
                          variant="outline"
                          className="text-xs px-2 py-1 gap-1 border-gray-400 text-gray-700 dark:border-gray-600 dark:text-gray-300 bg-white dark:bg-black whitespace-nowrap"
                        >
                          <Clock className="w-3 h-3" />
                          Pending
                        </Badge>

                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => acceptFriendRequest(request._id)}
                            disabled={actionLoading === request._id}
                            className="hover:bg-green-100 dark:hover:bg-green-900 hover:text-green-800 dark:hover:text-green-200 transition-colors p-1.5 border border-gray-300 dark:border-gray-700 h-8 w-8"
                            title="Accept friend request"
                          >
                            {actionLoading === request._id ? (
                              <Loader2 className="w-3 h-3 animate-spin text-black dark:text-white" />
                            ) : (
                              <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                            )}
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => rejectFriendRequest(request._id)}
                            disabled={actionLoading === request._id}
                            className="hover:bg-red-100 dark:hover:bg-red-900 hover:text-red-800 dark:hover:text-red-200 transition-colors p-1.5 border border-gray-300 dark:border-gray-700 h-8 w-8"
                            title="Reject friend request"
                          >
                            {actionLoading === request._id ? (
                              <Loader2 className="w-3 h-3 animate-spin text-black dark:text-white" />
                            ) : (
                              <X className="w-3 h-3 text-red-600 dark:text-red-400" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-full mb-4 border border-gray-300 dark:border-gray-700">
                    <Users className="w-8 h-8 text-gray-600 dark:text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-black dark:text-white mb-2">
                    No pending requests
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-sm">
                    You don't have any pending friend requests at the moment.
                    When someone sends you a request, it will appear here.
                  </p>
                </div>
              )}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </>
  );
}
