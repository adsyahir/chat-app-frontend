import { authenticatedClientFetch } from "./client.js";

export const chatAPI = {
  sendMessage: async (id, text, image = null) => {
    return await authenticatedClientFetch(`/api/message/send/${id}`, {
      method: "POST",
      body: JSON.stringify({ text, image }),
    });
  },
  getMessages: async (userToChatId) => {
    return await authenticatedClientFetch(`/api/message/get/${userToChatId}`, {
      method: "GET",
    });
  },
};
