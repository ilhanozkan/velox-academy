"use client";

import { GuestOnly } from "@/components/Auth/AuthGuard";

const AuthLayout = ({ children }) => <GuestOnly>{children}</GuestOnly>;

export default AuthLayout;
