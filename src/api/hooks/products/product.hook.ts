import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { platformQueryKey, usePlatformApiClient } from "../../apiClient";
import { showError, showSuccess } from "../../../utils/message";

export const useCreateProduct = () => {
  const { platform, apiClient } = usePlatformApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiClient.post("/product/create", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
    onSuccess: (data) => {
      showSuccess(data.message || "Product created successfully");
      queryClient.invalidateQueries({ queryKey: platformQueryKey(platform, "products") });
    },
    onError: showError,
  });
};

export const useGetAllProducts = (filters?: Record<string, any>) => {
  const { platform, apiClient } = usePlatformApiClient();
  return useQuery({
    queryKey: platformQueryKey(platform, "products", filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, String(value));
          }
        });
      }
      const endpoint = `/product/all${params.toString() ? `?${params.toString()}` : ""}`;
      const { data } = await apiClient.get(endpoint);
      return data.data;
    },
  });
};

export const useGetProductById = (id?: string | number) => {
  const { platform, apiClient } = usePlatformApiClient();
  return useQuery({
    queryKey: platformQueryKey(platform, "product", id),
    queryFn: async () => {
      const { data } = await apiClient.get(`/product/${id}`);
      return data.data?.product || data.data;
    },
    enabled: !!id,
  });
};

export const useUpdateProduct = () => {
  const { platform, apiClient } = usePlatformApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string | number; data: FormData | any }) => {
      const isFormData = data instanceof FormData;
      const headers = isFormData ? { "Content-Type": "multipart/form-data" } : undefined;
      const response = await apiClient.put(`/product/${id}`, data, { headers });
      return response.data;
    },
    onSuccess: (data, variables) => {
      showSuccess(data.message || "Product updated successfully");
      queryClient.invalidateQueries({ queryKey: platformQueryKey(platform, "products") });
      queryClient.invalidateQueries({ queryKey: platformQueryKey(platform, "product", variables.id) });
    },
    onError: showError,
  });
};

