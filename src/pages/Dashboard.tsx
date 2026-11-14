import { StatCard } from "@/components/ui/stat-card";
import { useGetDashboardOrderCount } from "@/api/hooks/admins/admin.hooks";
import { useGetAllUsers } from "@/api/hooks/user/user.hook";
import { useGetAllVendors } from "@/api/hooks/vendor/vendor.hook";
import { usePlatform } from "@/context/PlatformContext";
import { useRole } from "@/context/RoleContext";
import { Users, Store, ShoppingBag, Leaf, UtensilsCrossed, ArrowRightLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const { platform, currentConfig, switchPlatform } = usePlatform();
  const { permissions } = useRole();
  const canViewUsers = permissions.includes("VIEW_USERS");
  const canViewVendors = permissions.includes("VIEW_VENDORS");
  const canViewOrders = permissions.includes("VIEW_ORDERS");

  const usersQuery = useGetAllUsers({ limit: 1 }, canViewUsers);
  const vendorsQuery = useGetAllVendors({ limit: 1 }, canViewVendors);
  const ordersQuery = useGetDashboardOrderCount(canViewOrders);

  const handleToggle = () => {
    switchPlatform(platform === "minta-fresh" ? "restro" : "minta-fresh");
  };
  const count = (canView: boolean, isLoading: boolean, isError: boolean, value?: number) => {
    if (!canView) return "No access";
    if (isLoading) return "Loading…";
    if (isError || value === undefined) return "Unavailable";
    return value.toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div
        className="rounded-xl p-5 border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/60"
        style={{ borderLeftWidth: "4px", borderLeftColor: currentConfig.theme.brandHex }}
      >
        <div className="flex items-center gap-3.5">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm text-white"
            style={{ backgroundColor: currentConfig.theme.brandHex }}
          >
            {platform === "minta-fresh" ? <Leaf className="w-6 h-6" /> : <UtensilsCrossed className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{currentConfig.name} Dashboard</h1>
              <Badge variant="outline" style={{ color: currentConfig.theme.brandHex, borderColor: currentConfig.theme.brandHex }}>
                {platform === "minta-fresh" ? "Grocery Platform" : "Restaurant Platform"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {currentConfig.tagline} · Live totals from the active platform API
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleToggle} className="gap-2">
          <ArrowRightLeft className="w-3.5 h-3.5" />
          Switch to {platform === "minta-fresh" ? "Minta Restro" : "Minta Fresh"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Users"
          value={count(canViewUsers, usersQuery.isLoading, usersQuery.isError, usersQuery.data?.pages[0]?.total)}
          description="Active platform database"
          icon={Users}
        />
        <StatCard
          title="Total Vendors"
          value={count(canViewVendors, vendorsQuery.isLoading, vendorsQuery.isError, vendorsQuery.data?.pages[0]?.totalVendors)}
          description="Active platform database"
          icon={Store}
        />
        <StatCard
          title="Total Orders"
          value={count(canViewOrders, ordersQuery.isLoading, ordersQuery.isError, ordersQuery.data)}
          description="Active platform database"
          icon={ShoppingBag}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Metrics are fetched from {currentConfig.name}. Values are unavailable if the API request fails or your account lacks the required permission.
      </p>
    </div>
  );
};

export default Dashboard;
