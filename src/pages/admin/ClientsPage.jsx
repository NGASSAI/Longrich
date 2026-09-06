import { useState, useEffect, useCallback } from "react";
import { Search, ShieldOff, ShieldCheck, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const formatDate = (value) =>
  new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));

const STATUS_CONFIG = {
  active: { label: "Actif", className: "bg-emerald-deep/10 text-emerald-deep" },
  blocked: { label: "Bloqué", className: "bg-destructive/10 text-destructive" },
};

const formatFCFA = (value) =>
  new Intl.NumberFormat("fr-FR").format(Number(value)) + " FCFA";

const ORDER_STATUS_LABELS = {
  pending: "En attente",
  confirmed: "Confirmée",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
};

export function ClientsPage() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [updatingId, setUpdatingId] = useState(null);
  const [historyUser, setHistoryUser] = useState(null);
  const [historyOrders, setHistoryOrders] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get("/admin/users", {
        params: {
          search: search || undefined,
          status: statusFilter || undefined,
          page,
          limit: 15,
        },
      });
      setUsers(data.data.users);
      setPagination(data.data.pagination);
    } catch {
      setUsers([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const toggleStatus = async (user) => {
    const newStatus = user.status === "active" ? "blocked" : "active";
    const confirmMsg =
      newStatus === "blocked"
        ? `Bloquer ${user.name} ? Sa session active sera immédiatement invalidée.`
        : `Débloquer ${user.name} ?`;
    if (!window.confirm(confirmMsg)) return;

    setUpdatingId(user.id);
    try {
      const { data } = await api.patch(`/admin/users/${user.id}`, { status: newStatus });
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, ...data.data.user } : u)));
    } catch {
      window.alert("Impossible de mettre à jour ce client.");
    } finally {
      setUpdatingId(null);
    }
  };

  const openHistory = async (user) => {
    setHistoryUser(user);
    setIsLoadingHistory(true);
    try {
      const { data } = await api.get("/orders", { params: { userId: user.id, limit: 50 } });
      setHistoryOrders(data.data.orders);
    } catch {
      setHistoryOrders([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleDelete = async (user) => {
    if (
      !window.confirm(
        `Supprimer définitivement ${user.name} ? Ses conversations et messages seront supprimés. Ses commandes passées seront conservées.`
      )
    )
      return;

        try {
      await api.delete(`/admin/users/${user.id}`);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      setPagination((prev) => (prev ? { ...prev, total: prev.total - 1 } : prev));
    } catch {
      window.alert("Impossible de supprimer ce client.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-emerald-deep mb-1">Clients</h1>
        <p className="text-muted-foreground">
          {pagination ? `${pagination.total} client${pagination.total > 1 ? "s" : ""}` : "Chargement..."}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-50">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="Nom ou email..."
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
          <option value="active">Actif</option>
          <option value="blocked">Bloqué</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-sage-pale overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 rounded-lg bg-sage-pale animate-pulse" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <p className="text-muted-foreground py-12 text-center">Aucun client trouvé.</p>
        ) : (
          <div className="divide-y divide-sage-pale">
            {users.map((user) => {
              const status = STATUS_CONFIG[user.status];
              return (
                <div
                  key={user.id}
                  className="flex items-center gap-4 px-5 py-3 hover:bg-sage-pale/30 transition-colors cursor-pointer"
                  onClick={() => openHistory(user)}
                >
                  <div className="h-9 w-9 rounded-full bg-sage-pale flex items-center justify-center shrink-0 text-emerald-deep text-sm font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-charcoal truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <span className="hidden sm:inline text-xs text-muted-foreground shrink-0">
                    Depuis {formatDate(user.createdAt)}
                  </span>
                  <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${status.className}`}>
                    {status.label}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStatus(user);
                    }}
                    disabled={updatingId === user.id}
                    className="shrink-0 h-8 w-8 flex items-center justify-center rounded-full text-charcoal hover:bg-sage-pale transition-colors disabled:opacity-40"
                    aria-label={user.status === "active" ? "Bloquer" : "Débloquer"}
                    title={user.status === "active" ? "Bloquer ce client" : "Débloquer ce client"}
                  >
                    {user.status === "active" ? (
                      <ShieldOff className="h-4 w-4 text-destructive" />
                    ) : (
                      <ShieldCheck className="h-4 w-4 text-emerald-deep" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(user);
                    }}
                    className="shrink-0 h-8 w-8 flex items-center justify-center rounded-full text-charcoal hover:bg-sage-pale transition-colors"
                    aria-label="Supprimer"
                    title="Supprimer ce client"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </button>
                </div>
              );
            })}
          </div>
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

      <Dialog open={!!historyUser} onOpenChange={(open) => !open && setHistoryUser(null)}>
                    <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Profil client</DialogTitle>
          </DialogHeader>

          {historyUser && (
            <div className="flex items-start gap-4 pb-4 border-b border-sage-pale">
              <div className="h-14 w-14 rounded-full bg-sage-pale flex items-center justify-center shrink-0 overflow-hidden text-emerald-deep text-lg font-medium">
                {historyUser.avatar ? (
                  <img src={historyUser.avatar} alt={historyUser.name} className="h-full w-full object-cover" />
                ) : (
                  historyUser.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="font-display text-lg text-charcoal">{historyUser.name}</p>
                <p className="text-sm text-muted-foreground">{historyUser.email}</p>
                <p className="text-sm text-muted-foreground">{historyUser.phone || "Téléphone non renseigné"}</p>
                <div className="flex items-center gap-2 pt-1">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[historyUser.status].className}`}
                  >
                    {STATUS_CONFIG[historyUser.status].label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Client depuis {formatDate(historyUser.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <p className="text-sm font-medium text-charcoal pt-2">Historique des commandes</p>

          {isLoadingHistory ? (
            <div className="py-12 text-center text-muted-foreground">Chargement des commandes...</div>
          ) : historyOrders.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">Aucune commande enregistrée pour ce client.</div>
          ) : (
            <div className="space-y-4 pt-2">
              {historyOrders.map((order) => (
                <div key={order.id} className="p-4 rounded-xl border border-sage-pale bg-sage-pale/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-emerald-deep">Commande #{order.id.slice(-6)}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-deep/10 text-emerald-deep">
                      {ORDER_STATUS_LABELS[order.status] || order.status}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Passée le {formatDate(order.createdAt)} • Total : <strong className="text-charcoal">{formatFCFA(order.total)}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}