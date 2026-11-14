import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { platformQueryKey, usePlatformApiClient } from "../../apiClient";
import { showError, showSuccess } from "../../../utils/message";

export const useCreateSubCategory = () => {
  const { platform, apiClient } = usePlatformApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiClient.post("/sub-category/create", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
    onSuccess: (data) => {
      showSuccess(data.message || "Subcategory created successfully");
      queryClient.invalidateQueries({ queryKey: platformQueryKey(platform, "subCategories") });
    },
    onError: showError,
  });
};

export const useGetAllSubCategories = (
  arg?: string | number | { categoryId?: string | number; modeId?: string | number }
) => {
  const { platform, apiClient } = usePlatformApiClient();
  const categoryId = typeof arg === "object" ? arg?.categoryId : arg;
  const modeId = typeof arg === "object" ? arg?.modeId : undefined;

  return useQuery({
    queryKey: platformQueryKey(platform, "subCategories", categoryId, modeId),
    queryFn: async () => {
      const params: any = {};
      if (categoryId) params.categoryId = categoryId;
      if (modeId) params.modeId = modeId;
      const { data } = await apiClient.get("/sub-category/all", { params });
      return data.data;
    },
  });
};

export const useGetSubCategoryById = (id?: string | number) => {
  const { platform, apiClient } = usePlatformApiClient();
  return useQuery({
    queryKey: platformQueryKey(platform, "subCategory", id),
    queryFn: async () => {
      const { data } = await apiClient.get(`/sub-category/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
};

export const useUpdateSubCategory = () => {
  const { platform, apiClient } = usePlatformApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string | number; data: FormData | any }) => {
      const isFormData = data instanceof FormData;
      const headers = isFormData ? { "Content-Type": "multipart/form-data" } : undefined;
      const response = await apiClient.put(`/sub-category/${id}`, data, { headers });
      return response.data;
    },
    onSuccess: (data, variables) => {
      showSuccess(data.message || "Subcategory updated successfully");
      queryClient.invalidateQueries({ queryKey: platformQueryKey(platform, "subCategories") });
      queryClient.invalidateQueries({ queryKey: platformQueryKey(platform, "subCategory", variables.id) });
    },
    onError: showError,
  });
};

