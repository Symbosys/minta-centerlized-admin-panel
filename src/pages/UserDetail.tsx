import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, ArrowLeft, MapPin } from "lucide-react";
import {
  useGetUserProfile,
  useGetUserOrders,
  useGetUserWalletTransactions,
  useGetUserNotifications,
  useGetUserReviews,
} from "@/api/hooks/user/user.hook";
import { useGetAllAddresses } from "@/api/hooks/user/address.hook";
import { parseToDecimal } from "@/utils/util";

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");

  // Always fetch primary profile info for top header card
  const { data: user, isLoading: isProfileLoading, isError } = useGetUserProfile(id, { enabled: !!id });

  // Lazy-loaded query hooks — enabled only when their specific tab is active
  const { data: addressesData, isLoading: isAddressesLoading } = useGetAllAddresses(id, {
    enabled: activeTab === "addresses",
  });
  const { data: ordersData, isLoading: isOrdersLoading } = useGetUserOrders(id, {
    enabled: activeTab === "orders",
  });
  const { data: walletData, isLoading: isWalletLoading } = useGetUserWalletTransactions(id, {
    enabled: activeTab === "wallet",
  });
  const { data: notificationsData, isLoading: isNotificationsLoading } = useGetUserNotifications(id, {
    enabled: activeTab === "notifications",
  });
  const { data: reviewsData, isLoading: isReviewsLoading } = useGetUserReviews(id, {
    enabled: activeTab === "reviews",
  });

  if (isProfileLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading user details...</span>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="p-6 space-y-4">
        <Button variant="ghost" onClick={() => navigate("/users")} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Users
        </Button>
        <div className="text-muted-foreground">User not found or error loading user data.</div>
      </div>
    );
  }

  const userAddresses = Array.isArray(addressesData) ? addressesData : [];
  const userOrders = ordersData?.orders || (Array.isArray(ordersData) ? ordersData : []);
  const userTransactions = walletData?.transactions || (Array.isArray(walletData) ? walletData : []);
  const userNotifs = notificationsData?.notifications || (Array.isArray(notificationsData) ? notificationsData : []);
  const userReviews = Array.isArray(reviewsData) ? reviewsData : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/users")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{user.name || "N/A"}</h1>
          <p className="text-muted-foreground">User ID: {user.id || id}</p>
        </div>
        <Badge
          variant={user.status === "ACTIVE" || user.status === "active" ? "default" : "secondary"}
          className={user.status === "ACTIVE" || user.status === "active" ? "bg-success text-success-foreground ml-auto" : "ml-auto"}
        >
          {user.status || "ACTIVE"}
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val)} className="w-full">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="addresses">Addresses</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="wallet">Wallet</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        {/* PROFILE TAB */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{user.name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Mobile</p>
                  <p className="font-medium">{user.mobile || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user.email || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Registration Date</p>
                  <p className="font-medium">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge
                    variant={user.status === "ACTIVE" || user.status === "active" ? "default" : "secondary"}
                    className={user.status === "ACTIVE" || user.status === "active" ? "bg-success text-success-foreground" : ""}
                  >
                    {user.status || "ACTIVE"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="font-medium">{user.totalOrders ?? user._count?.Order ?? 0}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Current Location
                  </p>
                  <p className="font-medium">
                    {user.latitude && user.longitude ? `${user.latitude}, ${user.longitude}` : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ADDRESSES TAB */}
        <TabsContent value="addresses">
          <Card>
            <CardHeader>
              <CardTitle>Saved Addresses ({userAddresses.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isAddressesLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    <span className="ml-2 text-muted-foreground">Loading addresses...</span>
                  </div>
                ) : userAddresses.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No addresses found for this user.
                  </div>
                ) : (
                  userAddresses.map((address: any) => (
                    <div key={address.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="outline">{address.type || "HOME"}</Badge>
                        {address.isDefault && <Badge>Default</Badge>}
                      </div>
                      <h4 className="font-semibold mb-1">{address.mainAddress || "Address"}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{address.completeAddress}</p>
                      <div className="grid grid-cols-2 gap-2 text-sm mt-3 border-t pt-3">
                        <div>
                          <span className="text-muted-foreground">Receiver: </span>
                          <span className="font-medium">{address.receiverName || user.name || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Contact: </span>
                          <span className="font-medium">{address.receiverContact || address.mobile || user.mobile || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Landmark: </span>
                          <span>{address.landMark || address.landmark || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Floor: </span>
                          <span>{address.floor || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Latitude: </span>
                          <span className="font-mono text-xs">{address.latitude ? Number(address.latitude).toFixed(6) : "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Longitude: </span>
                          <span className="font-mono text-xs">{address.longitude ? Number(address.longitude).toFixed(6) : "N/A"}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ORDERS TAB */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Order History ({userOrders.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {isOrdersLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Loading orders...</span>
                </div>
              ) : userOrders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No orders found for this user.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order Number</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userOrders.map((order: any) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-sm">{order.orderNumber || order.id}</TableCell>
                        <TableCell className="font-medium text-success">
                          ₹{parseToDecimal(order.totalAmount || order.payableAmount || 0).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{order.paymentMethod || "COD"}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={order.status === "DELIVERED" ? "default" : "secondary"}>
                            {order.status || "PENDING"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
                  <div className="grid grid-cols-3 gap-4 bg-muted/20 p-4 rounded-lg border">
                    <div>
                      <p className="text-sm text-muted-foreground">Current Balance</p>
                      <p className="text-2xl font-bold text-success">
                        ₹{parseToDecimal(walletData?.balance ?? user.walletBalance ?? user.UserWallet?.balance ?? 0).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Currency</p>
                      <p className="font-medium">{walletData?.currency || "INR"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge variant={walletData?.isLocked ? "destructive" : "default"}>
                        {walletData?.isLocked ? "Locked" : "Active"}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-4">Transaction History ({userTransactions.length})</h3>
                    {userTransactions.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground border rounded-lg">
                        No transactions found.
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {userTransactions.map((txn: any) => {
                            const isCredit = txn.type === "CREDIT" || txn.type === "Credit";
                            return (
                              <TableRow key={txn.id}>
                                <TableCell>
                                  {txn.createdAt ? new Date(txn.createdAt).toLocaleDateString() : "N/A"}
                                </TableCell>
                                <TableCell>
                                  <Badge variant={isCredit ? "default" : "secondary"}>
                                    {txn.type}
                                  </Badge>
                                </TableCell>
                                <TableCell>{txn.description || "N/A"}</TableCell>
                                <TableCell>
                                  <Badge variant="outline">{txn.status || "SUCCESS"}</Badge>
                                </TableCell>
                                <TableCell className={`text-right font-medium ${isCredit ? "text-success" : "text-destructive"}`}>
                                  {isCredit ? "+" : "-"}₹{Math.abs(parseToDecimal(txn.amount)).toFixed(2)}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* NOTIFICATIONS TAB */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifications ({userNotifs.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {isNotificationsLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Loading notifications...</span>
                </div>
              ) : userNotifs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No notifications found for this user.
                </div>
              ) : (
                <div className="space-y-3">
                  {userNotifs.map((notif: any) => (
                    <div key={notif.id} className={`border rounded-lg p-4 ${!notif.isRead ? "bg-muted/30" : ""}`}>
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="outline">{notif.type || "SYSTEM"}</Badge>
                        {!notif.isRead && <Badge variant="default">Unread</Badge>}
                      </div>
                      <h4 className="font-semibold mb-1">{notif.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{notif.message || notif.body}</p>
                      <p className="text-xs text-muted-foreground">
                        {notif.createdAt ? new Date(notif.createdAt).toLocaleString() : "N/A"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* REVIEWS TAB */}
        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle>Reviews ({userReviews.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {isReviewsLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Loading reviews...</span>
                </div>
              ) : userReviews.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No reviews submitted by this user.
                </div>
              ) : (
                <div className="space-y-4">
                  {userReviews.map((review: any) => (
                    <div key={review.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">⭐</span>
                          <span className="font-semibold">
                            {Number(review.ratingAverage || review.vendorOverallRating || 5).toFixed(1)}
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
      </Tabs>
    </div>
  );
}
