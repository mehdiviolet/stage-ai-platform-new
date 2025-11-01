import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { conversationApi } from "./api";

type Conversation = {
  id: number;
  name: string;
  model: string;
  created_at: string;
  updated_at: string;
  messageCount: number;
};

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  mediaUrls?: string[];
};

type ChatState = {
  conversations: Conversation[];
  currentConversation: {
    id: number;
    name: string;
    model: string;
    messages: Message[];
  } | null;
  loading: boolean;
  error?: string;
};
export const createConversation = createAsyncThunk(
  "chat/createConversation",
  async (payload: { name: string; model: string }) => {
    const { data } = await conversationApi.create(payload);
    return data;
  }
);

export const loadConversations = createAsyncThunk(
  "chat/loadConversations",
  async () => {
    const { data } = await conversationApi.getAll();
    return data;
  }
);

export const loadConversationById = createAsyncThunk(
  "chat/loadConversationById",
  async (conversationById: number) => {
    const { data } = await conversationApi.getById(conversationById);
    return data;
  }
);

export const deleteById = createAsyncThunk(
  "chat/deleteConversation",
  async (id: number) => {
    const { data } = await conversationApi.deleteById(id);
    return data;
  }
);

export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async (payload: {
    conversationId: number;
    message: string;
    media?: any[];
  }) => {
    const { data } = await conversationApi.sendMessage(payload.conversationId, {
      message: payload.message,
    });
    console.log(data);

    return data;
  }
);

const initialState: ChatState = {
  currentConversation: null,
  conversations: [],
  loading: false,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    appendLocalMessage: (
      s,
      a: PayloadAction<{
        role: "user" | "assistant";
        content: string;
        mediaUrls?: string[];
      }>
    ) => {
      if (s.currentConversation) {
        s.currentConversation?.messages.push({
          id: Date.now(),
          timestamp: new Date().toISOString(),
          ...a.payload,
        });
      }
    },
  },
  extraReducers: (b) => {
    //create conversation
    b.addCase(createConversation.pending, (s) => {
      s.loading = true;
    })
      .addCase(createConversation.fulfilled, (s, a) => {
        s.loading = false;
        s.conversations.unshift(a.payload.conversation);
        s.currentConversation = { ...a.payload.conversation, messages: [] };
      })
      .addCase(createConversation.rejected, (s, a) => {
        s.loading = false;
        s.error = a.error.message;
      })
      //send message
      .addCase(sendMessage.pending, (s) => {
        s.loading = true;
      })
      .addCase(sendMessage.fulfilled, (s, a) => {
        if (s.currentConversation) {
          s.currentConversation.messages.push(a.payload.message);
          s.loading = false;
        }
      })
      .addCase(sendMessage.rejected, (s, a) => {
        s.loading = false;
        s.error = a.error.message;
      })
      .addCase(loadConversations.pending, (s) => {
        s.loading = true;
      })
      .addCase(loadConversations.fulfilled, (s, a) => {
        s.loading = false;
        s.conversations = a.payload.conversations;
      })
      .addCase(loadConversations.rejected, (s, a) => {
        s.loading = true;
        s.error = a.error.message;
      })
      .addCase(loadConversationById.pending, (s) => {
        s.loading = true;
      })
      .addCase(loadConversationById.fulfilled, (s, a) => {
        s.loading = false;
        s.currentConversation = a.payload.conversation;
      })
      .addCase(loadConversationById.rejected, (s, a) => {
        s.loading = false;
        s.error = a.error.message;
      })
      .addCase(deleteById.pending, (s) => {
        s.loading = true;
      })
      .addCase(deleteById.fulfilled, (s, a) => {
        s.loading = false;
        s.conversations = s.conversations.filter((c) => c.id !== a.payload);
        if (s.currentConversation?.id === a.payload) {
          s.currentConversation = null;
        }
      });
  },
});

export const { appendLocalMessage } = chatSlice.actions;

export default chatSlice.reducer;
