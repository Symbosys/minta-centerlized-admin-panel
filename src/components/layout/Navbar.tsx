import { useState, useRef, useEffect } from "react";
import {
  Menu,
  Search,
  Bell,
  User,
  Moon,
  Sun,
  LogOut,
  X,
  ShoppingBag,
  Users,
  Store,
  Package,
  Layers,
  Settings,
  ShieldCheck,
  Ticket,
  CreditCard,
  Receipt,
  FolderTree,
  HeadphonesIcon,
  LayoutDashboard,
  FileText,
  UserCheck,
  ArrowRight,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useRole } from "@/context/RoleContext";
import { useAuth } from "@/context/AuthContext";
import { usePlatform } from "@/context/PlatformContext";
import { useAdminLogout } from "@/api/hooks/admins/admin.hooks";
import { useNavigate, useLocation } from "react-router-dom";
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

interface NavSearchItem {
  title: string;
  path: string;
  icon: any;
  category: string;
  keywords: string[];
  platform?: "minta-fresh" | "restro";
}

const ALL_NAV_PAGES: NavSearchItem[] = [
  {
    title: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
    category: "Navigation",
    keywords: ["home", "stats", "overview", "metrics", "analytics"],
  },
  {
    title: "Orders",
    path: "/orders",
    icon: ShoppingBag,
    category: "Management",
    keywords: ["orders", "sales", "deliveries", "history", "transactions"],
  },
  {
    title: "Users",
    path: "/users",
    icon: Users,
    category: "Management",
    keywords: ["users", "customers", "clients", "accounts"],
  },
  {
    title: "Vendors",
    path: "/vendors",
    icon: Store,
    category: "Management",
    keywords: ["vendors", "stores", "restaurants", "shops", "partners"],
  },
  {
    title: "Vendor Owners",
    path: "/vendor-owners",
    icon: UserCheck,
    category: "Management",
    keywords: ["vendor owners", "proprietors", "business owners"],
  },
  {
    title: "Manage Subscriptions",
    path: "/subscriptions",
    icon: CreditCard,
    category: "Finance",
    keywords: ["subscriptions", "plans", "daily pass", "monthly pass", "pricing"],
  },
  {
    title: "Vendor Subscriptions",
    path: "/vendor-subscriptions",
    icon: Receipt,
    category: "Finance",
    keywords: ["vendor subscriptions", "enrollments", "billing", "store passes"],
  },
  {
    title: "Products",
    path: "/products",
    icon: Package,
    category: "Catalog",
    keywords: ["products", "items", "grocery", "food", "menu", "stock"],
  },
  {
    title: "Categories",
    path: "/categories",
    icon: FolderTree,
    category: "Catalog",
    keywords: ["categories", "subcategories", "sections", "taxonomy"],
  },
  {
    title: "Modes",
    path: "/modes",
    icon: Layers,
    category: "Catalog",
    keywords: ["modes", "dining", "takeaway", "delivery", "restro modes"],
    platform: "restro",
  },
  {
    title: "Offers & Promotions",
    path: "/offers",
    icon: Ticket,
    category: "Marketing",
    keywords: ["offers", "promotions", "discounts", "coupons", "deals"],
  },
  {
    title: "Global Settings",
    path: "/settings",
    icon: Settings,
    category: "System",
    keywords: ["settings", "configuration", "radius", "charges", "fees"],
  },
  {
    title: "Admin Management",
    path: "/admin-management",
    icon: ShieldCheck,
    category: "System",
    keywords: ["admins", "staff", "managers", "team"],
  },
  {
    title: "Sub-Admin Permissions",
    path: "/admin-permissions",
    icon: ShieldCheck,
    category: "System",
    keywords: ["permissions", "roles", "access control", "rbac"],
  },
  {
    title: "Legal Pages",
    path: "/legal-pages",
    icon: FileText,
    category: "System",
    keywords: ["legal", "terms", "privacy", "policy", "refund policy"],
  },
  {
    title: "Help & Support",
    path: "/support",
    icon: HeadphonesIcon,
    category: "System",
    keywords: ["support", "tickets", "chat", "customer service", "help"],
  },
];

