import Invitation from "@/components/invitation";
import { authenticatedServerFetch } from "@/lib/api";

const getPendingFriendRequests = async () => {
    try {
      const users = await authenticatedServerFetch(
        `http://localhost:8000/api/friends/pending-requests`
      );
      console.log("Pending friend requests:", users);
      return users;
    } catch (error) {
      console.error("Error fetching pending friend requests:", error);
      return [];
    }
  };
  

export default async function InvitationsPage() {
  const pendingRequests = await getPendingFriendRequests();

  return <Invitation pendingRequests={pendingRequests} />;
}
