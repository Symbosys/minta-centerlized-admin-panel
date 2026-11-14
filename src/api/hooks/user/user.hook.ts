import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { platformQueryKey, usePlatformApiClient } from "../../apiClient";
import { showError, showSuccess } from "../../../utils/message";
import { AxiosError } from "axios";

export const useGetUserProfile = (userId?: number | string, options?: { enabled?: boolean }) => {
    const { platform, apiClient } = usePlatformApiClient();
    return useQuery({
        queryKey: platformQueryKey(platform, "userProfile", userId),
        queryFn: async () => {
            const { data } = await apiClient.get("/user/profile", {
                params: userId ? { id: userId } : undefined,
            });
            return data.data;
        },
        enabled: options?.enabled !== undefined ? options.enabled : !!userId,
    });
};

export const useUpdateUserProfile = () => {
    const { platform, apiClient } = usePlatformApiClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            userId,
            userData,
        }: {
            userId?: number | string;
            userData: { name?: string; email?: string };
        }) => {
            const { data } = await apiClient.put("/user/update", userData, {
                params: userId ? { id: userId } : undefined,
            });
            return data;
        },
        onSuccess: (data, variables) => {
            showSuccess(data.message || "User profile updated successfully");
            queryClient.invalidateQueries({ queryKey: platformQueryKey(platform, "userProfile", variables.userId) });
        },
        onError: (error: AxiosError | Error) => {
            showError(error);
        },
    });
};

export interface GetAllUsersParams {
    limit?: number;
    name?: string;
    email?: string;
    phone?: string;
}

export const useGetAllUsers = (params?: GetAllUsersParams, enabled = true) => {
    const { platform, apiClient } = usePlatformApiClient();
    return useInfiniteQuery({
        queryKey: platformQueryKey(platform, "allUsers", params),
        queryFn: async ({ pageParam = 1 }) => {
            const { data } = await apiClient.get("/user/all", {
                params: {
                    page: pageParam,
                    limit: params?.limit || 10,
                    name: params?.name || undefined,
                    email: params?.email || undefined,
                    phone: params?.phone || undefined,
                },
            });
            return data.data; // Expected to contain users, total, totalPages, currentPage, count
        },
        getNextPageParam: (lastPage) => {
            if (lastPage.currentPage < lastPage.totalPages) {
                return lastPage.currentPage + 1;
            }
            return undefined;
        },
        initialPageParam: 1,
        enabled,
    });
};

export const useGetUserOrders = (userId?: number | string, options?: { enabled?: boolean }) => {
    const { platform, apiClient } = usePlatformApiClient();
    return useQuery({
        queryKey: platformQueryKey(platform, "userOrders", userId),
        queryFn: async () => {
            const { data } = await apiClient.get("/order/all", {
                params: { userId },
            });
            return data.data;
        },
        enabled: options?.enabled !== undefined ? options.enabled : !!userId,
    });
};

export const useGetUserWalletTransactions = (userId?: number | string, options?: { enabled?: boolean }) => {
    const { platform, apiClient } = usePlatformApiClient();
    return useQuery({
        queryKey: platformQueryKey(platform, "userWalletTransactions", userId),
        queryFn: async () => {
            const { data } = await apiClient.get("/user/wallet/transactions", {
                params: { userId },
            });
            return data.data;
        },
        enabled: options?.enabled !== undefined ? options.enabled : !!userId,
    });
};

export const useGetUserNotifications = (userId?: number | string, options?: { enabled?: boolean }) => {
    const { platform, apiClient } = usePlatformApiClient();
    return useQuery({
        queryKey: platformQueryKey(platform, "userNotifications", userId),
        queryFn: async () => {
            const { data } = await apiClient.get("/notification/all", {
                params: {
                    recipientType: "USER",
                    recipientId: userId,
                },
            });
            return data.data;
        },
        enabled: options?.enabled !== undefined ? options.enabled : !!userId,
    });
};

export const useGetUserReviews = (userId?: number | string, options?: { enabled?: boolean }) => {
    const { platform, apiClient } = usePlatformApiClient();
    return useQuery({
        queryKey: platformQueryKey(platform, "userReviews", userId),
        queryFn: async () => {
            const { data } = await apiClient.get("/user/reviews", {
                params: { userId },
            });
            return data.data;
        },
        enabled: options?.enabled !== undefined ? options.enabled : !!userId,
    });
};
