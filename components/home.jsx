"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import {
  ArrowLeft,
  CheckCircle,
  Loader2,
  Mail,
  MessageCircle,
  Phone,
  Search,
  UserRoundX,
  Users,
} from "lucide-react";
import { useChatStore } from "@/lib/chatStore";
import { useAuthStore } from "@/lib/authStore";

export default function HomePage() {
  const { user, userId, isAuthenticated, isLoading, _hasHydrated } = useAuthStore();
  
  // Always call useChatStore at the top level - this is crucial!
  const chatStore = useChatStore();
  
  console.log('userId', userId);
  console.log('test',chatStore.selectedContact);
  // Only render content after hydration is complete


  return (
    <SidebarHeader className="gap-4 border-b p-4 bg-white dark:bg-black border-gray-200 dark:border-gray-800">
    <div className="flex w-full items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-gray-100 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <Users className="w-5 h-5 text-black dark:text-white" />
        </div>
        <div>
          <div className="text-black dark:text-white text-lg font-semibold">
            Home
          </div>
          {/* <div className="text-sm text-gray-600 dark:text-gray-400">
            {contactList.length} contact
            {contactList.length !== 1 ? "s" : ""}
          </div> */}
        </div>
      </div>
      {/* {contactList.length > 0 && (
        <Badge
          variant="secondary"
          className="bg-black text-white dark:bg-white dark:text-black border border-gray-300 dark:border-gray-700"
        >
          {contactList.length}
        </Badge>
      )} */}
    </div>

    {/* Search Input */}
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
      <Input
        placeholder="Search contacts..."
        // value={searchTerm}
        // onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-10 bg-white dark:bg-black border-gray-300 dark:border-gray-700 focus:border-gray-500 dark:focus:border-gray-500"
      />
    </div>
  </SidebarHeader>
  )
  //   {/* <div>
  //     <p>User ID: {userId}</p>
  //     {isAuthenticated && chatStore && chatStore.selectedContact && (
  //       <div>
  //         <p>Selected contact: {chatStore.selectedContact.username}</p>
  //         <p>Email: {chatStore.selectedContact.email}</p>
  //         <p>ID: {chatStore.selectedContact._id}</p>
  //       </div>
  //     )}
  //     {isAuthenticated && chatStore && !chatStore.selectedContact && (
  //       <div>
  //         <p>No contact selected</p>
  //       </div>
  //     )}
  //   </div>
  // ); */}
}
  // const filteredContacts = contacts.filter((contact) => {
  //   const term = searchTerm.toLowerCase();
  //   const username = contact?.username?.toLowerCase?.() || "";
  //   const email = contact?.email?.toLowerCase?.() || "";
  //   return username.includes(term) || email.includes(term);
  // });

  // // Get selected contact and related data
  // const selectedContact = chatStoreResult.store?.selectedContact || null;
  // const selectedContactExists =
  //   selectedContact && contacts.some((c) => c._id === selectedContact?._id);
  //   const matchedContact =
  //   selectedContactExists &&
  //   contacts.find((c) => c._id === selectedContact?._id);

  // // ALWAYS call useEffect hooks at the same position
  // // Debug logging effect
  // useEffect(() => {
  //   console.group("🔍 HomePage Debug Info");
  //   console.log("Auth Store:", {
  //     user: authStore.user,
  //     isAuthenticated: authStore.isAuthenticated,
  //     isLoading: authStore.isLoading,
  //     _hasHydrated: authStore._hasHydrated,
  //   });
  //   console.log("Chat Store Result:", chatStoreResult);
  //   console.groupEnd();
  // }, [authStore, chatStoreResult]);

  // // Clear selected contact if it no longer exists in contacts
  // useEffect(() => {
  //   if (
  //     selectedContact &&
  //     !selectedContactExists &&
  //     chatStoreResult.store?.clearSelectedContact
  //   ) {
  //     chatStoreResult.store.clearSelectedContact();
  //   }
  // }, [selectedContact, selectedContactExists, chatStoreResult.store]);

  // // Helper functions - these don't use hooks so they're safe to define here
  // const formatDate = (dateString) => {
  //   const date = new Date(dateString);
  //   const now = new Date();
  //   const diffTime = Math.abs(now - date);
  //   const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  //   if (diffDays === 1) return "Added today";
  //   if (diffDays === 2) return "Added yesterday";
  //   if (diffDays <= 7) return `Added ${diffDays - 1} days ago`;

  //   return `Added ${date.toLocaleDateString()}`;
  // };

  // const handleSelectContact = (contact) => {
  //   if (chatStoreResult.store?.setSelectedContact) {
  //     chatStoreResult.store.setSelectedContact(contact);
  //   }
  // };

  // const handleBackToContacts = () => {
  //   if (chatStoreResult.store?.clearSelectedContact) {
  //     chatStoreResult.store.clearSelectedContact();
  //   }
  // };

  // const handleClearStores = () => {
  //   clearAllUserStores();
  //   toast.success("All user stores cleared");
  // };

  // const handleLogout = () => {
  //   authStore.clearUser();
  //   clearAllUserStores();
  //   toast.success("Logged out successfully");
  // };

  // // Show error if store is not available
  // if (!chatStoreResult.store) {
  //   // Show loading spinner initially
  //   return (
  //     <div className="flex items-center justify-center p-8">
  //       <div className="text-center text-gray-600 dark:text-gray-400">
  //         <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
  //         <p>Preparing chat store...</p>
  //       </div>
  //     </div>
  //   );
  // }

  // const { userId, userName } = chatStoreResult.store;

  // console.log("✅ Store is ready! Selected contact:", selectedContact);
  // console.log("✅ User ID:", userId);

  // Show selected contact view
  // // if (matchedContact) {
  //   return (
  //     <>
  //       {/* <SidebarHeader className="gap-4 border-b p-4 bg-white dark:bg-black border-gray-200 dark:border-gray-800">
  //         <div className="flex w-full items-center justify-between">
  //           <div className="flex items-center gap-3">
  //             <Button variant="ghost" size="sm" onClick={handleBackToContacts}>
  //               <ArrowLeft className="w-4 h-4" />
  //             </Button>
  //             <Avatar className="w-10 h-10">
  //               <AvatarImage src={matchedContact.avatar} />
  //               <AvatarFallback>
  //                 {matchedContact.username
  //                   .split(" ")
  //                   .map((n) => n[0])
  //                   .join("")}
  //               </AvatarFallback>
  //             </Avatar>
  //             <div>
  //               <div className="text-lg font-semibold text-black dark:text-white">
  //                 {matchedContact.username}
  //               </div>
  //               <div className="text-sm text-gray-600 dark:text-gray-400">
  //                 {matchedContact.email}
  //               </div>
  //             </div>
  //           </div>
  //           <Badge
  //             variant="outline"
  //             className="text-xs border-green-400 text-green-700 dark:border-green-600 dark:text-green-300 bg-white dark:bg-black whitespace-nowrap"
  //           >
  //             <CheckCircle className="w-3 h-3" /> Online
  //           </Badge>
  //         </div>
  //         <div className="flex gap-2">
  //           <Button variant="outline" size="sm" onClick={handleLogout}>
  //             Logout
  //           </Button>
  //         </div>
  //       </SidebarHeader>

  //       <SidebarContent>
  //         <SidebarGroup>
  //           <SidebarGroupContent className="px-4 py-8 text-center">
  //             <div className="p-4 rounded-full mb-4 bg-muted">
  //               <MessageCircle className="w-8 h-8" />
  //             </div>
  //             <h3 className="text-lg font-medium mb-2 text-black dark:text-white">
  //               Start chatting with {matchedContact.username}
  //             </h3>
  //             <p className="text-sm text-muted-foreground">
  //               This is where your chat interface will go.
  //             </p>
  //             <div className="mt-4 flex justify-center gap-2">
  //               <Button variant="outline" size="sm">
  //                 <Phone className="w-4 h-4" /> Call
  //               </Button>
  //               <Button variant="outline" size="sm">
  //                 <Mail className="w-4 h-4" /> Email
  //               </Button>
  //             </div>
  //           </SidebarGroupContent>
  //         </SidebarGroup>
  //       </SidebarContent> */}
  //     </>
  //   );
  // }

  // Show contacts list view
