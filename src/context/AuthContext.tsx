import React, { createContext, useContext, useEffect, useState } from "react";
import { usePlatformStore, type PlatformId } from "../store/usePlatformStore";
import { useAuthStore, type AdminUser } from "../store/useAuthStore";

export { type AdminUser };

interface AuthContextType {
  admin: AdminUser | null;
  token: string | null;
  loading: boolean;
  setAuth: (adminData: AdminUser, tokenStr: string, targetPlatform?: PlatformId) => void;
  clearAuth: (targetPlatform?: PlatformId) => void;
  isAuthenticated: boolean;
  refreshSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const platform = usePlatformStore((state) => state.platform);
  const session = useAuthStore((state) => state.sessions[platform]);
  const setPlatformAuth = useAuthStore((state) => state.setPlatformAuth);
  const clearPlatformAuth = useAuthStore((state) => state.clearPlatformAuth);

  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    // Zustand persist hydration completion check
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setHasHydrated(true);
    });
    setHasHydrated(useAuthStore.persist.hasHydrated());
    return () => {
      unsub();
    };
  }, []);

  const token = session?.token || null;
  const admin = session?.admin || null;
  const isAuthenticated = !!token && !!admin;

  const setAuth = (adminData: AdminUser, tokenStr: string, targetPlatform?: PlatformId) => {
    const target = targetPlatform || platform;
    setPlatformAuth(target, adminData, tokenStr);
  };

  const clearAuth = (targetPlatform?: PlatformId) => {
    const target = targetPlatform || platform;
    clearPlatformAuth(target);
  };

  const refreshSession = () => {
    // Reactive with Zustand state automatically
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        token,
        loading: !hasHydrated,
        setAuth,
        clearAuth,
        isAuthenticated,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
