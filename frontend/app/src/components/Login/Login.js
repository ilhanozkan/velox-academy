"use client";

import { useState } from "react";

import { AuthenticationTitle } from "@/components/AuthenticationTitle/AuthenticationTitle";
import { userLoginAPI } from "@/lib/features/auth/authSlice";
import { useAppStore } from "@/lib/hooks";

const Login = () => {
  const store = useAppStore();

  const [values, setValues] = useState({
    email: "",
    password: "",
  });

  const handleLogin = () => {
    store.dispatch(userLoginAPI(values)).then((res) => {
      // Redirect to dashboard after 1 second
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    });
  };

  return (
    <AuthenticationTitle
      title="Giriş Yap"
      handleLogin={handleLogin}
      values={values}
      setValues={setValues}
    />
  );
};

export default Login;
