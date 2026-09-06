import { useState, useEffect, useCallback } from "react";
import { ChevronDown, Search } from "lucide-react";
import { api } from "@/lib/api";
import { vibrate } from "@/lib/haptics";
import { NewOrderDialog } from "@/components/admin/NewOrderDialog";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const formatPrice = (value) =>
  new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(Number(value)) + " FCFA";

const formatDate = (value) =>
  new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));

const STATUS_CONFIG = {
  pending: { label: "En attente", className: "bg-sage-pale text-emerald-deep" },
  confirmed: { label: "Confirmée", className: "bg-amber-gold/20 text-amber-gold" },
  shipped: { label: "Expédiée", className: "bg-emerald-deep/10 text-emerald-deep" },
  delivered: { label: "Livrée", className: "bg-emerald-deep text-ivory-warm" },
  cancelled: { label: "Annulée", className: "bg-destructive/10 text-destructive" },
};

const SOURCE_LABELS = {
  website: "Site",
  whatsapp: "WhatsApp",
  phone_call: "Téléphone",
  admin: "Saisie admin",
};

const STATUS_OPTIONS = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

function OrderRow({ order, onStatusChange, onPaymentChange }) {
  const [expanded, setExpanded] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setIsUpdating(true);
    try {
      await onStatusChange(order.id, newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePaymentToggle = async () => {
    setIsUpdating(true);
    try {
      await onPaymentChange(order.id, order.paymentStatus === "paid" ? "unpaid" : "paid");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="border-b border-sage-pale last:border-0">
      <button
        type="button"
        onClick={() => {
          vibrate(6);
          setExpanded((v) => !v);
        }}
        className="w-full flex items-center justify-between gap-4 px-5 py-3 text-left"
      >
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-charcoal truncate">{order.orderNumber}</p>
          <p className="text-xs text-muted-foreground">
            {order.clientName} · {order.clientPhone} · {formatDate(order.createdAt)}
          </p>
        </div>
        <span className="hidden sm:inline text-xs text-muted-foreground shrink-0">
          {SOURCE_LABELS[order.source]}
        </span>
        <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${status.className}`}>
          {status.label}
        </span>
        <span className="font-display text-emerald-deep shrink-0">{formatPrice(order.total)}</span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {expanded && (
        <div className="px-5 pb-4 pt-1 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="space-y-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <span className="text-charcoal">
                  {item.productName} <span className="text-muted-foreground">× {item.quantity}</span>
                </span>
                <span className="text-charcoal">{formatPrice(item.subtotal)}</span>
              </div>
            ))}
          </div>

          {order.clientAddress && (
            <p className="text-sm text-muted-foreground">Adresse : {order.clientAddress}</p>
          )}
          {order.notes && <p className="text-sm text-muted-foreground">Notes : {order.notes}</p>}

          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-sage-pale">
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground">Statut :</label>
              <select
                value={order.status}
                onChange={handleStatusChange}
                disabled={isUpdating}
                className="h-8 rounded-md border border-input bg-transparent px-2 text-sm"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_CONFIG[s].label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handlePaymentToggle}
              disabled={isUpdating}
              className={`h-8 px-3 rounded-md text-xs font-medium transition-colors ${
                order.paymentStatus === "paid"
                  ? "bg-emerald-deep text-ivory-warm"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              {order.paymentStatus === "paid" ? "Payée" : "Non payée — marquer payée"}
            </button>

            {order.confirmedByAdmin && (
              <span className="text-xs text-muted-foreground ml-auto">
                Traitée par {order.confirmedByAdmin.name}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [newOrderOpen, setNewOrderOpen] = useState(false);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [page, setPage] = useState(1);

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get("/orders", {
        params: {
          search: search || undefined,
          status: statusFilter || undefined,
          source: sourceFilter || undefined,
          page,
          limit: 15,
        },
      });
      setOrders(data.data.orders);
      setPagination(data.data.pagination);
    } catch {
      setOrders([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, sourceFilter, page]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const { data } = await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, ...data.data.order } : o)));
    } catch {
      window.alert("Impossible de mettre à jour le statut.");
    }
  };

  const handlePaymentChange = async (orderId, newPaymentStatus) => {
    try {
      const { data } = await api.patch(`/orders/${orderId}/payment`, {
        paymentStatus: newPaymentStatus,
      });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, ...data.data.order } : o)));
    } catch {
      window.alert("Impossible de mettre à jour le paiement.");
    }
  };

  return (
    <div className="space-y-6">
           <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl text-emerald-deep mb-1">Commandes</h1>
          <p className="text-muted-foreground">
            {pagination ? `${pagination.total} commande${pagination.total > 1 ? "s" : ""}` : "Chargement..."}
          </p>
        </div>
        <Button onClick={() => setNewOrderOpen(true)}>
          <Plus className="h-4 w-4" /> Nouvelle commande
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="N° commande, nom, téléphone..."
            className="h-9 w-full rounded-md border border-input bg-transparent pl-9 pr-3 text-sm"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            setPage(1);
            setStatusFilter(e.target.value);
          }}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
        >
          <option value="">Tous les statuts</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {STATUS_CONFIG[s].label}
            </option>
          ))}
        </select>

        <select
          value={sourceFilter}
          onChange={(e) => {
            setPage(1);
            setSourceFilter(e.target.value);
          }}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
        >
          <option value="">Toutes les sources</option>
          {Object.entries(SOURCE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-sage-pale overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 rounded-lg bg-sage-pale animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <p className="text-muted-foreground py-12 text-center">Aucune commande trouvée.</p>
        ) : (
          orders.map((order) => (
            <OrderRow
              key={order.id}
              order={order}
              onStatusChange={handleStatusChange}
              onPaymentChange={handlePaymentChange}
            />
          ))
        )}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPage(p)}
              className={`h-9 w-9 rounded-full text-sm transition-colors ${
                p === page ? "bg-emerald-deep text-ivory-warm" : "text-charcoal hover:bg-sage-pale"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
        <NewOrderDialog
        open={newOrderOpen}
        onOpenChange={setNewOrderOpen}
        onCreated={() => loadOrders()}
      />
    </div>
  );
}