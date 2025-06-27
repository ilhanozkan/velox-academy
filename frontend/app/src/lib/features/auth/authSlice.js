import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { notifications } from "@mantine/notifications";

import { cookieUtils } from "@/hooks/useCookie";
import axiosInstance from "@/utils/axiosCommon";

const initialState = {
  user: {},
  loading: false,
};

export const userLoginAPI = createAsyncThunk(
  "authSlice/userLoginAPI",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance({
        method: "POST",
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/login`,
        data,
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.error);
    }
  }
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUserLogin: (state, action) => {
      state.user = action.payload;
    },
    handleLogout: (state) => {
      cookieUtils.remove("token");
      window.location.href = "/giris-yap";
    },
  },
  extraReducers: (builder) => {
    builder.addCase(userLoginAPI.fulfilled, (state, action) => {
      state.user = action.payload;
      state.loading = false;

      notifications.show({
        title: "Başarılı Giriş",
        message: "Başarıyla giriş yaptınız. Yönlendiriliyorsunuz...",
        color: "green",
      });
    });

    builder.addCase(userLoginAPI.rejected, (state, action) => {
      notifications.show({
        title: "Hata",
        message: action.payload,
        color: "red",
      });
      state.loading = false;
    });

    builder.addCase(userLoginAPI.pending, (state, action) => {
      state.loading = true;
    });
  },
});

// Selectors
export const getUser = (state) => state.auth.user;
export const getLoginLoading = (state) => state.auth.loading;

// Actions
export const { setUserLogin, handleLogout } = authSlice.actions;

// Default reducer
export default authSlice.reducer;
