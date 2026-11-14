import {
  useAdminReplyToSupportSession,
  useConnectAdminToSupportSession,
  useGetAdminSupportSessions,
  useUpdateAdminSupportSessionStatus,
  useGetAdminSessionMessagesInfinite,
} from "@/api/hooks/support/support.hooks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import {
  AlertTriangle,
  Bike,
  Calendar,
  CheckCircle2,
  Clock,
  Headphones,
  MessageSquare,
  Package,
  RefreshCw,
  Search,
  Send,
  Store,
  User,
  UserCheck,
  X
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

// Helper functions for date preset calculations
const formatDateToYYYYMMDD = (d: Date) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const getTodayRange = () => {
  const today = formatDateToYYYYMMDD(new Date());
  return { startDate: today, endDate: today };
};

const getThisWeekRange = () => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const distanceToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - distanceToMonday);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    startDate: formatDateToYYYYMMDD(monday),
    endDate: formatDateToYYYYMMDD(sunday),
  };
};

const getThisMonthRange = () => {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return {
    startDate: formatDateToYYYYMMDD(firstDay),
    endDate: formatDateToYYYYMMDD(lastDay),
  };
};

export default function Support() {
  const { admin } = useAuth();
  const navigate = useNavigate();
  const { sessionId: routeSessionId } = useParams<{ sessionId?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize filter state values directly from URL search parameters
  const [selectedStatus, setSelectedStatus] = useState<string>(
    searchParams.get("status") || "ALL"
  );
  const [selectedInitiator, setSelectedInitiator] = useState<string>(
    searchParams.get("actor") || searchParams.get("initiatorType") || "ALL"
  );
  const [searchQuery, setSearchQuery] = useState<string>(
    searchParams.get("search") || ""
  );
  const [startDate, setStartDate] = useState<string>(
    searchParams.get("startDate") || ""
  );
  const [endDate, setEndDate] = useState<string>(
    searchParams.get("endDate") || ""
  );

  const initialPreset =
    searchParams.get("datePreset") ||
    (searchParams.get("startDate") || searchParams.get("endDate")
      ? "CUSTOM"
      : "ALL");
  const [datePreset, setDatePreset] = useState<string>(initialPreset);

  // Custom Date Range Modal State
  const [isCustomDateOpen, setIsCustomDateOpen] = useState<boolean>(false);
  const [tempCustomStart, setTempCustomStart] = useState<string>(
    searchParams.get("startDate") || ""
  );
  const [tempCustomEnd, setTempCustomEnd] = useState<string>(
    searchParams.get("endDate") || ""
  );

  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    routeSessionId || null
  );
  const [replyText, setReplyText] = useState<string>("");
  const [lastRefetchedAt, setLastRefetchedAt] = useState<string>(
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  );

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Helper to sync filter state modifications to URL search parameters
  const updateFilterParams = (updates: {
    status?: string;
    actor?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    datePreset?: string;
  }) => {
    const params = new URLSearchParams(searchParams);
    if (updates.status !== undefined) {
      if (updates.status && updates.status !== "ALL") params.set("status", updates.status);
      else params.delete("status");
    }
    if (updates.actor !== undefined) {
      if (updates.actor && updates.actor !== "ALL") params.set("actor", updates.actor);
      else params.delete("actor");
    }
    if (updates.search !== undefined) {
      if (updates.search && updates.search.trim() !== "") params.set("search", updates.search.trim());
      else params.delete("search");
    }
    if (updates.startDate !== undefined) {
      if (updates.startDate) params.set("startDate", updates.startDate);
      else params.delete("startDate");
    }
    if (updates.endDate !== undefined) {
      if (updates.endDate) params.set("endDate", updates.endDate);
      else params.delete("endDate");
    }
    if (updates.datePreset !== undefined) {
      if (updates.datePreset && updates.datePreset !== "ALL") params.set("datePreset", updates.datePreset);
      else params.delete("datePreset");
    }
    setSearchParams(params, { replace: true });
  };

  const handleDatePresetChange = (preset: string) => {
    if (preset === "CUSTOM") {
      setTempCustomStart(startDate);
      setTempCustomEnd(endDate);
      setIsCustomDateOpen(true);
      return;
    }

    setDatePreset(preset);
    let newStart = "";
    let newEnd = "";

    if (preset === "TODAY") {
      const range = getTodayRange();
      newStart = range.startDate;
      newEnd = range.endDate;
    } else if (preset === "THIS_WEEK") {
      const range = getThisWeekRange();
      newStart = range.startDate;
      newEnd = range.endDate;
    } else if (preset === "THIS_MONTH") {
      const range = getThisMonthRange();
      newStart = range.startDate;
      newEnd = range.endDate;
    }

    setStartDate(newStart);
    setEndDate(newEnd);
    updateFilterParams({
      startDate: newStart,
      endDate: newEnd,
      datePreset: preset,
    });
  };

  const handleApplyCustomDates = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setStartDate(tempCustomStart);
    setEndDate(tempCustomEnd);
    setDatePreset("CUSTOM");
    updateFilterParams({
      startDate: tempCustomStart,
      endDate: tempCustomEnd,
      datePreset: "CUSTOM",
    });
    setIsCustomDateOpen(false);
  };

  const handleSelectSession = (sessionIdToSelect: string) => {
    setSelectedSessionId(sessionIdToSelect);
    const queryString = searchParams.toString();
    navigate({
      pathname: `/support/${sessionIdToSelect}`,
      search: queryString ? `?${queryString}` : "",
    });
  };

  // Fetch support sessions without polling (manual refresh only)
  const { data: sessionData, isLoading, refetch, isRefetching } = useGetAdminSupportSessions({
    status: selectedStatus,
    initiatorType: selectedInitiator,
    search: searchQuery,
    startDate,
    endDate,
    refetchInterval: false,
  });

  useEffect(() => {
    if (sessionData) {
      setLastRefetchedAt(
        new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
    }
  }, [sessionData]);

  const sessions = sessionData?.sessions || [];
  const total = sessionData?.total || 0;

  // Selected Session Object
  const selectedSession =
    sessions.find((s: any) => s.sessionId === selectedSessionId) ||
    (routeSessionId
      ? sessions.find((s: any) => s.sessionId === routeSessionId)
      : null) ||
    sessions[0] ||
    null;

  // Sync routeSessionId or select 1st session if on /support route
  useEffect(() => {
    if (routeSessionId) {
      setSelectedSessionId(routeSessionId);
    } else if (sessions.length > 0 && !selectedSessionId) {
      const firstId = sessions[0].sessionId;
      setSelectedSessionId(firstId);
      const queryString = searchParams.toString();
      navigate(
        {
          pathname: `/support/${firstId}`,
          search: queryString ? `?${queryString}` : "",
        },
        { replace: true }
      );
    }
  }, [routeSessionId, sessions]);

  // Fetch paginated messages for active session
  const {
    data: messagesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isMessagesLoading,
  } = useGetAdminSessionMessagesInfinite(selectedSessionId || "", 20);

  // Flatten and reverse paginated pages of messages so oldest message is first
  const allMessages = messagesData
    ? messagesData.pages.flatMap((page) => page.messages).reverse()
    : [];

  // Mutations
  const connectMutation = useConnectAdminToSupportSession();
  const replyMutation = useAdminReplyToSupportSession();
  const updateStatusMutation = useUpdateAdminSupportSessionStatus();

  const lastMessageId = messagesData?.pages[0]?.messages[0]?.id;

  // Auto-scroll to bottom of chat when active session changes
  useEffect(() => {
    if (selectedSessionId) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedSessionId]);

  // Auto-scroll to bottom when new messages arrive (sent/received)
  useEffect(() => {
    if (lastMessageId) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [lastMessageId]);

  // Handle scroll-up to load older messages (WhatsApp/Instagram style)
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    if (container.scrollTop < 10 && hasNextPage && !isFetchingNextPage) {
      const prevScrollHeight = container.scrollHeight;
      fetchNextPage().then(() => {
        // Restore scroll position
        setTimeout(() => {
          const newScrollHeight = container.scrollHeight;
          container.scrollTop = newScrollHeight - prevScrollHeight;
        }, 50);
      });
    }
  };

  // Handle Connect
  const handleConnect = () => {
    if (!selectedSession) return;
    connectMutation.mutate({ sessionId: selectedSession.sessionId });
  };

  // Handle Send Reply
  const handleSendReply = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedSession || !replyText.trim()) return;

    replyMutation.mutate(
      {
        sessionId: selectedSession.sessionId,
        messageText: replyText.trim(),
      },
      {
        onSuccess: () => {
          setReplyText("");
        },
      }
    );
  };

  // Handle Status Change
  const handleStatusChange = (newStatus: string) => {
    if (!selectedSession) return;
    updateStatusMutation.mutate({
      sessionId: selectedSession.sessionId,
      status: newStatus,
    });
  };

  // Handle Priority Change
  const handlePriorityChange = (newPriority: string) => {
    if (!selectedSession) return;
    updateStatusMutation.mutate({
      sessionId: selectedSession.sessionId,
      priority: newPriority,
    });
  };

  // Stats Counters
  const waitingCount = sessions.filter((s: any) => s.status === "WAITING_AGENT").length;
  const connectedCount = sessions.filter((s: any) => s.status === "AGENT_CONNECTED").length;
  const resolvedCount = sessions.filter((s: any) => s.status === "RESOLVED").length;

  const getInitiatorBadge = (type: string) => {
    switch (type) {
      case "VENDOR":
        return (
          <Badge variant="outline" className="text-[9px] px-1.5 py-0.5 font-medium bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100/50 flex items-center">
            <Store className="w-2.5 h-2.5 mr-1" /> Vendor
          </Badge>
        );
      case "DELIVERY_PARTNER":
        return (
          <Badge variant="outline" className="text-[9px] px-1.5 py-0.5 font-medium bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100/50 flex items-center">
            <Bike className="w-2.5 h-2.5 mr-1" /> Rider
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[9px] px-1.5 py-0.5 font-medium bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100/50 flex items-center">
            <User className="w-2.5 h-2.5 mr-1" /> User
          </Badge>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "WAITING_AGENT":
        return (
          <Badge variant="destructive" className="animate-pulse flex items-center text-[9px] px-1.5 py-0.5 font-medium">
            <AlertTriangle className="w-2.5 h-2.5 mr-1" /> Waiting Agent
          </Badge>
        );
      case "AGENT_CONNECTED":
        return (
          <Badge className="bg-emerald-600 hover:bg-emerald-700 border-transparent text-white flex items-center text-[9px] px-1.5 py-0.5 font-medium">
            <UserCheck className="w-2.5 h-2.5 mr-1" /> Connected
          </Badge>
        );
      case "RESOLVED":
        return (
          <Badge className="bg-blue-600 hover:bg-blue-700 border-transparent text-white flex items-center text-[9px] px-1.5 py-0.5 font-medium">
            <CheckCircle2 className="w-2.5 h-2.5 mr-1" /> Resolved
          </Badge>
        );
      case "CLOSED":
        return (
          <Badge variant="secondary" className="flex items-center text-[9px] px-1.5 py-0.5 font-medium">
            <Clock className="w-2.5 h-2.5 mr-1" /> Closed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="flex items-center text-[9px] px-1.5 py-0.5 font-medium">
            <MessageSquare className="w-2.5 h-2.5 mr-1" /> Bot Active
          </Badge>
        );
    }
  };

  const getInitiatorName = (session: any) => {
    if (session.initiatorType === "VENDOR" && session.vendor) {
      return session.vendor.shopName || session.vendor.ownerName || "Vendor";
    }
    if (session.initiatorType === "DELIVERY_PARTNER" && session.deliveryPartner) {
      return session.deliveryPartner.name || "Delivery Rider";
    }
    return session.user?.name || "Customer";
  };

  const getInitiatorContact = (session: any) => {
    if (session.initiatorType === "VENDOR" && session.vendor) {
      return session.vendor.email || session.vendor.mobile || "";
    }
    if (session.initiatorType === "DELIVERY_PARTNER" && session.deliveryPartner) {
      return session.deliveryPartner.mobile || session.deliveryPartner.email || "";
    }
    return session.user?.email || session.user?.mobile || "";
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-1.5 tracking-tight">
            <Headphones className="w-6 h-6 text-primary" /> Support & Live Chat Center
          </h1>
          <p className="text-muted-foreground text-xs">
            Manage live chat support sessions, connect with users/vendors, and resolve issues.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="bg-primary hover:bg-primary/95 text-primary-foreground font-medium shadow-xs transition-smooth flex items-center h-8 px-3 text-xs shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefetching ? "animate-spin" : ""}`} />
            Refresh Chat Sessions
          </Button>
          <span className="text-[9px] text-muted-foreground font-medium">
            Last synced: <span className="font-semibold">{lastRefetchedAt}</span>
          </span>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative overflow-hidden rounded-xl border border-border bg-card/50 p-3.5 shadow-xs transition-smooth hover:shadow-md hover:bg-card">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">Total Sessions</p>
              <h3 className="text-xl font-bold mt-1 tracking-tight">{total}</h3>
            </div>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary/30" />
        </div>
        <div className="relative overflow-hidden rounded-xl border border-border bg-card/50 p-3.5 shadow-xs transition-smooth hover:shadow-md hover:bg-card">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">Waiting Executive</p>
              <h3 className="text-xl font-bold mt-1 tracking-tight text-destructive">{waitingCount}</h3>
            </div>
            <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
              <AlertTriangle className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-destructive/30" />
        </div>
        <div className="relative overflow-hidden rounded-xl border border-border bg-card/50 p-3.5 shadow-xs transition-smooth hover:shadow-md hover:bg-card">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">Agent Connected</p>
              <h3 className="text-xl font-bold mt-1 tracking-tight text-emerald-600">{connectedCount}</h3>
            </div>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500/30" />
        </div>
        <div className="relative overflow-hidden rounded-xl border border-border bg-card/50 p-3.5 shadow-xs transition-smooth hover:shadow-md hover:bg-card">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">Resolved Sessions</p>
              <h3 className="text-xl font-bold mt-1 tracking-tight text-blue-600">{resolvedCount}</h3>
            </div>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500/30" />
        </div>
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[760px] max-h-[80vh]">
        {/* Left Panel: Sessions List & Filters */}
        <Card className="lg:col-span-5 flex flex-col h-full overflow-hidden border shadow-xs bg-card">
          <CardHeader className="p-3 pb-2 border-b space-y-2.5 bg-muted/5 shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
              <Input
                placeholder="Search session ID, name, email..."
                value={searchQuery}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchQuery(val);
                  updateFilterParams({ search: val });
                }}
                className="pl-8 h-8 text-xs bg-background border-border transition-smooth focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
              />
            </div>

            {/* Filter controls */}
            <div className="flex gap-2">
              <Select
                value={selectedStatus}
                onValueChange={(val) => {
                  setSelectedStatus(val);
                  updateFilterParams({ status: val });
                }}
              >
                <SelectTrigger className="w-1/2 h-8 text-xs border-border bg-background font-normal">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="WAITING_AGENT">Waiting Agent</SelectItem>
                  <SelectItem value="AGENT_CONNECTED">Agent Connected</SelectItem>
                  <SelectItem value="BOT_ACTIVE">Bot Active</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={selectedInitiator}
                onValueChange={(val) => {
                  setSelectedInitiator(val);
                  updateFilterParams({ actor: val });
                }}
              >
                <SelectTrigger className="w-1/2 h-8 text-xs border-border bg-background font-normal">
                  <SelectValue placeholder="Filter Actor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Actors</SelectItem>
                  <SelectItem value="USER">User / Customer</SelectItem>
                  <SelectItem value="VENDOR">Vendor</SelectItem>
                  <SelectItem value="DELIVERY_PARTNER">Delivery Rider</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date range filter preset dropdown & active range preview */}
            <div className="flex flex-col gap-1.5">
              <Select value={datePreset} onValueChange={handleDatePresetChange}>
                <SelectTrigger className="w-full h-8 text-xs border-border bg-background font-normal">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Time</SelectItem>
                  <SelectItem value="TODAY">Today</SelectItem>
                  <SelectItem value="THIS_WEEK">This Week</SelectItem>
                  <SelectItem value="THIS_MONTH">This Month</SelectItem>
                  <SelectItem value="CUSTOM">Custom Range...</SelectItem>
                </SelectContent>
              </Select>

              {(startDate || endDate) && (
                <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded px-2 py-1 text-[10px] text-primary">
                  <span className="flex items-center gap-1 font-medium truncate">
                    <Calendar className="w-3 h-3 text-primary shrink-0" />
                    {startDate === endDate && startDate ? startDate : `${startDate || "Start"} to ${endDate || "End"}`}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDatePreset("ALL");
                      setStartDate("");
                      setEndDate("");
                      updateFilterParams({ startDate: "", endDate: "", datePreset: "ALL" });
                    }}
                    className="h-4 w-4 p-0 hover:bg-primary/20 text-primary flex items-center justify-center shrink-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>

          {/* Session List Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-border/40">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground">
                <RefreshCw className="w-6 h-6 animate-spin mb-3 text-primary" />
                <p className="text-xs font-semibold">Loading support sessions...</p>
              </div>
            ) : sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground">
                <MessageSquare className="w-10 h-10 mb-3 opacity-30 text-muted-foreground" />
                <p className="text-xs font-semibold">No support chat sessions found.</p>
              </div>
            ) : (
              sessions.map((session: any) => {
                const isSelected = selectedSession?.sessionId === session.sessionId;
                const lastMsg = session.messages?.[0];
                const initiatorName = getInitiatorName(session);
                const initiatorInitials = initiatorName
                  ? initiatorName.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()
                  : "U";

                // Background colors for avatars depending on type
                let avatarBg = "bg-blue-50 text-blue-700 border-blue-200";
                let avatarIcon = <User className="w-2.5 h-2.5 text-blue-600" />;
                if (session.initiatorType === "VENDOR") {
                  avatarBg = "bg-purple-50 text-purple-700 border-purple-200";
                  avatarIcon = <Store className="w-2.5 h-2.5 text-purple-600" />;
                } else if (session.initiatorType === "DELIVERY_PARTNER") {
                  avatarBg = "bg-amber-50 text-amber-700 border-amber-200";
                  avatarIcon = <Bike className="w-2.5 h-2.5 text-amber-600" />;
                }

                return (
                  <div
                    key={session.sessionId}
                    onClick={() => handleSelectSession(session.sessionId)}
                    className={`p-2.5 cursor-pointer transition-all duration-200 flex items-start gap-2.5 border-l-2 ${
                      isSelected
                        ? "bg-primary/5 border-l-primary shadow-xs"
                        : "border-l-transparent hover:bg-muted/40 hover:border-l-muted-foreground/20"
                    }`}
                  >
                    {/* Initiator Avatar with overlaid small role badge */}
                    <div className={`relative flex items-center justify-center w-8 h-8 rounded-full border shrink-0 ${avatarBg} font-bold text-xs`}>
                      {initiatorInitials}
                      <span className="absolute -bottom-0.5 -right-0.5 p-0.5 rounded-full bg-background border border-border/80 shadow-2xs">
                        {avatarIcon}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-mono text-[9px] font-semibold text-muted-foreground truncate max-w-[120px]">
                          {session.sessionId}
                        </span>
                        <span className="shrink-0">{getStatusBadge(session.status)}</span>
                      </div>

                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <p className="font-semibold text-xs text-foreground truncate">
                          {initiatorName}
                        </p>
                      </div>

                      <p className="text-[11px] text-muted-foreground truncate mb-0.5">
                        {lastMsg ? lastMsg.messageText : session.subject || "Support Inquiry"}
                      </p>

                      <div className="flex items-center justify-between text-[9px] text-muted-foreground mt-1.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(session.updatedAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {session.escalationCount > 0 && (
                          <span className="text-destructive font-bold flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-destructive/10 animate-pulse border border-destructive/20 text-[9px]">
                            <AlertTriangle className="w-2 h-2" /> Escalated
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Right Panel: Chat Room & Session Detail */}
        <Card className="lg:col-span-7 flex flex-col h-full overflow-hidden border shadow-xs bg-card">
          {selectedSession ? (
            <>
              {/* Active Session Header */}
              <div className="p-3 border-b bg-muted/5 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                    <span className="font-mono font-bold text-[10px] bg-muted px-1.5 py-0.5 rounded border">
                      {selectedSession.sessionId}
                    </span>
                    {getStatusBadge(selectedSession.status)}
                    {selectedSession.order && (
                      <Badge variant="outline" className="text-[10px] border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 px-1.5 py-0.5 flex items-center">
                        <Package className="w-3 h-3 mr-1" /> Order #{selectedSession.order.orderNumber || selectedSession.order.id}
                      </Badge>
                    )}
                  </div>
                  <h2 className="text-sm font-bold text-foreground truncate">
                    {getInitiatorName(selectedSession)}
                  </h2>
                  <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1.5 truncate">
                    <span className="inline-block w-1 h-1 rounded-full bg-emerald-500" />
                    {getInitiatorContact(selectedSession)}
                    <span className="inline-block w-1 h-1 rounded-full bg-muted-foreground/30" />
                    Role: <span className="font-medium text-foreground/80">{selectedSession.initiatorType}</span>
                  </p>
                </div>

                {/* Session Quick Actions */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {/* Connect Button */}
                  {selectedSession.status === "WAITING_AGENT" ||
                  selectedSession.status === "BOT_ACTIVE" ||
                  selectedSession.assignedAdminId !== (admin?.id ? String(admin.id) : "") ? (
                    <Button
                      size="sm"
                      onClick={handleConnect}
                      disabled={connectMutation.isPending}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs hover:shadow-md transition-smooth h-8 px-3 text-xs"
                    >
                      <UserCheck className="w-3.5 h-3.5 mr-1" /> Connect
                    </Button>
                  ) : null}

                  {/* Status Dropdown */}
                  <Select
                    value={selectedSession.status}
                    onValueChange={handleStatusChange}
                    disabled={updateStatusMutation.isPending}
                  >
                    <SelectTrigger className="w-[110px] h-8 text-xs border-border bg-background font-normal">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WAITING_AGENT">Waiting Agent</SelectItem>
                      <SelectItem value="AGENT_CONNECTED">Agent Connected</SelectItem>
                      <SelectItem value="RESOLVED">Resolved</SelectItem>
                      <SelectItem value="CLOSED">Closed</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Priority Dropdown */}
                  <Select
                    value={selectedSession.priority || "MEDIUM"}
                    onValueChange={handlePriorityChange}
                    disabled={updateStatusMutation.isPending}
                  >
                    <SelectTrigger className="w-[85px] h-8 text-xs border-border bg-background font-normal">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Chat Thread Messages Area */}
              <div
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-muted/5"
              >
                {isFetchingNextPage && (
                  <div className="flex justify-center py-1.5 shrink-0">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary" />
                  </div>
                )}

                {isMessagesLoading ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <RefreshCw className="w-5 h-5 animate-spin mb-2 text-primary" />
                    <p className="text-xs">Loading messages...</p>
                  </div>
                ) : allMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <MessageSquare className="w-6 h-6 mb-2 opacity-35" />
                    <p className="text-[11px]">No messages in this chat session.</p>
                  </div>
                ) : (
                  allMessages.map((msg: any, idx: number) => {
                    const isAdmin = msg.senderType === "ADMIN";
                    const isBot = msg.senderType === "SYSTEM_BOT";

                    if (isBot) {
                      return (
                        <div key={msg.id || idx} className="flex justify-center my-2">
                          <div className="bg-background text-muted-foreground text-[11px] px-3.5 py-1.5 rounded-xl border border-border/80 max-w-[80%] text-center shadow-xs font-medium">
                            🤖 {msg.messageText}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={msg.id || idx}
                        className={`flex flex-col ${isAdmin ? "items-end" : "items-start"}`}
                      >
                        <span className="text-[9px] text-muted-foreground/75 mb-0.5 px-1 font-semibold tracking-wide">
                          {isAdmin
                            ? `You (${selectedSession.admin?.name || "Support Admin"})`
                            : getInitiatorName(selectedSession)}
                        </span>
                        <div
                          className={`max-w-[80%] rounded-xl px-3 py-1.5 text-xs shadow-xs transition-smooth hover:shadow-md ${
                            isAdmin
                              ? "bg-primary text-primary-foreground rounded-tr-none bg-gradient-to-r from-primary to-primary/95"
                              : "bg-card border border-border/75 text-foreground rounded-tl-none"
                          }`}
                        >
                          <p className="whitespace-pre-wrap leading-relaxed">{msg.messageText}</p>
                        </div>
                        <span className="text-[9px] text-muted-foreground/50 mt-0.5 px-1 font-medium">
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Message Input Form */}
              <div className="p-2.5 border-t bg-card shrink-0">
                {selectedSession.status === "RESOLVED" || selectedSession.status === "CLOSED" ? (
                  <div className="p-2 text-[11px] font-semibold text-amber-800 bg-amber-50/50 rounded-md border border-amber-200 flex items-center justify-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>This support session is marked as {selectedSession.status}. Reopen session status above to send further replies.</span>
                  </div>
                ) : (
                  <form onSubmit={handleSendReply} className="flex items-center gap-2">
                    <Input
                      placeholder="Type your response to the user..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      disabled={replyMutation.isPending}
                      className="flex-1 h-8 text-xs border-border bg-background transition-smooth focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
                    />
                    <Button
                      type="submit"
                      disabled={replyMutation.isPending || !replyText.trim()}
                      className="h-8 px-3 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs hover:shadow-md transition-smooth"
                    >
                      <Send className="w-3.5 h-3.5 mr-1" /> Reply
                    </Button>
                  </form>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-muted-foreground bg-muted/5">
              <div className="max-w-sm p-6 rounded-2xl border border-dashed border-border bg-card shadow-xs">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Headphones className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-1">Support Workspace</h3>
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                  Select a live support chat session from the list on the left to view conversation details, check order history, and send customer replies.
                </p>
                <div className="flex flex-col gap-1.5 text-[11px] text-left border-t border-border/80 pt-3 mt-1.5">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
                    <span>Red badges indicate customers waiting for a support executive.</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Green badges indicate that you are connected to the conversation.</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span>Blue badges indicate resolved issues.</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Custom Date Range Popup Modal */}
      <Dialog open={isCustomDateOpen} onOpenChange={setIsCustomDateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" /> Select Custom Date Range
            </DialogTitle>
            <DialogDescription className="text-xs">
              Choose a custom start date and end date to filter support sessions.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleApplyCustomDates} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground uppercase">Start Date</label>
                <Input
                  type="date"
                  value={tempCustomStart}
                  onChange={(e) => setTempCustomStart(e.target.value)}
                  className="h-9 text-xs border-border bg-background"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground uppercase">End Date</label>
                <Input
                  type="date"
                  value={tempCustomEnd}
                  onChange={(e) => setTempCustomEnd(e.target.value)}
                  className="h-9 text-xs border-border bg-background"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCustomDateOpen(false)}
                className="h-8 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                Apply Date Range
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}