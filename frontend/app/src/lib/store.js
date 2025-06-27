"use client";

import { combineReducers, configureStore } from "@reduxjs/toolkit";

// Import slices
import authSlice from "./features/auth/authSlice";
import trainingsSlice from "./features/trainings/trainingsSlice";

const rootReducer = combineReducers({
  auth: authSlice,
  trainings: trainingsSlice,
});

export const store = configureStore({
  reducer: rootReducer,
});
