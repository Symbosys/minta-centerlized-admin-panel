import { useInfiniteQuery } from "@tanstack/react-query";
import { platformQueryKey, usePlatformApiClient } from "../../apiClient";

export interface GetTransactionsParams {
  vendorId?: string | number;
  limit?: number;
  transactionType?: string;
}

export const useGetVendorWalletTransactions = (
  params?: GetTransactionsParams,
  options?: { enabled?: boolean }
) => {
  const { platform, apiClient } = usePlatformApiClient();
  return useInfiniteQuery({
    queryKey: platformQueryKey(platform, "vendorWalletTransactions", params),
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await apiClient.get("/vendor/wallet/all", {
        params: { ...params, page: pageParam },
      });
      return data.data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.currentPage < lastPage.totalPages) {
        return lastPage.currentPage + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: options?.enabled !== undefined ? options.enabled : !!params?.vendorId,
  });
};
