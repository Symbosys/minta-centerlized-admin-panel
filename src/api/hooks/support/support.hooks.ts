import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { platformQueryKey, usePlatformApiClient } from "../../apiClient";
import { showError, showSuccess } from "../../../utils/message";

export interface SupportSessionFilter {
  status?: string;
  search?: string;
  initiatorType?: string;
  page?: number;
  limit?: number;
  refetchInterval?: number | false;
  startDate?: string;
  endDate?: string;
}

/**
 * Hook to fetch all support sessions for Admin/Sub-Admin with auto-polling
 */
export const useGetAdminSupportSessions = (filters: SupportSessionFilter = {}) => {
  const { platform, apiClient } = usePlatformApiClient();
  const { status = "ALL", search = "", initiatorType = "ALL", page = 1, limit = 50, refetchInterval, startDate, endDate } = filters;

  return useQuery({
    queryKey: platformQueryKey(platform, "admin-support-sessions", status, search, initiatorType, page, limit, startDate, endDate),
    queryFn: async () => {
      const { data } = await apiClient.get("/support/chat/admin/sessions", {
        params: { status, search, initiatorType, page, limit, startDate, endDate },
      });
      return data.data || data;
    },
    refetchInterval: refetchInterval !== undefined ? refetchInterval : 5000,
  });
};

/**
 * Hook to fetch paginated chat messages for a specific session using Infinite Query
 */
export const useGetAdminSessionMessagesInfinite = (sessionId: string, limit = 20) => {
  const { platform, apiClient } = usePlatformApiClient();

  return useInfiniteQuery({
    queryKey: platformQueryKey(platform, "admin-session-messages", sessionId),
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await apiClient.get(`/support/chat/admin/sessions/${sessionId}/messages`, {
        params: { page: pageParam, limit },
      });
      return data.data || data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage: any) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    enabled: !!sessionId,
  });
};

/**
 * Hook to connect Admin/Sub-Admin to a support chat session
 */
export const useConnectAdminToSupportSession = () => {
  const { platform, apiClient } = usePlatformApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { sessionId: string }) => {
      const { data } = await apiClient.post("/support/chat/admin/connect", payload);
      return data;
    },
    onSuccess: (data, variables) => {
      showSuccess(data.message || "Connected to support chat session");
      queryClient.invalidateQueries({ queryKey: platformQueryKey(platform, "admin-support-sessions") });
      queryClient.invalidateQueries({ queryKey: platformQueryKey(platform, "admin-session-messages", variables.sessionId) });
    },
    onError: showError,
  });
};

/**
 * Hook to send an Admin/Sub-Admin reply message in a support chat session
 */
export const useAdminReplyToSupportSession = () => {
  const { platform, apiClient } = usePlatformApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { sessionId: string; messageText: string }) => {
      const { data } = await apiClient.post("/support/chat/admin/reply", payload);
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: platformQueryKey(platform, "admin-support-sessions") });
      queryClient.invalidateQueries({ queryKey: platformQueryKey(platform, "admin-session-messages", variables.sessionId) });
    },
    onError: showError,
  });
};

/**
 * Hook to update status, priority, or category of a support chat session
 */
export const useUpdateAdminSupportSessionStatus = () => {
  const { platform, apiClient } = usePlatformApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      sessionId: string;
      status?: string;
      priority?: string;
      category?: string;
    }) => {
      const { data } = await apiClient.post("/support/chat/admin/status", payload);
      return data;
    },
    onSuccess: (data, variables) => {
      showSuccess(data.message || "Support session updated successfully");
      queryClient.invalidateQueries({ queryKey: platformQueryKey(platform, "admin-support-sessions") });
      queryClient.invalidateQueries({ queryKey: platformQueryKey(platform, "admin-session-messages", variables.sessionId) });
    },
    onError: showError,
  });
};

