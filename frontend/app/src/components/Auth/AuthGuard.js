"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "react-redux";

import { selectAuthStatus, selectIsAdmin } from "@/lib/features/auth/authSlice";
import FullPageLoader from "@/components/FullPageLoader/FullPageLoader";

const isChecking = (status) => status === "idle" || status === "loading";

/** Renders children only for logged-in users (and only admins with `admin`). */
export const RequireAuth = ({ children, admin = false }) => {
  const router = useRouter();
  const pathname = usePathname();
  const status = useSelector(selectAuthStatus);
  const isAdmin = useSelector(selectIsAdmin);

  useEffect(() => {
    // Keep the query (e.g. ?adim= in the workspace) so the user comes back
    // to the same place after logging in.
    if (status === "unauthenticated")
      router.replace(`/giris-yap?next=${encodeURIComponent(pathname + window.location.search)}`);
    else if (status === "authenticated" && admin && !isAdmin) router.replace("/egitimler");
  }, [status, admin, isAdmin, pathname, router]);

  if (status !== "authenticated" || (admin && !isAdmin)) return <FullPageLoader />;
  return children;
};

/**
 * Only accept paths on this site as redirect targets after login. A prefix
 * check is not enough: browsers read "/\evil.com" or "/\t/evil.com" as
 * another host, so resolve the value and compare origins.
 */
const safeNext = (next) => {
  if (!next || !next.startsWith("/")) return "/egitimler";
  try {
    const url = new URL(next, window.location.origin);
    if (url.origin !== window.location.origin) return "/egitimler";
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/egitimler";
  }
};

/** Login/register pages: logged-in users are sent on to the app. */
export const GuestOnly = ({ children }) => {
  const router = useRouter();
  const status = useSelector(selectAuthStatus);

  useEffect(() => {
    if (status === "authenticated")
      router.replace(safeNext(new URLSearchParams(window.location.search).get("next")));
  }, [status, router]);

  if (isChecking(status) || status === "authenticated") return <FullPageLoader />;
  return children;
};

export { safeNext };