export const Navbar = ({ onToggleSidebar }: NavbarProps) => {
  const { theme, toggleTheme } = useTheme();
  const { role } = useRole();
  const { admin, clearAuth } = useAuth();
  const { platform, currentConfig } = usePlatform();
  const logoutMutation = useAdminLogout();
  const navigate = useNavigate();
  const location = useLocation();

  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut Ctrl+K or / to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsDropdownOpen(true);
      } else if (e.key === "Escape") {
        setIsDropdownOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  // Filter available pages by platform and search query
  const trimmedQuery = searchQuery.trim().toLowerCase();

  const availablePages = ALL_NAV_PAGES.filter((page) => {
    if (page.platform && page.platform !== platform) return false;
    return true;
  });

  const matchingPages = trimmedQuery
    ? availablePages.filter(
        (page) =>
          page.title.toLowerCase().includes(trimmedQuery) ||
          page.keywords.some((k) => k.toLowerCase().includes(trimmedQuery))
      )
    : [];

  // Execute direct module search
  const handleExecuteSearch = (targetRoute: string, query: string) => {
    setIsDropdownOpen(false);
    setMobileSearchOpen(false);
    navigate(`${targetRoute}?search=${encodeURIComponent(query)}`);
  };

  // Submit search on Enter key
  const handleFormSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!trimmedQuery) return;

    setIsDropdownOpen(false);
    setMobileSearchOpen(false);

    // If an exact matching page exists, go directly to that page
    const exactPage = matchingPages.find(
      (p) => p.title.toLowerCase() === trimmedQuery
    );
    if (exactPage) {
      navigate(exactPage.path);
      return;
    }

    // If currently on an entity list page, apply search in the current page
    if (location.pathname.startsWith("/users")) {
      handleExecuteSearch("/users", trimmedQuery);
      return;
    }
    if (location.pathname.startsWith("/vendors")) {
      handleExecuteSearch("/vendors", trimmedQuery);
      return;
    }
    if (location.pathname.startsWith("/products")) {
      handleExecuteSearch("/products", trimmedQuery);
      return;
    }
    if (location.pathname.startsWith("/subscriptions")) {
      handleExecuteSearch("/subscriptions", trimmedQuery);
      return;
    }
    if (location.pathname.startsWith("/vendor-subscriptions")) {
      handleExecuteSearch("/vendor-subscriptions", trimmedQuery);
      return;
    }

    // Default global search targets Orders
    handleExecuteSearch("/orders", trimmedQuery);
  };

  const clearSearch = () => {
    setSearchQuery("");
    inputRef.current?.focus();
  };

  return (
    <header className="h-16 border-b border-border bg-card sticky top-0 z-30">
      <div className="h-full px-4 flex items-center justify-between gap-3">
        {/* ─── Left Section ────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="hover:bg-muted shrink-0"
          >
            <Menu className="w-5 h-5" />
          </Button>

          {/* Platform Status Pill with Dynamic Platform Color */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full border border-border bg-muted/40 shrink-0">
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

          {/* ─── Global Search Bar ───────────────────────────────────────── */}
          <div
            ref={searchContainerRef}
            className={`relative flex-1 max-w-lg ${
              mobileSearchOpen ? "flex" : "hidden md:flex"
            }`}
          >
            <form onSubmit={handleFormSubmit} className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                placeholder={`Search orders, users, vendors, products in ${currentConfig.shortName}...`}
                className="pl-9 pr-16 bg-muted/50 border border-border/60 hover:border-border focus:border-primary text-sm h-9 rounded-lg transition-colors"
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="text-muted-foreground hover:text-foreground p-0.5 rounded"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <kbd className="hidden lg:inline-flex items-center gap-0.5 text-[10px] font-mono text-muted-foreground bg-background/80 border px-1.5 py-0.5 rounded shadow-2xs pointer-events-none">
                  Ctrl K
                </kbd>
              </div>
            </form>

            {/* ─── Search Dropdown Popover ─────────────────────────────────── */}
            {isDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-popover text-popover-foreground border border-border rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in-0 zoom-in-95 duration-100 max-h-[80vh] flex flex-col">
                <div className="p-2 border-b bg-muted/30 flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    Searching in{" "}
                    <strong className="text-foreground">
                      {currentConfig.name}
                    </strong>
                  </span>
                  <span>Press ↵ to search</span>
                </div>

                <div className="overflow-y-auto p-1.5 space-y-2">
                  {/* Matching Pages (Quick Page Jump) - SHOWN FIRST */}
                  {matchingPages.length > 0 && (
                    <div>
                      <div className="px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Quick Page Jump
                      </div>
                      <div className="space-y-0.5">
                        {matchingPages.map((page) => {
                          const IconComponent = page.icon;
                          return (
                            <button
                              key={page.path}
                              type="button"
                              onClick={() => {
                                setIsDropdownOpen(false);
                                setMobileSearchOpen(false);
                                navigate(page.path);
                              }}
                              className="w-full flex items-center justify-between px-2.5 py-2 text-sm rounded-lg hover:bg-muted text-left transition-colors group"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center shrink-0">
                                  <IconComponent className="w-4 h-4 text-foreground/80" />
                                </div>
                                <span className="font-medium">{page.title}</span>
                              </div>
                              <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                                {page.category}
                              </Badge>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Search Across Data - SHOWN BELOW */}
                  {trimmedQuery && (
                    <div>
                      <div className="px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Search Across Data
                      </div>
                      <div className="space-y-0.5">
                        <button
                          type="button"
                          onClick={() => handleExecuteSearch("/orders", trimmedQuery)}
                          className="w-full flex items-center justify-between px-2.5 py-2 text-sm rounded-lg hover:bg-muted text-left transition-colors group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                              <ShoppingBag className="w-4 h-4" />
                            </div>
                            <div className="truncate">
                              <span className="font-medium">Search Orders</span>{" "}
                              <span className="text-muted-foreground text-xs truncate">
                                for &ldquo;{searchQuery}&rdquo;
                              </span>
                            </div>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground shrink-0 transition-transform group-hover:translate-x-0.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleExecuteSearch("/users", trimmedQuery)}
                          className="w-full flex items-center justify-between px-2.5 py-2 text-sm rounded-lg hover:bg-muted text-left transition-colors group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                              <Users className="w-4 h-4" />
                            </div>
                            <div className="truncate">
                              <span className="font-medium">Search Users</span>{" "}
                              <span className="text-muted-foreground text-xs truncate">
                                for &ldquo;{searchQuery}&rdquo;
                              </span>
                            </div>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground shrink-0 transition-transform group-hover:translate-x-0.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleExecuteSearch("/vendors", trimmedQuery)}
                          className="w-full flex items-center justify-between px-2.5 py-2 text-sm rounded-lg hover:bg-muted text-left transition-colors group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                              <Store className="w-4 h-4" />
                            </div>
                            <div className="truncate">
                              <span className="font-medium">Search Vendors</span>{" "}
                              <span className="text-muted-foreground text-xs truncate">
                                for &ldquo;{searchQuery}&rdquo;
                              </span>
                            </div>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground shrink-0 transition-transform group-hover:translate-x-0.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleExecuteSearch("/products", trimmedQuery)}
                          className="w-full flex items-center justify-between px-2.5 py-2 text-sm rounded-lg hover:bg-muted text-left transition-colors group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                              <Package className="w-4 h-4" />
                            </div>
                            <div className="truncate">
                              <span className="font-medium">Search Products</span>{" "}
                              <span className="text-muted-foreground text-xs truncate">
                                for &ldquo;{searchQuery}&rdquo;
                              </span>
                            </div>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground shrink-0 transition-transform group-hover:translate-x-0.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Empty state when no matches */}
                  {trimmedQuery && matchingPages.length === 0 && (
                    <div className="p-3 text-center text-xs text-muted-foreground">
                      Press <kbd className="px-1.5 py-0.5 bg-muted rounded border text-[10px]">Enter</kbd> to search for &ldquo;{searchQuery}&rdquo; in {currentConfig.name}
                    </div>
                  )}

                  {/* Default suggestions when query is empty */}
                  {!trimmedQuery && (
                    <div>
                      <div className="px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Popular Sections
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        {availablePages.slice(0, 8).map((page) => {
                          const IconComponent = page.icon;
                          return (
                            <button
                              key={page.path}
                              type="button"
                              onClick={() => {
                                setIsDropdownOpen(false);
                                setMobileSearchOpen(false);
                                navigate(page.path);
                              }}
                              className="flex items-center gap-2 px-2.5 py-2 text-xs rounded-lg hover:bg-muted text-left transition-colors"
                            >
                              <IconComponent className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                              <span className="truncate">{page.title}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ─── Right Section ───────────────────────────────────────────── */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Mobile Search Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setMobileSearchOpen((prev) => !prev);
              setTimeout(() => inputRef.current?.focus(), 50);
            }}
            className="md:hidden hover:bg-muted"
            title="Search"
          >
            <Search className="w-5 h-5" />
          </Button>

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
              <Button variant="ghost" className="gap-2 hover:bg-muted px-2">
                <div
                  className="w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-xs shrink-0"
                  style={{ backgroundColor: currentConfig.theme.brandHex }}
                >
                  {admin?.name ? admin.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                </div>
                <div className="hidden lg:block text-left">
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

