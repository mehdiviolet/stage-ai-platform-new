import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { authApi } from "../chat/api";
import { local } from "../../lib/storage/local";

type User = {
  id: number;
  email: string;
  fullName: string;
  isActive: boolean;
  createdAt: string;
  lastLogin: string;
};

type RegisterRespnse = {
  user: User;
  success: boolean;
  message: string;
};

type LoginResponse = {
  success: boolean;
  message: string;
  token: string;
  user: User; // ← riusa User
};

type MeResponse = {
  success: boolean;
  user: User; // ← riusa User
};

type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error?: string;
};

const initialState: AuthState = {
  user: null,
  token: local.get("token") || null,
  isAuthenticated: false,
  loading: false,
};

export const registerUser = createAsyncThunk<
  RegisterRespnse,
  { email: string; password: string; fullName: string }
>("auth/register", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await authApi.register(payload);
    return data; // Ritorna { success, message, user }
  } catch (error: any) {
    console.log(error);
    return rejectWithValue(error.response?.data?.message || "Error register!");
  }
});

export const logUser = createAsyncThunk<
  LoginResponse,
  { email: string; password: string }
>("auth/login", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await authApi.login(payload);
    return data; //action.payload in fullfilled
  } catch (error: any) {
    console.log(error);
    return rejectWithValue(
      error.response?.data?.message || "Credenziali non valide!"
    );
  }
});

export const checkAuth = createAsyncThunk<MeResponse>(
  "auth/me",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await authApi.me();
      return data;
    } catch (error: any) {
      console.log(error);
      return rejectWithValue(
        error.response?.data?.message || "Non autenticato!"
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (s) => {
      s.error = undefined;
    },
    logout: (s) => {
      s.user = null;
      s.user = null;
      s.isAuthenticated = false;
      local.del("token");
    },
  },
  //LOGIN
  extraReducers: (b) => {
    b.addCase(logUser.pending, (s) => {
      s.loading = true;
    })
      .addCase(logUser.fulfilled, (s, a) => {
        s.loading = false;
        s.user = a.payload.user;
        s.token = a.payload.token;
        s.isAuthenticated = true;

        local.set("token", a.payload.token);
      })
      .addCase(logUser.rejected, (s, a) => {
        s.loading = false;
        s.isAuthenticated = false;
        s.error = a.payload as string; //messaggio user friendly
      })
      .addCase(registerUser.pending, (s) => {
        s.loading = true;
      })
      .addCase(registerUser.fulfilled, (s) => {
        s.loading = false;
        // Non fa login automatico, l'utente deve essere attivato dall'admin
      })
      .addCase(registerUser.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload as string;
      })
      .addCase(checkAuth.fulfilled, (s, a) => {
        s.loading = false;
        s.isAuthenticated = true;
        s.user = a.payload.user;
      });
  },
});

export default authSlice.reducer;

export const { clearError } = authSlice.actions;
