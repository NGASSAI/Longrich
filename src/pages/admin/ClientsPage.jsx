import { useState, useEffect, useCallback } from "react";
import { Search, ShieldOff, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";

const formatDate = (value) =>
  new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));

const STATUS_CONFIG = {
  active: { label: "Actif", className: "bg-emerald-deep/10 text-emerald-deep" },
  blocked: { label: "Bloqué", className: "bg-destructive/10 text-destructive" },
};

export function ClientsPage() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [updatingId, setUpdatingId] = useState(null);

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
      setUsers((prev) => prev.map((u) => (u.id === user.id ? data.data.user : u)));
    } catch {
      window.alert("Impossible de mettre à jour ce client.");
    } finally {
      setUpdatingId(null);
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
        <div className="relative flex-1 min-w-[200px]">
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
                <div key={user.id} className="flex items-center gap-4 px-5 py-3">
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
                    onClick={() => toggleStatus(user)}
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
    </div>
  );
}