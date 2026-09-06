import { useState, useEffect } from "react";
import { Plus, Trash2, Ban, CheckCircle2, X } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { vibrate } from "@/lib/haptics";

const formatDate = (value) =>
  new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));

function CreateAdminDialog({ open, onOpenChange, onCreated }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reset = () => {
    setName("");
    setEmail("");
    setPassword("");
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    vibrate(10);
    setIsSubmitting(true);
    try {
      const { data } = await api.post("/super-admin/admins", { name, email, password });
      vibrate([10, 40, 10]);
      onCreated(data.data.admin);
      reset();
      onOpenChange(false);
    } catch (err) {
      vibrate(30);
      setError(err.response?.data?.code === "EMAIL_TAKEN"
        ? "Un compte existe déjà avec cet email."
        : "Une erreur est survenue. Réessayez.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="dark sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-ivory-warm">
            Nouveau compte admin
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-name">Nom complet</Label>
            <Input id="admin-name" required minLength={2} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-email">Email</Label>
            <Input id="admin-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-password">Mot de passe</Label>
            <Input
              id="admin-password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8 caractères minimum"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Création..." : "Créer le compte"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AdminAccountsPage() {
  const [admins, setAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // { type: 'block'|'unblock'|'delete', admin }

  const loadAdmins = () => {
    api
      .get("/super-admin/admins")
      .then(({ data }) => setAdmins(data.data.admins))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const handleCreated = (admin) => {
    setAdmins((prev) => [admin, ...prev]);
  };

  const handleToggleStatus = async (admin) => {
    const newStatus = admin.status === "active" ? "blocked" : "active";
    vibrate(10);
    try {
      await api.patch(`/super-admin/admins/${admin.id}/status`, { status: newStatus });
      setAdmins((prev) => prev.map((a) => (a.id === admin.id ? { ...a, status: newStatus } : a)));
    } catch {
      vibrate(30);
    } finally {
      setConfirmAction(null);
    }
  };

  const handleDelete = async (admin) => {
    vibrate(10);
    try {
      await api.delete(`/super-admin/admins/${admin.id}`);
      setAdmins((prev) => prev.filter((a) => a.id !== admin.id));
    } catch {
      vibrate(30);
    } finally {
      setConfirmAction(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-ivory-warm">Comptes admin</h1>
          <p className="text-sm text-ivory-warm/50 mt-1">
            {isLoading ? "Chargement..." : `${admins.length} compte${admins.length > 1 ? "s" : ""}`}
          </p>
        </div>
        <Button
          onClick={() => {
            vibrate(8);
            setCreateOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" /> Nouveau
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-card animate-pulse" />
          ))}
        </div>
      ) : admins.length > 0 ? (
        <div className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">
          {admins.map((admin) => (
            <div key={admin.id} className="flex items-center justify-between gap-4 p-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 rounded-full bg-amber-gold/15 border border-amber-gold/30 flex items-center justify-center text-amber-gold font-medium shrink-0">
                  {admin.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-ivory-warm truncate">{admin.name}</p>
                  <p className="text-sm text-ivory-warm/50 truncate">{admin.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="hidden sm:block text-xs text-ivory-warm/40">
                  Depuis {formatDate(admin.createdAt)}
                </span>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    admin.status === "active"
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-destructive/15 text-destructive"
                  }`}
                >
                  {admin.status === "active" ? "Actif" : "Bloqué"}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    vibrate(6);
                    setConfirmAction({ type: admin.status === "active" ? "block" : "unblock", admin });
                  }}
                  className="h-8 w-8 flex items-center justify-center rounded-full text-ivory-warm/50 hover:bg-ivory-warm/10 hover:text-amber-gold transition-colors"
                  aria-label={admin.status === "active" ? "Bloquer" : "Débloquer"}
                >
                  {admin.status === "active" ? (
                    <Ban className="h-4 w-4" strokeWidth={1.75} />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" strokeWidth={1.75} />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    vibrate(6);
                    setConfirmAction({ type: "delete", admin });
                  }}
                  className="h-8 w-8 flex items-center justify-center rounded-full text-ivory-warm/50 hover:bg-destructive/15 hover:text-destructive transition-colors"
                  aria-label="Supprimer"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-ivory-warm/50 text-center py-12">Aucun compte admin pour le moment.</p>
      )}

      <CreateAdminDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={handleCreated} />

      {/* Confirmation avant toute action destructrice */}
      <Dialog open={!!confirmAction} onOpenChange={(v) => !v && setConfirmAction(null)}>
        <DialogContent className="dark sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-ivory-warm">
              {confirmAction?.type === "delete" && "Supprimer ce compte ?"}
              {confirmAction?.type === "block" && "Bloquer ce compte ?"}
              {confirmAction?.type === "unblock" && "Débloquer ce compte ?"}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-ivory-warm/60">
            {confirmAction?.admin?.name} ({confirmAction?.admin?.email})
            {confirmAction?.type === "delete" && " — cette action est irréversible."}
          </p>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" className="flex-1" onClick={() => setConfirmAction(null)}>
              <X className="h-4 w-4 mr-1" /> Annuler
            </Button>
            <Button
              variant={confirmAction?.type === "delete" ? "destructive" : "default"}
              className="flex-1"
              onClick={() =>
                confirmAction?.type === "delete"
                  ? handleDelete(confirmAction.admin)
                  : handleToggleStatus(confirmAction.admin)
              }
            >
              Confirmer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}