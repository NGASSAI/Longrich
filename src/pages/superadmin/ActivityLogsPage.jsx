import { useState, useEffect, useCallback } from "react";
import { ScrollText, Package, ShoppingCart, Settings } from "lucide-react";
import { api } from "@/lib/api";
import { vibrate } from "@/lib/haptics";

const formatDateTime = (value) =>
  new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

const ACTION_CONFIG = {
  "product.delete": { icon: Package, label: "Suppression produit", color: "text-destructive" },
  "order.status_update": { icon: ShoppingCart, label: "Statut commande", color: "text-amber-gold" },
  "settings.update": { icon: Settings, label: "Paramètres", color: "text-emerald-400" },
};

const FILTERS = [
  { value: "", label: "Toutes les actions" },
  { value: "product.delete", label: "Suppressions produit" },
  { value: "order.status_update", label: "Statuts commande" },
  { value: "settings.update", label: "Paramètres" },
];

export function ActivityLogsPage() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [actionFilter, setActionFilter] = useState("");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const loadLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get("/super-admin/activity-logs", {
        params: { action: actionFilter || undefined, page, limit: 20 },
      });
      setLogs(data.data.logs);
      setPagination(data.data.pagination);
    } catch {
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  }, [actionFilter, page]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const handleFilterChange = (value) => {
    vibrate(6);
    setActionFilter(value);
    setPage(1);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-ivory-warm">Logs d'activité</h1>
          <p className="text-sm text-ivory-warm/50 mt-1">
            Audit des actions sensibles réalisées par les administrateurs.
          </p>
        </div>

        <select
          value={actionFilter}
          onChange={(e) => handleFilterChange(e.target.value)}
          className="h-9 rounded-md border border-input bg-input/30 px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-gold"
        >
          {FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-card animate-pulse" />
          ))}
        </div>
      ) : logs.length > 0 ? (
        <>
          <div className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">
            {logs.map((log) => {
              const config = ACTION_CONFIG[log.action] || { icon: ScrollText, label: log.action, color: "text-ivory-warm/60" };
              const Icon = config.icon;
              return (
                <div key={log.id} className="flex items-start gap-3 p-4">
                  <div className={`h-9 w-9 rounded-full bg-ivory-warm/5 flex items-center justify-center shrink-0 ${config.color}`}>
                    <Icon className="h-4 w-4" strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm text-ivory-warm">{config.label}</p>
                      <span className="text-xs text-ivory-warm/40 shrink-0">{formatDateTime(log.createdAt)}</span>
                    </div>
                    {log.description && (
                      <p className="text-sm text-ivory-warm/60 mt-0.5">{log.description}</p>
                    )}
                    <p className="text-xs text-ivory-warm/40 mt-1">
                      Par {log.user?.name || "Utilisateur supprimé"}
                      {log.ipAddress && ` · ${log.ipAddress}`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    vibrate(6);
                    setPage(p);
                  }}
                  className={`h-8 w-8 rounded-full text-sm transition-colors ${
                    p === page ? "bg-amber-gold text-charcoal" : "text-ivory-warm/60 hover:bg-ivory-warm/10"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <p className="text-ivory-warm/50 text-center py-12">Aucun log d'activité pour le moment.</p>
      )}
    </div>
  );
}