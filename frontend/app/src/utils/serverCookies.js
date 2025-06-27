import { cookies } from "next/headers";

/**
 * Server-side cookie utilities for Next.js
 */
export const serverCookieUtils = {
  /**
   * Get a cookie value on the server side
   * @param {string} name - Cookie name
   * @returns {string|null} - Cookie value or null if not found
   */
  get: (name) => {
    try {
      const cookieStore = cookies();
      const cookie = cookieStore.get(name);
      return cookie ? cookie.value : null;
    } catch (error) {
      console.error("Error getting server cookie:", error);
      return null;
    }
  },

  /**
   * Get all cookies as an object
   * @returns {Object} - Object with cookie names as keys and values as values
   */
  getAll: () => {
    try {
      const cookieStore = cookies();
      const allCookies = {};

      cookieStore.getAll().forEach((cookie) => {
        allCookies[cookie.name] = cookie.value;
      });

      return allCookies;
    } catch (error) {
      console.error("Error getting all server cookies:", error);
      return {};
    }
  },

  /**
   * Check if a cookie exists
   * @param {string} name - Cookie name
   * @returns {boolean} - True if cookie exists
   */
  has: (name) => {
    try {
      const cookieStore = cookies();
      return cookieStore.has(name);
    } catch (error) {
      console.error("Error checking server cookie:", error);
      return false;
    }
  },
};

/**
 * Parse cookies from request headers (fallback for when Next.js cookies() is not available)
 * @param {string} cookieHeader - Cookie header string
 * @returns {Object} - Parsed cookies object
 */
export const parseCookiesFromHeader = (cookieHeader) => {
  if (!cookieHeader) return {};

  const cookies = {};

  cookieHeader.split(";").forEach((cookie) => {
    const [name, ...rest] = cookie.split("=");
    const value = rest.join("=");

    if (name && value) {
      cookies[name.trim()] = decodeURIComponent(value.trim());
    }
  });

  return cookies;
};
