import axios from "axios";

export const API_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080/api";
export const IMAGE_SERVER = process.env.NEXT_PUBLIC_IMAGE_SERVER || "http://localhost:8080/static";

// The session lives in an httpOnly cookie, so every request is sent with
// credentials and the token is never handled in JavaScript.
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Endpoints whose 401 is an expected answer rather than an expired session.
const AUTH_ENDPOINTS = ["/auth/profile", "/auth/login", "/auth/register", "/auth/change-password"];

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || "";

    if (
      status === 401 &&
      typeof window !== "undefined" &&
      !AUTH_ENDPOINTS.some((endpoint) => url.endsWith(endpoint)) &&
      !window.location.pathname.startsWith("/giris-yap")
    ) {
      const next = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.assign(`/giris-yap?next=${next}`);
    }

    return Promise.reject(error);
  }
);

/** User-facing message of an API error. */
export const errorMessage = (error, fallback = "Bir hata oluştu. Lütfen tekrar deneyin.") => {
  if (error?.response?.data?.error) return error.response.data.error;
  if (error?.code === "ERR_NETWORK") return "Sunucuya ulaşılamadı. İnternet bağlantınızı kontrol edin.";
  return fallback;
};

/** Field errors ({ field: message }) of an API validation error. */
export const fieldErrors = (error) => error?.response?.data?.details || {};

/** Absolute URL of a file served by the API (e.g. "images/web-dev-101.jpg"). */
export const imageUrl = (path) => (path ? `${IMAGE_SERVER}/${String(path).replace(/^\/+/, "")}` : null);

export default api;
