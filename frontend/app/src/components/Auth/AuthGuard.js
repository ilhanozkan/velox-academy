"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
    if (status === "unauthenticated")
      router.replace(`/giris-yap?next=${encodeURIComponent(pathname)}`);
    else if (status === "authenticated" && admin && !isAdmin) router.replace("/egitimler");
  }, [status, admin, isAdmin, pathname, router]);

  if (status !== "authenticated" || (admin && !isAdmin)) return <FullPageLoader />;
  return children;
};

// Only accept local paths as redirect targets after login.
const safeNext = (next) => (next && next.startsWith("/") && !next.startsWith("//") ? next : "/egitimler");

/** Login/register pages: logged-in users are sent on to the app. */
export const GuestOnly = ({ children }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = useSelector(selectAuthStatus);

  useEffect(() => {
    if (status === "authenticated") router.replace(safeNext(searchParams.get("next")));
  }, [status, router, searchParams]);

  if (isChecking(status) || status === "authenticated") return <FullPageLoader />;
  return children;
};

export { safeNext };
