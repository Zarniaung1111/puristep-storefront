import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { type Order } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Package, Clock, CheckCircle2, XCircle, Eye, ArrowLeft, LayoutDashboard } from "lucide-react";
import { format } from "date-fns";
import { SiNetflix, SiYoutube, SiCanva } from "react-icons/si";

const statusConfig = {
  pending: { label: "Pending", color: "bg-yellow-950/60 text-yellow-300 border-yellow-500/30", icon: <Clock className="w-3 h-3" /> },
  confirmed: { label: "Confirmed", color: "bg-green-950/60 text-green-300 border-green-500/30", icon: <CheckCircle2 className="w-3 h-3" /> },
  cancelled: { label: "Cancelled", color: "bg-red-950/60 text-red-300 border-red-500/30", icon: <XCircle className="w-3 h-3" /> },
};

const serviceIcon = (name: string) => {
  const n = name?.toLowerCase();
  if (n?.includes("netflix")) return <SiNetflix className="w-4 h-4 text-red-500" />;
  if (n?.includes("youtube")) return <SiYoutube className="w-4 h-4 text-rose-500" />;
  if (n?.includes("canva")) return <SiCanva className="w-4 h-4 text-teal-400" />;
  return <Package className="w-4 h-4 text-violet-400" />;
};

export default function Admin() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const { toast } = useToast();

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiRequest("PATCH", `/api/orders/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({ title: "Status updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update status", variant: "destructive" });
    },
  });

  const filtered = orders
    ? filterStatus === "all"
      ? orders
      : orders.filter((o) => o.status === filterStatus)
    : [];

  const counts = {
    all: orders?.length ?? 0,
    pending: orders?.filter((o) => o.status === "pending").length ?? 0,
    confirmed: orders?.filter((o) => o.status === "confirmed").length ?? 0,
    cancelled: orders?.filter((o) => o.status === "cancelled").length ?? 0,
  };

  return (
    <div className="min-h-screen bg-[#080810] text-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#080810]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="text-white/40 hover:text-white/70 transition-colors" data-testid="link-back-home">
              <ArrowLeft className="w-4 h-4" />
            </a>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4 text-violet-400" />
              <span className="font-semibold text-sm">Admin Dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-white/30 text-xs">Live</span>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">Orders</h1>
          <p className="text-white/30 text-sm">Manage all incoming subscription orders</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: "Total", key: "all", color: "text-white" },
            { label: "Pending", key: "pending", color: "text-yellow-400" },
            { label: "Confirmed", key: "confirmed", color: "text-green-400" },
            { label: "Cancelled", key: "cancelled", color: "text-red-400" },
          ].map(stat => (
            <div
              key={stat.key}
              className={`bg-white/[0.03] border border-white/8 rounded-xl p-4 cursor-pointer transition-all ${filterStatus === stat.key ? "border-violet-500/40 bg-violet-950/20" : "hover:border-white/15"}`}
              onClick={() => setFilterStatus(stat.key)}
              data-testid={`stat-${stat.key}`}
            >
              <p className="text-white/40 text-xs mb-1">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>
                {isLoading ? <Skeleton className="h-7 w-8 bg-white/10" /> : counts[stat.key as keyof typeof counts]}
              </p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-white/30 text-sm">Filter:</span>
          <div className="flex items-center gap-2 flex-wrap">
            {["all", "pending", "confirmed", "cancelled"].map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all ${filterStatus === s ? "bg-violet-600 text-white" : "bg-white/5 text-white/40 hover:text-white/70 hover:bg-white/10"}`}
                data-testid={`filter-${s}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full bg-white/5 rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
              <Package className="w-7 h-7 text-white/20" />
            </div>
            <p className="text-white/30 font-medium">No orders yet</p>
            <p className="text-white/15 text-sm mt-1">Orders will appear here when customers submit them</p>
          </div>
        ) : (
          <div className="space-y-3">
            {[...filtered].reverse().map((order) => (
              <div
                key={order.id}
                className="bg-white/[0.03] border border-white/8 rounded-xl p-4 flex items-center gap-4 hover:border-white/15 transition-all"
                data-testid={`order-row-${order.id}`}
              >
                <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                  {serviceIcon(order.productName)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <p className="font-semibold text-sm text-white truncate">
                      {order.productName} — {order.planName}
                    </p>
                    <Badge className={`${statusConfig[order.status as keyof typeof statusConfig]?.color || "bg-white/10 text-white/40"} text-xs flex items-center gap-1`}>
                      {statusConfig[order.status as keyof typeof statusConfig]?.icon}
                      {statusConfig[order.status as keyof typeof statusConfig]?.label || order.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-white/30 flex-wrap">
                    <span>{order.contactPlatform}: {order.contactUsername}</span>
                    <span>·</span>
                    <span>{order.paymentMethod}</span>
                    <span>·</span>
                    <span>{order.price}</span>
                    <span>·</span>
                    <span>{format(new Date(order.createdAt), "MMM d, h:mm a")}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Select
                    value={order.status}
                    onValueChange={(val) => statusMutation.mutate({ id: order.id, status: val })}
                  >
                    <SelectTrigger className="h-8 text-xs bg-white/5 border-white/10 text-white w-32" data-testid={`select-status-${order.id}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#13131f] border-white/10 text-white">
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-white/40 hover:text-white hover:bg-white/10"
                    onClick={() => setSelectedOrder(order)}
                    data-testid={`button-view-${order.id}`}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="bg-[#0e0e1a] border border-white/10 text-white max-w-sm w-[calc(100vw-2rem)] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/8">
                <div className="w-9 h-9 rounded-xl bg-black/30 border border-white/10 flex items-center justify-center">
                  {serviceIcon(selectedOrder.productName)}
                </div>
                <div>
                  <p className="font-semibold text-sm">{selectedOrder.productName} — {selectedOrder.planName}</p>
                  <p className="text-violet-400 font-bold text-sm">{selectedOrder.price}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Platform", value: selectedOrder.contactPlatform },
                  { label: "Username", value: selectedOrder.contactUsername },
                  { label: "Payment", value: selectedOrder.paymentMethod },
                  { label: "Status", value: selectedOrder.status },
                  { label: "Ordered", value: format(new Date(selectedOrder.createdAt), "MMM d, yyyy h:mm a") },
                ].map(item => (
                  <div key={item.label} className="bg-white/[0.03] rounded-lg p-3">
                    <p className="text-white/30 text-xs mb-1">{item.label}</p>
                    <p className="text-white text-sm font-medium capitalize">{item.value}</p>
                  </div>
                ))}
              </div>
              {selectedOrder.paymentScreenshot && (
                <div>
                  <p className="text-white/30 text-xs mb-2">Payment Screenshot</p>
                  <img
                    src={selectedOrder.paymentScreenshot}
                    alt="Payment proof"
                    className="w-full rounded-xl border border-white/10 object-cover max-h-64"
                    data-testid="img-order-screenshot"
                  />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
