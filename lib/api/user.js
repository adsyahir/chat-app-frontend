import { authenticatedClientFetch } from "./client.js";

export const userAPI = {

    getUserById: async (id) => {
        return await authenticatedClientFetch(`api/users/get-user-by-id/${id}`, {
          method: "GET",
        });
      },
}