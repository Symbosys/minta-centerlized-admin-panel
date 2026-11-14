import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Shield } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  useGetAllAdmins,
  useCreateAdmin,
  useDeleteAdmin,
} from "@/api/hooks/admins/admin.hooks";
import { format } from "date-fns";

export default function AdminManagement() {
  const navigate = useNavigate();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Form State for Admin Creation
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    role: "SUB_ADMIN",
  });

  // API Hooks
  const { data: adminsData, isLoading: isLoadingAdmins } = useGetAllAdmins();
  const { mutate: createAdmin, isPending: isCreating } = useCreateAdmin();
  const { mutate: deleteAdmin, isPending: isDeleting } = useDeleteAdmin();

  const admins = useMemo(() => (Array.isArray(adminsData) ? adminsData : (adminsData?.data || [])), [adminsData]);

  const handleCreate = () => {
    if (!formData.name || !formData.email || !formData.mobile || !formData.password || !formData.role) return;

    createAdmin(formData, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
        setFormData({ name: "", email: "", mobile: "", password: "", role: "SUB_ADMIN" });
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin & Sub-Admin Management</h1>
          <p className="text-muted-foreground">Create sub-admins, manage accounts and assign module action permissions</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate("/admin-permissions")}
          >
            <Shield className="h-4 w-4 mr-2" />
            Assign Permissions Page
          </Button>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Admin
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Admin / Sub Admin</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="admin-name">Full Name</Label>
                  <Input
                    id="admin-name"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="admin-email">Email Address</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="admin-mobile">Phone Number (10 Digits)</Label>
                  <Input
                    id="admin-mobile"
                    type="tel"
                    maxLength={10}
                    placeholder="Enter 10-digit mobile number"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, "") })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="admin-role">Admin Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(val) => setFormData({ ...formData, role: val })}
                  >
                    <SelectTrigger id="admin-role">
                      <SelectValue placeholder="Select admin role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">ADMIN (Full Access)</SelectItem>
                      <SelectItem value="SUB_ADMIN">SUB_ADMIN (Sub Admin)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="admin-password">Password</Label>
                  <Input
                    id="admin-password"
                    type="password"
                    placeholder="Enter secure password (min 8 characters)"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>

                <Button
                  className="w-full mt-2"
                  onClick={handleCreate}
                  disabled={
                    isCreating ||
                    !formData.name ||
                    !formData.email ||
                    formData.mobile.length !== 10 ||
                    !formData.password ||
                    !formData.role
                  }
                >
                  {isCreating ? "Creating Admin..." : "Create Admin"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Admin Users Table */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Admins & Sub-Admins List</h2>
        {isLoadingAdmins ? (
          <div className="text-center py-12 text-muted-foreground">Loading admins...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((admin: any) => (
                <TableRow key={admin.id}>
                  <TableCell className="font-medium">{admin.name}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell className="font-mono text-sm">{admin.mobile || admin.user?.mobile || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={admin.role === "ADMIN" ? "default" : "secondary"}>
                      {admin.role === "ADMIN" ? "ADMIN" : "SUB ADMIN"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {admin.role === "ADMIN" ? (
                      <span className="text-xs text-muted-foreground font-semibold">Full System Access</span>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        {admin.permissions?.length || 0} Actions Assigned
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{format(new Date(admin.createdAt), "MMM dd, yyyy HH:mm")}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {admin.role === "SUB_ADMIN" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/admin-permissions?subAdminId=${admin.id}`)}
                          title="Assign Sub-Admin Permissions Page"
                        >
                          <Shield className="h-4 w-4 mr-1 text-primary" />
                          Permissions
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete ${admin.name}?`)) {
                            deleteAdmin(admin.id);
                          }
                        }}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {admins.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No admins found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}

