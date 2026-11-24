import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
  Search,
  RefreshCw,
  Edit,
  Store,
  CreditCard,
  Calendar,
  Clock,
  CheckCircle2,
  Hourglass,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  IndianRupee,
} from "lucide-react";
import {
  useGetVendorSubscriptions,
  useUpdateVendorSubscriptionPrice,
  VendorSubscriptionRecord,
} from "@/api/hooks/subscription/subscription.hook";
import { showError, showSuccess } from "@/utils/message";
import { formatPrice } from "@/utils/util";
import { format } from "date-fns";

export default function VendorSubscriptions() {
  // --- Filter & Pagination States ---
  const [searchParams] = useSearchParams();
  const urlSearch = searchParams.get("search") || "";
  const [searchTerm, setSearchTerm] = useState(urlSearch);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    const q = searchParams.get("search");
    if (q !== null && q !== searchTerm) {
      setSearchTerm(q);
      setCurrentPage(1);
    }
  }, [searchParams]);

  // --- Modal Edit State ---
  const [editingRecord, setEditingRecord] = useState<VendorSubscriptionRecord | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editStatus, setEditStatus] = useState<string>("PENDING");

  // --- Queries & Mutations ---
  const {
    data,
    isLoading,
    refetch,
    isRefetching,
  } = useGetVendorSubscriptions({
    page: currentPage,
    limit,
    status: statusFilter === "ALL" ? undefined : statusFilter,
    type: typeFilter === "ALL" ? undefined : typeFilter,
  });

  const updatePriceMutation = useUpdateVendorSubscriptionPrice();

  const records = data?.records || [];
  const pagination = data?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 };

  // Local filter for search term (by shop name, owner name, or mobile)
  const filteredRecords = useMemo(() => {
    // Ensure only approved vendors are shown
    const approvedOnly = records.filter(
      (rec) =>
        rec.vendor?.status === "APPROVED" ||
        rec.vendor?.isApproved === true ||
        (!rec.vendor?.status && rec.vendor)
    );

    if (!searchTerm.trim()) return approvedOnly;
    const term = searchTerm.toLowerCase();
    return approvedOnly.filter(
      (rec) =>
        rec.vendor?.shopName?.toLowerCase().includes(term) ||
        rec.vendor?.ownerName?.toLowerCase().includes(term) ||
        rec.vendor?.mobile?.toLowerCase().includes(term) ||
        rec.subscription?.name?.toLowerCase().includes(term)
    );
  }, [records, searchTerm]);

  // Open Edit Price Dialog
  const handleOpenEdit = (record: VendorSubscriptionRecord) => {
    setEditingRecord(record);
    setEditPrice(String(record.pricePaid));
    setEditStatus(record.status);
  };

  // Submit Price / Status Update
  const handleSavePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    const numPrice = parseFloat(editPrice);
    if (isNaN(numPrice) || numPrice < 0) {
      showError("Please enter a valid price amount (0 or greater)");
      return;
    }

    try {
      await updatePriceMutation.mutateAsync({
        id: editingRecord.id,
        pricePaid: numPrice,
        status: editStatus,
      });

      showSuccess(`Subscription price for ${editingRecord.vendor?.shopName || "vendor"} updated to ₹${numPrice}`);
      setEditingRecord(null);
    } catch (err: any) {
      showError(err?.response?.data?.message || "Failed to update vendor subscription price");
    }
  };

  // Helper for Status Badge styling
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            ACTIVE
          </Badge>
        );
      case "PENDING":
        return (
          <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100">
            <Hourglass className="w-3 h-3 mr-1" />
            PENDING
          </Badge>
        );
      case "EXPIRED":
        return (
          <Badge className="bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-100">
            <AlertCircle className="w-3 h-3 mr-1" />
            EXPIRED
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge className="bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-100">
            <XCircle className="w-3 h-3 mr-1" />
            CANCELLED
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = pagination.total || records.length;
    const active = records.filter((r) => r.status === "ACTIVE").length;
    const pending = records.filter((r) => r.status === "PENDING").length;
    const totalRevenue = records.reduce((sum, r) => sum + (parseFloat(String(r.pricePaid)) || 0), 0);
    return { total, active, pending, totalRevenue };
  }, [records, pagination]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vendor Subscriptions</h1>
          <p className="text-muted-foreground mt-1">
            Manage vendor enrolled subscriptions, audit status, and customize pricing for onboarding vendors.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
            <Store className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total}</div>
            <p className="text-xs text-muted-foreground mt-1">All vendor enrollments</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-emerald-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-emerald-800">Active Subscriptions</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700">{metrics.active}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently running store passes</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-amber-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-amber-800">Pending Activation</CardTitle>
            <Hourglass className="w-4 h-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700">{metrics.pending}</div>
            <p className="text-xs text-muted-foreground mt-1">Selected during onboarding</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Page Total Value</CardTitle>
            <IndianRupee className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(metrics.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">Recorded on current page</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="shadow-sm">
        <CardHeader className="border-b pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-semibold">Vendor Subscriptions List</CardTitle>
              <CardDescription>
                All vendors with their chosen Daily or Monthly subscription plans. Click Edit to adjust price.
              </CardDescription>
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search shop, owner, mobile..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}>
                <SelectTrigger className="w-[130px] h-9">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="EXPIRED">Expired</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              {/* Plan Type Filter */}
              <Select value={typeFilter} onValueChange={(val) => { setTypeFilter(val); setCurrentPage(1); }}>
                <SelectTrigger className="w-[130px] h-9">
                  <SelectValue placeholder="Plan Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  <SelectItem value="DAILY">Daily Pass</SelectItem>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12 space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading vendor subscriptions...</p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <Store className="w-12 h-12 text-muted-foreground/40 mb-3" />
              <h3 className="text-base font-semibold">No vendor subscriptions found</h3>
              <p className="text-sm text-muted-foreground max-w-sm mt-1">
                {searchTerm || statusFilter !== "ALL" || typeFilter !== "ALL"
                  ? "No vendor records matched your filter criteria. Try clearing filters."
                  : "Vendors who select a subscription plan during onboarding will appear here."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="w-[240px]">Vendor & Shop</TableHead>
                    <TableHead className="w-[180px]">Plan Name</TableHead>
                    <TableHead className="w-[120px]">Plan Type</TableHead>
                    <TableHead className="w-[130px]">Price Paid</TableHead>
                    <TableHead className="w-[120px]">Status</TableHead>
                    <TableHead className="w-[180px]">Validity Period</TableHead>
                    <TableHead className="w-[160px]">Enrolled On</TableHead>
                    <TableHead className="text-right w-[100px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id} className="hover:bg-muted/30">
                      {/* Vendor Info */}
                      <TableCell>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-foreground">
                            {record.vendor?.shopName || "Unnamed Shop"}
                          </span>
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] px-1.5 py-0 h-4 font-semibold hover:bg-emerald-50">
                            APPROVED
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {record.vendor?.ownerName || "Unknown Owner"} • {record.vendor?.mobile || "No Mobile"}
                        </div>
                        {record.vendor?.city ? (
                          <div className="text-[11px] text-muted-foreground/70">
                            📍 {record.vendor.city}
                          </div>
                        ) : null}
                      </TableCell>

                      {/* Plan Info */}
                      <TableCell>
                        <div className="font-medium text-foreground">
                          {record.subscription?.name || "Standard Plan"}
                        </div>
                        {record.subscription?.price ? (
                          <div className="text-xs text-muted-foreground">
                            Master: {formatPrice(record.subscription.price)}
                          </div>
                        ) : null}
                      </TableCell>

                      {/* Plan Type */}
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            record.subscription?.type === "DAILY"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-purple-50 text-purple-700 border-purple-200"
                          }
                        >
                          {record.subscription?.type === "DAILY" ? "Daily Pass" : "Monthly"}
                        </Badge>
                      </TableCell>

                      {/* Price Paid */}
                      <TableCell>
                        <div className="font-bold text-base text-foreground">
                          {formatPrice(record.pricePaid)}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {parseFloat(String(record.pricePaid)) === parseFloat(String(record.subscription?.price))
                            ? "Standard rate"
                            : "Custom adjusted rate"}
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell>{renderStatusBadge(record.status)}</TableCell>

                      {/* Validity */}
                      <TableCell>
                        {record.startDate && record.endDate ? (
                          <div className="text-xs space-y-0.5">
                            <div>From: {format(new Date(record.startDate), "dd MMM yyyy")}</div>
                            <div className="text-muted-foreground">
                              To: {format(new Date(record.endDate), "dd MMM yyyy")}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">
                            Pending Activation
                          </span>
                        )}
                      </TableCell>

                      {/* Enrolled At */}
                      <TableCell>
                        <div className="text-xs">
                          {record.createdAt
                            ? format(new Date(record.createdAt), "dd MMM yyyy, hh:mm a")
                            : "—"}
                        </div>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEdit(record)}
                          className="h-8 gap-1.5 text-xs font-medium"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          Edit Price
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>

        {/* Pagination Footer */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <div className="text-xs text-muted-foreground">
              Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total vendor subscriptions)
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1 || isLoading}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-xs font-medium px-2">{currentPage}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={currentPage >= pagination.totalPages || isLoading}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* EDIT PRICE MODAL DIALOG */}
      <Dialog open={!!editingRecord} onOpenChange={(open) => !open && setEditingRecord(null)}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="w-5 h-5 text-primary" />
              Edit Subscription Price
            </DialogTitle>
            <DialogDescription>
              Adjust the price to be charged for this vendor's subscription. This price will be used when amount is deducted manually post-verification.
            </DialogDescription>
          </DialogHeader>

          {editingRecord && (
            <form onSubmit={handleSavePrice} className="space-y-4 py-2">
              {/* Vendor & Plan Details Banner */}
              <div className="bg-muted/60 p-3 rounded-lg border space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vendor Shop:</span>
                  <span className="font-semibold text-foreground">{editingRecord.vendor?.shopName || "Unnamed"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Owner Name:</span>
                  <span className="font-medium text-foreground">{editingRecord.vendor?.ownerName || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plan Selected:</span>
                  <span className="font-medium text-primary">
                    {editingRecord.subscription?.name} ({editingRecord.subscription?.type})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Standard Master Price:</span>
                  <span className="font-medium">{formatPrice(editingRecord.subscription?.price)}</span>
                </div>
              </div>

              {/* Price Paid Input */}
              <div className="space-y-2">
                <Label htmlFor="priceInput" className="text-sm font-semibold">
                  Custom Subscription Price (₹) *
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
                    ₹
                  </span>
                  <Input
                    id="priceInput"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Enter price e.g. 49 or 999"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="pl-8 text-base font-semibold"
                    required
                    autoFocus
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  You can set a special discounted or custom fee for this vendor shop.
                </p>
              </div>

              {/* Status Select */}
              <div className="space-y-2">
                <Label htmlFor="statusSelect" className="text-sm font-semibold">
                  Subscription Status
                </Label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger id="statusSelect" className="h-10">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">PENDING (Waiting for manual deduction / verification)</SelectItem>
                    <SelectItem value="ACTIVE">ACTIVE (Store pass active)</SelectItem>
                    <SelectItem value="EXPIRED">EXPIRED</SelectItem>
                    <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingRecord(null)}
                  disabled={updatePriceMutation.isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updatePriceMutation.isPending} className="gap-2">
                  {updatePriceMutation.isPending ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Price Changes"
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
