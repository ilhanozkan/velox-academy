import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import api, { errorMessage, fieldErrors } from "@/lib/api";

// status: "idle" (not checked yet) | "loading" | "authenticated" | "unauthenticated"
const initialState = {
  user: null,
  status: "idle",
};

const rejectWith = (error, rejectWithValue) =>
  rejectWithValue({ message: errorMessage(error), fields: fieldErrors(error) });

export const fetchProfile = createAsyncThunk("auth/fetchProfile", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/auth/profile");
    return data.user;
  } catch (error) {
    return rejectWith(error, rejectWithValue);
  }
});

export const login = createAsyncThunk("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/auth/login", credentials);
    return data.user;
  } catch (error) {
    return rejectWith(error, rejectWithValue);
  }
});

export const register = createAsyncThunk("auth/register", async (values, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/auth/register", values);
    return data.user;
  } catch (error) {
    return rejectWith(error, rejectWithValue);
  }
});

export const logout = createAsyncThunk("auth/logout", async () => {
  // The session cookie is httpOnly: only the server can remove it.
  await api.post("/auth/logout").catch(() => {});
});

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = "authenticated";
      })
      .addCase(fetchProfile.rejected, (state) => {
        state.user = null;
        state.status = "unauthenticated";
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.status = "unauthenticated";
      });

    for (const thunk of [login, register]) {
      builder.addCase(thunk.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = "authenticated";
      });
    }
  },
});

// Selectors
export const selectUser = (state) => state.auth.user;
export const selectAuthStatus = (state) => state.auth.status;
export const selectIsAdmin = (state) => state.auth.user?.role === "admin";

// Actions
export const { setUser } = authSlice.actions;

// Default reducer
export default authSlice.reducer;
