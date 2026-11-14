import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Plus,
  Loader2,
  Image as ImageIcon,
  Pencil,
  Trash2,
  Layers,
  Sparkles,
  FolderTree,
  Package,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  useGetAllModesAdmin,
  useCreateMode,
  useUpdateMode,
  useDeleteMode,
  type ModeItem,
} from "@/api/hooks/mode/mode.hook";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const modeSchema = z.object({
  name: z.string().min(2, "Mode name must be at least 2 characters").max(100),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  description: z.string().max(2500).optional(),
  badge: z.string().max(50).optional(),
  displayOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
  image: z
    .any()
    .optional()
    .refine(
      (files) => {
        if (!files || files.length === 0) return true;
        return files[0]?.size <= MAX_FILE_SIZE;
      },
      "Max image size is 5MB."
    )
    .refine(
      (files) => {
        if (!files || files.length === 0) return true;
        return ACCEPTED_IMAGE_TYPES.includes(files[0]?.type);
      },
      "Supported formats: .jpg, .jpeg, .png, .webp"
    ),
  icon: z
    .any()
    .optional()
    .refine(
      (files) => {
        if (!files || files.length === 0) return true;
        return files[0]?.size <= MAX_FILE_SIZE;
      },
      "Max icon size is 5MB."
    )
    .refine(
      (files) => {
        if (!files || files.length === 0) return true;
        return ACCEPTED_IMAGE_TYPES.includes(files[0]?.type);
      },
      "Supported formats: .jpg, .jpeg, .png, .webp"
    ),
});

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const BADGE_SUGGESTIONS = ["Bestseller", "Trending", "Popular", "New", "Chef's Special", "Express"];

