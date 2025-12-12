import { authenticatedClientFetch } from "./client.js";

export const chatAPI = {
  sendMessage: async (id, text, image = null, encryptionData = null) => {
    const body = { text, image };

    // Add encryption metadata if present
    if (encryptionData) {
      body.nonce = encryptionData.nonce;
      body.encrypted = true;
    }

    return await authenticatedClientFetch(`/api/message/send/${id}`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
  getMessages: async (userToChatId) => {
    return await authenticatedClientFetch(`/api/message/get/${userToChatId}`, {
      method: "GET",
    });
  },
};
