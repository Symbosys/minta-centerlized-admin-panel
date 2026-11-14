import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Loader2,
  Plus,
  Image as ImageIcon,
  ChevronRight,
  FolderTree,
  Pencil,
  Layers,
} from "lucide-react";
import {
  useGetAllCategories,
  useCreateCategory,
  useUpdateCategory,
} from "@/api/hooks/category/category.hook";
import {
  useGetAllSubCategories,
  useCreateSubCategory,
  useUpdateSubCategory,
} from "@/api/hooks/sub_category/sub_category.hook";
import { useGetAllModesAdmin } from "@/api/hooks/mode/mode.hook";
import { usePlatform } from "@/context/PlatformContext";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  modeId: z.string().optional(),
  description: z.string().optional(),
  image: z
    .any()
    .optional()
    .refine(
      (files) => {
        if (!files || files.length === 0) return true;
        return files[0]?.size <= MAX_FILE_SIZE;
      },
      `Max file size is 5MB.`
    )
    .refine(
      (files) => {
        if (!files || files.length === 0) return true;
        return ACCEPTED_IMAGE_TYPES.includes(files[0]?.type);
      },
      "Only .jpg, .jpeg, .png and .webp formats are supported."
    ),
});

const subCategorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  image: z
    .any()
    .optional()
    .refine(
      (files) => {
        if (!files || files.length === 0) return true;
        return files[0]?.size <= MAX_FILE_SIZE;
      },
      `Max file size is 5MB.`
    )
    .refine(
      (files) => {
        if (!files || files.length === 0) return true;
        return ACCEPTED_IMAGE_TYPES.includes(files[0]?.type);
      },
      "Only .jpg, .jpeg, .png and .webp formats are supported."
    ),
});

