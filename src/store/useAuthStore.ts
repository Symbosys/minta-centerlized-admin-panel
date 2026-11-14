import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PlatformId } from "./usePlatformStore";

export interface AdminUser {
  id: string | number;
  name?: string;
  email: string;
  role: "ADMIN" | "SUB_ADMIN" | string;
  mobile?: string;
  permissions?: string[];
  [key: string]: any;
}

export interface PlatformSession {
  token: string;
  admin: AdminUser;
}

interface AuthState {
  sessions: {
    "minta-fresh"?: PlatformSession | null;
    "restro"?: PlatformSession | null;
  };
  revokedSessions: Partial<Record<PlatformId, string>>;
  setPlatformAuth: (platform: PlatformId, admin: AdminUser, token: string) => void;
  clearPlatformAuth: (platform?: PlatformId) => void;
  getPlatformToken: (platform: PlatformId) => string | null;
  getPlatformAdmin: (platform: PlatformId) => AdminUser | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      sessions: {
        "minta-fresh": null,
        "restro": null,
      },
      revokedSessions: {},

      setPlatformAuth: (platform: PlatformId, admin: AdminUser, token: string) => {
        set((state) => ({
          sessions: {
            ...state.sessions,
            [platform]: { token, admin },
          },
          revokedSessions: {
            ...state.revokedSessions,
            [platform]: undefined,
          },
        }));
      },

      clearPlatformAuth: (platform?: PlatformId) => {
        const invalidate = (platformId: PlatformId) => {
          const token = get().getPlatformToken(platformId);
          return token ? { [platformId]: token } : {};
        };
        if (platform) {
          set((state) => ({
            sessions: {
              ...state.sessions,
              [platform]: null,
            },
            revokedSessions: {
              ...state.revokedSessions,
              ...invalidate(platform),
            },
          }));
        } else {
          set((state) => ({
            sessions: {
              "minta-fresh": null,
              "restro": null,
            },
            revokedSessions: {
              ...state.revokedSessions,
              ...invalidate("minta-fresh"),
              ...invalidate("restro"),
            },
          }));
        }
      },

      getPlatformToken: (platform: PlatformId) => {
        const token = get().sessions[platform]?.token || null;
        return token && token !== get().revokedSessions[platform] ? token : null;
      },

      getPlatformAdmin: (platform: PlatformId) => {
        const session = get().sessions[platform];
        return session && session.token !== get().revokedSessions[platform] ? session.admin : null;
      },
    }),
    {
      name: "minta-admin-auth",
    }
  )
);

