import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { platformQueryKey, usePlatformApiClient } from "../../apiClient";
import { showError, showSuccess } from "../../../utils/message";

// ── Types ───────────────────────────────────────────────────

export enum LegalDocumentType {
  PRIVACY_POLICY = "PRIVACY_POLICY",
  TERMS_AND_CONDITIONS = "TERMS_AND_CONDITIONS",
  BUSINESS_AND_PAYMENT = "BUSINESS_AND_PAYMENT",
  VENDOR_AND_PARTNER = "VENDOR_AND_PARTNER",
  CSR_POLICY = "CSR_POLICY",
  REFUND_POLICY = "REFUND_POLICY",
  ABOUT_US = "ABOUT_US",
}

export interface LegalDocument {
  id: string;
  type: LegalDocumentType;
  title: string;
  content: string;
  isPublished: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

// ── Hooks ───────────────────────────────────────────────────

export const useGetAllLegalDocuments = () => {
  const { platform, apiClient } = usePlatformApiClient();
  return useQuery<LegalDocument[]>({
    queryKey: platformQueryKey(platform, "all-legal-docs"),
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<LegalDocument[]>>("/admin/legal/all");
      return data.data;
    },
  });
};

export const useGetLegalDocumentByType = (type?: LegalDocumentType) => {
  const { platform, apiClient } = usePlatformApiClient();
  return useQuery<LegalDocument>({
    queryKey: platformQueryKey(platform, "legal-doc", type),
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<LegalDocument>>(`/admin/legal/${type}`);
      return data.data;
    },
    enabled: !!type,
  });
};

export const useUpsertLegalDocument = () => {
  const { platform, apiClient } = usePlatformApiClient();
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<LegalDocument>, Error, Partial<LegalDocument>>({
    mutationFn: async (payload) => {
      const { data } = await apiClient.post<ApiResponse<LegalDocument>>("/admin/legal/upsert", payload);
      return data;
    },
    onSuccess: (data, variables) => {
      showSuccess(data.message || "Legal document saved successfully");
      queryClient.invalidateQueries({ queryKey: platformQueryKey(platform, "all-legal-docs") });
      queryClient.invalidateQueries({ queryKey: platformQueryKey(platform, "legal-doc", variables.type) });
    },
    onError: (err: any) => showError(err),
  });
};

