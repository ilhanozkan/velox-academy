"use client";

import { RequireAuth } from "@/components/Auth/AuthGuard";

const AdminLayout = ({ children }) => <RequireAuth admin>{children}</RequireAuth>;

export default AdminLayout;
