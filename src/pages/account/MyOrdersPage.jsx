import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Package, ChevronDown } from "lucide-react";
import { api } from "@/lib/api";
import { vibrate } from "@/lib/haptics";

const formatPrice = (value) =>
  new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(Number(value)) + " FCFA";

const formatDate = (value) =>
  new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(value));

const STATUS_CONFIG = {
  pending: { label: "En attente", className: "bg-sage-pale text-emerald-deep" },
  confirmed: { label: "Confirmée", className: "bg-amber-gold/20 text-amber-gold" },
  shipped: { label: "Expédiée", className: "bg-emerald-deep/10 text-emerald-deep" },
  delivered: { label: "Livrée", className: "bg-emerald-deep text-ivory-warm" },
  cancelled: { label: "Annulée", className: "bg-destructive/10 text-destructive" },
};

const PAYMENT_LABELS = {
  unpaid: "Non payée",
  paid: "Payée",
};

function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false);
  const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => {
          vibrate(6);
          setExpanded((v) => !v);
        }}
        className="w-full flex items-center justify-between gap-4 p-4 sm:p-5 text-left"
      >
        <div className="flex items-center gap-4 min-w-0">
          <div className="h-11 w-11 rounded-full bg-sage-pale flex items-center justify-center shrink-0 text-emerald-deep">
            <Package className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-charcoal truncate">{order.orderNumber}</p>
            <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.className}`}>
            {status.label}
          </span>
          <span className="font-display text-lg text-emerald-deep hidden sm:inline">
            {formatPrice(order.total)}
          </span>
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {expanded && (
        <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-border animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="sm:hidden flex items-center justify-between py-3">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="font-display text-lg text-emerald-deep">{formatPrice(order.total)}</span>
          </div>

          <div className="space-y-3 py-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <span className="text-charcoal">
                  {item.productName} <span className="text-muted-foreground">× {item.quantity}</span>
                </span>
                <span className="text-charcoal">{formatPrice(item.subtotal)}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border text-sm text-muted-foreground">
            <span>Paiement : {PAYMENT_LABELS[order.paymentStatus]}</span>
            {order.confirmedByAdmin && <span>Confirmée par {order.confirmedByAdmin.name}</span>}
          </div>
        </div>
      )}
    </div>
  );
}

export function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get("/orders/my-orders")
      .then(({ data }) => setOrders(data.data.orders))
      .catch(() => setOrders([]))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-4xl text-emerald-deep mb-2">Mes commandes</h1>
      <p className="text-muted-foreground mb-8">
        {isLoading ? "Chargement..." : `${orders.length} commande${orders.length > 1 ? "s" : ""}`}
      </p>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-sage-pale animate-pulse" />
          ))}
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-3">
          {orders.map((order, i) => (
            <div
              key={order.id}
              className="animate-in fade-in slide-in-from-bottom-2 duration-500"
              style={{ animationDelay: `${Math.min(i * 60, 300)}ms`, animationFillMode: "backwards" }}
            >
              <OrderCard order={order} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" strokeWidth={1.25} />
          <p className="text-muted-foreground mb-6">Vous n'avez pas encore passé de commande.</p>
          <Link
            to="/produits"
            onClick={() => vibrate(8)}
            className="text-emerald-deep hover:text-amber-gold transition-colors font-medium"
          >
            Découvrir le catalogue →
          </Link>
        </div>
      )}
    </div>
  );
}