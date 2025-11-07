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

type ConversationDetail = {
  id: number;
  name: string;
  model: string;
  created_at: string;
  updated_at: string;
  messages: Message[];
};

//NON serve media types qui! perché useremo direttamente in ChatPage!
// type Media = {
//   base64: string;
//   fileName?: string;
//   mimeType?: string;
// };

type ChatState = {
  conversations: Conversation[];
  currentConversation: {
    id: number;
    name: string;
    model: string;
    messages: Message[];
    // media?: Media;
  } | null;
  loading: boolean;
  error?: string;
};

export const createConversation = createAsyncThunk<
  { success: boolean; conversation: Conversation },
  { name: string; model: string }
>("chat/createConversation", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await conversationApi.create(payload);
    return data;
  } catch (error: any) {
    console.log(error);
    return rejectWithValue(
      error.response?.data?.message || "converstion failed!"
    );
  }
});

export const loadConversations = createAsyncThunk<{
  conversations: Conversation[];
}>("chat/loadConversations", async (_, { rejectWithValue }) => {
  try {
    const { data } = await conversationApi.getAll();
    return data;
  } catch (error: any) {
    console.log(error);
    return rejectWithValue(
      error.response?.data?.message || "load converstion failed!"
    );
  }
});

export const loadConversationById = createAsyncThunk<
  {
    conversation: ConversationDetail;
  },
  number
>("chat/loadConversationById", async (id, { rejectWithValue }) => {
  try {
    const { data } = await conversationApi.getById(id);
    return data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Load failed!");
  }
});

export const deleteById = createAsyncThunk<number, number>(
  "chat/deleteConversation",
  async (id, { rejectWithValue }) => {
    try {
      await conversationApi.deleteById(id);
      return id;
    } catch (error: any) {
      console.log(error);
      return rejectWithValue(
        error.response?.data?.message || "deleted failed!"
      );
    }
  }
);

export const sendMessage = createAsyncThunk<
  {
    success: boolean;
    conversation: Conversation;
    message: Message;
    messageCount: number;
  },
  {
    conversationId: number;
    message: string;
    media?: any[];
  }
>("chat/sendMessage", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await conversationApi.sendMessage(payload.conversationId, {
      message: payload.message,
      media: payload.media,
    });
    console.log(data);

    return data;
  } catch (error: any) {
    console.log(error);
    return rejectWithValue(
      error.response?.data?.message || "send message failed!"
    );
  }
});

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
        //createConversation ritorna conversazione senza messages, Tu aggiungi messages: [] manualmente per inizializzare
        s.currentConversation = { ...a.payload.conversation, messages: [] };
      })
      .addCase(createConversation.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload as string;
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
        s.error = a.payload as string;
      })
      .addCase(loadConversations.pending, (s) => {
        s.loading = true;
      })
      .addCase(loadConversations.fulfilled, (s, a) => {
        s.loading = false;
        s.conversations = a.payload.conversations;
      })
      .addCase(loadConversations.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload as string;
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
        s.error = a.payload as string;
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
