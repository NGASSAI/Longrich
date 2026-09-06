import { useState, useEffect } from "react";
import { Users, ShoppingCart, Package, Wallet } from "lucide-react";
import { api } from "@/lib/api";

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-sage-pale flex items-center gap-4">
      <div className="h-11 w-11 rounded-xl bg-sage-pale flex items-center justify-center shrink-0">
        <Icon className="h-5 w-5 text-emerald-deep" strokeWidth={1.75} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-display text-2xl text-charcoal truncate">{value}</p>
      </div>
    </div>
  );
}

function formatFCFA(amount) {
  return new Intl.NumberFormat("fr-FR").format(Number(amount)) + " FCFA";
}

export function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get("/admin/stats")
      .then(({ data }) => setStats(data.data.stats))
      .catch(() => setStats(null))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-sage-pale animate-pulse" />
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <p className="text-muted-foreground py-12 text-center">
        Impossible de charger les statistiques pour le moment.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-emerald-deep mb-1">Tableau de bord</h1>
        <p className="text-muted-foreground">Vue d'ensemble de l'activité</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Wallet} label="Chiffre d'affaires" value={formatFCFA(stats.totalRevenue)} />
        <StatCard icon={ShoppingCart} label="Commandes" value={stats.totalOrders} />
        <StatCard icon={Package} label="Produits" value={stats.totalProducts} />
        <StatCard icon={Users} label="Clients" value={stats.totalClients} />
      </div>

      <div className="bg-white rounded-2xl border border-sage-pale overflow-hidden">
        <div className="px-5 py-4 border-b border-sage-pale">
          <h2 className="font-display text-lg text-charcoal">Commandes récentes</h2>
        </div>
        {stats.recentOrders.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center">Aucune commande pour l'instant.</p>
        ) : (
          <div className="divide-y divide-sage-pale">
            {stats.recentOrders.map((order) => (
              <div key={order.id} className="px-5 py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm text-charcoal truncate">{order.user?.name || "Client"}</p>
                  <p className="text-xs text-muted-foreground truncate">{order.user?.email}</p>
                </div>
                <span className="text-sm font-medium text-emerald-deep shrink-0">
                  {formatFCFA(order.total)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}