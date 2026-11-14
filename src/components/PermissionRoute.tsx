import React from "react";
import { useRole } from "@/context/RoleContext";

interface PermissionRouteProps {
  permission?: string;
  requiredRole?: "ADMIN" | "SUB_ADMIN";
  children: React.ReactNode;
}

export const PermissionRoute: React.FC<PermissionRouteProps> = ({
  permission,
  requiredRole,
  children,
}) => {
  const { role, permissions, isPermissionsLoading, isPermissionsError } = useRole();

  if (isPermissionsLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading permissions…</div>;
  }
  if (isPermissionsError) {
    return <div role="alert" className="p-8 text-center text-destructive">Unable to verify your permissions. Try reloading or sign in again.</div>;
  }
  if (!role || (requiredRole && role !== requiredRole) || (permission && !permissions.includes(permission))) {
    return <div role="alert" className="p-8 text-center text-destructive">You do not have permission to view this page.</div>;
  }
  return <>{children}</>;
};
