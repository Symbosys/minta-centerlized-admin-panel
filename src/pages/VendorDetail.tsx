import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, CheckCircle, XCircle, MapPin, Loader2 } from "lucide-react";
import { parseToDecimal } from "@/utils/util";
import {
  useGetVendorById,
  useGetVendorOrders,
  useGetVendorReviews,
  useGetVendorPayouts,
} from "@/api/hooks/vendor/vendor.hook";
import { useGetVendorProducts, useGetVendorCategories } from "@/api/hooks/vendor/product.hook";
import { useGetVendorWalletTransactions } from "@/api/hooks/vendor/wallet.hook";
import { useGetAllVendorBankAccounts } from "@/api/hooks/vendor/bank.hook";
import { useGetVendorDocument } from "@/api/hooks/vendor/documents.hook";

export default function VendorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");

  // Always fetch primary vendor info for header & top card
  const { data: vendor, isLoading, isError } = useGetVendorById(id, { enabled: !!id });

  // Lazy-loaded queries for tabs — executed ONLY when their tab is active
  const { data: docsData, isLoading: isDocsLoading } = useGetVendorDocument(id, {
    enabled: activeTab === "documents",
  });
  const { data: bankData, isLoading: isBankLoading } = useGetAllVendorBankAccounts(id, {
    enabled: activeTab === "bank",
  });
  const { data: walletData, isLoading: isWalletLoading } = useGetVendorWalletTransactions(
    { vendorId: id },
    { enabled: activeTab === "wallet" }
  );
  const { data: ordersData, isLoading: isOrdersLoading } = useGetVendorOrders(id, {
    enabled: activeTab === "orders",
  });
  const { data: categoriesData, isLoading: isCategoriesLoading } = useGetVendorCategories(id, {
    enabled: activeTab === "categories",
  });
  const { data: productsData, isLoading: isProductsLoading } = useGetVendorProducts(id, {
    enabled: activeTab === "products",
  });
  const { data: reviewsData, isLoading: isReviewsLoading } = useGetVendorReviews(id, {
    enabled: activeTab === "reviews",
  });
  const { data: payoutsData, isLoading: isPayoutsLoading } = useGetVendorPayouts(id, {
    enabled: activeTab === "payouts",
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading vendor details...</span>
      </div>
    );
  }

  if (isError || !vendor) {
    return (
      <div className="p-6 space-y-4">
        <Button variant="ghost" onClick={() => navigate("/vendors")} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Vendors
        </Button>
        <div className="text-muted-foreground">Vendor not found or error loading vendor.</div>
      </div>
    );
  }

  const vendorDocs = docsData || vendor.documents || null;
  const vendorBanks = Array.isArray(bankData) ? bankData : vendor.bankAccounts || [];
  const vendorTransactions = walletData?.pages.flatMap((page: any) => page.transactions) || [];
  const vendorCategories = (Array.isArray(categoriesData) ? categoriesData : [])?.filter((c: any) => c.isSelected || c.isActive) || [];
  const vendorProducts = productsData?.products || (Array.isArray(productsData) ? productsData : []);
  const vendorOrders = ordersData?.orders || (Array.isArray(ordersData) ? ordersData : []);
  const vendorReviews = Array.isArray(reviewsData) ? reviewsData : [];
  const vendorPayouts = payoutsData?.payouts || (Array.isArray(payoutsData) ? payoutsData : []);

  const getStatusColor = (status: string) => {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/vendors")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{vendor.shopName || "N/A"}</h1>
          <p className="text-muted-foreground">Owner: {vendor.ownerName || "N/A"}</p>
        </div>
        <div className="ml-auto flex gap-2">
          <Badge variant={getStatusColor(vendor.status)}>{vendor.status || "NEW"}</Badge>
          <Badge variant={vendor.isActive ? "default" : "secondary"}>
            {vendor.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val)} className="w-full">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="bank">Bank Accounts</TabsTrigger>
          <TabsTrigger value="wallet">Wallet</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
        </TabsList>

        {/* PROFILE TAB */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Vendor Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Shop Name</p>
                  <p className="font-medium">{vendor.shopName || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Owner Name</p>
                  <p className="font-medium">{vendor.ownerName || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Mobile</p>
                  <p className="font-medium">{vendor.mobile || vendor.contactNumber || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{vendor.email || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <p className="font-medium">⭐ {parseToDecimal(vendor.rating).toFixed(1)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="font-medium">{vendor.totalOrders ?? vendor._count?.Order ?? 0}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Shop Address
                </h3>
                <div className="space-y-2">
                  <p className="font-medium">{vendor.mainAddress || "N/A"}</p>
                  <p className="text-sm text-muted-foreground">{vendor.completeAddress || "N/A"}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">City:</span> {vendor.city || "N/A"}
                    </div>
                    <div>
                      <span className="text-muted-foreground">State:</span> {vendor.state || "N/A"}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Pincode:</span> {vendor.pincode || "N/A"}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Country:</span> {vendor.country || "India"}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Coordinates: {vendor.latitude || "N/A"}, {vendor.longitude || "N/A"}
                  </p>
                </div>
              </div>

              {(vendor.images || vendor.shopImages?.length > 0) && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-3">Shop Images</h3>
                  <div className="flex gap-2">
                    {vendor.images ? (
                      <img
                        src={typeof vendor.images === "string" ? JSON.parse(vendor.images).url : vendor.images.url}
                        alt="Shop"
                        className="w-24 h-24 rounded object-cover border"
                      />
                    ) : (
                      <span className="text-sm text-muted-foreground">No images uploaded.</span>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* DOCUMENTS TAB */}
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {isDocsLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Loading documents...</span>
                </div>
              ) : vendorDocs ? (
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">Aadhaar Card</h4>
                      {vendorDocs.isAadhaarVerified ? (
                        <Badge variant="default" className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Verified
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> Unverified
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm font-mono">{vendorDocs.aadhaarNumber || "Not Provided"}</p>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">PAN Card</h4>
                    <p className="text-sm font-mono">{vendorDocs.panNumber || "Not Provided"}</p>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">FSSAI License</h4>
                    <p className="text-sm font-mono">{vendorDocs.fassaiNumber || vendorDocs.fssaiNumber || "Not provided"}</p>
                    {vendorDocs.reason && (
                      <p className="text-sm text-muted-foreground mt-2">Note: {vendorDocs.reason}</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No documents available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* BANK TAB */}
        <TabsContent value="bank">
          <Card>
            <CardHeader>
              <CardTitle>Bank Accounts ({vendorBanks.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {isBankLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Loading bank accounts...</span>
                </div>
              ) : vendorBanks.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No bank accounts available</p>
              ) : (
                <div className="space-y-4">
                  {vendorBanks.map((bank: any) => (
                    <div key={bank.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold">{bank.bankName || "Bank"}</h4>
                        <Badge variant={bank.isVerified || bank.status === "APPROVED" ? "default" : "secondary"}>
                          {bank.status || (bank.isVerified ? "Verified" : "Pending")}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Account Holder: </span>
                          <span className="font-medium">{bank.accountHolder}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Account Number: </span>
                          <span className="font-mono">{bank.accountNumber}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">IFSC: </span>
                          <span className="font-mono">{bank.ifsc}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Branch: </span>
                          <span>{bank.branch || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* WALLET TAB */}
        <TabsContent value="wallet">
          <Card>
            <CardHeader>
              <CardTitle>Wallet Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {isWalletLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Loading wallet details...</span>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4 bg-muted/20 p-4 rounded-lg border">
                    <div>
                      <p className="text-sm text-muted-foreground">Current Balance</p>
                      <p className="text-2xl font-bold text-success">
                        ₹{parseToDecimal(walletData?.pages[0]?.totalBalance ?? vendor.walletBalance ?? vendor.VendorWallet?.balance ?? 0).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge variant="default">Active</Badge>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-4">Transaction History ({vendorTransactions.length})</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Reference ID</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {vendorTransactions.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                              No transactions found
                            </TableCell>
                          </TableRow>
                        ) : (
                          vendorTransactions.map((txn: any) => {
                            const isCredit = txn.type === "CREDIT" || txn.type === "Credit";
                            return (
                              <TableRow key={txn.id}>
                                <TableCell>{new Date(txn.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell>
                                  <Badge variant={isCredit ? "default" : "secondary"}>
                                    {txn.type}
                                  </Badge>
                                </TableCell>
                                <TableCell>{txn.description || "N/A"}</TableCell>
                                <TableCell className="font-mono text-sm">{txn.referenceId || txn.orderId || "-"}</TableCell>
                                <TableCell className={`text-right font-medium ${isCredit ? "text-success" : "text-destructive"}`}>
                                  {isCredit ? "+" : "-"}₹{Math.abs(parseToDecimal(txn.amount)).toFixed(2)}
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ORDERS TAB */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Orders ({vendorOrders.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {isOrdersLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Loading orders...</span>
                </div>
              ) : vendorOrders.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No orders found for this vendor</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order Number</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Delivery Partner</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendorOrders.map((order: any) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-sm">{order.orderNumber || order.id}</TableCell>
                        <TableCell>{order.userName || "N/A"}</TableCell>
                        <TableCell>{order.deliveryPartner || "Unassigned"}</TableCell>
                        <TableCell className="font-medium text-success">
                          ₹{parseToDecimal(order.totalAmount || order.payableAmount || 0).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={order.status === "DELIVERED" ? "default" : "secondary"}>
                            {order.status || "PENDING"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {order.date ? new Date(order.date).toLocaleDateString() : "N/A"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* CATEGORIES TAB */}
        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Categories ({vendorCategories.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {isCategoriesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : vendorCategories.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No active categories found</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {vendorCategories.map((cat: any) => (
                    <div key={cat.id} className="border rounded-lg p-4 flex flex-col items-center gap-2 text-center">
                      <div className="w-16 h-16 rounded overflow-hidden bg-muted flex items-center justify-center">
                        {cat.image ? (
                          <img
                            src={typeof cat.image === "string" ? JSON.parse(cat.image).url : cat.image.url}
                            alt={cat.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <MapPin className="w-6 h-6 text-muted-foreground" />
                        )}
                      </div>
                      <span className="font-medium text-sm">{cat.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* PRODUCTS TAB */}
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Products ({vendorProducts.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {isProductsLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Loading products...</span>
                </div>
              ) : vendorProducts.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No products available</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendorProducts.map((product: any) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>
                          ₹{parseToDecimal(product.vendorPrice || product.sellingPrice || product.price || 0).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={product.isVeg ? "default" : "destructive"}>
                            {product.isVeg ? "Veg" : "Non-Veg"}
                          </Badge>
                        </TableCell>
                        <TableCell>⭐ {parseToDecimal(product.rating || 0).toFixed(1)}</TableCell>
                        <TableCell>
                          <Badge variant={product.isAvailable ? "default" : "secondary"}>
                            {product.isAvailable ? "Available" : "Unavailable"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* REVIEWS TAB */}
        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle>Reviews ({vendorReviews.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {isReviewsLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Loading reviews...</span>
                </div>
              ) : vendorReviews.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No reviews found for this vendor</p>
              ) : (
                <div className="space-y-4">
                  {vendorReviews.map((review: any) => (
                    <div key={review.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">⭐</span>
                          <span className="font-semibold">
                            {parseToDecimal(review.vendorRating || review.ratingAverage || 5).toFixed(1)}
                          </span>
                        </div>
                        <Badge variant={review.status === "APPROVED" ? "default" : "secondary"}>
                          {review.status || "APPROVED"}
                        </Badge>
                      </div>
                      <p className="text-sm mb-2">{review.reviewText || review.comment || "No comment provided."}</p>
                      <p className="text-xs text-muted-foreground">
                        {review.order?.orderNumber ? `Order: #${review.order.orderNumber} • ` : ""}
                        {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* PAYOUTS TAB */}
        <TabsContent value="payouts">
          <Card>
            <CardHeader>
              <CardTitle>Payout History ({vendorPayouts.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {isPayoutsLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Loading payouts...</span>
                </div>
              ) : vendorPayouts.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No payout records found</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction / Payout ID</TableHead>
                      <TableHead>Bank Account</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendorPayouts.map((payout: any) => (
                      <TableRow key={payout.id}>
                        <TableCell className="font-mono text-sm">{payout.reference || payout.id}</TableCell>
                        <TableCell>{payout.bankAccount?.bankName || "N/A"}</TableCell>
                        <TableCell className="font-medium text-success">
                          ₹{parseToDecimal(payout.amount).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={payout.status === "SUCCESS" ? "default" : "secondary"}>
                            {payout.status || "PENDING"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {payout.createdAt ? new Date(payout.createdAt).toLocaleDateString() : "N/A"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
