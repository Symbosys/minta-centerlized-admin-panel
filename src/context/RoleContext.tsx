import React, { createContext, useContext, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCurrentAdminPermissions } from "@/api/hooks/admins/admin.hooks";

type UserRole = "ADMIN" | "SUB_ADMIN";

interface RoleContextType {
  role: UserRole | null;
  permissions: string[];
  isPermissionsLoading: boolean;
  isPermissionsError: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const ADMIN_ALL_PERMISSIONS = [
  "VIEW_DASHBOARD", "CREATE_ADMINS", "VIEW_ADMINS", "UPDATE_ADMINS", "DELETE_ADMINS",
  "CREATE_USERS", "VIEW_USERS", "UPDATE_USERS", "DELETE_USERS",
  "CREATE_VENDORS", "VIEW_VENDORS", "UPDATE_VENDORS", "DELETE_VENDORS",
  "CREATE_DELIVERY_PARTNERS", "VIEW_DELIVERY_PARTNERS", "UPDATE_DELIVERY_PARTNERS", "DELETE_DELIVERY_PARTNERS",
  "CREATE_PRODUCTS", "VIEW_PRODUCTS", "UPDATE_PRODUCTS", "DELETE_PRODUCTS",
  "CREATE_CATEGORIES", "VIEW_CATEGORIES", "UPDATE_CATEGORIES", "DELETE_CATEGORIES",
  "CREATE_ORDERS", "VIEW_ORDERS", "UPDATE_ORDERS", "DELETE_ORDERS",
  "CREATE_PAYMENTS", "VIEW_PAYMENTS", "UPDATE_PAYMENTS", "DELETE_PAYMENTS",
  "CREATE_PROMOTIONS", "VIEW_PROMOTIONS", "UPDATE_PROMOTIONS", "DELETE_PROMOTIONS",
  "CREATE_NOTIFICATIONS", "VIEW_NOTIFICATIONS", "UPDATE_NOTIFICATIONS", "DELETE_NOTIFICATIONS",
  "CREATE_SUPPORT", "VIEW_SUPPORT", "UPDATE_SUPPORT", "DELETE_SUPPORT",
  "CREATE_REVIEWS", "VIEW_REVIEWS", "UPDATE_REVIEWS", "DELETE_REVIEWS",
  "CREATE_GEOGRAPHY", "VIEW_GEOGRAPHY", "UPDATE_GEOGRAPHY", "DELETE_GEOGRAPHY",
  "CREATE_PACKING_BAGS", "VIEW_PACKING_BAGS", "UPDATE_PACKING_BAGS", "DELETE_PACKING_BAGS",
  "CREATE_SETTINGS", "VIEW_SETTINGS", "UPDATE_SETTINGS", "DELETE_SETTINGS", "VIEW_LOGS",
];

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { admin, isAuthenticated } = useAuth();
  const role = admin?.role === "ADMIN" || admin?.role === "SUB_ADMIN" ? admin.role : null;
  const adminId = role === "SUB_ADMIN" ? admin?.id?.toString() : undefined;
  const { data, isLoading, isError } = useCurrentAdminPermissions(adminId);

  const permissions = useMemo(() => {
    if (!isAuthenticated) return [];
    if (role === "ADMIN") return ADMIN_ALL_PERMISSIONS;
    if (role === "SUB_ADMIN") return data?.permissionKeys ?? [];
    return [];
  }, [isAuthenticated, role, data]);

  return (
    <RoleContext.Provider
      value={{
        role,
        permissions,
        isPermissionsLoading: Boolean(isAuthenticated && role === "SUB_ADMIN" && isLoading),
        isPermissionsError: Boolean(isAuthenticated && role === "SUB_ADMIN" && isError),
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) throw new Error("useRole must be used within RoleProvider");
  return context;
};
