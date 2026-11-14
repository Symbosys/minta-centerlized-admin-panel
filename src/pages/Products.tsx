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
  Eye,
  Pencil,
  Tag,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  useGetAllProducts,
  useCreateProduct,
  useUpdateProduct,
} from "@/api/hooks/products/product.hook";
import { useGetAllCategories } from "@/api/hooks/category/category.hook";
import { useGetAllSubCategories } from "@/api/hooks/sub_category/sub_category.hook";
import { useGetActiveModes } from "@/api/hooks/mode/mode.hook";
import { AttachOfferModal } from "@/components/offers/AttachOfferModal";
import { usePlatform } from "@/context/PlatformContext";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const formatPrice = (val: any) => {
  if (val === null || val === undefined) return "0.00";
  if (typeof val === "number") return val.toFixed(2);
  if (typeof val === "string") return Number(val).toFixed(2);
  if (typeof val === "object" && val.d) {
    const strVal = val.d.join("");
    return Number(strVal).toFixed(2);
  }
  return "0.00";
};

const formatText = (val: any) => {
  if (!val) return "";
  if (typeof val === "object") {
    if (val.d) return val.d.join("");
    return JSON.stringify(val);
  }
  return String(val);
};

const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  modeId: z.string().optional(),
  categoryId: z.string().min(1, "Please select a category"),
  subCategoryId: z.string().optional(),
  marketPrice: z.string().optional(),
  sellingPrice: z.string().min(1, "Selling price is required"),
  vendorPrice: z.string().min(1, "Vendor price is required"),
  weight: z.string().optional(),
  pieces: z.string().optional(),
  isActive: z.boolean().default(true),
  isMandatory: z.boolean().default(false),
  images: z
    .any()
    .optional()
    .refine(
      (files) => !files || files.length <= 4,
      "You can upload up to 4 images max.",
    )
    .refine((files) => {
      if (!files || files.length === 0) return true;
      for (let i = 0; i < files.length; i++) {
        if (files[i].size > MAX_FILE_SIZE) return false;
      }
      return true;
    }, `Max file size is 5MB.`)
    .refine((files) => {
      if (!files || files.length === 0) return true;
      for (let i = 0; i < files.length; i++) {
        if (!ACCEPTED_IMAGE_TYPES.includes(files[i].type)) return false;
      }
      return true;
    }, "Only .jpg, .jpeg, .png and .webp formats are supported."),
});

