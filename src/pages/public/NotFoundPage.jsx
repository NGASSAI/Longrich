import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { vibrate } from "@/lib/haptics";

export function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
      <div className="h-16 w-16 rounded-full bg-sage-pale flex items-center justify-center mb-6">
        <Compass className="h-7 w-7 text-emerald-deep" strokeWidth={1.75} />
      </div>
      <p className="font-display text-6xl text-emerald-deep mb-2">404</p>
      <h1 className="font-display text-2xl text-charcoal mb-2">Page introuvable</h1>
      <p className="text-muted-foreground mb-8 max-w-sm">
        La page que vous cherchez n'existe pas ou a été déplacée.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button asChild onClick={() => vibrate(8)}>
          <Link to="/">Retour à l'accueil</Link>
        </Button>
        <Button variant="outline" asChild onClick={() => vibrate(6)}>
          <Link to="/produits">Voir le catalogue</Link>
        </Button>
      </div>
    </div>
  );
}