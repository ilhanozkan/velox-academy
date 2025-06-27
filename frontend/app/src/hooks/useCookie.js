"use client";

import { useState, useCallback, useEffect } from "react";

/**
 * Custom hook for managing cookies
 * @param {string} name - Cookie name
 * @param {string} defaultValue - Default value if cookie doesn't exist
 * @returns {[string, function]} - [value, deleteCookie]
 */
export const useCookie = (name, defaultValue = "") => {
  const [value, setValue] = useState(defaultValue);

  const getCookie = useCallback((cookieName) => {
    if (typeof window === "undefined") return "";

    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${cookieName}=`);
    if (parts.length === 2) {
      return parts.pop().split(";").shift();
    }
    return "";
  }, []);

  const deleteCookie = useCallback((cookieName, options = {}) => {
    if (typeof window === "undefined") return;

    const { path = "/", domain } = options;

    let cookieString = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`;

    if (domain) {
      cookieString += `; domain=${domain}`;
    }

    document.cookie = cookieString;
    setValue("");
  }, []);

  useEffect(() => {
    const cookieValue = getCookie(name);
    setValue(cookieValue || defaultValue);
  }, [name, defaultValue, getCookie]);

  const removeCookie = useCallback(
    (options) => {
      deleteCookie(name, options);
    },
    [name, deleteCookie]
  );

  return [value, removeCookie];
};

export const cookieUtils = {
  get: (name) => {
    if (typeof window === "undefined") return "";

    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop().split(";").shift();
    }
    return "";
  },

  remove: (name, options = {}) => {
    if (typeof window === "undefined") return;

    const { path = "/", domain } = options;

    let cookieString = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`;

    if (domain) {
      cookieString += `; domain=${domain}`;
    }

    document.cookie = cookieString;
  },
};
