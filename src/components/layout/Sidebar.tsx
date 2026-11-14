import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useRole } from "@/context/RoleContext";
import { usePlatform, PLATFORMS, type PlatformId } from "@/context/PlatformContext";
import {
  LayoutDashboard,
  Users,
  Store,
  UserCheck,
  Bike,
  ShoppingBag,
  Package,
  FolderTree,
  Settings,
  ShieldCheck,
  HeadphonesIcon,
  ChevronDown,
  PackageOpen,
  CalendarDays,
  Megaphone,
  Ticket,
  Gavel,
  CreditCard,
  Receipt,
  Layers,
  UtensilsCrossed,
  Leaf,
  ArrowRightLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface MenuItem {
  title: string;
  icon: any;
  path: string;
  permission: string;
  requiredRole?: "ADMIN" | "SUB_ADMIN";
  platform?: PlatformId; // specific platform only
  subItems?: { title: string; path: string }[];
}

const baseMenuItems: MenuItem[] = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/",
    permission: "VIEW_DASHBOARD",
  },
  {
    title: "Users",
    icon: Users,
    path: "/users",
    permission: "VIEW_USERS",
  },
  {
    title: "Vendors",
    icon: Store,
    path: "/vendors",
    permission: "VIEW_VENDORS",
  },
  {
    title: "Vendor Owners",
    icon: UserCheck,
    path: "/vendor-owners",
    permission: "VIEW_VENDORS",
    requiredRole: "ADMIN",
  },
  // FRESH ONLY
  {
    title: "Manage Subscriptions",
    icon: CreditCard,
    path: "/subscriptions",
    permission: "VIEW_VENDORS",
    platform: "minta-fresh",
  },
  {
    title: "Vendor Subscriptions",
    icon: Receipt,
    path: "/vendor-subscriptions",
    permission: "VIEW_VENDORS",
    platform: "minta-fresh",
  },
  // RESTRO ONLY
  {
    title: "Mode",
    icon: Layers,
    path: "/modes",
    permission: "VIEW_PRODUCTS",
    platform: "restro",
  },
  // {
  //   title: "Delivery Partners",
  //   icon: Bike,
  //   path: "/delivery-partners",
  //   permission: "VIEW_DELIVERY_PARTNERS",
  // },
  // {
  //   title: "Delivery Gigs",
  //   icon: CalendarDays,
  //   path: "/delivery-gigs",
  //   permission: "VIEW_DELIVERY_PARTNERS",
  // },
  {
    title: "Orders",
    icon: ShoppingBag,
    path: "/orders",
    permission: "VIEW_ORDERS",
  },
  {
    title: "Products",
    icon: Package,
    path: "/products",
    permission: "VIEW_PRODUCTS",
  },
  // {
  //   title: "Packing Bags",
  //   icon: PackageOpen,
  //   path: "/packing-bags",
  //   permission: "VIEW_PACKING_BAGS",
  //   subItems: [
  //     { title: "Create Product", path: "/packing-bags/create" },
  //     { title: "Products List", path: "/packing-bags/products" },
  //     { title: "Orders", path: "/packing-bags/orders" },
  //   ],
  // },
  {
    title: "Categories",
    icon: FolderTree,
    path: "/categories",
    permission: "VIEW_CATEGORIES",
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/settings",
    permission: "VIEW_SETTINGS",
  },
  {
    title: "Admin Management",
    icon: ShieldCheck,
    path: "/admin-management",
    permission: "VIEW_ADMINS",
  },
  {
    title: "Advertisements",
    icon: Megaphone,
    path: "/advertisements",
    permission: "VIEW_PROMOTIONS",
  },
  {
    title: "Offers",
    icon: Ticket,
    path: "/offers",
    permission: "VIEW_PROMOTIONS",
  },
  {
    title: "Legal Pages",
    icon: Gavel,
    path: "/legal-pages",
    permission: "VIEW_SETTINGS",
  },
  {
    title: "Support & Help",
    icon: HeadphonesIcon,
    path: "/support",
    permission: "VIEW_SUPPORT",
  },
];

