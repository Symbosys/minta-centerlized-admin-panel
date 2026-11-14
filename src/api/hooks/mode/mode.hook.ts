import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { platformQueryKey, usePlatformApiClient } from "../../apiClient";
import { showError, showSuccess } from "../../../utils/message";

export interface ModeItem {
  id: string | number;
  name: string;
  slug: string;
  description?: string | null;
  image: {
    public_id?: string;
    secure_url?: string;
    url?: string;
  };
  icon?: {
    public_id?: string;
    secure_url?: string;
    url?: string;
  } | null;
  badge?: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    categories?: number;
    subCategories?: number;
    products?: number;
    orders?: number;
  };
}

export const useGetAllModesAdmin = (options?: { enabled?: boolean }) => {
  const { platform, apiClient } = usePlatformApiClient();
  return useQuery<ModeItem[]>({
    queryKey: platformQueryKey(platform, "admin-modes"),
    queryFn: async () => {
      const { data } = await apiClient.get("/mode/admin/all");
      return data.data || [];
    },
    enabled: options?.enabled !== undefined ? options.enabled : true,
  });
};

export const useGetActiveModes = (options?: { enabled?: boolean }) => {
  const { platform, apiClient } = usePlatformApiClient();
  return useQuery<ModeItem[]>({
    queryKey: platformQueryKey(platform, "active-modes"),
    queryFn: async () => {
      const { data } = await apiClient.get("/mode/all");
      return data.data || [];
    },
    enabled: options?.enabled !== undefined ? options.enabled : true,
  });
};

export const useGetModeByIdOrSlug = (idOrSlug?: string | number) => {
  const { platform, apiClient } = usePlatformApiClient();
  return useQuery<ModeItem>({
    queryKey: platformQueryKey(platform, "mode", idOrSlug),
    queryFn: async () => {
      const { data } = await apiClient.get(`/mode/${idOrSlug}`);
      return data.data;
    },
    enabled: !!idOrSlug,
  });
};

export const useCreateMode = () => {
  const { platform, apiClient } = usePlatformApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiClient.post("/mode", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
    onSuccess: (data) => {
      showSuccess(data.message || "Mode created successfully");
      queryClient.invalidateQueries({ queryKey: platformQueryKey(platform, "admin-modes") });
      queryClient.invalidateQueries({ queryKey: platformQueryKey(platform, "active-modes") });
    },
    onError: showError,
  });
};

export const useUpdateMode = () => {
  const { platform, apiClient } = usePlatformApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string | number; data: FormData | any }) => {
      const isFormData = data instanceof FormData;
      const headers = isFormData ? { "Content-Type": "multipart/form-data" } : undefined;
      const response = await apiClient.put(`/mode/${id}`, data, { headers });
      return response.data;
    },
    onSuccess: (data, variables) => {
      showSuccess(data.message || "Mode updated successfully");
      queryClient.invalidateQueries({ queryKey: platformQueryKey(platform, "admin-modes") });
      queryClient.invalidateQueries({ queryKey: platformQueryKey(platform, "active-modes") });
      queryClient.invalidateQueries({ queryKey: platformQueryKey(platform, "mode", variables.id) });
    },
    onError: showError,
  });
};

export const useDeleteMode = () => {
  const { platform, apiClient } = usePlatformApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string | number) => {
      const response = await apiClient.delete(`/mode/${id}`);
      return response.data;
    },
    onSuccess: (data) => {
      showSuccess(data.message || "Mode deleted successfully");
      queryClient.invalidateQueries({ queryKey: platformQueryKey(platform, "admin-modes") });
      queryClient.invalidateQueries({ queryKey: platformQueryKey(platform, "active-modes") });
    },
    onError: showError,
  });
};

