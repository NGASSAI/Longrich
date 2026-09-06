import { useState, useEffect, useCallback } from "react";
import { TrendingUp, Users, Package, Heart, PieChart, Target } from "lucide-react";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const formatFCFA = (value) =>
  new Intl.NumberFormat("fr-FR").format(Number(value)) + " FCFA";

const SOURCE_LABELS = {
  website: "Site",
  whatsapp: "WhatsApp",
  phone_call: "Téléphone",
  admin: "Saisie admin",
};

function Section({ icon: Icon, title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-sage-pale p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="h-4 w-4 text-emerald-deep" strokeWidth={1.75} />
        <h2 className="font-display text-lg text-charcoal">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export function StatisticsPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get("/admin/stats/detailed", {
        params: { from: from || undefined, to: to || undefined },
      });
      setStats(data.data);
    } catch {
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-40 rounded-2xl bg-sage-pale animate-pulse" />
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

  const { revenue, topClients, topSellingProducts, mostLikedProducts, ordersByChannel, conversion } = stats;

  const maxChannelCount = Math.max(...ordersByChannel.map((c) => c.count), 1);
  const maxSoldQty = Math.max(...topSellingProducts.map((p) => p.quantitySold), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-emerald-deep mb-1">Statistiques</h1>
        <p className="text-muted-foreground">Analyse détaillée de l'activité</p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="from">Du</Label>
          <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="to">Au</Label>
          <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        {(from || to) && (
          <button
            type="button"
            onClick={() => {
              setFrom("");
              setTo("");
            }}
            className="text-sm text-destructive h-9"
          >
            Réinitialiser
          </button>
        )}
      </div>

      {/* Revenu */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-sage-pale p-5">
          <p className="text-xs text-muted-foreground mb-1">CA total (tout historique)</p>
          <p className="font-display text-2xl text-emerald-deep">{formatFCFA(revenue.totalRevenue)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-sage-pale p-5">
          <p className="text-xs text-muted-foreground mb-1">
            CA {from || to ? "sur la période" : "(sans filtre)"}
          </p>
          <p className="font-display text-2xl text-emerald-deep">{formatFCFA(revenue.periodRevenue)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-sage-pale p-5">
          <p className="text-xs text-muted-foreground mb-1">Commandes payées sur la période</p>
          <p className="font-display text-2xl text-emerald-deep">{revenue.periodOrderCount}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Meilleurs clients */}
        <Section icon={Users} title="Meilleurs clients">
          {topClients.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune donnée.</p>
          ) : (
            <div className="space-y-3">
              {topClients.map((entry, i) => (
                <div key={entry.user?.id || i} className="flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="text-charcoal truncate">{entry.user?.name || "Client supprimé"}</p>
                    <p className="text-xs text-muted-foreground">{entry.orderCount} commande(s)</p>
                  </div>
                  <span className="font-medium text-emerald-deep shrink-0">
                    {formatFCFA(entry.totalSpent)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Produits les plus vendus */}
        <Section icon={TrendingUp} title="Produits les plus vendus">
          {topSellingProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune donnée.</p>
          ) : (
            <div className="space-y-3">
              {topSellingProducts.map((entry, i) => (
                <div key={entry.product?.id || i}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-charcoal truncate">{entry.product?.name || "Produit supprimé"}</span>
                    <span className="text-muted-foreground shrink-0 ml-2">{entry.quantitySold} vendus</span>
                  </div>
                  <div className="h-2 rounded-full bg-sage-pale overflow-hidden">
                    <div
                      className="h-full bg-emerald-deep rounded-full"
                      style={{ width: `${(entry.quantitySold / maxSoldQty) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Produits les plus aimés */}
        <Section icon={Heart} title="Produits les plus aimés">
          {mostLikedProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune donnée.</p>
          ) : (
            <div className="space-y-2">
              {mostLikedProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between text-sm">
                  <span className="text-charcoal truncate">{product.name}</span>
                  <span className="text-muted-foreground shrink-0 flex items-center gap-1">
                    <Heart className="h-3.5 w-3.5 fill-destructive text-destructive" />
                    {product.likesCount}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Répartition par canal */}
        <Section icon={PieChart} title="Commandes par canal">
          {ordersByChannel.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune donnée.</p>
          ) : (
            <div className="space-y-3">
              {ordersByChannel.map((entry) => (
                <div key={entry.source}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-charcoal">{SOURCE_LABELS[entry.source] || entry.source}</span>
                    <span className="text-muted-foreground">{entry.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-sage-pale overflow-hidden">
                    <div
                      className="h-full bg-amber-gold rounded-full"
                      style={{ width: `${(entry.count / maxChannelCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>

      {/* Conversion */}
      <Section icon={Target} title="Taux de conversion">
        <div className="grid sm:grid-cols-3 gap-4 text-center">
          <div>
            <p className="font-display text-2xl text-emerald-deep">{conversion.totalOrders}</p>
            <p className="text-xs text-muted-foreground">Commandes totales</p>
          </div>
          <div>
            <p className="font-display text-2xl text-emerald-deep">{conversion.totalViews}</p>
            <p className="text-xs text-muted-foreground">Vues produits cumulées</p>
          </div>
          <div>
            <p className="font-display text-2xl text-emerald-deep">{conversion.conversionRate}%</p>
            <p className="text-xs text-muted-foreground">Taux de conversion</p>
          </div>
        </div>
      </Section>
    </div>
  );
}