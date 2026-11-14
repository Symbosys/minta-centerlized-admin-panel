import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClientFor, getActivePlatform, platformQueryKey, usePlatformApiClient } from "../../apiClient";
import { showError, showSuccess } from "../../../utils/message";

export interface LoginPayload {
  email: string;
  password: string;
  platform?: ReturnType<typeof getActivePlatform>;
}

export const useAdminLogin = () => {
  const { platform } = usePlatformApiClient();
  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const targetPlatform = payload.platform ?? platform;
      const { data } = await apiClientFor(targetPlatform).post("/admin/login", {
        email: payload.email,
        password: payload.password,
      });
      return { ...data, platform: targetPlatform };
    },
    onSuccess: (data) => {
      showSuccess(data.message || `Signed into ${data.platform === "restro" ? "Minta Restro" : "Minta Fresh"} successfully`);
    },
    onError: showError,
  });
};

export const useAdminLogout = () => {
  const { platform } = usePlatformApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (targetPlatform: ReturnType<typeof getActivePlatform> = platform) => {
      try {
        const { data } = await apiClientFor(targetPlatform).post("/admin/logout");
        return data;
      } catch {
        return { success: true };
      }
    },
    onSuccess: (_data, targetPlatform) => {
      queryClient.removeQueries({ queryKey: platformQueryKey(targetPlatform ?? platform) });
      showSuccess("Logged out successfully");
    },
    onError: (_error, targetPlatform) => {
      queryClient.removeQueries({ queryKey: platformQueryKey(targetPlatform ?? platform) });
      showSuccess("Logged out");
    },
  });
};

export const useGetDashboardOrderCount = (enabled = true) => {
  const { platform, apiClient } = usePlatformApiClient();
  return useQuery({
    queryKey: platformQueryKey(platform, "dashboard-order-count"),
    queryFn: async () => {
      const { data } = await apiClient.get("/order/admin/all", { params: { page: 1, limit: 1 } });
      return Number(data.data?.totalOrders ?? 0);
    },
    enabled,
  });
};

export const useCurrentAdminPermissions = (adminId?: string | number) => {
  const { platform, apiClient } = usePlatformApiClient();
  return useQuery({
    queryKey: platformQueryKey(platform, "current-admin-permissions", adminId),
    queryFn: async () => {
      const { data } = await apiClient.get(`/admin/${adminId}/permissions`);
      return data.data as { permissionKeys: string[] };
    },
    enabled: !!adminId,
    staleTime: 60 * 1000,
  });
};

// ── Admin CRUD hooks ────────────────────────────────────────

export const useGetAllAdmins = () => {
  const { platform, apiClient } = usePlatformApiClient();
  return useQuery({
    queryKey: platformQueryKey(platform, "all-admins"),
    queryFn: async () => {
      const { data } = await apiClient.get("/admin/all");
      return data.data || data;
    },
  });
};

export const useGetAdminById = (id?: string | number) => {
  const { platform, apiClient } = usePlatformApiClient();
  return useQuery({
    queryKey: platformQueryKey(platform, "admin", id),
    queryFn: async () => {
      const { data } = await apiClient.get(`/admin/${id}`);
      return data.data || data;
    },
    enabled: !!id,
  });
};

export const useCreateAdmin = () => {
  const { platform, apiClient } = usePlatformApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await apiClient.post("/admin/create", payload);
      return data;
    },
    onSuccess: (data) => {
      showSuccess(data.message || "Admin created successfully");
      queryClient.invalidateQueries({ queryKey: platformQueryKey(platform, "all-admins") });
    },
    onError: showError,
  });
};

export const useDeleteAdmin = () => {
  const { platform, apiClient } = usePlatformApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string | number) => {
      const { data } = await apiClient.delete(`/admin/${id}`);
      return data;
    },
    onSuccess: (data) => {
      showSuccess(data.message || "Admin deleted successfully");
      queryClient.invalidateQueries({ queryKey: platformQueryKey(platform, "all-admins") });
    },
    onError: showError,
  });
};

// ── Permission Management Hooks ─────────────────────────────

export const useGetAllPermissions = () => {
  const { platform, apiClient } = usePlatformApiClient();
  return useQuery({
    queryKey: platformQueryKey(platform, "all-permissions"),
    queryFn: async () => {
      const { data } = await apiClient.get("/admin/permissions/all");
      return data.data || data;
    },
  });
};

export const useGetAdminPermissions = (adminId?: string | number) => {
  const { platform, apiClient } = usePlatformApiClient();
  return useQuery({
    queryKey: platformQueryKey(platform, "admin-permissions", adminId),
    queryFn: async () => {
      const { data } = await apiClient.get(`/admin/${adminId}/permissions`);
      return data.data || data;
    },
    enabled: !!adminId,
  });
};

export const useAssignAdminPermissions = () => {
  const { platform, apiClient } = usePlatformApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ adminId, permissionKeys }: { adminId: string | number; permissionKeys: string[] }) => {
      const { data } = await apiClient.post(`/admin/${adminId}/permissions`, { permissionKeys });
      return data;
    },
    onSuccess: (data, variables) => {
      showSuccess(data.message || "Permissions assigned successfully");
      queryClient.invalidateQueries({ queryKey: platformQueryKey(platform, "admin-permissions", variables.adminId) });
      queryClient.invalidateQueries({ queryKey: platformQueryKey(platform, "all-admins") });
      queryClient.invalidateQueries({ queryKey: platformQueryKey(platform, "admin", variables.adminId) });
      queryClient.invalidateQueries({ queryKey: platformQueryKey(platform, "current-admin-permissions", variables.adminId) });
    },
    onError: showError,
  });
};
