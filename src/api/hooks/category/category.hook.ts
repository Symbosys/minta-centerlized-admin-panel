import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { platformQueryKey, usePlatformApiClient } from "../../apiClient";
import { showError, showSuccess } from "../../../utils/message";

export const useCreateCategory = () => {
  const { platform, apiClient } = usePlatformApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiClient.post("/category/create", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
    onSuccess: (data) => {
      showSuccess(data.message || "Category created successfully");
      queryClient.invalidateQueries({ queryKey: platformQueryKey(platform, "categories") });
    },
    onError: showError,
  });
};

export const useGetAllCategories = (params?: { modeId?: string | number }) => {
  const { platform, apiClient } = usePlatformApiClient();
  return useQuery({
    queryKey: platformQueryKey(platform, "categories", params?.modeId),
    queryFn: async () => {
      const { data } = await apiClient.get("/category/all", { params });
      return data.data;
    },
  });
};

export const useGetCategoryById = (id?: string | number) => {
  const { platform, apiClient } = usePlatformApiClient();
  return useQuery({
    queryKey: platformQueryKey(platform, "category", id),
    queryFn: async () => {
      const { data } = await apiClient.get(`/category/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
};

export const useUpdateCategory = () => {
  const { platform, apiClient } = usePlatformApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string | number; data: FormData | any }) => {
      const isFormData = data instanceof FormData;
      const headers = isFormData ? { "Content-Type": "multipart/form-data" } : undefined;
      const response = await apiClient.put(`/category/${id}`, data, { headers });
      return response.data;
    },
    onSuccess: (data, variables) => {
      showSuccess(data.message || "Category updated successfully");
      queryClient.invalidateQueries({ queryKey: platformQueryKey(platform, "categories") });
      queryClient.invalidateQueries({ queryKey: platformQueryKey(platform, "category", variables.id) });
    },
    onError: showError,
  });
};

