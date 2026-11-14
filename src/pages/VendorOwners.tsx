import React, { useState } from "react";
import {
  useGetVendorOwners,
  useCreateVendorOwner,
  useUpdateVendorOwner,
  VendorOwner,
} from "@/api/hooks/vendor-owner/vendorOwner.hook";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  UserCheck,
  Plus,
  Search,
  Edit,
  Loader2,
  Store,
  FileText,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const VendorOwners: React.FC = () => {
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [search, setSearch] = useState<string>("");
  const [searchInput, setSearchInput] = useState<string>("");

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [selectedOwner, setSelectedOwner] = useState<VendorOwner | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    fssaiLicenceNumber: "",
    mainAddress: "",
    completeAddress: "",
    city: "Ranchi",
    state: "Jharkhand",
    country: "India",
    pincode: "",
    aadhaarNumber: "",
    panNumber: "",
    gstinNumber: "",
  });

  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    fssaiLicenceNumber: "",
    mainAddress: "",
    completeAddress: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
    aadhaarNumber: "",
    panNumber: "",
    gstinNumber: "",
    isActive: true,
    isApproved: false,
  });

  // Queries & Mutations
  const { data, isLoading, isError, refetch } = useGetVendorOwners({
    page,
    limit,
    search,
  });

  const createMutation = useCreateVendorOwner();
  const updateMutation = useUpdateVendorOwner();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleOpenCreate = () => {
    setFormData({
      name: "",
      email: "",
      mobile: "",
      password: "",
      fssaiLicenceNumber: "",
      mainAddress: "",
      completeAddress: "",
      city: "Ranchi",
      state: "Jharkhand",
      country: "India",
      pincode: "",
      aadhaarNumber: "",
      panNumber: "",
      gstinNumber: "",
    });
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync(formData);
      setIsCreateOpen(false);
    } catch (err) {
      console.error("Create Vendor Owner error:", err);
    }
  };

  const handleOpenEdit = (owner: VendorOwner) => {
    setSelectedOwner(owner);
    setEditFormData({
      name: owner.name || "",
      email: owner.email || "",
      mobile: owner.mobile || "",
      password: "",
      fssaiLicenceNumber: owner.fssaiLicenceNumber || "",
      mainAddress: owner.mainAddress || "",
      completeAddress: owner.completeAddress || "",
      city: owner.city || "",
      state: owner.state || "",
      country: owner.country || "",
      pincode: owner.pincode || "",
      aadhaarNumber: owner.aadhaarNumber || "",
      panNumber: owner.panNumber || "",
      gstinNumber: owner.gstinNumber || "",
      isActive: owner.isActive ?? true,
      isApproved: owner.isApproved ?? false,
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOwner) return;

    const payload: any = { ...editFormData };
    if (!payload.password) delete payload.password; // Do not update password if left empty

    try {
      await updateMutation.mutateAsync({
        id: selectedOwner.id,
        data: payload,
      });
      setIsEditOpen(false);
      setSelectedOwner(null);
    } catch (err) {
      console.error("Update Vendor Owner error:", err);
    }
  };

  const vendorOwners = data?.vendorOwners || [];
  const pagination = data?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <UserCheck className="w-7 h-7 text-primary" />
            Vendor Owners
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage vendor owners, their profile details, license credentials, and linked vendor shops.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Vendor Owner
        </Button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-card shadow-sm border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Vendor Owners
            </CardTitle>
            <UserCheck className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination.total}</div>
            <p className="text-xs text-muted-foreground mt-1">Registered in database</p>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current Page
            </CardTitle>
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination.page} / {pagination.totalPages || 1}</div>
            <p className="text-xs text-muted-foreground mt-1">Page view ratio</p>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Items Per Page
            </CardTitle>
            <Store className="w-5 h-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination.limit}</div>
            <p className="text-xs text-muted-foreground mt-1">Records displayed per fetch</p>
          </CardContent>
        </Card>
      </div>

      {/* Controls & Search */}
      <Card className="p-4 bg-card border">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Search by name, mobile, email, or FSSAI license number..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="secondary">
            Search
          </Button>
          {search && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setSearchInput("");
                setSearch("");
                setPage(1);
              }}
            >
              Clear
            </Button>
          )}
        </form>
      </Card>

      {/* Main Table */}
      <Card className="border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor Owner</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>FSSAI Licence</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Shops</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Loading vendor owners...
                    </div>
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-destructive">
                    Failed to load vendor owners. Please try refreshing.
                  </TableCell>
                </TableRow>
              ) : vendorOwners.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    No vendor owners found matching query.
                  </TableCell>
                </TableRow>
              ) : (
                vendorOwners.map((owner) => (
                  <TableRow key={owner.id}>
                    <TableCell>
                      <div className="font-medium text-foreground">{owner.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3" /> {owner.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm flex items-center gap-1 text-foreground">
                        <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                        {owner.mobile}
                      </div>
                    </TableCell>
                    <TableCell>
                      {owner.fssaiLicenceNumber ? (
                        <Badge variant="outline" className="font-mono text-xs gap-1">
                          <FileText className="w-3 h-3 text-primary" />
                          {owner.fssaiLicenceNumber}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">Not provided</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {owner.city || "Ranchi"}, {owner.state || "Jharkhand"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="gap-1">
                        <Store className="w-3 h-3" />
                        {owner.vendors?.length || 0} Vendor(s)
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Badge variant={owner.isActive ? "default" : "destructive"} className="text-[10px]">
                          {owner.isActive ? "Active" : "Inactive"}
                        </Badge>
                        {owner.isApproved && (
                          <Badge variant="outline" className="text-[10px] border-emerald-500 text-emerald-600">
                            Approved
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(owner)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="text-xs text-muted-foreground">
              Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total items)
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPage((prev) => prev + 1)}
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* CREATE MODAL DIALOG */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <UserCheck className="w-5 h-5 text-primary" /> Create Vendor Owner
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  required
                  placeholder="e.g. Rajesh Kumar"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="e.g. rajesh@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="mobile">Mobile Number *</Label>
                <Input
                  id="mobile"
                  required
                  placeholder="e.g. 9876543210"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  placeholder="Enter strong password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="fssaiLicenceNumber">FSSAI Licence Number (Optional)</Label>
                <Input
                  id="fssaiLicenceNumber"
                  placeholder="14-digit FSSAI License"
                  value={formData.fssaiLicenceNumber}
                  onChange={(e) => setFormData({ ...formData, fssaiLicenceNumber: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="Ranchi"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  placeholder="Jharkhand"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  placeholder="834001"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="aadhaarNumber">Aadhaar Number</Label>
                <Input
                  id="aadhaarNumber"
                  placeholder="12-digit Aadhaar"
                  value={formData.aadhaarNumber}
                  onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="panNumber">PAN Number</Label>
                <Input
                  id="panNumber"
                  placeholder="ABCDE1234F"
                  value={formData.panNumber}
                  onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="gstinNumber">GSTIN Number</Label>
                <Input
                  id="gstinNumber"
                  placeholder="22AAAAA0000A1Z5"
                  value={formData.gstinNumber}
                  onChange={(e) => setFormData({ ...formData, gstinNumber: e.target.value })}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="completeAddress">Complete Address</Label>
                <Input
                  id="completeAddress"
                  placeholder="Building, street, landmark details..."
                  value={formData.completeAddress}
                  onChange={(e) => setFormData({ ...formData, completeAddress: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter className="pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Create Vendor Owner
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT MODAL DIALOG */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <Edit className="w-5 h-5 text-primary" /> Edit Vendor Owner ({selectedOwner?.name})
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="edit-email">Email Address</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="edit-mobile">Mobile Number</Label>
                <Input
                  id="edit-mobile"
                  value={editFormData.mobile}
                  onChange={(e) => setEditFormData({ ...editFormData, mobile: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="edit-password">New Password (Leave blank to keep unchanged)</Label>
                <Input
                  id="edit-password"
                  type="password"
                  placeholder="Enter new password"
                  value={editFormData.password}
                  onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="edit-fssai">FSSAI Licence Number</Label>
                <Input
                  id="edit-fssai"
                  value={editFormData.fssaiLicenceNumber}
                  onChange={(e) => setEditFormData({ ...editFormData, fssaiLicenceNumber: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="edit-city">City</Label>
                <Input
                  id="edit-city"
                  value={editFormData.city}
                  onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="edit-state">State</Label>
                <Input
                  id="edit-state"
                  value={editFormData.state}
                  onChange={(e) => setEditFormData({ ...editFormData, state: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="edit-pincode">Pincode</Label>
                <Input
                  id="edit-pincode"
                  value={editFormData.pincode}
                  onChange={(e) => setEditFormData({ ...editFormData, pincode: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="edit-aadhaar">Aadhaar Number</Label>
                <Input
                  id="edit-aadhaar"
                  value={editFormData.aadhaarNumber}
                  onChange={(e) => setEditFormData({ ...editFormData, aadhaarNumber: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="edit-pan">PAN Number</Label>
                <Input
                  id="edit-pan"
                  value={editFormData.panNumber}
                  onChange={(e) => setEditFormData({ ...editFormData, panNumber: e.target.value })}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="edit-gstin">GSTIN Number</Label>
                <Input
                  id="edit-gstin"
                  value={editFormData.gstinNumber}
                  onChange={(e) => setEditFormData({ ...editFormData, gstinNumber: e.target.value })}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="edit-address">Complete Address</Label>
                <Input
                  id="edit-address"
                  value={editFormData.completeAddress}
                  onChange={(e) => setEditFormData({ ...editFormData, completeAddress: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editFormData.isActive}
                    onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  Active Account
                </label>

                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editFormData.isApproved}
                    onChange={(e) => setEditFormData({ ...editFormData, isApproved: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  Approved Account
                </label>
              </div>
            </div>

            <DialogFooter className="pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorOwners;
