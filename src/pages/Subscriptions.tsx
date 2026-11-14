import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Edit,
  Trash2,
  Calendar,
  Clock,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Search,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import {
  useGetAllSubscriptionPlans,
  useCreateSubscriptionPlan,
  useUpdateSubscriptionPlan,
  useDeleteSubscriptionPlan,
  SubscriptionPlan,
  SubscriptionType,
} from "@/api/hooks/subscription/subscription.hook";
import { showError, showSuccess } from "@/utils/message";
import { formatPrice, parseToDecimal } from "@/utils/util";
import { format } from "date-fns";

export default function Subscriptions() {
  // --- Modal States ---
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);

  // --- Form State ---
  const [planForm, setPlanForm] = useState({
    name: "",
    type: "MONTHLY" as SubscriptionType,
    price: "",
    description: "",
    isActive: true,
  });

  // --- Filter & Search States ---
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // --- Query & Mutations ---
  const {
    data: plans = [],
    isLoading,
    refetch,
    isRefetching,
  } = useGetAllSubscriptionPlans();

  const createPlanMutation = useCreateSubscriptionPlan();
  const updatePlanMutation = useUpdateSubscriptionPlan();
  const deletePlanMutation = useDeleteSubscriptionPlan();

  // Reset form
  const resetForm = () => {
    setPlanForm({
      name: "",
      type: "MONTHLY",
      price: "",
      description: "",
      isActive: true,
    });
    setEditingPlan(null);
  };

  // Open Edit Modal
  const handleEditClick = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setPlanForm({
      name: plan.name,
      type: plan.type,
      price: String(parseToDecimal(plan.price)),
      description: plan.description || "",
      isActive: plan.isActive,
    });
  };

  // Save Plan (Create or Update)
  const handleSubmitPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planForm.name.trim() || !planForm.price) {
      showError(new Error("Please enter plan name and price"));
      return;
    }

    try {
      if (editingPlan) {
        await updatePlanMutation.mutateAsync({
          id: editingPlan.id,
          payload: {
            name: planForm.name.trim(),
            type: planForm.type,
            price: Number(planForm.price),
            description: planForm.description.trim() || undefined,
            isActive: planForm.isActive,
          },
        });
        showSuccess("Subscription plan updated successfully");
        setEditingPlan(null);
      } else {
        await createPlanMutation.mutateAsync({
          name: planForm.name.trim(),
          type: planForm.type,
          price: Number(planForm.price),
          description: planForm.description.trim() || undefined,
          isActive: planForm.isActive,
        });
        showSuccess("Subscription plan created successfully");
        setIsCreateOpen(false);
      }
      resetForm();
    } catch (err: any) {
      showError(err);
    }
  };

  // Toggle active switch directly from table
  const handleToggleActive = async (plan: SubscriptionPlan, newStatus: boolean) => {
    try {
      await updatePlanMutation.mutateAsync({
        id: plan.id,
        payload: { isActive: newStatus },
      });
      showSuccess(`Plan ${newStatus ? "activated" : "deactivated"} successfully`);
    } catch (err: any) {
      showError(err);
    }
  };

  // Delete plan
  const handleDeletePlan = async () => {
    if (!deletingPlanId) return;
    try {
      await deletePlanMutation.mutateAsync(deletingPlanId);
      showSuccess("Plan removed or deactivated successfully");
      setDeletingPlanId(null);
    } catch (err: any) {
      showError(err);
    }
  };

  // Summary Metrics
  const metrics = useMemo(() => {
    const totalPlans = plans.length;
    const activePlans = plans.filter((p) => p.isActive).length;
    const dailyPlans = plans.filter((p) => p.type === "DAILY").length;
    const monthlyPlans = plans.filter((p) => p.type === "MONTHLY").length;

    return {
      totalPlans,
      activePlans,
      dailyPlans,
      monthlyPlans,
    };
  }, [plans]);

  // Filtered Plans List
  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      // Search filter
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesName = plan.name.toLowerCase().includes(term);
        const matchesDesc = plan.description?.toLowerCase().includes(term);
        if (!matchesName && !matchesDesc) return false;
      }

      // Type filter
      if (typeFilter !== "ALL" && plan.type !== typeFilter) {
        return false;
      }

      // Status filter
      if (statusFilter === "ACTIVE" && !plan.isActive) return false;
      if (statusFilter === "INACTIVE" && plan.isActive) return false;

      return true;
    });
  }, [plans, searchTerm, typeFilter, statusFilter]);

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CreditCard className="h-8 w-8 text-primary" />
            Manage Subscriptions
          </h1>
          <p className="text-muted-foreground mt-1">
            Create, view, update, and manage all vendor subscription plans (Daily & Monthly).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            onClick={() => {
              resetForm();
              setIsCreateOpen(true);
            }}
            className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Create Subscription Plan
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Subscription Plans
            </CardTitle>
            <CreditCard className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalPlans}</div>
            <p className="text-xs text-muted-foreground mt-1">All configured plans</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Plans
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{metrics.activePlans}</div>
            <p className="text-xs text-muted-foreground mt-1">Available for vendors to purchase</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Daily Plans
            </CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.dailyPlans}</div>
            <p className="text-xs text-muted-foreground mt-1">24-hour pay-as-you-go tiers</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Monthly Plans
            </CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.monthlyPlans}</div>
            <p className="text-xs text-muted-foreground mt-1">30-day recurring tiers</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="shadow-sm border-border">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>All Subscription Plans</CardTitle>
              <CardDescription>
                List of all master subscription plans configured in the platform.
              </CardDescription>
            </div>

            {/* Filter and Search Controls */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search plan name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-9"
                />
              </div>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[120px] h-9">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  <SelectItem value="DAILY">Daily</SelectItem>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[120px] h-9">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading subscription plans...
            </div>
          ) : filteredPlans.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <CreditCard className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="text-muted-foreground text-sm">
                {searchTerm || typeFilter !== "ALL" || statusFilter !== "ALL"
                  ? "No plans match your search and filter criteria."
                  : "No subscription plans created yet. Click 'Create Subscription Plan' above."}
              </p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Plan Name</TableHead>
                    <TableHead>Billing Type</TableHead>
                    <TableHead>Price (₹)</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Active Status</TableHead>
                    <TableHead>Created Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPlans.map((plan) => (
                    <TableRow key={plan.id} className="hover:bg-muted/30">
                      <TableCell className="font-semibold text-foreground">
                        {plan.name}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            plan.type === "DAILY"
                              ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300"
                              : "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300"
                          }
                        >
                          {plan.type === "DAILY" ? (
                            <Clock className="h-3 w-3 mr-1" />
                          ) : (
                            <Calendar className="h-3 w-3 mr-1" />
                          )}
                          {plan.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-bold text-foreground">
                        ₹{formatPrice(plan.price)}
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-muted-foreground text-sm">
                        {plan.description || "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={plan.isActive}
                            onCheckedChange={(val) => handleToggleActive(plan, val)}
                          />
                          <span
                            className={`text-xs font-medium ${
                              plan.isActive ? "text-emerald-600" : "text-muted-foreground"
                            }`}
                          >
                            {plan.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {plan.createdAt
                          ? format(new Date(plan.createdAt), "dd MMM yyyy")
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClick(plan)}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                            title="Edit Plan"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingPlanId(plan.id)}
                            className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                            title="Delete Plan"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ======================================================== */}
      {/* MODAL: CREATE / EDIT PLAN */}
      {/* ======================================================== */}
      <Dialog
        open={isCreateOpen || !!editingPlan}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateOpen(false);
            setEditingPlan(null);
            resetForm();
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSubmitPlan}>
            <DialogHeader>
              <DialogTitle>
                {editingPlan ? "Edit Subscription Plan" : "Create Subscription Plan"}
              </DialogTitle>
              <DialogDescription>
                Configure the name, billing duration, pricing, and status for this subscription plan.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Plan Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g. Daily Store Pass, Monthly Gold Plan"
                  value={planForm.name}
                  onChange={(e) =>
                    setPlanForm({ ...planForm, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Billing Type *</Label>
                  <Select
                    value={planForm.type}
                    onValueChange={(val: SubscriptionType) =>
                      setPlanForm({ ...planForm, type: val })
                    }
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DAILY">DAILY (24 Hours)</SelectItem>
                      <SelectItem value="MONTHLY">MONTHLY (30 Days)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder="49.00"
                    value={planForm.price}
                    onChange={(e) =>
                      setPlanForm({ ...planForm, price: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  rows={3}
                  placeholder="Details of benefits, fee waivers, or order privileges..."
                  value={planForm.description}
                  onChange={(e) =>
                    setPlanForm({ ...planForm, description: e.target.value })
                  }
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <Label>Active Status</Label>
                  <p className="text-xs text-muted-foreground">
                    Enable this plan so vendors can see and purchase it
                  </p>
                </div>
                <Switch
                  checked={planForm.isActive}
                  onCheckedChange={(val) =>
                    setPlanForm({ ...planForm, isActive: val })
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateOpen(false);
                  setEditingPlan(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createPlanMutation.isPending || updatePlanMutation.isPending}
              >
                {editingPlan ? "Save Changes" : "Create Plan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ======================================================== */}
      {/* MODAL: DELETE CONFIRMATION */}
      {/* ======================================================== */}
      <Dialog
        open={!!deletingPlanId}
        onOpenChange={(open) => !open && setDeletingPlanId(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Remove Plan?
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this subscription plan? If any vendors have
              previously purchased it, the plan will be safely deactivated to preserve past records.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeletingPlanId(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeletePlan}
              disabled={deletePlanMutation.isPending}
            >
              Confirm Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
