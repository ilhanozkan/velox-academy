"use client";

import { Suspense } from "react";

import { GuestOnly } from "@/components/Auth/AuthGuard";
import FullPageLoader from "@/components/FullPageLoader/FullPageLoader";

const AuthLayout = ({ children }) => (
  <Suspense fallback={<FullPageLoader />}>
    <GuestOnly>{children}</GuestOnly>
  </Suspense>
);

export default AuthLayout;
