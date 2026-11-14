import React, { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Trash2,
  Edit,
  Image as ImageIcon,
  Search,
  Tag,
  Percent,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  useGetAllOffers,
  useCreateOffer,
  useUpdateOffer,
  useDeleteOffer,
  Offer,
  OfferStatus,
  OfferType,
  DiscountType,
  DayOfWeek,
} from "@/api/hooks/admins/offer.hook";
import { showWarning, showSuccess } from "@/utils/message";
import { parseToDecimal } from "@/utils/util";

const ALL_DAYS: DayOfWeek[] = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

const DAY_LABELS: Record<DayOfWeek, string> = {
  SUNDAY: "Sun",
  MONDAY: "Mon",
  TUESDAY: "Tue",
  WEDNESDAY: "Wed",
  THURSDAY: "Thu",
  FRIDAY: "Fri",
  SATURDAY: "Sat",
};

export default function Offers() {
  // Modal states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [activeTab, setActiveTab] = useState("general");

  // Search & Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [stackableFilter, setStackableFilter] = useState<string>("ALL");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    badgeText: "",
    type: "AUTOMATIC" as OfferType,
    discountType: "PERCENTAGE" as DiscountType,
    discountValue: 10,
    displayOrder: 0,
    status: "ACTIVE" as OfferStatus,
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    code: "",

    // 🔄 Period Offer Configuration
    isPeriodOffer: false,
    periodDurationType: "MONTHS",
    periodDurationValue: 1,
    targetOrderCount: 5,

    // Metadata
    minCartValue: 0,
    minCartItems: 1,
    applicableDays: [...ALL_DAYS],
    usageLimitTotal: "",
    usageLimitPerUser: 1,
    isStackable: false,
    termsAndConditions: "",
  });

  // Banner image
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Queries & Mutations
  const { data: offersData, isLoading } = useGetAllOffers();

  const { mutate: createOffer, isPending: isCreating } = useCreateOffer();
  const { mutate: updateOffer, isPending: isUpdating } = useUpdateOffer();
  const { mutate: deleteOffer } = useDeleteOffer();

  const offers = offersData?.offers || [];

  // Summary Metrics
  const stats = useMemo(() => {
    const total = offers.length;
    const active = offers.filter((o) => o.status === "ACTIVE").length;
    const automatic = offers.filter((o) => o.type === "AUTOMATIC").length;
    const promoCodes = offers.filter((o) => o.type === "PROMO_CODE").length;
    const periodOffers = offers.filter((o) => o.isPeriodOffer).length;
    return { total, active, automatic, promoCodes, periodOffers };
  }, [offers]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingOffer(null);
    setActiveTab("general");
    setFormData({
      title: "",
      subtitle: "",
      description: "",
      badgeText: "",
      type: "AUTOMATIC",
      discountType: "PERCENTAGE",
      discountValue: 10,
      displayOrder: 0,
      status: "ACTIVE",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      code: "",

      isPeriodOffer: false,
      periodDurationType: "MONTHS",
      periodDurationValue: 1,
      targetOrderCount: 5,

      minCartValue: 0,
      minCartItems: 1,
      applicableDays: [...ALL_DAYS],
      usageLimitTotal: "",
      usageLimitPerUser: 1,
      isStackable: false,
      termsAndConditions: "",
    });
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsDialogOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (offer: Offer) => {
    setEditingOffer(offer);
    setActiveTab("general");
    const meta = offer.metadata || ({} as any);

    const parsedDiscountVal = parseToDecimal(offer.discountValue);
    const parsedMinCart = parseToDecimal(meta.minCartValue);

    setFormData({
      title: offer.title || "",
      subtitle: offer.subtitle || "",
      description: offer.description || "",
      badgeText: offer.badgeText || "",
      type: offer.type || "AUTOMATIC",
      discountType: offer.discountType || "PERCENTAGE",
      discountValue: parsedDiscountVal,
      displayOrder: offer.displayOrder || 0,
      status: offer.status || "ACTIVE",
      startDate: offer.startDate ? offer.startDate.split("T")[0] : new Date().toISOString().split("T")[0],
      endDate: offer.endDate ? offer.endDate.split("T")[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      code: offer.codes?.[0]?.code || "",

      isPeriodOffer: Boolean(offer.isPeriodOffer),
      periodDurationType: offer.periodRule?.periodDurationType || "MONTHS",
      periodDurationValue: offer.periodRule?.periodDurationValue || 1,
      targetOrderCount: offer.periodRule?.targetOrderCount || 5,

      minCartValue: parsedMinCart,
      minCartItems: meta.minCartItems ?? 1,
      applicableDays: meta.applicableDays || [...ALL_DAYS],
      usageLimitTotal: meta.usageLimitTotal != null ? String(meta.usageLimitTotal) : "",
      usageLimitPerUser: meta.usageLimitPerUser || 1,
      isStackable: meta.isStackable ?? false,
      termsAndConditions: meta.termsAndConditions || "",
    });

    setSelectedFile(null);
    setPreviewUrl(offer.bannerImage?.url || null);
    setIsDialogOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const toggleDayOfWeek = (day: DayOfWeek) => {
    setFormData((prev) => {
      const exists = prev.applicableDays.includes(day);
      const updated = exists
        ? prev.applicableDays.filter((d) => d !== day)
        : [...prev.applicableDays, day];
      return { ...prev, applicableDays: updated };
    });
  };

  const handleSaveOffer = () => {
    if (!formData.title.trim()) {
      showWarning("Offer title is required");
      setActiveTab("general");
      return;
    }
    if (!editingOffer && !selectedFile) {
      showWarning("Please select a banner image for the offer");
      setActiveTab("general");
      return;
    }
    if (!formData.isPeriodOffer && !formData.endDate) {
      showWarning("End date is required");
      setActiveTab("schedule");
      return;
    }
    if (formData.isPeriodOffer && (formData.targetOrderCount < 1 || formData.periodDurationValue < 1)) {
      showWarning("Please provide a valid period duration and target order milestone");
      setActiveTab("discount");
      return;
    }
    if (formData.type === "PROMO_CODE" && !formData.code.trim()) {
      showWarning("Please specify a promo code");
      setActiveTab("discount");
      return;
    }

    const payload = new FormData();
    payload.append("title", formData.title.trim());
    if (formData.subtitle) payload.append("subtitle", formData.subtitle.trim());
    if (formData.description) payload.append("description", formData.description.trim());
    if (formData.badgeText) payload.append("badgeText", formData.badgeText.trim());
    payload.append("type", formData.type);
    payload.append("discountType", formData.discountType);
    payload.append("discountValue", String(formData.discountValue));
    payload.append("displayOrder", String(formData.displayOrder));
    payload.append("status", formData.status);
    payload.append("isPeriodOffer", formData.isPeriodOffer ? "true" : "false");

    if (formData.isPeriodOffer) {
      const periodRuleObj = {
        periodDurationType: formData.periodDurationType || "MONTHS",
        periodDurationValue: Number(formData.periodDurationValue) || 1,
        targetOrderCount: Number(formData.targetOrderCount) || 5,
      };
      payload.append("periodRule", JSON.stringify(periodRuleObj));
      payload.append("periodRule[periodDurationType]", formData.periodDurationType || "MONTHS");
      payload.append("periodRule[periodDurationValue]", String(formData.periodDurationValue || 1));
      payload.append("periodRule[targetOrderCount]", String(formData.targetOrderCount || 5));

      const startDateObj = formData.startDate ? new Date(formData.startDate) : new Date();
      const farFutureDate = new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000);
      payload.append("startDate", startDateObj.toISOString());
      payload.append("endDate", farFutureDate.toISOString());
    } else {
      const startDateObj = formData.startDate ? new Date(formData.startDate) : new Date();
      const endDateObj = formData.endDate ? new Date(formData.endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      endDateObj.setHours(23, 59, 59, 999);
      payload.append("startDate", startDateObj.toISOString());
      payload.append("endDate", endDateObj.toISOString());

      // Metadata payload
      payload.append("metadata[minCartValue]", String(formData.minCartValue || 0));
      payload.append("metadata[minCartItems]", String(formData.minCartItems || 1));
      formData.applicableDays.forEach((d) => payload.append("metadata[applicableDays][]", d));
      if (formData.usageLimitTotal) payload.append("metadata[usageLimitTotal]", String(formData.usageLimitTotal));
      payload.append("metadata[usageLimitPerUser]", String(formData.usageLimitPerUser || 1));
    }

    const metadataPayload = {
      minCartValue: formData.isPeriodOffer ? 0 : Number(formData.minCartValue) || 0,
      minCartItems: formData.isPeriodOffer ? 1 : Number(formData.minCartItems) || 1,
      applicableDays: formData.isPeriodOffer ? ALL_DAYS : formData.applicableDays,
      usageLimitTotal: (!formData.isPeriodOffer && formData.usageLimitTotal) ? Number(formData.usageLimitTotal) : null,
      usageLimitPerUser: (!formData.isPeriodOffer && formData.usageLimitPerUser) ? Number(formData.usageLimitPerUser) : 1,
      isStackable: Boolean(formData.isStackable),
      termsAndConditions: formData.termsAndConditions || null,
    };
    payload.append("metadata", JSON.stringify(metadataPayload));

    payload.append("metadata[isStackable]", String(formData.isStackable));
    if (formData.termsAndConditions) payload.append("metadata[termsAndConditions]", formData.termsAndConditions);

    if (formData.code && formData.type === "PROMO_CODE") {
      payload.append("code", formData.code.trim().toUpperCase());
    }

    if (selectedFile) {
      payload.append("image", selectedFile);
    }

    if (editingOffer) {
      updateOffer(
        { id: editingOffer.id, payload },
        {
          onSuccess: () => setIsDialogOpen(false),
        }
      );
    } else {
      createOffer(payload, {
        onSuccess: () => {
          setIsDialogOpen(false);
        },
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    showSuccess(`Copied "${text}" to clipboard`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Filtered list of offers
  const filteredOffers = useMemo(() => {
    return offers.filter((offer) => {
      const matchesSearch =
        (offer.title || "").toLowerCase().includes(search.toLowerCase()) ||
        (offer.description || "").toLowerCase().includes(search.toLowerCase()) ||
        (offer.badgeText || "").toLowerCase().includes(search.toLowerCase()) ||
        (offer.codes?.[0]?.code || "").toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === "ALL" || offer.status === statusFilter;
      const matchesType =
        typeFilter === "ALL" ||
        (typeFilter === "PERIOD_OFFER" && offer.isPeriodOffer) ||
        (typeFilter === "AUTOMATIC" && !offer.isPeriodOffer && offer.type === "AUTOMATIC") ||
        (typeFilter === "PROMO_CODE" && !offer.isPeriodOffer && offer.type === "PROMO_CODE");
      const matchesStackable =
        stackableFilter === "ALL" ||
        (stackableFilter === "STACKABLE" && offer.metadata?.isStackable) ||
        (stackableFilter === "EXCLUSIVE" && !offer.metadata?.isStackable);

      return matchesSearch && matchesStatus && matchesType && matchesStackable;
    });
  }, [offers, search, statusFilter, typeFilter, stackableFilter]);

  return (
    <div className="space-y-6 animate-fade-in p-2 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-primary animate-pulse" />
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              Offers & Promotions
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Create promotions and manage store discount offers. Attach offers to products on the Products page.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="shadow-lg hover:shadow-primary/25">
          <Plus className="h-4 w-4 mr-2" />
          Create Offer
        </Button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-primary flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase">Total Offers</div>
            <div className="text-2xl font-bold mt-1">{stats.total}</div>
          </div>
          <div className="p-3 bg-primary/10 rounded-full text-primary">
            <Tag className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-500 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase">Active Now</div>
            <div className="text-2xl font-bold mt-1 text-emerald-600">{stats.active}</div>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-full text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-blue-500 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase">Auto-Applied</div>
            <div className="text-2xl font-bold mt-1 text-blue-600">{stats.automatic}</div>
          </div>
          <div className="p-3 bg-blue-500/10 rounded-full text-blue-600">
            <Percent className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-purple-500 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase">Period Milestone</div>
            <div className="text-2xl font-bold mt-1 text-purple-600">{stats.periodOffers}</div>
          </div>
          <div className="p-3 bg-purple-500/10 rounded-full text-purple-600">
            <Sparkles className="h-5 w-5" />
          </div>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="p-4 md:p-6 shadow-sm">
        {/* Filter Controls */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, badge, or promo code..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                <SelectItem value="PAUSED">Paused</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="EXPIRED">Expired</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="AUTOMATIC">Auto Apply</SelectItem>
                <SelectItem value="PROMO_CODE">Promo Code</SelectItem>
                <SelectItem value="PERIOD_OFFER">🔄 Period Offers</SelectItem>
              </SelectContent>
            </Select>

            <Select value={stackableFilter} onValueChange={setStackableFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Stackability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Stacking</SelectItem>
                <SelectItem value="STACKABLE">Stackable</SelectItem>
                <SelectItem value="EXCLUSIVE">Exclusive Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="text-center py-16 text-muted-foreground flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span>Loading promotions...</span>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[100px]">Banner</TableHead>
                  <TableHead>Offer Details</TableHead>
                  <TableHead>Discount / Benefit</TableHead>
                  <TableHead>Application</TableHead>
                  <TableHead>Attached Products</TableHead>
                  <TableHead>Stackable</TableHead>
                  <TableHead>Validity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOffers.map((offer) => {
                  const code = offer.codes?.[0]?.code;
                  const discountVal = parseToDecimal(offer.discountValue);
                  const isCashback = offer.discountType.includes("CASHBACK");
                  const attachedCount = offer._count?.productTargets ?? offer.productTargets?.length ?? 0;
                  const isStackable = offer.metadata?.isStackable ?? false;

                  return (
                    <TableRow key={offer.id} className="hover:bg-muted/20">
                      {/* Banner Image */}
                      <TableCell>
                        <div className="w-16 h-11 rounded-md bg-muted overflow-hidden border shadow-sm flex items-center justify-center">
                          {offer.bannerImage?.url ? (
                            <img
                              src={offer.bannerImage.url}
                              alt={offer.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="h-4 w-4 text-muted-foreground/50" />
                          )}
                        </div>
                      </TableCell>

                      {/* Title & Badges */}
                      <TableCell className="max-w-[220px]">
                        <div className="space-y-1">
                          <div className="font-semibold text-sm line-clamp-1 flex items-center gap-1.5">
                            {offer.title}
                          </div>
                          {offer.subtitle && (
                            <div className="text-xs text-muted-foreground line-clamp-1">
                              {offer.subtitle}
                            </div>
                          )}
                          {offer.badgeText && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-primary/20">
                              {offer.badgeText}
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      {/* Benefit */}
                      <TableCell>
                        <div className="flex items-center gap-1.5 font-bold text-sm">
                          {isCashback ? (
                            <Wallet className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <Percent className="h-4 w-4 text-primary" />
                          )}
                          {offer.discountType === "PERCENTAGE" ||
                          offer.discountType === "WALLET_CASHBACK_PERCENTAGE"
                            ? `${discountVal}%`
                            : `₹${discountVal}`}
                          <span className="text-xs font-normal text-muted-foreground">
                            {isCashback ? "Cashback" : "Off"}
                          </span>
                        </div>
                        {offer.metadata?.minCartValue ? (
                          <div className="text-[10px] text-muted-foreground">
                            Min cart: ₹{parseToDecimal(offer.metadata.minCartValue)}
                          </div>
                        ) : null}
                      </TableCell>

                      {/* Application Mode */}
                      <TableCell>
                        {offer.isPeriodOffer ? (
                          <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30 gap-1 font-medium">
                            <Sparkles className="h-3 w-3 text-purple-600" />
                            Period Offer
                          </Badge>
                        ) : offer.type === "PROMO_CODE" ? (
                          <div className="flex items-center gap-1.5">
                            <Badge variant="outline" className="font-mono text-xs bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30">
                              {code || "CODE"}
                            </Badge>
                            {code && (
                              <button
                                onClick={() => copyToClipboard(code)}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                                title="Copy promo code"
                              >
                                {copiedCode === code ? (
                                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                              </button>
                            )}
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30">
                            Auto Apply
                          </Badge>
                        )}
                      </TableCell>

                      {/* Attached Products Count */}
                      <TableCell>
                        <Badge variant="secondary" className="text-xs gap-1 py-1 px-2.5 font-medium">
                          <ShoppingBag className="h-3.5 w-3.5 text-primary" />
                          <span>{attachedCount} {attachedCount === 1 ? "Product" : "Products"}</span>
                        </Badge>
                      </TableCell>

                      {/* Stackable */}
                      <TableCell>
                        {isStackable ? (
                          <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30">
                            Stackable
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] text-muted-foreground">
                            Exclusive
                          </Badge>
                        )}
                      </TableCell>

                      {/* Validity */}
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {offer.isPeriodOffer ? (
                          <div>
                            <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-200 font-medium">
                              🎯 {offer.periodRule?.targetOrderCount || 5} Orders / {offer.periodRule?.periodDurationValue || 1} {offer.periodRule?.periodDurationType === "DAYS" ? "Days" : "Mo"}
                            </Badge>
                            <div className="text-[10px] text-muted-foreground mt-0.5">Recurring Cycle</div>
                          </div>
                        ) : (
                          <div>
                            <div>
                              {new Date(offer.startDate).toLocaleDateString()} -{" "}
                              {new Date(offer.endDate).toLocaleDateString()}
                            </div>
                            {offer.metadata?.applicableDays && (
                              <div className="text-[10px] text-primary/80 mt-0.5">
                                {offer.metadata.applicableDays.length === 7
                                  ? "All Days"
                                  : `${offer.metadata.applicableDays.length} Days/wk`}
                              </div>
                            )}
                          </div>
                        )}
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Badge
                          variant={
                            offer.status === "ACTIVE"
                              ? "default"
                              : offer.status === "PAUSED"
                              ? "secondary"
                              : "outline"
                          }
                          className={
                            offer.status === "ACTIVE"
                              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                              : ""
                          }
                        >
                          {offer.status}
                        </Badge>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Edit Offer"
                            onClick={() => handleOpenEdit(offer)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:bg-destructive/10"
                            title="Delete Offer"
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete offer "${offer.title}"?`)) {
                                deleteOffer(offer.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {filteredOffers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-16 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle className="h-8 w-8 text-muted-foreground/50" />
                        <div>No offers matching your search criteria.</div>
                        <Button variant="outline" size="sm" onClick={handleOpenCreate}>
                          <Plus className="h-3 w-3 mr-1" /> Create an Offer
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {/* 🛠️ Offer Create / Edit Modal (3 Clean Sections) */}
      {/* ═════════════════════════════════════════════════════════════════════════ */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl h-[80vh] max-h-[80vh] flex flex-col p-0 overflow-hidden shadow-2xl">
          <DialogHeader className="p-5 pb-3 border-b bg-card">
            <DialogTitle className="text-xl flex items-center gap-2 font-bold">
              <Sparkles className="h-5 w-5 text-primary" />
              {editingOffer ? "Edit Promotion Offer" : "Create New Promotion Offer"}
            </DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="px-5 pt-3 pb-2 border-b bg-muted/20">
              <TabsList className="grid grid-cols-3 w-full h-10">
                <TabsTrigger value="general">1. General</TabsTrigger>
                <TabsTrigger value="discount">2. Discount & Rules</TabsTrigger>
                <TabsTrigger value="schedule">3. Schedule & Limits</TabsTrigger>
              </TabsList>
            </div>

            {/* Scrollable Tab Content Container */}
            <div className="flex-1 overflow-y-auto p-5 md:p-6">
              {/* TAB 1: GENERAL */}
              <TabsContent value="general" className="space-y-4 m-0 focus-visible:outline-none">
                {/* Mode Selector Toggle */}
                <div className="p-3.5 rounded-lg border bg-muted/30 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-sm flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-purple-600" />
                      Periodic Milestone Offer (isPeriodOffer)
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Reward customers after completing a target number of delivered orders within a duration window (e.g. 5 orders in 1 month).
                    </div>
                  </div>
                  <Switch
                    checked={formData.isPeriodOffer}
                    onCheckedChange={(val) => setFormData({ ...formData, isPeriodOffer: val })}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Offer Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g. 5 Orders Carnival Reward"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subtitle">Subtitle</Label>
                    <Input
                      id="subtitle"
                      placeholder="e.g. Complete 5 orders this month and get your next order 100% Free!"
                      value={formData.subtitle}
                      onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="badgeText">Badge Callout Tag</Label>
                    <Input
                      id="badgeText"
                      placeholder="e.g. FREE ORDER or 5 ORDERS REWARD"
                      value={formData.badgeText}
                      onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="displayOrder">Display Sequence Order</Label>
                    <Input
                      id="displayOrder"
                      type="number"
                      value={formData.displayOrder}
                      onChange={(e) =>
                        setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide details about the promotional offer..."
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                {/* Banner Upload */}
                <div className="space-y-2 pt-2">
                  <Label>Offer Banner Image *</Label>
                  <div className="border-2 border-dashed rounded-lg p-4 flex flex-col sm:flex-row items-center gap-4 bg-muted/20">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="cursor-pointer flex-1"
                    />
                    {previewUrl && (
                      <div className="w-32 h-18 rounded-md border bg-background overflow-hidden flex-shrink-0 shadow-sm">
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <div className="space-y-1">
                    <Label>Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(val: OfferStatus) => setFormData({ ...formData, status: val })}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                        <SelectItem value="PAUSED">Paused</SelectItem>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              {/* TAB 2: DISCOUNT & CART RULES */}
              <TabsContent value="discount" className="space-y-4 m-0 focus-visible:outline-none">
                {formData.isPeriodOffer ? (
                  <div className="p-4 rounded-lg border border-purple-200 bg-purple-50/50 dark:bg-purple-950/20 space-y-3">
                    <div className="font-semibold text-sm text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-purple-600" />
                      Period Duration & Target Milestone Rules
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="periodDurationValue">Period Duration *</Label>
                        <div className="flex gap-2">
                          <Input
                            id="periodDurationValue"
                            type="number"
                            min={1}
                            value={formData.periodDurationValue}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                periodDurationValue: parseInt(e.target.value) || 1,
                              })
                            }
                            className="w-24"
                          />
                          <Select
                            value={formData.periodDurationType}
                            onValueChange={(val) =>
                              setFormData({ ...formData, periodDurationType: val })
                            }
                          >
                            <SelectTrigger className="flex-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="MONTHS">Month(s)</SelectItem>
                              <SelectItem value="DAYS">Day(s)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="targetOrderCount">Required Completed Orders *</Label>
                        <Input
                          id="targetOrderCount"
                          type="number"
                          min={1}
                          value={formData.targetOrderCount}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              targetOrderCount: parseInt(e.target.value) || 1,
                            })
                          }
                          placeholder="e.g. 5"
                        />
                        <p className="text-[11px] text-muted-foreground">
                          Number of delivered orders required in this window to unlock the benefit.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Application Mode</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(val: OfferType) => setFormData({ ...formData, type: val })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AUTOMATIC">Automatic (Applied on Qualification)</SelectItem>
                        <SelectItem value="PROMO_CODE">Promo Code (Requires User Input)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.type === "PROMO_CODE" && (
                    <div className="space-y-2">
                      <Label htmlFor="code">Promo Code *</Label>
                      <Input
                        id="code"
                        placeholder="e.g. FRESH50"
                        className="font-mono uppercase font-bold"
                        value={formData.code}
                        onChange={(e) =>
                          setFormData({ ...formData, code: e.target.value.toUpperCase() })
                        }
                      />
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Discount Mechanism</Label>
                    <Select
                      value={formData.discountType}
                      onValueChange={(val: DiscountType) =>
                        setFormData({ ...formData, discountType: val })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PERCENTAGE">Direct Percentage Off (%)</SelectItem>
                        <SelectItem value="FIXED_AMOUNT">Flat Price Reduction (₹)</SelectItem>
                        <SelectItem value="WALLET_CASHBACK_PERCENTAGE">
                          Wallet Cashback Percentage (%)
                        </SelectItem>
                        <SelectItem value="WALLET_CASHBACK_FLAT">
                          Wallet Cashback Flat Amount (₹)
                        </SelectItem>
                        <SelectItem value="BUY_X_GET_Y">Buy X Get Y</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discountValue">
                      {formData.discountType.includes("PERCENTAGE")
                        ? "Discount Percentage (%) *"
                        : "Discount Value (₹) *"}
                    </Label>
                    <Input
                      id="discountValue"
                      type="number"
                      min={0}
                      value={formData.discountValue}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discountValue: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                    {formData.isPeriodOffer && formData.discountType === "PERCENTAGE" && formData.discountValue === 100 && (
                      <p className="text-[11px] text-emerald-600 font-medium">
                        🎉 Next order will be 100% Completely Free!
                      </p>
                    )}
                  </div>
                </div>

                {!formData.isPeriodOffer && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="minCartValue">Min Cart Order Value (₹)</Label>
                      <Input
                        id="minCartValue"
                        type="number"
                        min={0}
                        value={formData.minCartValue}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            minCartValue: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                      <p className="text-[11px] text-muted-foreground">
                        Minimum cart subtotal required to qualify for this offer (0 = no minimum).
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="minCartItems">Min Cart Items Count</Label>
                      <Input
                        id="minCartItems"
                        type="number"
                        min={1}
                        value={formData.minCartItems}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            minCartItems: parseInt(e.target.value) || 1,
                          })
                        }
                      />
                      <p className="text-[11px] text-muted-foreground">
                        Minimum number of total items in cart required to activate discount.
                      </p>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* TAB 3: SCHEDULE & RULES */}
              <TabsContent value="schedule" className="space-y-4 m-0 focus-visible:outline-none">
                {formData.isPeriodOffer ? (
                  <div className="p-4 rounded-lg border border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 text-xs text-blue-900 dark:text-blue-200 space-y-1">
                    <div className="font-semibold text-sm flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-blue-600" />
                      Continuous Lifetime Recurring Cycles
                    </div>
                    <div>
                      This periodic offer runs continuously for customers across recurring cycles until marked as Paused. Fixed calendar dates, days-of-the-week restrictions, and global caps are omitted.
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startDate">Start Date *</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endDate">End Date *</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Day of Week Selector */}
                    <div className="space-y-2">
                      <Label>Applicable Days of Week</Label>
                      <div className="flex flex-wrap gap-2">
                        {ALL_DAYS.map((day) => {
                          const isSelected = formData.applicableDays.includes(day);
                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() => toggleDayOfWeek(day)}
                              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                                isSelected
                                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                  : "bg-muted text-muted-foreground border-transparent hover:bg-muted/80"
                              }`}
                            >
                              {DAY_LABELS[day]}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Usage Limits */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="usageLimitTotal">Total Global Usage Cap</Label>
                        <Input
                          id="usageLimitTotal"
                          type="number"
                          placeholder="e.g. 500 (Empty = Unlimited)"
                          value={formData.usageLimitTotal}
                          onChange={(e) =>
                            setFormData({ ...formData, usageLimitTotal: e.target.value })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="usageLimitPerUser">Per User Usage Limit</Label>
                        <Input
                          id="usageLimitPerUser"
                          type="number"
                          min={1}
                          value={formData.usageLimitPerUser}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              usageLimitPerUser: parseInt(e.target.value) || 1,
                            })
                          }
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Stackable Switch */}
                <div className="flex items-center justify-between p-3.5 rounded-lg border bg-muted/20">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-sm flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      Stackable with Other Offers
                    </div>
                    <div className="text-xs text-muted-foreground">
                      If enabled, customers can combine this offer with other active stackable discounts in their cart.
                    </div>
                  </div>
                  <Switch
                    checked={formData.isStackable}
                    onCheckedChange={(val) => setFormData({ ...formData, isStackable: val })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="termsAndConditions">Terms & Conditions</Label>
                  <Textarea
                    id="termsAndConditions"
                    placeholder="Enter offer fine print / rules..."
                    rows={2}
                    value={formData.termsAndConditions}
                    onChange={(e) =>
                      setFormData({ ...formData, termsAndConditions: e.target.value })
                    }
                  />
                </div>
              </TabsContent>
            </div>
          </Tabs>

          <DialogFooter className="p-4 border-t bg-card gap-2 flex-shrink-0">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveOffer} disabled={isCreating || isUpdating}>
              {editingOffer
                ? isUpdating
                  ? "Updating..."
                  : "Save Changes"
                : isCreating
                ? "Creating..."
                : "Create Offer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