export default function Categories() {
  const { isRestro } = usePlatform();
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedModeFilter, setSelectedModeFilter] = useState<string>("all");

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  const [isSubCategoryModalOpen, setIsSubCategoryModalOpen] = useState(false);
  const [editingSubCategory, setEditingSubCategory] = useState<any>(null);

  const { data: modes } = useGetAllModesAdmin({ enabled: isRestro });
  const { data: categories, isLoading: isCategoriesLoading } = useGetAllCategories();
  const { data: subCategories, isLoading: isSubCategoriesLoading } = useGetAllSubCategories(selectedCategory?.id);

  const { mutate: createCategory, isPending: isCreatingCategory } = useCreateCategory();
  const { mutate: updateCategory, isPending: isUpdatingCategory } = useUpdateCategory();

  const { mutate: createSubCategory, isPending: isCreatingSubCategory } = useCreateSubCategory();
  const { mutate: updateSubCategory, isPending: isUpdatingSubCategory } = useUpdateSubCategory();

  // Filter categories by selected Mode when in Restro mode
  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    if (!isRestro || selectedModeFilter === "all") return categories;
    return categories.filter(
      (cat: any) =>
        cat.modeId?.toString() === selectedModeFilter ||
        cat.mode?.id?.toString() === selectedModeFilter
    );
  }, [categories, selectedModeFilter, isRestro]);

  // Keep selectedCategory in sync when categories or filter changes
  useEffect(() => {
    if (filteredCategories && filteredCategories.length > 0) {
      if (!selectedCategory || !filteredCategories.some((c: any) => c.id === selectedCategory.id)) {
        setSelectedCategory(filteredCategories[0]);
      }
    } else {
      setSelectedCategory(null);
    }
  }, [filteredCategories]);

  const categoryForm = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema as any),
    defaultValues: { name: "", modeId: "", description: "" },
  });

  const subCategoryForm = useForm<z.infer<typeof subCategorySchema>>({
    resolver: zodResolver(subCategorySchema as any),
    defaultValues: { name: "", description: "" },
  });

  const handleOpenCreateCategoryModal = () => {
    setEditingCategory(null);
    const defaultMode =
      isRestro && selectedModeFilter && selectedModeFilter !== "all"
        ? selectedModeFilter
        : isRestro && modes && modes.length > 0
        ? modes[0].id.toString()
        : "";
    categoryForm.reset({ name: "", modeId: defaultMode, description: "" });
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategoryModal = (category: any) => {
    setEditingCategory(category);
    const modeIdVal = category.modeId
      ? category.modeId.toString()
      : category.mode?.id
      ? category.mode.id.toString()
      : "";
    categoryForm.reset({
      name: category.name || "",
      modeId: modeIdVal,
      description: category.description || "",
    });
    setIsCategoryModalOpen(true);
  };

  const handleOpenCreateSubCategoryModal = () => {
    setEditingSubCategory(null);
    subCategoryForm.reset({ name: "", description: "" });
    setIsSubCategoryModalOpen(true);
  };

  const handleOpenEditSubCategoryModal = (subCategory: any) => {
    setEditingSubCategory(subCategory);
    subCategoryForm.reset({
      name: subCategory.name || "",
      description: subCategory.description || "",
    });
    setIsSubCategoryModalOpen(true);
  };

  const onCategorySubmit = (values: z.infer<typeof categorySchema>) => {
    if (isRestro && (!values.modeId || values.modeId.trim() === "")) {
      categoryForm.setError("modeId", {
        type: "manual",
        message: "Please select an operational mode.",
      });
      return;
    }

    if (!editingCategory && (!values.image || values.image.length === 0)) {
      categoryForm.setError("image", {
        type: "manual",
        message: "Image is required for a new category.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("name", values.name);
    if (isRestro && values.modeId) {
      formData.append("modeId", values.modeId);
    }
    if (values.description) formData.append("description", values.description);
    if (values.image?.[0]) formData.append("image", values.image[0]);

    const targetMode = isRestro
      ? modes?.find((m: any) => m.id.toString() === values.modeId?.toString())
      : undefined;

    if (editingCategory) {
      updateCategory(
        { id: editingCategory.id, data: formData },
        {
          onSuccess: () => {
            setIsCategoryModalOpen(false);
            setEditingCategory(null);
            categoryForm.reset();
            if (selectedCategory?.id === editingCategory.id) {
              setSelectedCategory((prev: any) => ({
                ...prev,
                name: values.name,
                description: values.description,
                ...(isRestro && values.modeId ? { modeId: values.modeId } : {}),
                ...(isRestro && targetMode
                  ? { mode: { id: targetMode.id, name: targetMode.name, slug: targetMode.slug } }
                  : {}),
              }));
            }
          },
        }
      );
    } else {
      createCategory(formData, {
        onSuccess: () => {
          setIsCategoryModalOpen(false);
          categoryForm.reset();
        },
      });
    }
  };

  const onSubCategorySubmit = (values: z.infer<typeof subCategorySchema>) => {
    if (!selectedCategory) return;

    if (!editingSubCategory && (!values.image || values.image.length === 0)) {
      subCategoryForm.setError("image", {
        type: "manual",
        message: "Image is required for a new sub-category.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("name", values.name);
    if (values.description) formData.append("description", values.description);
    if (values.image?.[0]) formData.append("image", values.image[0]);
    formData.append("categoryId", selectedCategory.id.toString());

    if (isRestro) {
      const modeIdVal = selectedCategory.modeId || selectedCategory.mode?.id;
      if (modeIdVal) {
        formData.append("modeId", modeIdVal.toString());
      }
    }

    if (editingSubCategory) {
      updateSubCategory(
        { id: editingSubCategory.id, data: formData },
        {
          onSuccess: () => {
            setIsSubCategoryModalOpen(false);
            setEditingSubCategory(null);
            subCategoryForm.reset();
          },
        }
      );
    } else {
      createSubCategory(formData, {
        onSuccess: () => {
          setIsSubCategoryModalOpen(false);
          subCategoryForm.reset();
        },
      });
    }
  };

  return (
    <div className="space-y-6 flex flex-col h-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Categories & Sub-Categories</h1>
          <p className="text-muted-foreground text-sm">
            {isRestro
              ? "Organize products by Mode, Category, and Sub-Category for targeted delivery and catalog management"
              : "Manage all product categories and sub-categories across the catalog"}
          </p>
        </div>
      </div>

      {/* Mode Filter Pills (Only visible in Restro mode) */}
      {isRestro && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mr-2 shrink-0">
            <Layers className="w-3.5 h-3.5 text-primary" /> Filter By Mode:
          </span>
          <Button
            variant={selectedModeFilter === "all" ? "default" : "outline"}
            size="sm"
            className="h-8 text-xs shrink-0 rounded-full"
            onClick={() => setSelectedModeFilter("all")}
          >
            All Modes
            <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-background/20 text-[10px]">
              {categories?.length || 0}
            </span>
          </Button>
          {modes?.map((mode: any) => {
            const count =
              categories?.filter(
                (c: any) =>
                  c.modeId?.toString() === mode.id.toString() ||
                  c.mode?.id?.toString() === mode.id.toString()
              ).length || 0;
            const isSelected = selectedModeFilter === mode.id.toString();
            return (
              <Button
                key={mode.id.toString()}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                className={cn(
                  "h-8 text-xs shrink-0 rounded-full transition-all",
                  isSelected
                    ? "shadow-sm"
                    : "hover:border-primary/40 hover:bg-primary/5"
                )}
                onClick={() => setSelectedModeFilter(mode.id.toString())}
              >
                {mode.name}
                {mode.badge && (
                  <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold uppercase tracking-wide">
                    {mode.badge}
                  </span>
                )}
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-background/20 text-[10px]">
                  {count}
                </span>
              </Button>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-[1.1fr_2fr] gap-6 flex-1 min-h-0">
        {/* Categories Panel */}
        <Card className="flex flex-col h-full md:max-h-[75vh]">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b">
            <div className="space-y-0.5">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <span>Categories</span>
                {isRestro && selectedModeFilter !== "all" && (
                  <Badge variant="secondary" className="text-[10px] font-normal px-2 py-0">
                    {modes?.find((m: any) => m.id.toString() === selectedModeFilter)?.name}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-xs">
                {filteredCategories.length} {filteredCategories.length === 1 ? "category" : "categories"} shown
              </CardDescription>
            </div>
            <Button size="sm" onClick={handleOpenCreateCategoryModal} className="h-8">
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Category
            </Button>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full">
              {isCategoriesLoading ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : filteredCategories.length === 0 ? (
                <div className="text-center py-12 px-4 text-muted-foreground text-sm">
                  <p>{isRestro ? "No categories found for this mode." : "No categories found."}</p>
                  <Button
                    variant="link"
                    size="sm"
                    className="mt-2 text-xs"
                    onClick={handleOpenCreateCategoryModal}
                  >
                    + Add category now
                  </Button>
                </div>
              ) : (
                <div className="p-2 space-y-1.5">
                  {filteredCategories.map((category: any) => {
                    const isSelected = selectedCategory?.id === category.id;
                    return (
                      <div
                        key={category.id}
                        onClick={() => setSelectedCategory(category)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all border cursor-pointer group",
                          isSelected
                            ? "bg-primary/10 text-primary border-primary/30 font-medium shadow-sm"
                            : "hover:bg-muted/80 border-transparent hover:border-border"
                        )}
                      >
                        <div className="w-10 h-10 rounded-md overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center border">
                          {category.image?.url ? (
                            <img
                              src={category.image.url}
                              alt={category.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-semibold">{category.name}</p>
                          {isRestro && (
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[10px] px-1.5 py-0 h-4 font-normal flex items-center gap-1",
                                  isSelected
                                    ? "border-primary/40 bg-primary/20 text-primary"
                                    : "border-muted-foreground/30 text-muted-foreground bg-muted/40"
                                )}
                              >
                                <Layers className="w-2.5 h-2.5" />
                                {category.mode?.name || "Mode #" + category.modeId}
                              </Badge>
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditCategoryModal(category);
                          }}
                          className="p-1.5 rounded-md hover:bg-background/80 text-muted-foreground hover:text-foreground opacity-70 group-hover:opacity-100 transition-opacity"
                          title="Edit Category"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <ChevronRight className={cn("w-4 h-4 text-muted-foreground/50", isSelected && "text-primary")} />
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Sub-Categories Panel */}
        <Card className="flex flex-col h-full md:max-h-[75vh]">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b">
            <div className="space-y-0.5">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <span>Sub-Categories</span>
                {selectedCategory && (
                  <Badge variant="outline" className="text-xs font-normal">
                    {selectedCategory.name}
                  </Badge>
                )}
                {isRestro && selectedCategory?.mode?.name && (
                  <Badge
                    variant="outline"
                    className="text-[10px] bg-primary/10 text-primary border-primary/20 flex items-center gap-1"
                  >
                    <Layers className="w-3 h-3" />
                    Mode: {selectedCategory.mode.name}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-xs">
                {selectedCategory
                  ? `${subCategories?.length || 0} sub-categories under ${selectedCategory.name}`
                  : "Select a category to view sub-categories"}
              </CardDescription>
            </div>
            {selectedCategory && (
              <Button size="sm" onClick={handleOpenCreateSubCategoryModal} className="h-8">
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Sub-Category
              </Button>
            )}
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full">
              {!selectedCategory ? (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center text-muted-foreground">
                  <FolderTree className="w-12 h-12 stroke-[1.2] mb-3 text-muted-foreground/60" />
                  <p className="text-sm font-medium">Select a category from the left</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Sub-categories {isRestro ? "and mode relationships" : ""} will be displayed here
                  </p>
                </div>
              ) : isSubCategoriesLoading ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : subCategories?.length === 0 ? (
                <div className="text-center py-12 px-4 text-muted-foreground text-sm">
                  <p>No sub-categories created for &quot;{selectedCategory.name}&quot; yet.</p>
                  <Button
                    variant="link"
                    size="sm"
                    className="mt-2 text-xs"
                    onClick={handleOpenCreateSubCategoryModal}
                  >
                    + Add first sub-category
                  </Button>
                </div>
              ) : (
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subCategories?.map((sub: any) => {
                    const modeName =
                      sub.mode?.name ||
                      sub.category?.mode?.name ||
                      selectedCategory?.mode?.name;
                    return (
                      <div
                        key={sub.id}
                        className="rounded-xl border bg-card/60 p-3 flex flex-col justify-between gap-3 hover:shadow-md transition-shadow relative group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center border">
                            {sub.image?.url ? (
                              <img
                                src={sub.image.url}
                                alt={sub.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="w-6 h-6 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm truncate">{sub.name}</h4>
                            {sub.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                {sub.description}
                              </p>
                            )}
                            {isRestro && modeName && (
                              <div className="mt-1.5 flex items-center gap-1">
                                <Badge
                                  variant="secondary"
                                  className="text-[9px] px-1.5 py-0 h-4 font-normal flex items-center gap-1"
                                >
                                  <Layers className="w-2.5 h-2.5 text-primary" />
                                  {modeName}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t pt-2 mt-1 text-xs text-muted-foreground">
                          <span className="text-[10px]">{sub.products?.length || 0} products</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs px-2"
                            onClick={() => handleOpenEditSubCategoryModal(sub)}
                          >
                            <Pencil className="w-3 h-3 mr-1" /> Edit
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* CREATE / EDIT CATEGORY MODAL */}
      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
          </DialogHeader>
          <Form {...categoryForm}>
            <form onSubmit={categoryForm.handleSubmit(onCategorySubmit)} className="space-y-4">
              {/* Mode Selection (Only in Restro mode) */}
              {isRestro && (
                <FormField
                  control={categoryForm.control}
                  name="modeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center justify-between">
                        <span>Operational Mode *</span>
                        <span className="text-xs text-muted-foreground font-normal">
                          Select which mode this category belongs to
                        </span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a mode (e.g. Instant Delivery)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {modes?.map((mode: any) => (
                            <SelectItem key={mode.id.toString()} value={mode.id.toString()}>
                              <div className="flex items-center gap-2">
                                <Layers className="w-3.5 h-3.5 text-primary" />
                                <span className="font-medium">{mode.name}</span>
                                {mode.badge && (
                                  <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-normal">
                                    {mode.badge}
                                  </Badge>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={categoryForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Farm Fresh Vegetables" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={categoryForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Brief summary of items in this category..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={categoryForm.control}
                name="image"
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel>{editingCategory ? "Replace Image (Optional)" : "Category Image *"}</FormLabel>
                    <FormControl>
                      <Input
                        {...fieldProps}
                        type="file"
                        accept="image/*"
                        onChange={(event) => onChange(event.target.files && event.target.files.length > 0 ? event.target.files : null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCategoryModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreatingCategory || isUpdatingCategory}>
                  {isCreatingCategory || isUpdatingCategory ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  {editingCategory ? "Update Category" : "Save Category"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* CREATE / EDIT SUB-CATEGORY MODAL */}
      <Dialog open={isSubCategoryModalOpen} onOpenChange={setIsSubCategoryModalOpen}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>
              {editingSubCategory ? "Edit Sub-Category" : `Add Sub-Category to ${selectedCategory?.name}`}
            </DialogTitle>
          </DialogHeader>

          {/* Mode & Category Inheritance Banner (Only in Restro mode) */}
          {isRestro && selectedCategory && (
            <div className="p-3 rounded-lg border bg-muted/40 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Parent Category:</span>
                <span className="font-semibold text-foreground">{selectedCategory.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Assigned Mode:</span>
                <Badge
                  variant="outline"
                  className="text-[10px] bg-primary/10 text-primary border-primary/20 flex items-center gap-1"
                >
                  <Layers className="w-3 h-3" />
                  {selectedCategory.mode?.name || "Inherited from Category"}
                </Badge>
              </div>
            </div>
          )}

          <Form {...subCategoryForm}>
            <form onSubmit={subCategoryForm.handleSubmit(onSubCategorySubmit)} className="space-y-4">
              <FormField
                control={subCategoryForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Leafy Greens" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={subCategoryForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Brief description..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={subCategoryForm.control}
                name="image"
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel>{editingSubCategory ? "Replace Image (Optional)" : "Image *"}</FormLabel>
                    <FormControl>
                      <Input
                        {...fieldProps}
                        type="file"
                        accept="image/*"
                        onChange={(event) => onChange(event.target.files && event.target.files.length > 0 ? event.target.files : null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsSubCategoryModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreatingSubCategory || isUpdatingSubCategory}>
                  {isCreatingSubCategory || isUpdatingSubCategory ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  {editingSubCategory ? "Update Sub-Category" : "Save Sub-Category"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
