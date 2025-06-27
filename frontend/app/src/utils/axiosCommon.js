"use client";
import axios from "axios";

import { cookieUtils } from "@/hooks/useCookie";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
  headers: {
    "Content-type": "application/json",
  },
  withCredentials: true,
});

export default axiosInstance;