export const Sidebar = ({ collapsed }: { collapsed: boolean }) => {
  const { permissions, role } = useRole();
  const { platform, switchPlatform, currentConfig } = usePlatform();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpand = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]
    );
  };

  const handleTogglePlatform = (targetPlatform: PlatformId) => {
    if (targetPlatform !== platform) {
      switchPlatform(targetPlatform);
    }
  };

  // Filter by permission and by active platform
  const filteredMenuItems = baseMenuItems.filter((item) => {
    const hasPermission = permissions.includes(item.permission);
    if (!hasPermission) return false;
    if (item.requiredRole && item.requiredRole !== role) return false;
    if (item.platform && item.platform !== platform) return false;
    return true;
  });

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 z-40 flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* ─── Top Brand Header ────────────────────────────────────────── */}
      <div className="h-16 flex items-center justify-between px-3 border-b border-sidebar-border">
        {collapsed ? (
          <div className="w-full flex justify-center">
            {platform === "minta-fresh" ? (
              <Leaf className="w-7 h-7 text-sidebar-primary" />
            ) : (
              <UtensilsCrossed className="w-7 h-7 text-sidebar-primary" />
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors shadow-sm text-white"
              style={{ backgroundColor: currentConfig.theme.brandHex }}
            >
              {platform === "minta-fresh" ? (
                <Leaf className="w-5 h-5" />
              ) : (
                <UtensilsCrossed className="w-5 h-5" />
              )}
            </div>
            <div className="flex flex-col truncate">
              <span className="text-base font-bold text-sidebar-foreground truncate tracking-tight">
                {currentConfig.name}
              </span>
              <span className="text-[11px] text-sidebar-foreground/70 uppercase tracking-wider font-semibold">
                Centralized Control
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ─── Platform Switcher Control ───────────────────────────────── */}
      <div className={cn("p-2 border-b border-sidebar-border/60 bg-sidebar-accent/30", collapsed && "px-1.5")}>
        {collapsed ? (
          <button
            onClick={() => handleTogglePlatform(platform === "minta-fresh" ? "restro" : "minta-fresh")}
            className="w-full py-2 flex flex-col items-center justify-center rounded-lg hover:bg-sidebar-accent transition-colors group"
            title={`Switch to ${platform === "minta-fresh" ? "Minta Restro" : "Minta Fresh"}`}
          >
            <ArrowRightLeft className="w-4 h-4 text-sidebar-foreground/80 group-hover:text-white transition-colors" />
            <span className="text-[9px] uppercase font-bold mt-1 text-sidebar-foreground/80">
              {platform === "minta-fresh" ? "Fresh" : "Restro"}
            </span>
          </button>
        ) : (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] uppercase font-bold text-sidebar-foreground/60 tracking-wider">
                Select Platform
              </span>
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 py-0 border-sidebar-border text-sidebar-foreground/90 font-medium bg-black/20"
              >
                {platform === "minta-fresh" ? "Grocery" : "Restaurant"}
              </Badge>
            </div>
            <div className="grid grid-cols-2 p-1 bg-black/25 rounded-lg gap-1 border border-white/10">
              <button
                type="button"
                onClick={() => handleTogglePlatform("minta-fresh")}
                className={cn(
                  "flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-semibold transition-all duration-200",
                  platform === "minta-fresh"
                    ? "text-white shadow-sm"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-white/5"
                )}
                style={
                  platform === "minta-fresh"
                    ? { backgroundColor: PLATFORMS["minta-fresh"].theme.brandHex }
                    : undefined
                }
              >
                <Leaf className="w-3.5 h-3.5" />
                <span>Fresh</span>
              </button>
              <button
                type="button"
                onClick={() => handleTogglePlatform("restro")}
                className={cn(
                  "flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-semibold transition-all duration-200",
                  platform === "restro"
                    ? "text-white shadow-sm"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-white/5"
                )}
                style={
                  platform === "restro"
                    ? { backgroundColor: PLATFORMS["restro"].theme.brandHex }
                    : undefined
                }
              >
                <UtensilsCrossed className="w-3.5 h-3.5" />
                <span>Restro</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Navigation Links ────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <ul className="space-y-1">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const isExpanded = expandedItems.includes(item.title);

            return (
              <li key={item.title}>
                {hasSubItems ? (
                  <>
                    <button
                      onClick={() => toggleExpand(item.title)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-smooth",
                        collapsed && "justify-center"
                      )}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-left text-sm font-medium">
                            {item.title}
                          </span>
                          <ChevronDown
                            className={cn(
                              "w-4 h-4 transition-transform",
                              isExpanded && "rotate-180"
                            )}
                          />
                        </>
                      )}
                    </button>
                    {!collapsed && isExpanded && item.subItems && (
                      <ul className="ml-4 mt-1 space-y-1">
                        {item.subItems.map((subItem) => (
                          <li key={subItem.path}>
                            <NavLink
                              to={subItem.path}
                              className={({ isActive }) =>
                                cn(
                                  "block px-3 py-1.5 rounded-lg text-xs text-sidebar-foreground/80 hover:bg-sidebar-accent transition-smooth",
                                  isActive && "bg-sidebar-primary text-sidebar-primary-foreground font-semibold"
                                )
                              }
                            >
                              {subItem.title}
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-smooth",
                        isActive && "bg-sidebar-primary text-sidebar-primary-foreground font-medium",
                        collapsed && "justify-center"
                      )
                    }
                    title={collapsed ? item.title : undefined}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    {!collapsed && (
                      <span className="text-sm font-medium truncate">{item.title}</span>
                    )}
                  </NavLink>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};
