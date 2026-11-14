import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  User,
  MapPin,
  Store,
  Bike,
  Package,
  CreditCard,
  RefreshCw,
  Clock,
  Navigation,
  Radio,
  Truck,
  Bell,
  MessageSquare,
  Star,
  Loader2,
} from "lucide-react";
import {
  useGetOrderDetailsAdmin,
  useGetVendorBroadcastsAdmin,
  useGetDeliveryBroadcastsAdmin,
} from "@/api/hooks/order/order.hook";
import { parseToDecimal } from "@/utils/util";

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  // Primary API Call for Order Details (executed on initial page load)
  const { data: order, isLoading, isError } = useGetOrderDetailsAdmin(id, { enabled: !!id });

  // Separate Paginated API Calls for Broadcasts (executed ONLY when their tab is active)
  const { data: vendorBroadcastsData, isLoading: isVendorBroadcastsLoading } = useGetVendorBroadcastsAdmin(id, {
    enabled: activeTab === "vendor-broadcasts",
  });
  const { data: deliveryBroadcastsData, isLoading: isDeliveryBroadcastsLoading } = useGetDeliveryBroadcastsAdmin(id, {
    enabled: activeTab === "delivery-broadcasts",
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary mr-2" />
        <span className="text-muted-foreground">Loading order details...</span>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Order Not Found</h2>
          <p className="text-muted-foreground">
            The order you're looking for doesn't exist or an error occurred.
          </p>
          <Button onClick={() => navigate("/orders")}>Back to Orders</Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "bg-success text-success-foreground";
      case "PLACED":
      case "PREPARING":
        return "bg-warning text-warning-foreground";
      case "CANCELLED":
        return "bg-destructive text-destructive-foreground";
      case "REFUNDED":
        return "bg-muted text-muted-foreground";
      case "PAID":
        return "bg-success text-success-foreground";
      case "PENDING":
        return "bg-warning text-warning-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const InfoRow = ({ label, value }: { label: string; value: any }) => (
    <div className="flex justify-between py-2 border-b border-border last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value ?? "N/A"}</span>
    </div>
  );

  // Data helpers from relations
  const user = order.user || {};
  const address = order.address || {};
  const vendorAssignment = order.orderVendorAssignments?.[0] || order.orderVendorAssignments || {};
  const vendor = vendorAssignment.vendor || {};
  const deliveryAssignment = order.orderDeliveryAssignment || {};
  const deliveryPartner = deliveryAssignment.deliveryPartner || {};
  const items = order.items || [];
  const payment = Array.isArray(order.payments) ? order.payments[0] : (order.payments || {});
  const refund = order.refunds || null;
  const timestamps = order.timestamps || {};
  const trackingEvents = order.tracking || [];
  const notifications = order.notifications || [];
  const disputeDetails = order.disputeDetails || null;
  const review = order.review || null;

  const vendorBroadcasts = vendorBroadcastsData?.broadcasts || (Array.isArray(vendorBroadcastsData) ? vendorBroadcastsData : []);
  const deliveryBroadcasts = deliveryBroadcastsData?.broadcasts || (Array.isArray(deliveryBroadcastsData) ? deliveryBroadcastsData : []);

  const totalAmountNum = parseToDecimal(order.subtotal);
  const paidAmountNum = parseToDecimal(order.paidAmount);
  const discountAmountNum = parseToDecimal(order.discountAmount);
  const deliveryFeeNum = parseToDecimal(order.deliveryFee);
  const platformFeeNum = parseToDecimal(order.platformFee);
  const packingFeeNum = parseToDecimal(order.packingFee);
  const itemTotalNum = parseToDecimal(order.itemTotal);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/orders")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{order.orderNumber || `#${order.id}`}</h1>
            <p className="text-muted-foreground mt-1">
              Order placed on {order.createdAt ? new Date(order.createdAt).toLocaleString() : "N/A"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge className={getStatusColor(order.status)}>{order.status || "PLACED"}</Badge>
          <Badge className={getStatusColor(order.paymentStatus)}>
            {order.paymentStatus || "PENDING"}
          </Badge>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">Total Amount</div>
            <div className="text-2xl font-bold text-success">
              ₹{totalAmountNum.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">
              Payment Method
            </div>
            <div className="text-2xl font-bold">{order.paymentMethod || "COD"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">Items</div>
            <div className="text-2xl font-bold">{items.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">Source</div>
            <div className="text-2xl font-bold">{order.source || "APP"}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val)} className="w-full">
        <TabsList className="w-full flex flex-wrap h-auto justify-start gap-1 bg-muted p-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="user">User</TabsTrigger>
          <TabsTrigger value="vendor">Vendor</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="refund">Refund</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="tracking">Tracking</TabsTrigger>
          <TabsTrigger value="vendor-broadcasts">Vendor Broadcasts</TabsTrigger>
          <TabsTrigger value="delivery-broadcasts">Delivery Broadcasts</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="dispute">Dispute & Review</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Order Information</h3>
                  <InfoRow label="Order Number" value={order.orderNumber} />
                  <InfoRow label="Order Date" value={order.createdAt ? new Date(order.createdAt).toLocaleString() : "N/A"} />
                  <InfoRow label="Source" value={order.source} />
                  <InfoRow label="Order Status" value={order.status} />
                  <InfoRow label="Payment Status" value={order.paymentStatus} />
                  <InfoRow label="Delivery Status" value={order.deliveryStatus} />
                  <InfoRow label="Currency" value={order.currency || "INR"} />
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Financial Details</h3>
                  <InfoRow label="Item Total" value={`₹${itemTotalNum.toFixed(2)}`} />
                  <InfoRow label="Delivery Fee" value={`₹${deliveryFeeNum.toFixed(2)}`} />
                  <InfoRow label="Platform Fee" value={`₹${platformFeeNum.toFixed(2)}`} />
                  <InfoRow label="Packing Fee" value={`₹${packingFeeNum.toFixed(2)}`} />
                  <InfoRow label="Discount" value={`-₹${discountAmountNum.toFixed(2)}`} />
                  <InfoRow label="Paid Amount" value={`₹${paidAmountNum.toFixed(2)}`} />
                  <InfoRow label="Total Amount" value={`₹${totalAmountNum.toFixed(2)}`} />
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold mb-3">Additional Details</h3>
                <InfoRow label="Notes" value={order.notes || "None"} />
                <InfoRow label="Cancel Reason" value={order.cancelReason || "N/A"} />
                <InfoRow label="Refund Reference" value={order.refundReference || "N/A"} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User & Address Tab */}
        <TabsContent value="user">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                User & Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  User Details
                </h3>
                <InfoRow label="User Name" value={user.name || "N/A"} />
                <InfoRow label="Mobile" value={user.mobile || "N/A"} />
                <InfoRow label="Email" value={user.email || "N/A"} />
                <InfoRow label="User ID" value={order.userId?.toString()} />
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Delivery Address
                </h3>
                <InfoRow label="Address Type" value={address.addressType || address.type || "N/A"} />
                <InfoRow label="Main Address" value={address.mainAddress || address.addressLine1 || "N/A"} />
                <InfoRow label="Complete Address" value={address.completeAddress || address.addressLine2 || "N/A"} />
                <InfoRow label="Receiver Name" value={address.receiverName || address.name || user.name || "N/A"} />
                <InfoRow label="Contact" value={address.contactNumber || address.mobile || user.mobile || "N/A"} />
                <InfoRow label="City" value={address.city || "Ranchi"} />
                <InfoRow label="Landmark" value={address.landmark || "N/A"} />
                <InfoRow label="Floor" value={address.floor || "N/A"} />
                <InfoRow
                  label="Coordinates"
                  value={address.latitude ? `${address.latitude}, ${address.longitude}` : "N/A"}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vendor Tab */}
        <TabsContent value="vendor">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="w-5 h-5" />
                Vendor Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {vendor.id ? (
                <div>
                  <InfoRow label="Shop Name" value={vendor.shopName} />
                  <InfoRow label="Owner Name" value={vendor.ownerName} />
                  <InfoRow label="Vendor ID" value={vendor.id.toString()} />
                  <InfoRow label="Mobile" value={vendor.mobile} />
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Awaiting vendor assignment (VENDOR_PENDING)
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Delivery Partner Tab */}
        <TabsContent value="delivery">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bike className="w-5 h-5" />
                Delivery Partner Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {deliveryPartner.id ? (
                <div>
                  <InfoRow label="Partner Name" value={deliveryPartner.name} />
                  <InfoRow label="Partner ID" value={deliveryPartner.id.toString()} />
                  <InfoRow label="Mobile" value={deliveryPartner.mobile} />
                  <InfoRow label="Vehicle Type" value={deliveryPartner.vehicleType || "BIKE"} />
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Awaiting delivery partner assignment (DELIVERY_PENDING)
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Items Tab */}
        <TabsContent value="items">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Ordered Items ({items.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Product Name</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Total Price</TableHead>
                      <TableHead>Category</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                          No item records found
                        </TableCell>
                      </TableRow>
                    ) : (
                      items.map((item: any) => {
                        const unitPrice = parseToDecimal(item.unitPrice || item.product?.price || 0);
                        const itemQty = Number(item.quantity || 1);
                        const totalPrice = parseToDecimal(item.totalPrice || item.subtotal || unitPrice * itemQty);
                        return (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">
                              {item.product?.name || item.productName || "Product"}
                            </TableCell>
                            <TableCell>{itemQty}</TableCell>
                            <TableCell>₹{unitPrice.toFixed(2)}</TableCell>
                            <TableCell className="font-medium">₹{totalPrice.toFixed(2)}</TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {item.product?.category?.name || "N/A"}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
              <Separator className="my-4" />
              <div className="space-y-2 max-w-sm ml-auto text-sm">
                <div className="flex justify-between">
                  <span>Item Subtotal:</span>
                  <span>₹{itemTotalNum.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-success">
                  <span>Discount:</span>
                  <span>-₹{discountAmountNum.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee:</span>
                  <span>₹{deliveryFeeNum.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Fee:</span>
                  <span>₹{platformFeeNum.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-base font-bold">
                  <span>Grand Total:</span>
                  <span className="text-success">₹{totalAmountNum.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Tab */}
        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <InfoRow label="Payment Method" value={order.paymentMethod} />
              <InfoRow label="Payment Status" value={order.paymentStatus} />
              <InfoRow label="Payment Reference" value={order.paymentReference || payment?.referenceId || "N/A"} />
              <InfoRow label="Amount" value={`₹${totalAmountNum.toFixed(2)}`} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Refund Tab */}
        <TabsContent value="refund">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Refund Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {refund ? (
                <div>
                  <InfoRow label="Refund ID" value={refund.id?.toString()} />
                  <InfoRow label="Amount" value={`₹${parseToDecimal(refund.amount).toFixed(2)}`} />
                  <InfoRow label="Reason" value={refund.reason || order.cancelReason || "N/A"} />
                  <InfoRow label="Status" value={refund.status || "PROCESSED"} />
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No refunds associated with this order.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Order Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timestamps && Object.keys(timestamps).length > 0 ? (
                  Object.entries(timestamps).map(([key, value]) => {
                    if (!value) return null;
                    return (
                      <div key={key} className="flex items-start gap-4">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                        <div className="flex-1">
                          <div className="font-medium capitalize">
                            {key.replace(/([A-Z])/g, " $1").trim()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(value as string).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    Order created at {new Date(order.createdAt).toLocaleString()}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tracking Tab */}
        <TabsContent value="tracking">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="w-5 h-5" />
                Tracking Events ({trackingEvents.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {trackingEvents.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No tracking logs recorded yet.</p>
              ) : (
                <div className="rounded-lg border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Event Type</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trackingEvents.map((event: any) => (
                        <TableRow key={event.id}>
                          <TableCell className="text-sm font-mono">
                            {new Date(event.timestamp || event.createdAt).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{event.eventType}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{event.notes || "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vendor Broadcasts Tab (Lazy Loaded) */}
        <TabsContent value="vendor-broadcasts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Radio className="w-5 h-5" />
                Vendor Broadcasts ({vendorBroadcasts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isVendorBroadcastsLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
                  <span className="text-muted-foreground">Loading vendor broadcasts...</span>
                </div>
              ) : vendorBroadcasts.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No vendor broadcast logs.</p>
              ) : (
                <div className="rounded-lg border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Vendor Shop Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Notified At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vendorBroadcasts.map((b: any) => (
                        <TableRow key={b.id}>
                          <TableCell className="font-medium">{b.vendor?.shopName || "Vendor"}</TableCell>
                          <TableCell>
                            <Badge variant={b.status === "ACCEPTED" ? "default" : "secondary"}>
                              {b.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {b.createdAt ? new Date(b.createdAt).toLocaleString() : "N/A"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Delivery Broadcasts Tab (Lazy Loaded) */}
        <TabsContent value="delivery-broadcasts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Delivery Broadcasts ({deliveryBroadcasts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isDeliveryBroadcastsLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
                  <span className="text-muted-foreground">Loading delivery broadcasts...</span>
                </div>
              ) : deliveryBroadcasts.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No delivery broadcast logs.</p>
              ) : (
                <div className="rounded-lg border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Delivery Partner</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Notified At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deliveryBroadcasts.map((b: any) => (
                        <TableRow key={b.id}>
                          <TableCell className="font-medium">{b.deliveryPartner?.name || "Partner"}</TableCell>
                          <TableCell>
                            <Badge variant={b.status === "ACCEPTED" ? "default" : "secondary"}>
                              {b.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {b.createdAt ? new Date(b.createdAt).toLocaleString() : "N/A"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications ({notifications.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No notifications logged for this order.</p>
              ) : (
                <div className="rounded-lg border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Title</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Sent At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {notifications.map((n: any) => (
                        <TableRow key={n.id}>
                          <TableCell className="font-medium">{n.title || n.message || "Notification"}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{n.type || "INFO"}</Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {n.createdAt ? new Date(n.createdAt).toLocaleString() : "N/A"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dispute & Review Tab */}
        <TabsContent value="dispute">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Dispute Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                {disputeDetails ? (
                  <div className="p-4 border border-destructive rounded-lg bg-destructive/10 space-y-2">
                    <h3 className="font-semibold text-destructive">Active Dispute</h3>
                    <p className="text-sm">{typeof disputeDetails === "string" ? disputeDetails : JSON.stringify(disputeDetails)}</p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No disputes reported for this order.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Order Review
                </CardTitle>
              </CardHeader>
              <CardContent>
                {review ? (
                  <div className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-warning fill-warning" />
                      <span className="font-bold">{parseToDecimal(review.ratingAverage || review.rating || 5).toFixed(1)}</span>
                    </div>
                    <p className="text-sm">{review.reviewText || review.comment || "No text provided"}</p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No review submitted yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrderDetail;
