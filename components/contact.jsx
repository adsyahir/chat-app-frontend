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
  MessageCircle,
  Phone,
  Mail,
} from "lucide-react";
import {
  SidebarHeader,
  SidebarInput,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { authenticatedClientFetch } from "@/lib/clientFetch.js";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useChatStore } from "@/lib/chatStore";
import { useAuthStore } from "@/lib/authStore";

export default function Contacts({ contacts = [] }) {
  const [contactList, setContactList] = useState(contacts);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const router = useRouter();

  useEffect(() => {
    setContactList(contacts);
  }, [contacts]);

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

    if (diffDays === 1) return "Added today";
    if (diffDays === 2) return "Added yesterday";
    if (diffDays <= 7) return `Added ${diffDays - 1} days ago`;

    return `Added ${date.toLocaleDateString()}`;
  };

  const handleRemoveContact = async (contactId) => {
    setActionLoading(contactId);

    try {
      const response = await authenticatedClientFetch(
        `/api/friends/remove-friend`,
        {
          method: "DELETE",
          body: JSON.stringify({
            friendId: contactId,
          }),
        }
      );

      if (response) {
        // Remove the contact from the list
        setContactList((prev) =>
          prev.filter((contact) => contact._id !== contactId)
        );

        // Show success toast
        toast.success("Contact removed successfully");

        // Refresh the page to update other components
        router.refresh();
      }
    } catch (error) {
      console.error("Error removing contact:", error);
      toast.error("Failed to remove contact");
    } finally {
      setActionLoading(null);
    }
  };

  // ✅ Fix: Handle null return from useChatStore
  const chatStore = useChatStore();
  
  const handleMessage = (contact) => {
    // ✅ Check if chatStore is available before using it
    if (chatStore?.setSelectedContact) {
      chatStore.setSelectedContact(contact);
      console.log('selectedContact is',chatStore?.selectedContact);

      router.push("/");
    } else {
      // Handle the case when chat store is not ready
      console.warn("Chat store not ready, redirecting without setting contact");
      router.push("/");
    }
  };

  const filteredContacts = contactList.filter(
    (contact) =>
      contact.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ✅ Optional: Show loading state while chat store initializes
  const isChatStoreReady = chatStore !== null;

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
                Contacts
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {contactList.length} contact
                {contactList.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
          {contactList.length > 0 && (
            <Badge
              variant="secondary"
              className="bg-black text-white dark:bg-white dark:text-black border border-gray-300 dark:border-gray-700"
            >
              {contactList.length}
            </Badge>
          )}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
          <Input
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white dark:bg-black border-gray-300 dark:border-gray-700 focus:border-gray-500 dark:focus:border-gray-500"
          />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="px-2">
            <div className="space-y-2">
              {filteredContacts.length > 0 ? (
                filteredContacts.map((contact) => (
                  <div
                    key={contact._id}
                    className="group p-3 rounded-xl border border-gray-300 dark:border-gray-700 hover:border-gray-500 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all duration-200 hover:shadow-sm bg-white dark:bg-black"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Avatar className="w-10 h-10 ring-2 ring-gray-300 dark:ring-gray-700 group-hover:ring-gray-500 dark:group-hover:ring-gray-500 transition-all duration-200 flex-shrink-0">
                          <AvatarImage
                            src={contact.avatar}
                            alt={contact.username}
                          />
                          <AvatarFallback className="bg-black text-white dark:bg-white dark:text-black font-medium border border-gray-300 dark:border-gray-700">
                            {getInitials(contact.username)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="font-medium text-black dark:text-white group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors truncate">
                            {contact.username}
                          </span>
                          {contact.email && (
                            <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
                              {contact.email}
                            </span>
                          )}
                          <span className="text-xs text-gray-500 dark:text-gray-500">
                            {formatDate(contact.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <Badge
                          variant="outline"
                          className="text-xs px-2 py-1 gap-1 border-green-400 text-green-700 dark:border-green-600 dark:text-green-300 bg-white dark:bg-black whitespace-nowrap"
                        >
                          <CheckCircle className="w-3 h-3" />
                          Friend
                        </Badge>

                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMessage(contact)}
                            // ✅ Optional: Disable button if chat store not ready
                            disabled={!isChatStoreReady}
                            className="hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-800 dark:hover:text-blue-200 transition-colors p-1.5 border border-gray-300 dark:border-gray-700 h-8 w-8"
                            title={isChatStoreReady ? "Send message" : "Loading..."}
                          >
                            <MessageCircle className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveContact(contact._id)}
                            disabled={actionLoading === contact._id}
                            className="hover:bg-red-100 dark:hover:bg-red-900 hover:text-red-800 dark:hover:text-red-200 transition-colors p-1.5 border border-gray-300 dark:border-gray-700 h-8 w-8"
                            title="Remove contact"
                          >
                            {actionLoading === contact._id ? (
                              <Loader2 className="w-3 h-3 animate-spin text-black dark:text-white" />
                            ) : (
                              <UserRoundX className="w-3 h-3 text-red-600 dark:text-red-400" />
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
                    {searchTerm ? "No contacts found" : "No contacts yet"}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-sm">
                    {searchTerm
                      ? `No contacts match "${searchTerm}". Try a different search term.`
                      : "You don't have any contacts yet. Add friends to start chatting with them."}
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