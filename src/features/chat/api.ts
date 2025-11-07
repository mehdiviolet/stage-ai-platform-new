import { api } from "../../lib/api/client";
import type { createConversation } from "./types";

export const authApi = {
  register: (payload: { email: string; password: string; fullName: string }) =>
    api.post("/auth/register", payload),
  login: (payload: { email: string; password: string }) =>
    api.post("/auth/login", payload),
  me: () => api.get("/auth/me"),
};

export const conversationApi = {
  create: (payload: { name: string; model: string }) => {
    return api.post("/conversations/create", payload);
  },
  sendMessage: (id: number, payload: { message: string; media?: Array<any> }) =>
    api.post(`/conversations/${id}/message`, payload),
  //Get all conversations
  getAll: () => api.get("/conversations"),
  //Get conversation By ID
  getById: (id: number) => api.get(`/conversations/${id}`),
  //Delete Conversation By ID
  deleteById: (id: number) => api.delete(`/conversations/${id}`),
};

// Non è servito perché /conversations/{id}/message - Invia messaggio + media
export const mediaApi = {
  uploadMedia: (payload: {
    base64: string;
    fileName?: string;
    mimType?: string;
  }) => {
    return api.post("/media/upload", payload);
  },
};

/////////practice again:////////////////////////
// export const authApii = {
//   register: (payload: {
//     email: string;
//     password: string;
//     fullName: string;
//   }) => {
//     return api.post("/auth/register", payload);
//   },
//   login: (payload: { emai: string; password: string }) => {
//     return api.post("/auth/login", payload);
//   },
//   getProfile: () => {
//     return api.get("/auth/me");
//   },
// };

// export const conversationApii = {
//   createConversation: (payload: { name: string; model: string }) => {
//     return api.post("/conversations/create", payload);
//   },

//   getConversations: () => {
//     return api.get("/conversations");
//   },

//   getConversationsById: (id: number) => {
//     return api.get(`/conversations/${id}`);
//   },

//   deleteConversationsById: (id: number) => {
//     return api.delete(`/conversations/${id}`);
//   },
//   sendMessage: (id: number, payload: { message: string; media?: any[] }) => {
//     return api.post(`/conversations/${id}/message`, payload);
//   },
// };

//////////////////////////////////////////////////////
