"use client";

import { RequireAuth } from "@/components/Auth/AuthGuard";

// The training workspace uses the full screen, without the sidebar.
const WorkspaceLayout = ({ children }) => <RequireAuth>{children}</RequireAuth>;

export default WorkspaceLayout;
