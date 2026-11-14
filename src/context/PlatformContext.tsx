import React, { createContext, useCallback, useContext, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  usePlatformStore,
  PLATFORMS,
  applyPlatformTheme,
  type PlatformId,
  type PlatformConfig,
  type PlatformTheme,
} from "../store/usePlatformStore";
import { useThemeStore } from "../store/useThemeStore";

export { PLATFORMS, type PlatformId, type PlatformConfig, type PlatformTheme };

interface PlatformContextType {
  platform: PlatformId;
  currentConfig: PlatformConfig;
  switchPlatform: (next: PlatformId) => void;
  isFresh: boolean;
  isRestro: boolean;
}

const PlatformContext = createContext<PlatformContextType | undefined>(undefined);

export const PlatformProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const platform = usePlatformStore((state) => state.platform);
  const setPlatform = usePlatformStore((state) => state.switchPlatform);
  const queryClient = useQueryClient();
  const theme = useThemeStore((state) => state.theme);

  const switchPlatform = useCallback((next: PlatformId) => {
    if (next === usePlatformStore.getState().platform) return;
    queryClient.clear();
    setPlatform(next);
  }, [queryClient, setPlatform]);

  // Synchronize CSS custom property variables whenever platform or dark mode changes
  useEffect(() => {
    applyPlatformTheme(platform, theme === "dark");
  }, [platform, theme]);

  const currentConfig = PLATFORMS[platform];

  return (
    <PlatformContext.Provider
      value={{
        platform,
        currentConfig,
        switchPlatform,
        isFresh: platform === "minta-fresh",
        isRestro: platform === "restro",
      }}
    >
      {children}
    </PlatformContext.Provider>
  );
};

export const usePlatform = () => {
  const context = useContext(PlatformContext);
  if (!context) {
    throw new Error("usePlatform must be used within PlatformProvider");
  }
  return context;
};
