import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { conversationApi, mediaApi } from "./api";

type Conversation = {
  id: number;
  name: string;
  model: string;
  created_at: string;
  updated_at: string;
  messageCount: number;
};

type Conversations = {
  id: number;
  name: string;
  model: string;
  created_at: string;
  updated_at: string;
  messageCount: number;
};
type ConversationDetail = {
  id: number;
  name: string;
  model: string;
  created_at: string;
  updated_at: string;
  messages: Message[];
};

// type ConversationDet = {
//   id: number;
//   name: string;
//   model: string;
//   created_at: string;
//   updated_at: string;
//   message: Message[];
// };

type Media = {
  base64: string;
  fileName: string;
  mimeType: string;
};

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  mediaUrls: Array<any>;
};

type chatState = {
  conversation: Conversations[];
  currentConversation: {
    id: number;
    name: string;
    model: string;
    messages: Message[];
    media?: Media;
  } | null;
  isLoading: boolean;
  error?: string;
};

const initialState: chatState = {
  conversation: [],
  currentConversation: null,
  isLoading: true,
};

export const createConversation = createAsyncThunk<
  {
    success: boolean;
    conversation: Conversation;
  },
  { name: string; model: string }
>("chat/create", async (payload) => {
  const { data } = await conversationApi.create(payload);
  console.log("Conversation create : ", data, "payload:", payload);

  return data;
});

export const getConversations = createAsyncThunk<{
  conversations: Conversation[];
}>("chat/conversations", async () => {
  const { data } = await conversationApi.getAll();
  console.log("All conversations:", data);
  return data;
});

export const getConversationById = createAsyncThunk<
  {
    conversation: ConversationDetail;
  },
  number
>("chat/getConversation", async (id) => {
  const { data } = await conversationApi.getById(id);
  console.log("Conversation by id:", data);
  return data;
});

export const sendMessage = createAsyncThunk<
  {
    success: boolean;
    message: Message;
    messageCount: number;
  },
  {
    id: number;
    message: string;
    media?: Array<any>;
  }
>("chat/sendMessage", async (payload) => {
  const { data } = await conversationApi.sendMessage(payload.id, {
    message: payload.message,
    media: payload.media,
  });
  console.log("send message", data);
  return data;
});

export const deleteConversationById = createAsyncThunk<number, number>(
  "chat/deleteById",
  async (id) => {
    const { data } = await conversationApi.deleteById(id);
    console.log("Delete:", id, data);
    return id;
  }
);

export const uploadMedia = createAsyncThunk<
  { url: string; fileName: string; fileType: string; fileSize: number },
  {
    base64: string;
    fileName?: string;
    mimType?: string;
  }
>("chat/uploadMedia", async (payload) => {
  const { data } = await mediaApi.uploadMedia(payload);
  return data;
});

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    appendLocalMessage: (
      s,
      a: PayloadAction<{
        role: "user" | "assistant";
        content: string;
        media?: Array<{ preview: string; fileName: string }>;
      }>
    ) => {
      const tempMessage: Message = {
        id: Date.now(),
        role: a.payload.role,
        content: a.payload.content,
        mediaUrls: a.payload.media,
        timestamp: new Date().toISOString(),
      };
      s.currentConversation?.messages.push(tempMessage);
    },
    resetAll: (s) => {
      s.conversation = [];
    },
  },
  extraReducers: (b) => {
    b.addCase(createConversation.pending, (s) => {
      s.isLoading = true;
    })
      .addCase(createConversation.fulfilled, (s, a) => {
        s.isLoading = false;
        s.conversation.unshift(a.payload.conversation);
        // s.currentConversation = a.payload.conversation;
        s.currentConversation = { ...a.payload.conversation, messages: [] };
      })
      .addCase(createConversation.rejected, (s, a) => {
        s.isLoading = false;
      })
      .addCase(sendMessage.pending, (s, a) => {
        s.isLoading = true;
      })
      .addCase(sendMessage.fulfilled, (s, a) => {
        s.error = undefined;
        if (s.currentConversation) {
          s.currentConversation.messages.push(a.payload.message);
          s.isLoading = false;
          console.log("Send");
        }
      })
      .addCase(getConversations.pending, (s, a) => {
        s.isLoading = true;
      })
      .addCase(getConversations.fulfilled, (s, a) => {
        s.isLoading = false;
        // s.conversation = a.payload.conversations.filter(
        //   (conv) => conv.messageCount > 0
        // );

        s.conversation = a.payload.conversations;
      })
      .addCase(getConversationById.pending, (s) => {
        s.isLoading = true;
      })
      .addCase(getConversationById.fulfilled, (s, a) => {
        s.isLoading = false;
        s.currentConversation = a.payload.conversation;
      })
      .addCase(deleteConversationById.pending, (s) => {
        s.isLoading = true;
      })
      .addCase(deleteConversationById.fulfilled, (s, a) => {
        s.isLoading = false;
        s.conversation = s.conversation.filter((conv) => conv.id !== a.payload);
        //abbiamo ritornati id, quinid payload output è id: action.payload diventa id
      })
      .addCase(uploadMedia.pending, (s, a) => {
        s.isLoading = true;
      })
      .addCase(uploadMedia.fulfilled, (s, a) => {
        s.isLoading = false;
        // s.currentConversation?.media ;
      });
  },
});

export const { appendLocalMessage, resetAll } = chatSlice.actions;
export default chatSlice.reducer;
