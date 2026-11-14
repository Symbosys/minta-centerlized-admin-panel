import { Menu, Search, Bell, User, Moon, Sun, LogOut } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useRole } from "@/context/RoleContext";
import { useAuth } from "@/context/AuthContext";
import { usePlatform } from "@/context/PlatformContext";
import { useAdminLogout } from "@/api/hooks/admins/admin.hooks";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar = ({ onToggleSidebar }: NavbarProps) => {
  const { theme, toggleTheme } = useTheme();
  const { role } = useRole();
  const { admin, clearAuth } = useAuth();
  const { platform, currentConfig } = usePlatform();
  const logoutMutation = useAdminLogout();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutMutation.mutate(platform, {
      onSuccess: () => {
        clearAuth(platform);
        navigate("/auth", { replace: true });
      },
      onError: () => {
        clearAuth(platform);
        navigate("/auth", { replace: true });
      },
    });
  };

  return (
    <header className="h-16 border-b border-border bg-card sticky top-0 z-30">
      <div className="h-full px-4 flex items-center justify-between gap-4">
        {/* ─── Left Section ────────────────────────────────────────────── */}
        <div className="flex items-center gap-4 flex-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="hover:bg-muted shrink-0"
          >
            <Menu className="w-5 h-5" />
          </Button>

          {/* Platform Status Pill with Dynamic Platform Color */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full border border-border bg-muted/40">
            <span
              className="flex h-2.5 w-2.5 rounded-full animate-pulse"
              style={{ backgroundColor: currentConfig.theme.brandHex }}
            />
            <span className="text-xs font-semibold text-foreground">
              {currentConfig.name}
            </span>
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 h-4 font-medium border-border"
              style={{ color: currentConfig.theme.brandHex }}
            >
              {platform === "minta-fresh" ? "Grocery API" : "Restro API"}
            </Badge>
          </div>

          <div className="relative flex-1 max-w-md hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={`Search ${currentConfig.name} data...`}
              className="pl-9 bg-muted/50 border-0"
            />
          </div>
        </div>

        {/* ─── Right Section ───────────────────────────────────────────── */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="hover:bg-muted"
            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative hover:bg-muted">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>System Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-80 overflow-y-auto">
                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium text-sm">Centralized Control Active</span>
                    <Badge variant="secondary" className="text-xs">Live</Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Connected to {currentConfig.name} ({currentConfig.apiUrl})
                  </span>
                  <span className="text-xs text-muted-foreground">Just now</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 hover:bg-muted">
                <div
                  className="w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-xs"
                  style={{ backgroundColor: currentConfig.theme.brandHex }}
                >
                  {admin?.name ? admin.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium leading-none">{admin?.name || admin?.email || "Admin User"}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{role || "No role"}</div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div>Signed in as</div>
                <div className="text-xs font-normal text-muted-foreground truncate">{admin?.email || "admin"}</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={handleLogout}>
                <LogOut className="mr-2 w-4 h-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
