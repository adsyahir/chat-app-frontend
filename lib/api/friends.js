import { authenticatedClientFetch } from "./client.js";

export const friendsAPI = {
    getExistingChattedFriends: async (id) => {
        return await authenticatedClientFetch(`api/friends/get-existing-chatted-friends`, {
          method: "GET",
        });
      },
}