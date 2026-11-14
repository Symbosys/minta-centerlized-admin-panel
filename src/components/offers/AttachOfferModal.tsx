import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Search,
  Tag,
  Percent,
  Wallet,
  Calendar,
  ShoppingBag,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import {
  useGetAllOffers,
  useGetProductOffers,
  useAttachOffersToProduct,
  useDetachOfferFromProduct,
  Offer,
} from "@/api/hooks/admins/offer.hook";
import { parseToDecimal } from "@/utils/util";

export interface AttachOfferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetType?: "PRODUCT";
  targetId: string | number;
  targetName: string;
  targetSubtitle?: string;
}

export const AttachOfferModal: React.FC<AttachOfferModalProps> = ({
  open,
  onOpenChange,
  targetId,
  targetName,
  targetSubtitle,
}) => {
  const [search, setSearch] = useState("");

  // 1. Fetch all active offers
  const { data: allOffersData, isLoading: isLoadingAllOffers } = useGetAllOffers();
  const allOffers = allOffersData?.offers || [];

  // 2. Fetch product-attached offers
  const productOffersQuery = useGetProductOffers(open ? targetId : undefined);

  // Mutations
  const attachProductOffer = useAttachOffersToProduct();
  const detachProductOffer = useDetachOfferFromProduct();

  // Extract attached offer IDs
  const attachedOfferIds = useMemo(() => {
    if (!open) return new Set<string>();
    const data = productOffersQuery.data as any;
    const directOffers = data?.directOffers || [];
    return new Set<string>(directOffers.map((o: any) => String(o.id)));
  }, [open, productOffersQuery.data]);

  // Filter offers matching the search query
  const filteredOffers = useMemo(() => {
    return allOffers.filter((offer) => {
      const matchesSearch =
        (offer.title || "").toLowerCase().includes(search.toLowerCase()) ||
        (offer.subtitle || "").toLowerCase().includes(search.toLowerCase()) ||
        (offer.badgeText || "").toLowerCase().includes(search.toLowerCase()) ||
        (offer.codes?.[0]?.code || "").toLowerCase().includes(search.toLowerCase());

      return matchesSearch;
    });
  }, [allOffers, search]);

  const isMutating = attachProductOffer.isPending || detachProductOffer.isPending;

  const handleToggleOffer = async (offer: Offer, isAttached: boolean) => {
    if (isMutating) return;

    const offerId = offer.id;

    if (isAttached) {
      detachProductOffer.mutate({ productId: targetId, offerId });
    } else {
      attachProductOffer.mutate({ productId: targetId, offerIds: [offerId] });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[85vh] max-h-[85vh] flex flex-col p-0 overflow-hidden shadow-2xl">
        {/* Header */}
        <DialogHeader className="p-5 pb-3 border-b bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-lg text-primary">
              <ShoppingBag className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                Attach Offers: {targetName}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {targetSubtitle || "Manage promotional discounts directly attached to this product"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Search & Counter Bar */}
        <div className="px-5 py-3 border-b bg-muted/20 flex items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search promotions by title, code or badge..."
              className="pl-9 h-9 text-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Badge variant="secondary" className="px-3 py-1 text-xs">
            {attachedOfferIds.size} Attached
          </Badge>
        </div>

        {/* Offers List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {isLoadingAllOffers || productOffersQuery.isLoading ? (
            <div className="text-center py-16 text-muted-foreground flex flex-col items-center gap-2">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
              <span className="text-xs">Loading available promotions...</span>
            </div>
          ) : (
            <>
              {filteredOffers.map((offer) => {
                const isAttached = attachedOfferIds.has(String(offer.id));
                const discountVal = parseToDecimal(offer.discountValue);
                const isCashback = offer.discountType.includes("CASHBACK");
                const code = offer.codes?.[0]?.code;

                return (
                  <div
                    key={offer.id}
                    className={`p-3.5 rounded-lg border transition-all flex items-center justify-between gap-4 ${
                      isAttached
                        ? "bg-primary/5 border-primary/40 shadow-xs"
                        : "bg-card hover:bg-muted/30 border-border"
                    }`}
                  >
                    {/* Left: Thumbnail & Details */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-14 h-11 rounded-md bg-muted overflow-hidden border flex-shrink-0 flex items-center justify-center">
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

                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm line-clamp-1">
                            {offer.title}
                          </span>
                          {offer.badgeText && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-primary/20"
                            >
                              {offer.badgeText}
                            </Badge>
                          )}
                          {isAttached && (
                            <Badge className="text-[10px] px-1.5 py-0 h-4 bg-emerald-600 text-white">
                              Active on Product
                            </Badge>
                          )}
                        </div>

                        {offer.subtitle && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {offer.subtitle}
                          </p>
                        )}

                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap pt-0.5">
                          <div className="flex items-center gap-1 font-bold text-foreground">
                            {isCashback ? (
                              <Wallet className="h-3.5 w-3.5 text-emerald-600" />
                            ) : (
                              <Percent className="h-3.5 w-3.5 text-primary" />
                            )}
                            {offer.discountType.includes("PERCENTAGE")
                              ? `${discountVal}%`
                              : `₹${discountVal}`}{" "}
                            {isCashback ? "Cashback" : "Off"}
                          </div>

                          {code && (
                            <Badge
                              variant="outline"
                              className="font-mono text-[10px] px-1.5 py-0 h-4 bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30"
                            >
                              {code}
                            </Badge>
                          )}

                          <div className="flex items-center gap-1 text-[10px]">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {new Date(offer.startDate).toLocaleDateString()} -{" "}
                              {new Date(offer.endDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Switch / Action */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <div className="text-xs font-semibold">
                          {isAttached ? (
                            <span className="text-emerald-600">Attached</span>
                          ) : (
                            <span className="text-muted-foreground">Inactive</span>
                          )}
                        </div>
                      </div>
                      <Switch
                        checked={isAttached}
                        disabled={isMutating}
                        onCheckedChange={() => handleToggleOffer(offer, isAttached)}
                      />
                    </div>
                  </div>
                );
              })}

              {filteredOffers.length === 0 && (
                <div className="text-center py-12 text-muted-foreground space-y-2">
                  <Tag className="h-8 w-8 mx-auto text-muted-foreground/40" />
                  <div className="text-sm font-medium">No matching offers found</div>
                  <p className="text-xs">
                    Create promotions in the Offers tab first to attach them to this product.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-card flex justify-end gap-2">
          <Button variant="default" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
