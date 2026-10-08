import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./features/auth/authSlice";

export const makeStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
    },
  });
