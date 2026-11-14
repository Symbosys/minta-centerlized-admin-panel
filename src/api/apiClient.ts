import axios, { type AxiosInstance } from "axios";
import { usePlatformStore, PLATFORMS, type PlatformId } from "../store/usePlatformStore";
import { useAuthStore, type AdminUser } from "../store/useAuthStore";

export const getActivePlatform = (): PlatformId => usePlatformStore.getState().platform;

export const getPlatformToken = (platform: PlatformId): string | null =>
  useAuthStore.getState().getPlatformToken(platform);

export const getPlatformAdminData = (platform: PlatformId): AdminUser | null =>
  useAuthStore.getState().getPlatformAdmin(platform);

export const setPlatformSession = (platform: PlatformId, adminData: AdminUser, token: string) =>
  useAuthStore.getState().setPlatformAuth(platform, adminData, token);

export const clearPlatformSession = (platform: PlatformId) =>
  useAuthStore.getState().clearPlatformAuth(platform);

const clients = new Map<PlatformId, AxiosInstance>();

export const apiClientFor = (platform: PlatformId): AxiosInstance => {
  const cached = clients.get(platform);
  if (cached) return cached;

  const client = axios.create({
    baseURL: PLATFORMS[platform].apiUrl,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  });

  client.interceptors.request.use((config) => {
    const token = getPlatformToken(platform);
    if (token) config.headers.Authorization = `Bearer ${token}`;
    else delete config.headers.Authorization;
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401 && !error.config?.url?.includes("/admin/login")) {
        clearPlatformSession(platform);
      }
      return Promise.reject(error);
    },
  );

  clients.set(platform, client);
  return client;
};

export const usePlatformApiClient = () => {
  const platform = usePlatformStore((state) => state.platform);
  return { platform, apiClient: apiClientFor(platform) };
};

export const platformQueryKey = (platform: PlatformId, ...parts: unknown[]) =>
  ["platform", platform, ...parts] as const;

