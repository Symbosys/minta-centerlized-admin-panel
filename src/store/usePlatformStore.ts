import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PlatformId = "minta-fresh" | "restro";

export interface PlatformThemePalette {
  primary: string;
  primaryForeground: string;
  accent: string;
  accentForeground: string;
  ring: string;
  sidebarBackground: string;
  sidebarForeground: string;
  sidebarPrimary: string;
  sidebarPrimaryForeground: string;
  sidebarAccent: string;
  sidebarAccentForeground: string;
  sidebarBorder: string;
  sidebarRing: string;
}

export interface PlatformTheme {
  brandColor: string;
  brandHex: string;
  brandHoverHex: string;
  tagColor: string;
  light: PlatformThemePalette;
  dark: PlatformThemePalette;
}

export interface PlatformConfig {
  id: PlatformId;
  name: string;
  shortName: string;
  tagline: string;
  apiUrl: string;
  badgeVariant: "default" | "secondary" | "outline";
  theme: PlatformTheme;
}

/**
 * Centrally configured UI color codes per PlatformId.
 * To change or customize platform colors in the future, modify the values below.
 */
export const PLATFORMS: Record<PlatformId, PlatformConfig> = {
  "minta-fresh": {
    id: "minta-fresh",
    name: "Minta Fresh",
    shortName: "Fresh",
    tagline: "Grocery & FMCG Deliveries",
    apiUrl: import.meta.env.VITE_FRESH_API_URL || "http://localhost:4000/api/v1/minta-fresh",
    badgeVariant: "default",
    theme: {
      brandColor: "hsl(276 76% 44%)", // Minta Purple
      brandHex: "#8719C6",
      brandHoverHex: "#7013a7",
      tagColor: "text-purple-600 dark:text-purple-400",
      light: {
        primary: "276 76% 44%",
        primaryForeground: "0 0% 100%",
        accent: "264 73% 75%",
        accentForeground: "0 0% 13%",
        ring: "276 76% 44%",
        sidebarBackground: "276 76% 44%",
        sidebarForeground: "0 0% 100%",
        sidebarPrimary: "264 73% 75%",
        sidebarPrimaryForeground: "0 0% 13%",
        sidebarAccent: "276 76% 38%",
        sidebarAccentForeground: "0 0% 100%",
        sidebarBorder: "276 76% 38%",
        sidebarRing: "264 73% 75%",
      },
      dark: {
        primary: "282 75% 55%",
        primaryForeground: "0 0% 100%",
        accent: "270 40% 65%",
        accentForeground: "0 0% 93%",
        ring: "282 75% 55%",
        sidebarBackground: "0 0% 9%",
        sidebarForeground: "0 0% 93%",
        sidebarPrimary: "270 40% 65%",
        sidebarPrimaryForeground: "0 0% 93%",
        sidebarAccent: "0 0% 15%",
        sidebarAccentForeground: "0 0% 93%",
        sidebarBorder: "0 0% 15%",
        sidebarRing: "270 40% 65%",
      },
    },
  },
  "restro": {
    id: "restro",
    name: "Minta Restro",
    shortName: "Restro",
    tagline: "Multi-Mode Food & Restaurant Services",
    apiUrl: import.meta.env.VITE_RESTRO_API_URL || "http://localhost:4001/api/v1/minta-fresh",
    badgeVariant: "secondary",
    theme: {
      brandColor: "hsl(24 95% 48%)", // Warm Orange / Culinary Amber
      brandHex: "#EA580C",
      brandHoverHex: "#C2410C",
      tagColor: "text-orange-600 dark:text-orange-400",
      light: {
        primary: "24 95% 48%",
        primaryForeground: "0 0% 100%",
        accent: "32 90% 70%",
        accentForeground: "0 0% 13%",
        ring: "24 95% 48%",
        sidebarBackground: "24 95% 42%",
        sidebarForeground: "0 0% 100%",
        sidebarPrimary: "32 90% 70%",
        sidebarPrimaryForeground: "0 0% 13%",
        sidebarAccent: "24 95% 36%",
        sidebarAccentForeground: "0 0% 100%",
        sidebarBorder: "24 95% 36%",
        sidebarRing: "32 90% 70%",
      },
      dark: {
        primary: "24 95% 55%",
        primaryForeground: "0 0% 100%",
        accent: "30 80% 60%",
        accentForeground: "0 0% 93%",
        ring: "24 95% 55%",
        sidebarBackground: "0 0% 9%",
        sidebarForeground: "0 0% 93%",
        sidebarPrimary: "24 95% 55%",
        sidebarPrimaryForeground: "0 0% 93%",
        sidebarAccent: "0 0% 15%",
        sidebarAccentForeground: "0 0% 93%",
        sidebarBorder: "0 0% 15%",
        sidebarRing: "24 95% 55%",
      },
    },
  },
};

/**
 * Applies the platform's color codes directly to CSS custom properties on document.documentElement
 */
export const applyPlatformTheme = (platform: PlatformId, isDark: boolean) => {
  if (typeof window === "undefined") return;
  const root = window.document.documentElement;
  const config = PLATFORMS[platform];
  if (!config) return;

  const mode = isDark ? "dark" : "light";
  const colors = config.theme[mode];

  root.style.setProperty("--primary", colors.primary);
  root.style.setProperty("--primary-foreground", colors.primaryForeground);
  root.style.setProperty("--accent", colors.accent);
  root.style.setProperty("--accent-foreground", colors.accentForeground);
  root.style.setProperty("--ring", colors.ring);
  root.style.setProperty("--sidebar-background", colors.sidebarBackground);
  root.style.setProperty("--sidebar-foreground", colors.sidebarForeground);
  root.style.setProperty("--sidebar-primary", colors.sidebarPrimary);
  root.style.setProperty("--sidebar-primary-foreground", colors.sidebarPrimaryForeground);
  root.style.setProperty("--sidebar-accent", colors.sidebarAccent);
  root.style.setProperty("--sidebar-accent-foreground", colors.sidebarAccentForeground);
  root.style.setProperty("--sidebar-border", colors.sidebarBorder);
  root.style.setProperty("--sidebar-ring", colors.sidebarRing);

  root.setAttribute("data-platform", platform);
};

interface PlatformState {
  platform: PlatformId;
  switchPlatform: (next: PlatformId) => void;
}

export const usePlatformStore = create<PlatformState>()(
  persist(
    (set) => ({
      platform: "minta-fresh",
      switchPlatform: (next: PlatformId) => {
        set({ platform: next });
        window.dispatchEvent(
          new CustomEvent("platform_switched", { detail: { platform: next } })
        );
      },
    }),
    {
      name: "minta-admin-platform",
    }
  )
);