export default function Modes() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMode, setEditingMode] = useState<ModeItem | null>(null);
  const [isSlugManual, setIsSlugManual] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [deletingModeId, setDeletingModeId] = useState<string | number | null>(null);

  const { data: rawModes, isLoading: isModesLoading } = useGetAllModesAdmin();
  const { mutate: createMode, isPending: isCreatingMode } = useCreateMode();
  const { mutate: updateMode, isPending: isUpdatingMode } = useUpdateMode();
  const { mutate: deleteMode, isPending: isDeletingMode } = useDeleteMode();

  const modes = rawModes || [];

  const modeForm = useForm<z.infer<typeof modeSchema>>({
    resolver: zodResolver(modeSchema as any),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      badge: "",
      displayOrder: 0,
      isActive: true,
    },
  });

  const filteredModes = useMemo(() => {
    if (!Array.isArray(modes)) return [];
    return modes.filter((m: ModeItem) =>
      m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.slug?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.badge && m.badge.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [modes, searchQuery]);

  const handleOpenCreateModal = () => {
    setEditingMode(null);
    setIsSlugManual(false);
    setImagePreview(null);
    setIconPreview(null);
    modeForm.reset({
      name: "",
      slug: "",
      description: "",
      badge: "",
      displayOrder: 0,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleEditMode = (mode: ModeItem) => {
    setEditingMode(mode);
    setIsSlugManual(true);
    setImagePreview(mode.image?.secure_url || mode.image?.url || null);
    setIconPreview(mode.icon?.secure_url || mode.icon?.url || null);
    modeForm.reset({
      name: mode.name || "",
      slug: mode.slug || "",
      description: mode.description || "",
      badge: mode.badge || "",
      displayOrder: mode.displayOrder || 0,
      isActive: Boolean(mode.isActive),
    });
    setIsModalOpen(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    modeForm.setValue("name", val);
    if (!isSlugManual) {
      modeForm.setValue("slug", slugify(val));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      setImagePreview(URL.createObjectURL(files[0]));
      modeForm.setValue("image", files);
    } else {
      setImagePreview(editingMode?.image?.secure_url || editingMode?.image?.url || null);
      modeForm.setValue("image", undefined);
    }
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      setIconPreview(URL.createObjectURL(files[0]));
      modeForm.setValue("icon", files);
    } else {
      setIconPreview(editingMode?.icon?.secure_url || editingMode?.icon?.url || null);
      modeForm.setValue("icon", undefined);
    }
  };

  const handleToggleStatus = (mode: ModeItem) => {
    const formData = new FormData();
    formData.append("isActive", String(!mode.isActive));
    updateMode({ id: mode.id, data: formData });
  };

  const onSubmit = (values: z.infer<typeof modeSchema>) => {
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("slug", values.slug);
    if (values.description) formData.append("description", values.description);
    if (values.badge) formData.append("badge", values.badge);
    formData.append("displayOrder", String(values.displayOrder));
    formData.append("isActive", String(values.isActive));

    if (values.image && values.image.length > 0) {
      formData.append("image", values.image[0]);
    }
    if (values.icon && values.icon.length > 0) {
      formData.append("icon", values.icon[0]);
    }

    if (editingMode) {
      updateMode(
        { id: editingMode.id, data: formData },
        {
          onSuccess: () => {
            setIsModalOpen(false);
            setEditingMode(null);
            modeForm.reset();
          },
        }
      );
    } else {
      if (!values.image || values.image.length === 0) {
        modeForm.setError("image", { message: "Banner image is required when creating a mode" });
        return;
      }
      createMode(formData, {
        onSuccess: () => {
          setIsModalOpen(false);
          modeForm.reset();
        },
      });
    }
  };

  const handleDeleteConfirm = () => {
    if (!deletingModeId) return;
    deleteMode(deletingModeId, {
      onSuccess: () => {
        setDeletingModeId(null);
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Mode Management</h1>
        <p className="text-muted-foreground">Manage application modes and product scopes</p>
      </div>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search modes by name, slug, badge..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={handleOpenCreateModal}>
            <Plus className="h-4 w-4 mr-2" />
            Add Mode
          </Button>
        </div>

        {/* Add/Edit Mode Modal */}
        <Dialog
          open={isModalOpen}
          onOpenChange={(open) => {
            setIsModalOpen(open);
            if (!open) setEditingMode(null);
          }}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingMode ? "Edit Mode" : "Add New Mode"}</DialogTitle>
            </DialogHeader>
            <Form {...modeForm}>
              <form onSubmit={modeForm.handleSubmit(onSubmit)} className="grid gap-4 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={modeForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mode Name *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Chicken Biryani, Fresh Meat"
                            {...field}
                            onChange={handleNameChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={modeForm.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL Slug *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. chicken-biryani"
                            {...field}
                            onChange={(e) => {
                              setIsSlugManual(true);
                              field.onChange(e);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={modeForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Brief description of this mode and its offerings..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={modeForm.control}
                    name="badge"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Badge Tag (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Bestseller, Trending" {...field} />
                        </FormControl>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {BADGE_SUGGESTIONS.map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="cursor-pointer text-xs font-normal hover:bg-muted"
                              onClick={() => modeForm.setValue("badge", tag)}
                            >
                              + {tag}
                            </Badge>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={modeForm.control}
                    name="displayOrder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Order</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" {...field} />
                        </FormControl>
                        <FormDescription>Lower order appears first in customer app</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Banner Image */}
                  <FormField
                    control={modeForm.control}
                    name="image"
                    render={({ field: { value, onChange, ...fieldProps } }) => (
                      <FormItem>
                        <FormLabel>
                          {editingMode ? "Replace Banner Image (Optional)" : "Banner Image *"}
                        </FormLabel>
                        <FormControl>
                          <div className="space-y-2">
                            <Input
                              {...fieldProps}
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                            />
                            {imagePreview && (
                              <div className="relative w-full h-28 rounded-md overflow-hidden border bg-muted flex items-center justify-center">
                                <img
                                  src={imagePreview}
                                  alt="Banner preview"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Mode Icon */}
                  <FormField
                    control={modeForm.control}
                    name="icon"
                    render={({ field: { value, onChange, ...fieldProps } }) => (
                      <FormItem>
                        <FormLabel>Mode Icon (Optional)</FormLabel>
                        <FormControl>
                          <div className="space-y-2">
                            <Input
                              {...fieldProps}
                              type="file"
                              accept="image/*"
                              onChange={handleIconChange}
                            />
                            {iconPreview && (
                              <div className="relative w-20 h-20 rounded-full overflow-hidden border bg-muted p-1 flex items-center justify-center">
                                <img
                                  src={iconPreview}
                                  alt="Icon preview"
                                  className="w-full h-full object-contain"
                                />
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={modeForm.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3 mt-2">
                      <div className="space-y-0.5">
                        <FormLabel>Active Status</FormLabel>
                        <div className="text-xs text-muted-foreground">
                          Make mode visible to customers and product catalog
                        </div>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full mt-4"
                  disabled={isCreatingMode || isUpdatingMode}
                >
                  {(isCreatingMode || isUpdatingMode) && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {editingMode ? "Update Mode" : "Create Mode"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Modes Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Mode Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Badge</TableHead>
              <TableHead className="text-center">Order</TableHead>
              <TableHead className="text-center">Categories</TableHead>
              <TableHead className="text-center">Products</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isModesLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    <span className="ml-2">Loading modes...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredModes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                  No modes found. Click "Add Mode" to create one.
                </TableCell>
              </TableRow>
            ) : (
              filteredModes.map((mode: ModeItem) => {
                const imgUrl = mode.image?.secure_url || mode.image?.url;
                const iconUrl = mode.icon?.secure_url || mode.icon?.url;

                return (
                  <TableRow key={mode.id}>
                    <TableCell>
                      <div className="relative w-10 h-10 rounded overflow-hidden bg-muted flex items-center justify-center border">
                        {imgUrl ? (
                          <img src={imgUrl} alt={mode.name} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-muted-foreground" />
                        )}
                        {iconUrl && (
                          <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-background border overflow-hidden">
                            <img src={iconUrl} alt="" className="w-full h-full object-contain" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div>{mode.name}</div>
                      {mode.description && (
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {mode.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      /{mode.slug}
                    </TableCell>
                    <TableCell>
                      {mode.badge ? (
                        <Badge variant="secondary" className="font-normal text-xs">
                          {mode.badge}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center font-mono text-sm">
                      {mode.displayOrder ?? 0}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="font-mono text-xs gap-1">
                        <FolderTree className="w-3 h-3 text-muted-foreground" />
                        {mode._count?.categories ?? 0}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="font-mono text-xs gap-1">
                        <Package className="w-3 h-3 text-muted-foreground" />
                        {mode._count?.products ?? 0}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Switch
                          checked={mode.isActive}
                          onCheckedChange={() => handleToggleStatus(mode)}
                        />
                        <span
                          className={`text-xs font-medium ${
                            mode.isActive ? "text-emerald-600" : "text-muted-foreground"
                          }`}
                        >
                          {mode.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditMode(mode)}
                          title="Edit Mode"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingModeId(mode.id)}
                          title="Delete Mode"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Delete Confirmation Alert */}
      <AlertDialog
        open={deletingModeId !== null}
        onOpenChange={(open) => !open && setDeletingModeId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this mode?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the mode from your catalog. Products and categories linked to this
              mode may need to be reassigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeletingMode}
            >
              {isDeletingMode ? "Deleting..." : "Delete Mode"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
