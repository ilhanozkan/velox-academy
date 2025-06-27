import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001";

export const getSandboxDetails = createAsyncThunk(
  "trainings/getSandboxDetails",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/trainings/${id}/sandbox`,
        {
          withCredentials: true,
        }
      );
      return { id, sandboxData: response.data.sandbox };
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Sandbox detayları alınamadı";
      return rejectWithValue(errorMessage);
    }
  }
);

export const enrollInTraining = createAsyncThunk(
  "trainings/enrollInTraining",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/trainings/${id}/enroll`,
        {},
        {
          withCredentials: true,
        }
      );
      return { id, sandboxData: response.data.enrollment.sandbox };
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Eğitime kayıt olurken hata oluştu";
      return rejectWithValue(errorMessage);
    }
  }
);

const initialState = {
  sandboxDetails: {},
  loading: false,
  error: null,
};

const trainingsSlice = createSlice({
  name: "trainings",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSandboxDetails: (state) => {
      state.sandboxDetails = {};
    },
  },
  extraReducers: (builder) => {
    builder
      // Get sandbox details
      .addCase(getSandboxDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSandboxDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.sandboxDetails[action.payload.id] = action.payload.sandboxData;
      })
      .addCase(getSandboxDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Enroll in training
      .addCase(enrollInTraining.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(enrollInTraining.fulfilled, (state, action) => {
        state.loading = false;
        state.sandboxDetails[action.payload.id] = action.payload.sandboxData;
      })
      .addCase(enrollInTraining.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSandboxDetails } = trainingsSlice.actions;

export default trainingsSlice.reducer;
