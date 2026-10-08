"use client";

import { useCallback, useState } from "react";

const read = (key, fallback) => {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
};

/**
 * useState that is remembered in localStorage (per browser). Only use it in
 * components that render on the client, since the initial value is read
 * synchronously.
 */
const useStoredState = (key, fallback) => {
  const [value, setValue] = useState(() => (typeof window === "undefined" ? fallback : read(key, fallback)));

  const update = useCallback(
    (next) =>
      setValue((current) => {
        const resolved = typeof next === "function" ? next(current) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          // Storage can be full or disabled; the value still applies.
        }
        return resolved;
      }),
    [key]
  );

  return [value, update];
};

export default useStoredState;