//   return (
//     <>
//       {/* <SidebarHeader className="gap-4 border-b p-4 bg-white dark:bg-black border-gray-200 dark:border-gray-800">
//         <div className="flex justify-between items-center">
//           <div className="flex items-center gap-2">
//             <div className="p-2 bg-gray-100 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
//               <Users className="w-5 h-5 text-black dark:text-white" />
//             </div>
//             <div>
//               <div className="text-lg font-semibold text-black dark:text-white">
//                 Chatter
//               </div>
//               <div className="text-sm text-gray-600 dark:text-gray-400">
//                 {contacts.length} chat{contacts.length !== 1 ? "s" : ""} • User:{" "}
//                 {userName || userId}
//               </div>
//             </div>
//           </div>
//           <div className="flex items-center gap-2">
//             {contacts.length > 0 && (
//               <Badge
//                 variant="secondary"
//                 className="bg-black text-white dark:bg-white dark:text-black border border-gray-300 dark:border-gray-700"
//               >
//                 {contacts.length}
//               </Badge>
//             )}
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={handleClearStores}
//               className="text-xs"
//             >
//               Clear Stores
//             </Button>
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={handleLogout}
//               className="text-xs"
//             >
//               Logout
//             </Button>
//           </div>
//         </div>

//         <div className="relative mt-2">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
//           <Input
//             placeholder="Search contacts..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="pl-10 bg-white dark:bg-black border-gray-300 dark:border-gray-700 focus:border-gray-500 dark:focus:border-gray-500"
//           />
//         </div>
//       </SidebarHeader>

