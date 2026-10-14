"use client";

import { useCallback, useState } from "react";

const read = (key, fallback, sanitize) => {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    const value = JSON.parse(raw);
    return sanitize ? sanitize(value) ?? fallback : value;
  } catch {
    return fallback;
  }
};

/**
 * useState that is remembered in localStorage (per browser). Only use it in
 * components that render on the client, since the initial value is read
 * synchronously. `sanitize(value)` validates a stored value: it returns the
 * value to use, or null/undefined to fall back to the default.
 */
const useStoredState = (key, fallback, sanitize) => {
  const [value, setValue] = useState(() =>
    typeof window === "undefined" ? fallback : read(key, fallback, sanitize)
  );

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
