import { useState, useEffect, useCallback } from "react";
import { Database, Server, Radio, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import { vibrate } from "@/lib/haptics";

const formatUptime = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}min`;
  if (m > 0) return `${m}min ${s}s`;
  return `${s}s`;
};

function StatCard({ icon: Icon, title, status, children }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <Icon className="h-4.5 w-4.5 text-amber-gold" strokeWidth={1.5} />
          <h3 className="text-sm font-medium text-ivory-warm/90">{title}</h3>
        </div>
        {status && (
          <span
            className={`h-2 w-2 rounded-full ${
              status === "ok" ? "bg-emerald-500" : "bg-destructive"
            } ${status === "ok" ? "animate-pulse" : ""}`}
          />
        )}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-ivory-warm/50">{label}</span>
      <span className="text-ivory-warm font-medium">{value}</span>
    </div>
  );
}

export function MonitoringPage() {
  const [status, setStatus] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const { data } = await api.get("/super-admin/monitoring");
      setStatus(data.data.status);
      setLastUpdated(new Date());
      setError(false);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    // Monitoring vivant : rafraichissement automatique toutes les 10s.
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const handleManualRefresh = () => {
    vibrate(8);
    fetchStatus();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-ivory-warm">Monitoring système</h1>
          <p className="text-sm text-ivory-warm/50 mt-1">
            {lastUpdated
              ? `Mis à jour à ${lastUpdated.toLocaleTimeString("fr-FR")}`
              : "Chargement..."}
          </p>
        </div>
        <button
          type="button"
          onClick={handleManualRefresh}
          className="h-9 w-9 flex items-center justify-center rounded-full text-ivory-warm/60 hover:bg-ivory-warm/10 hover:text-amber-gold transition-colors active:scale-90"
          aria-label="Rafraîchir"
        >
          <RefreshCw className="h-4.5 w-4.5" strokeWidth={1.75} />
        </button>
      </div>

      {error && !status && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-4 py-3 mb-6">
          Impossible de récupérer l'état du système.
        </p>
      )}

      {status && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard icon={Database} title="Base de données" status={status.database.status}>
            <Metric
              label="Statut"
              value={status.database.status === "ok" ? "Opérationnelle" : "Erreur"}
            />
            {status.database.latencyMs !== null && (
              <Metric label="Latence" value={`${status.database.latencyMs} ms`} />
            )}
          </StatCard>

          <StatCard icon={Server} title="Serveur">
            <Metric label="Environnement" value={status.server.environment} />
            <Metric label="Node.js" value={status.server.nodeVersion} />
            <Metric label="Disponible depuis" value={formatUptime(status.server.uptimeSeconds)} />
            <Metric label="Mémoire utilisée" value={`${status.server.memoryUsedMb} Mo`} />
          </StatCard>

          <StatCard icon={Radio} title="Temps réel">
            <Metric label="Connexions actives" value={status.realtime.connectedClients} />
          </StatCard>
        </div>
      )}
    </div>
  );
}