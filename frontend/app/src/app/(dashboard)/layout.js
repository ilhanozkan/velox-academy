"use client";

import { RequireAuth } from "@/components/Auth/AuthGuard";
import DashboardShell from "@/components/Layout/DashboardShell";

const DashboardLayout = ({ children }) => (
  <RequireAuth>
    <DashboardShell>{children}</DashboardShell>
  </RequireAuth>
);

export default DashboardLayout;
