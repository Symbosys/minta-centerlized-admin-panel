import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useGetAllVendors, useUpdateVendorStatus } from "@/api/hooks/vendor/vendor.hook";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Filter, Download, Eye, Star, Trash2, Loader2, Check, Ban, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { parseToDecimal } from "@/utils/util";

const Vendors = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlSearch = searchParams.get("search") || "";
  const [searchTerm, setSearchTerm] = useState(urlSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(urlSearch);

  const [actionType, setActionType] = useState<"APPROVED" | "REJECTED" | "BLOCKED" | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<any | null>(null);
  const [reason, setReason] = useState("");

  const updateStatusMutation = useUpdateVendorStatus();

  // Sync with search parameter (e.g. from Navbar global search)
  useEffect(() => {
    const q = searchParams.get("search");
    if (q !== null && q !== searchTerm) {
      setSearchTerm(q);
      setDebouncedSearch(q);
    }
  }, [searchParams]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useGetAllVendors({
    search: debouncedSearch || undefined,
  });

  const vendors = useMemo(() => {
    return data?.pages.flatMap((page) => page.vendors) || [];
  }, [data]);

  const totalVendors = data?.pages[0]?.totalVendors || 0;

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "default";
      case "NEW":
        return "secondary";
      case "BLOCKED":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusClassName = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-success text-success-foreground";
      case "NEW":
        return "bg-warning text-warning-foreground";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vendors Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage restaurant and food vendor partners
          </p>
        </div>
        <Button className="gap-2">
          <Download className="w-4 h-4" />
          Export Data
        </Button>
      </div>

      {/* Filters */}
      <Card className="shadow-soft">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by shop name, owner, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Vendors Table */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>All Vendors ({totalVendors})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Shop Name</TableHead>
                  <TableHead className="font-semibold">Owner</TableHead>
                  <TableHead className="font-semibold">Contact</TableHead>
                  <TableHead className="font-semibold">Rating</TableHead>
                  <TableHead className="font-semibold">Total Orders</TableHead>
                  <TableHead className="font-semibold">Wallet Balance</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                      <p className="mt-2 text-muted-foreground">Loading vendors...</p>
                    </TableCell>
                  </TableRow>
                ) : vendors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No vendors found.
                    </TableCell>
                  </TableRow>
                ) : (
                  vendors.map((vendor: any) => (
                    <TableRow key={vendor.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{vendor.shopName || "N/A"}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {vendor.ownerName || "N/A"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="text-sm">{vendor.mobile || "N/A"}</div>
                        <div className="text-xs text-muted-foreground">{vendor.email || "N/A"}</div>
                      </TableCell>
                      <TableCell>
                        {vendor.rating > 0 ? (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-warning text-warning" />
                            <span className="font-medium">{(vendor.rating || 0).toFixed(1)}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">No rating</span>
                        )}
                      </TableCell>
                      <TableCell>{vendor.totalOrders || 0}</TableCell>
                      <TableCell className="font-medium">
                        ₹{parseToDecimal(vendor.walletBalance ?? vendor.VendorWallet?.balance ?? 0).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getStatusBadgeVariant(vendor.status)}
                          className={getStatusClassName(vendor.status)}
                        >
                          {vendor.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="View Details"
                            onClick={() => navigate(`/vendors/${vendor.id}`)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          
                          {vendor.status !== "APPROVED" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Approve Vendor"
                              className="text-success hover:bg-success/10"
                              onClick={() => {
                                setSelectedVendor(vendor);
                                setActionType("APPROVED");
                              }}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}

                          {vendor.status !== "APPROVED" && vendor.status !== "REJECTED" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Reject Vendor"
                              className="text-warning hover:bg-warning/10"
                              onClick={() => {
                                setSelectedVendor(vendor);
                                setActionType("REJECTED");
                                setReason("");
                              }}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}

                          {vendor.status !== "BLOCKED" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Block Vendor"
                              className="text-destructive hover:bg-destructive/10"
                              onClick={() => {
                                setSelectedVendor(vendor);
                                setActionType("BLOCKED");
                                setReason("");
                              }}
                            >
                              <Ban className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {hasNextPage && (
            <div className="flex justify-center mt-6">
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="gap-2"
              >
                {isFetchingNextPage ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading more...
                  </>
                ) : (
                  "Load More"
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Action Dialog */}
      <Dialog open={actionType !== null} onOpenChange={(open) => {
        if (!open) {
          setActionType(null);
          setSelectedVendor(null);
          setReason("");
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {actionType === "APPROVED" && "Approve Vendor"}
              {actionType === "REJECTED" && "Reject Vendor Application"}
              {actionType === "BLOCKED" && "Block Vendor"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "APPROVED" && `Are you sure you want to approve ${selectedVendor?.shopName || "this vendor"}? This will activate their account and provision their wallet.`}
              {actionType === "REJECTED" && `Please provide a reason for rejecting the application of ${selectedVendor?.shopName || "this vendor"}.`}
              {actionType === "BLOCKED" && `Are you sure you want to block ${selectedVendor?.shopName || "this vendor"}? Please provide a reason for blocking them.`}
            </DialogDescription>
          </DialogHeader>

          {(actionType === "REJECTED" || actionType === "BLOCKED") && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="reason" className="font-medium">Reason</Label>
                <Textarea
                  id="reason"
                  placeholder={actionType === "REJECTED" ? "Reason for rejection..." : "Reason for blocking..."}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setActionType(null);
                setSelectedVendor(null);
                setReason("");
              }}
              disabled={updateStatusMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant={actionType === "APPROVED" ? "default" : "destructive"}
              disabled={
                updateStatusMutation.isPending || 
                ((actionType === "REJECTED" || actionType === "BLOCKED") && !reason.trim())
              }
              onClick={async () => {
                if (!selectedVendor || !actionType) return;
                
                const payload: any = { status: actionType };
                if (actionType === "REJECTED") {
                  payload.rejectReason = reason;
                } else if (actionType === "BLOCKED") {
                  payload.blockReason = reason;
                }

                try {
                  await updateStatusMutation.mutateAsync({
                    id: selectedVendor.id,
                    data: payload,
                  });
                  setActionType(null);
                  setSelectedVendor(null);
                  setReason("");
                } catch (error) {
                  // Mutation handles error UI toast notifications
                }
              }}
            >
              {updateStatusMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {actionType === "APPROVED" && "Approve"}
              {actionType === "REJECTED" && "Reject"}
              {actionType === "BLOCKED" && "Block"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Vendors;
