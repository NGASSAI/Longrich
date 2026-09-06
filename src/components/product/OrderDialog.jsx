import { useState } from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { vibrate } from "@/lib/haptics";

const formatPrice = (value) =>
  new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(Number(value)) + " FCFA";

export function OrderDialog({ product, open, onOpenChange }) {
  const { user, isAuthenticated } = useAuth();

  const [quantity, setQuantity] = useState(1);
  const [clientName, setClientName] = useState(user?.name || "");
  const [clientPhone, setClientPhone] = useState(user?.phone || "");
  const [clientAddress, setClientAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);

  const effectivePrice = product.promoPrice && Number(product.promoPrice) < Number(product.price)
    ? product.promoPrice
    : product.price;
  const total = Number(effectivePrice) * quantity;

  const adjustQuantity = (delta) => {
    vibrate(6);
    setQuantity((q) => Math.max(1, Math.min(product.stock, q + delta)));
  };

  const resetAndClose = () => {
    setQuantity(1);
    setClientAddress("");
    setNotes("");
    setError(null);
    setSuccess(null);
    onOpenChange(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    vibrate(10);
    setIsSubmitting(true);

    try {
      const { data } = await api.post("/orders", {
        clientName,
        clientPhone,
        clientAddress: clientAddress || undefined,
        notes: notes || undefined,
        items: [{ productId: product.id, quantity }],
      });
      vibrate([10, 40, 10]);
      setSuccess(data.data.order.orderNumber);
    } catch (err) {
      vibrate(30);
      setError(err.response?.data?.message || "Une erreur est survenue. Réessayez.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? onOpenChange(v) : resetAndClose())}>
      <DialogContent className="sm:max-w-md">
        {success ? (
          <div className="py-6 text-center animate-in fade-in zoom-in-95 duration-300">
            <CheckCircle2 className="h-14 w-14 text-emerald-deep mx-auto mb-4" strokeWidth={1.5} />
            <DialogTitle className="font-display text-2xl text-emerald-deep mb-2">
              Commande enregistrée !
            </DialogTitle>
            <p className="text-muted-foreground mb-1">Numéro de commande</p>
            <p className="font-medium text-charcoal mb-6">{success}</p>
            <p className="text-sm text-muted-foreground mb-6">
              Notre équipe vous contactera pour confirmer la livraison. Paiement à la réception.
            </p>
            <div className="flex flex-col gap-2">
              {isAuthenticated && (
                <Button asChild onClick={resetAndClose}>
                  <Link to="/mes-commandes">Voir mes commandes</Link>
                </Button>
              )}
              <Button variant="outline" onClick={resetAndClose}>
                Continuer mes achats
              </Button>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-2xl text-emerald-deep">
                Commander
              </DialogTitle>
              <DialogDescription>{product.name}</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Quantite */}
              <div className="flex items-center justify-between">
                <Label>Quantité</Label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => adjustQuantity(-1)}
                    disabled={quantity <= 1}
                    className="h-8 w-8 flex items-center justify-center rounded-full border border-input text-charcoal disabled:opacity-40 active:scale-90 transition-transform"
                    aria-label="Diminuer la quantité"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-6 text-center font-medium">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => adjustQuantity(1)}
                    disabled={quantity >= product.stock}
                    className="h-8 w-8 flex items-center justify-center rounded-full border border-input text-charcoal disabled:opacity-40 active:scale-90 transition-transform"
                    aria-label="Augmenter la quantité"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientName">Nom complet</Label>
                <Input
                  id="clientName"
                  required
                  minLength={2}
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Votre nom"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientPhone">Téléphone</Label>
                <Input
                  id="clientPhone"
                  type="tel"
                  required
                  minLength={8}
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="+242 ..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientAddress">Adresse de livraison (optionnel)</Label>
                <Input
                  id="clientAddress"
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                  placeholder="Quartier, avenue, repère..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optionnel)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Précisions utiles pour la livraison..."
                  rows={2}
                />
              </div>

              {error && (
                <p role="alert" className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
                  {error}
                </p>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="font-display text-xl text-emerald-deep">{formatPrice(total)}</span>
              </div>

              <Button
                type="submit"
                className="w-full transition-transform active:scale-[0.98] shadow-sm hover:shadow-md"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Envoi en cours..." : "Confirmer la commande"}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Paiement à la livraison. Aucun paiement en ligne requis.
              </p>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}