export default function Products() {
  const { platform } = usePlatform();
  const isRestro = platform === "restro";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModeFilter, setSelectedModeFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedViewProduct, setSelectedViewProduct] = useState<any>(null);

  const [selectedOfferProduct, setSelectedOfferProduct] = useState<any>(null);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

  const { data: rawProducts, isLoading: isProductsLoading } =
    useGetAllProducts();
  const { data: categories, isLoading: isCategoriesLoading } =
    useGetAllCategories();
  const { data: modes, isLoading: isModesLoading } = useGetActiveModes({
    enabled: isRestro,
  });

  const { mutate: createProduct, isPending: isCreatingProduct } =
    useCreateProduct();
  const { mutate: updateProduct, isPending: isUpdatingProduct } =
    useUpdateProduct();

  const products = rawProducts?.products || rawProducts || [];

  const productForm = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema as any),
    defaultValues: {
      name: "",
      description: "",
      modeId: "",
      categoryId: "",
      subCategoryId: "",
      marketPrice: "",
      sellingPrice: "",
      vendorPrice: "",
      weight: "",
      pieces: "",
      isActive: true,
      isMandatory: false,
    },
  });

  const selectedCategoryId = productForm.watch("categoryId");
  const selectedModeId = productForm.watch("modeId");
  const { data: subCategories, isLoading: isSubCategoriesLoading } =
    useGetAllSubCategories(selectedCategoryId);

  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    if (!isRestro || !selectedModeId) return categories;
    return categories.filter((cat: any) => {
      const catModeId = cat.modeId?.toString() || cat.mode?.id?.toString();
      return catModeId === selectedModeId.toString();
    });
  }, [categories, selectedModeId, isRestro]);

  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    return products.filter((product: any) => {
      const matchesSearch = product.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesMode =
        !isRestro || selectedModeFilter === "all"
          ? true
          : product.modeId?.toString() === selectedModeFilter ||
            product.mode?.id?.toString() === selectedModeFilter;
      return matchesSearch && matchesMode;
    });
  }, [products, searchQuery, selectedModeFilter, isRestro]);

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    productForm.reset({
      name: "",
      description: "",
      modeId:
        isRestro && selectedModeFilter !== "all" ? selectedModeFilter : "",
      categoryId: "",
      subCategoryId: "",
      marketPrice: "",
      sellingPrice: "",
      vendorPrice: "",
      weight: "",
      pieces: "",
      isActive: true,
      isMandatory: false,
    });
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    productForm.reset({
      name: product.name || "",
      description: product.description || "",
      modeId: isRestro
        ? product.modeId?.toString() || product.mode?.id?.toString() || ""
        : "",
      categoryId:
        product.categoryId?.toString() ||
        product.category?.id?.toString() ||
        "",
      subCategoryId:
        product.subCategoryId?.toString() ||
        product.subCategory?.id?.toString() ||
        "",
      marketPrice:
        product.marketPrice !== null && product.marketPrice !== undefined
          ? String(formatPrice(product.marketPrice))
          : "",
      sellingPrice:
        product.sellingPrice !== null && product.sellingPrice !== undefined
          ? String(formatPrice(product.sellingPrice))
          : "",
      vendorPrice:
        product.vendorPrice !== null && product.vendorPrice !== undefined
          ? String(formatPrice(product.vendorPrice))
          : "",
      weight: product.weight ? formatText(product.weight) : "",
      pieces: product.pieces ? formatText(product.pieces) : "",
      isActive: Boolean(product.isActive),
      isMandatory: Boolean(product.isMandatory),
    });
    setIsModalOpen(true);
  };

  const handleViewProduct = (product: any) => {
    setSelectedViewProduct(product);
    setIsViewOpen(true);
  };

  const onSubmit = (values: z.infer<typeof productSchema>) => {
    const formData = new FormData();
    formData.append("name", values.name);
    if (values.description) formData.append("description", values.description);
    if (isRestro && values.modeId) formData.append("modeId", values.modeId);
    formData.append("categoryId", values.categoryId);
    if (values.subCategoryId)
      formData.append("subCategoryId", values.subCategoryId);
    if (values.marketPrice) formData.append("marketPrice", values.marketPrice);
    formData.append("sellingPrice", values.sellingPrice);
    formData.append("vendorPrice", values.vendorPrice);
    if (values.weight) formData.append("weight", values.weight);
    if (values.pieces) formData.append("pieces", values.pieces);
    formData.append("isActive", String(values.isActive));
    formData.append("isMandatory", String(values.isMandatory));

    if (values.images && values.images.length > 0) {
      for (let i = 0; i < values.images.length; i++) {
        formData.append("images", values.images[i]);
      }
    }

    if (editingProduct) {
      updateProduct(
        { id: editingProduct.id, data: formData },
        {
          onSuccess: () => {
            setIsModalOpen(false);
            setEditingProduct(null);
            productForm.reset();
          },
        },
      );
    } else {
      createProduct(formData, {
        onSuccess: () => {
          setIsModalOpen(false);
          productForm.reset();
        },
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Products</h1>
        <p className="text-muted-foreground">
          Manage your product catalog globally
        </p>
      </div>

      <Card className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex flex-1 items-center gap-3 w-full sm:max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {isRestro && (
              <Select
                value={selectedModeFilter}
                onValueChange={setSelectedModeFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Modes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modes</SelectItem>
                  {modes?.map((m: any) => (
                    <SelectItem key={m.id.toString()} value={m.id.toString()}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <Button onClick={handleOpenCreateModal}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>

        {/* Add/Edit Product Modal */}
        <Dialog
          open={isModalOpen}
          onOpenChange={(open) => {
            setIsModalOpen(open);
            if (!open) setEditingProduct(null);
          }}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "Edit Product" : "Add New Product"}
              </DialogTitle>
            </DialogHeader>
            <Form {...productForm}>
              <form
                onSubmit={productForm.handleSubmit(onSubmit)}
                className="grid gap-4 py-4"
              >
                <FormField
                  control={productForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter product name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div
                  className={`grid grid-cols-1 ${
                    isRestro ? "sm:grid-cols-3" : "sm:grid-cols-2"
                  } gap-4`}
                >
                  {isRestro && (
                    <FormField
                      control={productForm.control}
                      name="modeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mode</FormLabel>
                          <Select
                            onValueChange={(val) => {
                              field.onChange(val);
                              const currentCatId =
                                productForm.getValues("categoryId");
                              if (currentCatId) {
                                const currentCat = categories?.find(
                                  (c: any) =>
                                    c.id.toString() === currentCatId.toString(),
                                );
                                const catModeId =
                                  currentCat?.modeId?.toString() ||
                                  currentCat?.mode?.id?.toString();
                                if (catModeId && catModeId !== val.toString()) {
                                  productForm.setValue("categoryId", "");
                                  productForm.setValue("subCategoryId", "");
                                }
                              }
                            }}
                            value={field.value || ""}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select mode" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {modes?.map((m: any) => (
                                <SelectItem
                                  key={m.id.toString()}
                                  value={m.id.toString()}
                                >
                                  {m.name}
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
                    control={productForm.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select
                          onValueChange={(val) => {
                            field.onChange(val);
                            productForm.setValue("subCategoryId", "");
                            if (isRestro) {
                              const selectedCat = categories?.find(
                                (c: any) => c.id.toString() === val.toString(),
                              );
                              if (
                                selectedCat?.modeId &&
                                !productForm.getValues("modeId")
                              ) {
                                productForm.setValue(
                                  "modeId",
                                  selectedCat.modeId.toString(),
                                );
                              }
                            }
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {filteredCategories?.length === 0 ? (
                              <div className="p-2 text-center text-xs text-muted-foreground">
                                {isRestro
                                  ? "No categories found for this mode"
                                  : "No categories found"}
                              </div>
                            ) : (
                              filteredCategories?.map((cat: any) => (
                                <SelectItem
                                  key={cat.id.toString()}
                                  value={cat.id.toString()}
                                >
                                  <div className="flex items-center justify-between w-full gap-2">
                                    <span>{cat.name}</span>
                                    {isRestro && cat.mode?.name && (
                                      <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                        {cat.mode.name}
                                      </span>
                                    )}
                                  </div>
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={productForm.control}
                    name="subCategoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sub-Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={
                            !selectedCategoryId ||
                            isSubCategoriesLoading ||
                            !subCategories?.length
                          }
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select sub-category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {subCategories?.map((subCat: any) => (
                              <SelectItem
                                key={subCat.id.toString()}
                                value={subCat.id.toString()}
                              >
                                {subCat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={productForm.control}
                    name="sellingPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Selling Price (₹)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={productForm.control}
                    name="marketPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Market Price (₹)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={productForm.control}
                    name="vendorPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vendor Price (₹)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={productForm.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight (e.g. 500g, 1kg)</FormLabel>
                        <FormControl>
                          <Input placeholder="Weight" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={productForm.control}
                    name="pieces"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pieces (e.g. 5 pcs)</FormLabel>
                        <FormControl>
                          <Input placeholder="Pieces" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mt-2 mb-2">
                  <FormField
                    control={productForm.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Active Product</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={productForm.control}
                    name="isMandatory"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Mandatory</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={productForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter product description"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={productForm.control}
                  name="images"
                  render={({ field: { value, onChange, ...fieldProps } }) => (
                    <FormItem>
                      <FormLabel>
                        {editingProduct
                          ? "Replace Images (Optional, Max 4)"
                          : "Images (Max 4)"}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...fieldProps}
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(event) =>
                            onChange(
                              event.target.files &&
                                event.target.files.length > 0
                                ? event.target.files
                                : undefined,
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full mt-4"
                  disabled={isCreatingProduct || isUpdatingProduct}
                >
                  {isCreatingProduct || isUpdatingProduct ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  {editingProduct ? "Update Product" : "Create Product"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* View Product Details Modal */}
        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                Product Details
              </DialogTitle>
            </DialogHeader>
            {selectedViewProduct && (
              <div className="space-y-6 py-2">
                {/* Product Images */}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">
                    Product Images
                  </h4>
                  {selectedViewProduct.images &&
                  selectedViewProduct.images.length > 0 ? (
                    <div className="grid grid-cols-4 gap-3">
                      {selectedViewProduct.images.map(
                        (imgObj: any, index: number) => {
                          const imgUrl = imgObj?.image?.url || imgObj?.url;
                          return (
                            <div
                              key={imgObj.id || index}
                              className="aspect-square rounded-lg border overflow-hidden bg-muted flex items-center justify-center"
                            >
                              {imgUrl ? (
                                <img
                                  src={imgUrl}
                                  alt={`Product ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <ImageIcon className="w-6 h-6 text-muted-foreground" />
                              )}
                            </div>
                          );
                        },
                      )}
                    </div>
                  ) : (
                    <div className="p-4 border rounded-lg bg-muted/50 text-center text-sm text-muted-foreground">
                      No images uploaded for this product.
                    </div>
                  )}
                </div>

                {/* Name, Mode & Category */}
                <div
                  className={`grid grid-cols-1 ${
                    isRestro ? "sm:grid-cols-3" : "sm:grid-cols-2"
                  } gap-4 border-t pt-4`}
                >
                  <div>
                    <span className="text-xs text-muted-foreground block">
                      Product Name
                    </span>
                    <span className="font-semibold text-base">
                      {selectedViewProduct.name}
                    </span>
                  </div>
                  {isRestro && (
                    <div>
                      <span className="text-xs text-muted-foreground block">
                        Application Mode
                      </span>
                      <span className="font-medium text-sm">
                        {selectedViewProduct.mode?.name ? (
                          <Badge variant="outline" className="mt-0.5">
                            {selectedViewProduct.mode.name}
                          </Badge>
                        ) : (
                          "Default"
                        )}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-xs text-muted-foreground block">
                      Category / Sub-Category
                    </span>
                    <span className="font-medium text-sm">
                      {selectedViewProduct.category?.name || "N/A"}
                      {selectedViewProduct.subCategory?.name &&
                        ` > ${selectedViewProduct.subCategory.name}`}
                    </span>
                  </div>
                </div>

                {/* Prices */}
                <div className="grid grid-cols-3 gap-4 border-t pt-4 bg-muted/30 p-3 rounded-lg">
                  <div>
                    <span className="text-xs text-muted-foreground block">
                      Selling Price
                    </span>
                    <span className="font-bold text-success text-base">
                      ₹{formatPrice(selectedViewProduct.sellingPrice)}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">
                      Market Price
                    </span>
                    <span className="font-medium text-sm">
                      {selectedViewProduct.marketPrice !== null &&
                      selectedViewProduct.marketPrice !== undefined
                        ? `₹${formatPrice(selectedViewProduct.marketPrice)}`
                        : "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">
                      Vendor Price
                    </span>
                    <span className="font-medium text-sm">
                      ₹{formatPrice(selectedViewProduct.vendorPrice)}
                    </span>
                  </div>
                </div>

                {/* Specification & Status */}
                <div className="grid grid-cols-4 gap-4 border-t pt-4">
                  <div>
                    <span className="text-xs text-muted-foreground block">
                      Weight
                    </span>
                    <span className="text-sm font-medium">
                      {formatText(selectedViewProduct.weight) || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">
                      Pieces
                    </span>
                    <span className="text-sm font-medium">
                      {formatText(selectedViewProduct.pieces) || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">
                      Mandatory
                    </span>
                    <Badge
                      variant={
                        selectedViewProduct.isMandatory
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {selectedViewProduct.isMandatory ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">
                      Status
                    </span>
                    <Badge
                      variant={
                        selectedViewProduct.isActive ? "default" : "secondary"
                      }
                    >
                      {selectedViewProduct.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>

                {/* Description */}
                <div className="border-t pt-4">
                  <span className="text-xs text-muted-foreground block mb-1">
                    Description
                  </span>
                  <p className="text-sm text-foreground whitespace-pre-wrap bg-muted/20 p-3 rounded-lg border">
                    {selectedViewProduct.description ||
                      "No description provided."}
                  </p>
                </div>

                <div className="flex justify-end gap-2 border-t pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsViewOpen(false)}
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      setIsViewOpen(false);
                      handleEditProduct(selectedViewProduct);
                    }}
                  >
                    <Pencil className="h-4 w-4 mr-2" /> Edit Product
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Product Name</TableHead>
              {isRestro && <TableHead>Mode</TableHead>}
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Weight/Pieces</TableHead>
              <TableHead>Mandatory</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isProductsLoading ? (
              <TableRow>
                <TableCell
                  colSpan={isRestro ? 9 : 8}
                  className="h-24 text-center"
                >
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    <span className="ml-2">Loading products...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={isRestro ? 9 : 8}
                  className="h-24 text-center text-muted-foreground"
                >
                  No products found.
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product: any) => {
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="w-10 h-10 rounded overflow-hidden bg-muted flex items-center justify-center">
                        {product.images?.[0]?.image?.url ? (
                          <img
                            src={product.images[0].image.url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {product.name}
                    </TableCell>
                    {isRestro && (
                      <TableCell>
                        {product.mode?.name ? (
                          <Badge
                            variant="secondary"
                            className="font-normal text-xs"
                          >
                            {product.mode.name}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">-</span>
                        )}
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="font-medium">
                        {product.category?.name || "N/A"}
                      </div>
                      {product.subCategory?.name && (
                        <div className="text-xs text-muted-foreground">
                          {product.subCategory.name}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-success">
                        ₹{formatPrice(product.sellingPrice)}
                      </div>
                      {product.marketPrice !== null &&
                        product.marketPrice !== undefined && (
                          <div className="text-xs text-muted-foreground line-through">
                            ₹{formatPrice(product.marketPrice)}
                          </div>
                        )}
                    </TableCell>
                    <TableCell>
                      {product.weight && (
                        <div className="text-xs">
                          {formatText(product.weight)}
                        </div>
                      )}
                      {product.pieces && (
                        <div className="text-xs">
                          {formatText(product.pieces)}
                        </div>
                      )}
                      {!product.weight && !product.pieces && (
                        <div className="text-xs text-muted-foreground">-</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          product.isMandatory ? "destructive" : "secondary"
                        }
                      >
                        {product.isMandatory ? "Yes" : "No"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={product.isActive ? "default" : "secondary"}
                      >
                        {product.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedOfferProduct(product);
                            setIsOfferModalOpen(true);
                          }}
                          title="Attach / Manage Offers"
                          className="text-primary hover:text-primary hover:bg-primary/10"
                        >
                          <Tag className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewProduct(product)}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditProduct(product)}
                          title="Edit Product"
                        >
                          <Pencil className="h-4 w-4" />
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

      {/* Attach Offers Modal */}
      {selectedOfferProduct && (
        <AttachOfferModal
          open={isOfferModalOpen}
          onOpenChange={setIsOfferModalOpen}
          targetType="PRODUCT"
          targetId={selectedOfferProduct.id}
          targetName={selectedOfferProduct.name}
          targetSubtitle={`Category: ${selectedOfferProduct.category?.name || "N/A"} • Selling Price: ₹${formatPrice(selectedOfferProduct.sellingPrice)}`}
        />
      )}
    </div>
  );
}