//       <SidebarContent>
//         <SidebarGroup> */}
//       {/* <SidebarGroupContent className="px-2 py-4">
//             {filteredContacts.length > 0 ? (
//               filteredContacts.map((contact) => (
//                 <div
//                   key={contact._id}
//                   onClick={() => handleSelectContact(contact)}
//                   className={`cursor-pointer p-3 rounded-xl border transition-all bg-white dark:bg-black hover:shadow-sm hover:border-gray-500 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900 ${
//                     selectedContact?._id === contact._id
//                       ? "border-blue-500 bg-blue-50 dark:bg-blue-900"
//                       : "border-gray-300 dark:border-gray-700"
//                   }`}
//                 >
//                   <div className="flex items-center gap-3">
//                     <Avatar className="w-10 h-10 ring-2 ring-gray-300 dark:ring-gray-700 group-hover:ring-gray-500 dark:group-hover:ring-gray-500 transition-all duration-200 flex-shrink-0">
//                       <AvatarImage src={contact.avatar} />
//                       <AvatarFallback className="bg-black text-white dark:bg-white dark:text-black font-medium border border-gray-300 dark:border-gray-700">
//                         {contact.username
//                           .split(" ")
//                           .map((n) => n[0])
//                           .join("")}
//                       </AvatarFallback>
//                     </Avatar>
//                     <div className="flex-1 min-w-0">
//                       <div className="font-medium truncate text-black dark:text-white group-hover:text-gray-900 dark:group-hover:text-gray-100">
//                         {contact.username}
//                       </div>
//                       <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
//                         {contact.email}
//                       </div>
//                       <div className="text-xs text-gray-500 dark:text-gray-500">
//                         {formatDate(contact.createdAt)}
//                       </div>
//                     </div>
//                     <Badge
//                       variant="outline"
//                       className="text-xs px-2 py-1 gap-1 border-green-400 text-green-700 dark:border-green-600 dark:text-green-300 bg-white dark:bg-black whitespace-nowrap"
//                     >
//                       <CheckCircle className="w-3 h-3" />
//                       Friend
//                     </Badge>
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <div className="flex flex-col items-center justify-center py-12 px-4">
//                 <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-full mb-4 border border-gray-300 dark:border-gray-700">
//                   <Users className="w-8 h-8 text-gray-600 dark:text-gray-400" />
//                 </div>
//                 <h3 className="text-lg font-medium text-black dark:text-white mb-2">
//                   {searchTerm ? "No contacts found" : "No contacts yet"}
//                 </h3>
//                 <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-sm">
//                   {searchTerm
//                     ? `No contacts match "${searchTerm}". Try a different search term.`
//                     : "You don't have any contacts yet. Add friends to start chatting with them."}
//                 </p>
//               </div>
//             )}
//           </SidebarGroupContent> */}
//       {/* </SidebarGroup>
//       </SidebarContent> */}
//     </>
//   );
// }
