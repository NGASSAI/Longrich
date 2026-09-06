import { WifiOff } from "lucide-react";

export function OfflineScreen() {
  return (
    <div className="min-h-screen bg-ivory-warm flex flex-col items-center justify-center px-6 text-center">
      <div className="h-16 w-16 rounded-full bg-sage-pale flex items-center justify-center mb-6">
        <WifiOff className="h-7 w-7 text-emerald-deep" strokeWidth={1.75} />
      </div>
      <h1 className="font-display text-2xl text-emerald-deep mb-2">Pas de connexion</h1>
      <p className="text-muted-foreground mb-6 max-w-sm">
        Vérifiez votre connexion internet. L'application reprendra automatiquement dès que vous serez reconnecté.
      </p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="px-5 py-2.5 rounded-full bg-emerald-deep text-ivory-warm text-sm font-medium hover:bg-emerald-deep/90 transition-colors"
      >
        Réessayer
      </button>
    </div>
  );
}