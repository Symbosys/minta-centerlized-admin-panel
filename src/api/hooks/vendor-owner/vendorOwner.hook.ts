import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { platformQueryKey, usePlatformApiClient } from "../../apiClient";
import { showError, showSuccess } from "../../../utils/message";

export interface GetVendorOwnersParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface VendorOwner {
  id: string | number;
  name: string;
  email: string;
  mobile: string;
  fssaiLicenceNumber?: string | null;
  mainAddress?: string | null;
  completeAddress?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  pincode?: string | null;
  aadhaarNumber?: string | null;
  panNumber?: string | null;
  gstinNumber?: string | null;
  isActive: boolean;
  isApproved: boolean;
  fcmToken?: string | null;
  vendors?: Array<{
    id: string | number;
    shopName?: string | null;
    ownerName?: string | null;
    mobile?: string | null;
    city?: string | null;
    status?: string | null;
    isApproved?: boolean;
    isActive?: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVendorOwnerPayload {
  name: string;
  email: string;
  mobile: string;
  password: string;
  fssaiLicenceNumber?: string;
  mainAddress?: string;
  completeAddress?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  aadhaarNumber?: string;
  panNumber?: string;
  gstinNumber?: string;
}

export interface UpdateVendorOwnerPayload {
  name?: string;
  email?: string;
  mobile?: string;
  password?: string;
  fssaiLicenceNumber?: string | null;
  mainAddress?: string | null;
  completeAddress?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  pincode?: string | null;
  aadhaarNumber?: string | null;
  panNumber?: string | null;
  gstinNumber?: string | null;
  isActive?: boolean;
  isApproved?: boolean;
}

export const useGetVendorOwners = (params?: GetVendorOwnersParams) => {
  const { platform, apiClient } = usePlatformApiClient();
  return useQuery({
    queryKey: platformQueryKey(platform, "vendorOwners", params),
    queryFn: async () => {
      const { data } = await apiClient.get("/vendor-owner/admin", {
        params,
      });
      return data.data as {
        vendorOwners: VendorOwner[];
        pagination: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      };
    },
  });
};

export const useCreateVendorOwner = () => {
  const { platform, apiClient } = usePlatformApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateVendorOwnerPayload) => {
      const response = await apiClient.post("/vendor-owner/admin", payload);
      return response.data;
    },
    onSuccess: (data) => {
      showSuccess(data.message || "Vendor Owner created successfully");
      queryClient.invalidateQueries({ queryKey: platformQueryKey(platform, "vendorOwners") });
    },
    onError: showError,
  });
};

export const useUpdateVendorOwner = () => {
  const { platform, apiClient } = usePlatformApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string | number;
      data: UpdateVendorOwnerPayload;
    }) => {
      const response = await apiClient.put(`/vendor-owner/admin/${id}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      showSuccess(data.message || "Vendor Owner updated successfully");
      queryClient.invalidateQueries({ queryKey: platformQueryKey(platform, "vendorOwners") });
    },
    onError: showError,
  });
};
