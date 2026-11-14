import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Save, ArrowLeft, CheckSquare } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  useGetAllAdmins,
  useGetAllPermissions,
  useGetAdminPermissions,
  useAssignAdminPermissions,
} from "@/api/hooks/admins/admin.hooks";

export default function SubAdminPermissions() {
  const navigate = useNavigate();
  const { id: routeAdminId } = useParams<{ id?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  // Determine initial selected sub-admin ID from URL param or query string
  const initialAdminId = routeAdminId || searchParams.get("subAdminId") || "";

  const [selectedSubAdminId, setSelectedSubAdminId] = useState<string>(initialAdminId);
  const [selectedPermissionKeys, setSelectedPermissionKeys] = useState<string[]>([]);

  // API Hooks
  const { data: adminsData, isLoading: isLoadingAdmins } = useGetAllAdmins();
  const { data: permissionsData, isLoading: isLoadingPermissions } = useGetAllPermissions();
  const { data: adminPermissionsData, isLoading: isLoadingAdminPermissions } = useGetAdminPermissions(selectedSubAdminId);
  const { mutate: assignPermissions, isPending: isAssigning } = useAssignAdminPermissions();

  const admins = useMemo(() => (Array.isArray(adminsData) ? adminsData : (adminsData?.data || [])), [adminsData]);
  const subAdmins = useMemo(() => admins.filter((a: any) => a.role === "SUB_ADMIN"), [admins]);

  // Set default selected sub-admin if none provided and sub-admins exist
  useEffect(() => {
    if (!selectedSubAdminId && subAdmins.length > 0) {
      setSelectedSubAdminId(subAdmins[0].id.toString());
    }
  }, [subAdmins, selectedSubAdminId]);

  // Sync selected sub-admin with URL search params
  const handleSelectSubAdmin = (subAdminId: string) => {
    setSelectedSubAdminId(subAdminId);
    setSearchParams({ subAdminId });
  };

  const allPermissionList = useMemo(() => {
    if (!permissionsData) return [];
    return permissionsData.permissions || [];
  }, [permissionsData]);

  const groupedPermissions = useMemo(() => {
    if (!permissionsData) return {};
    return permissionsData.grouped || {};
  }, [permissionsData]);

  // Sync pre-selected permission keys when sub-admin permissions load
  useEffect(() => {
    if (adminPermissionsData?.permissionKeys) {
      setSelectedPermissionKeys(adminPermissionsData.permissionKeys);
    } else {
      setSelectedPermissionKeys([]);
    }
  }, [adminPermissionsData, selectedSubAdminId]);

  const handleTogglePermission = (key: string) => {
    setSelectedPermissionKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleSelectByAction = (actionType: string) => {
    const actionKeys = allPermissionList
      .filter((p: any) => p.type === actionType)
      .map((p: any) => p.key);
    setSelectedPermissionKeys((prev) => Array.from(new Set([...prev, ...actionKeys])));
  };

  const handleSelectAll = () => {
    const allKeys = allPermissionList.map((p: any) => p.key);
    setSelectedPermissionKeys(allKeys);
  };

  const handleClearAll = () => {
    setSelectedPermissionKeys([]);
  };

  const handleSavePermissions = () => {
    if (!selectedSubAdminId) return;
    assignPermissions(
      { adminId: selectedSubAdminId, permissionKeys: selectedPermissionKeys },
      {
        onSuccess: () => {
          // Stay on page after successful save
        },
      }
    );
  };

  const getActionBadgeStyle = (type: string) => {
    switch (type) {
      case "VIEW":
        return "bg-sky-500/10 text-sky-600 border-sky-200 dark:border-sky-800";
      case "CREATE":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-800";
      case "UPDATE":
        return "bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-800";
      case "DELETE":
        return "bg-rose-500/10 text-rose-600 border-rose-200 dark:border-rose-800";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const currentSelectedSubAdmin = useMemo(
    () => subAdmins.find((sa: any) => sa.id.toString() === selectedSubAdminId),
    [subAdmins, selectedSubAdminId]
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Header Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => navigate("/admin-management")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <Shield className="h-7 w-7 text-primary" />
              Sub-Admin Permission Assignment
            </h1>
            <p className="text-sm text-muted-foreground">
              Configure granular action-level access permissions (`CREATE`, `VIEW`, `UPDATE`, `DELETE`) for sub-admins.
            </p>
          </div>
        </div>

        {selectedSubAdminId && (
          <Button onClick={handleSavePermissions} disabled={isAssigning} className="shadow">
            <Save className="h-4 w-4 mr-2" />
            {isAssigning ? "Saving Changes..." : "Save Assigned Permissions"}
          </Button>
        )}
      </div>

      {/* Sub-Admin Target Selector Card */}
      <Card className="p-6 border shadow-sm">
        <div className="grid md:grid-cols-2 gap-6 items-center">
          <div className="space-y-2">
            <Label className="text-base font-semibold">Target Sub-Admin Account</Label>
            {isLoadingAdmins ? (
              <div className="text-sm text-muted-foreground">Loading sub-admins list...</div>
            ) : (
              <Select value={selectedSubAdminId} onValueChange={handleSelectSubAdmin}>
                <SelectTrigger className="w-full text-base py-5">
                  <SelectValue placeholder="Choose a sub-admin to assign permissions..." />
                </SelectTrigger>
                <SelectContent>
                  {subAdmins.map((sa: any) => (
                    <SelectItem key={sa.id} value={sa.id.toString()}>
                      {sa.name} ({sa.email})
                    </SelectItem>
                  ))}
                  {subAdmins.length === 0 && (
                    <SelectItem value="none" disabled>
                      No Sub-Admin Accounts Registered
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            )}
          </div>

          {currentSelectedSubAdmin && (
            <div className="p-4 rounded-lg bg-muted/30 border space-y-1">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sub-Admin Profile</div>
              <div className="text-base font-bold text-foreground">{currentSelectedSubAdmin.name}</div>
              <div className="text-sm text-muted-foreground">{currentSelectedSubAdmin.email}</div>
              <div className="text-xs font-mono text-muted-foreground">Phone: {currentSelectedSubAdmin.mobile || currentSelectedSubAdmin.user?.mobile || "-"}</div>
            </div>
          )}
        </div>
      </Card>

      {/* Permissions Configuration Area */}
      {selectedSubAdminId ? (
        <div className="space-y-6">
          {/* Quick Helper Actions Toolbar */}
          <Card className="p-4 border bg-card shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  Assigned Actions:{" "}
                  <span className="font-bold text-primary text-base">
                    {selectedPermissionKeys.length}
                  </span>{" "}
                  of <span className="font-semibold text-muted-foreground">{allPermissionList.length}</span> Total
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => handleSelectByAction("VIEW")}>
                  Select All VIEW
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleSelectByAction("CREATE")}>
                  Select All CREATE
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleSelectByAction("UPDATE")}>
                  Select All UPDATE
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleSelectByAction("DELETE")}>
                  Select All DELETE
                </Button>
                <Button size="sm" variant="outline" onClick={handleSelectAll}>
                  Grant Full Access
                </Button>
                <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={handleClearAll}>
                  Clear All
                </Button>
              </div>
            </div>
          </Card>

          {/* Module Permissions Grid */}
          {isLoadingPermissions || isLoadingAdminPermissions ? (
            <div className="text-center py-16 text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
              Loading permissions schema for sub-admin...
            </div>
          ) : (
            <div className="grid gap-4">
              {Object.keys(groupedPermissions).map((moduleName) => {
                const modulePerms = groupedPermissions[moduleName] || [];

                return (
                  <Card key={moduleName} className="p-5 border hover:border-primary/40 transition-all shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1 md:max-w-xs">
                        <h3 className="font-bold text-base text-foreground capitalize flex items-center gap-2">
                          {moduleName.replace("_", " ")} Module
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Granular action permissions for {moduleName.toLowerCase()} operations
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-4">
                        {modulePerms.map((perm: any) => {
                          const isChecked = selectedPermissionKeys.includes(perm.key);
                          return (
                            <label
                              key={perm.key}
                              className="flex items-center gap-2 cursor-pointer select-none text-sm font-medium p-2 rounded-md hover:bg-muted/40 transition-all"
                              onClick={() => handleTogglePermission(perm.key)}
                              title={perm.description}
                            >
                              <Checkbox checked={isChecked} />
                              <span className={`px-2.5 py-1 rounded text-xs border font-semibold ${getActionBadgeStyle(perm.type)}`}>
                                {perm.type}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Save Action Footer */}
          <div className="flex justify-end pt-4">
            <Button size="lg" onClick={handleSavePermissions} disabled={isAssigning} className="w-full sm:w-auto shadow-md">
              <Save className="h-5 w-5 mr-2" />
              {isAssigning ? "Saving Permissions..." : "Save Assigned Permissions"}
            </Button>
          </div>
        </div>
      ) : (
        <Card className="text-center py-16 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
          Please select a sub-admin above to view and configure assigned module permissions.
        </Card>
      )}
    </div>
  );
}

