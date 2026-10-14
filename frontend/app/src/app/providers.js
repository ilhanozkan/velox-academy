"use client";

import { useEffect, useRef } from "react";
import { Provider, useDispatch } from "react-redux";
import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";

import { makeStore } from "@/lib/store";
import { fetchProfile } from "@/lib/features/auth/authSlice";
import { theme } from "@/app/theme/theme";

// Checks the session once when the app loads.
const AuthBootstrap = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  return children;
};

const Providers = ({ children }) => {
  // One store per browser session (the root layout never remounts).
  const storeRef = useRef(null);
  if (!storeRef.current) storeRef.current = makeStore();

  return (
    <Provider store={storeRef.current}>
      <MantineProvider theme={theme}>
        <ModalsProvider labels={{ confirm: "Onayla", cancel: "İptal Et" }}>
          <Notifications position="top-right" />
          <AuthBootstrap>{children}</AuthBootstrap>
        </ModalsProvider>
      </MantineProvider>
    </Provider>
  );
};

export default Providers;
