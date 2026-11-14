import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { platformQueryKey, usePlatformApiClient } from "../../apiClient";
import { showError, showSuccess } from "../../../utils/message";

/**
 * Hook to retrieve all global settings for the active platform
 */
export const useGetAllSettings = () => {
  const { platform, apiClient } = usePlatformApiClient();
  return useQuery({
    queryKey: platformQueryKey(platform, "global-settings"),
    queryFn: async () => {
      const { data } = await apiClient.get(`/others/settings`);
      return data.data || data; // Contains settings and rawSettings
    },
  });
};

/**
 * Hook to create or update a specific setting for the active platform
 */
export const useManageSetting = () => {
  const { platform, apiClient } = usePlatformApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { key: string; value: string }) => {
      const response = await apiClient.post(`/others/settings/manage`, payload);
      return response.data;
    },
    onSuccess: (data) => {
      showSuccess(data.message || "Setting updated successfully");
      queryClient.invalidateQueries({ queryKey: platformQueryKey(platform, "global-settings") });
    },
    onError: showError,
  });
};

