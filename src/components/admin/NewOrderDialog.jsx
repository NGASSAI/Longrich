import { useState, useEffect, useCallback } from "react";
import { Search, Plus, Minus, X } from "lucide-react";
import { api } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const formatFCFA = (value) =>
  new Intl.NumberFormat("fr-FR").format(Number(value)) + " FCFA";

const SOURCE_OPTIONS = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "phone_call", label: "Téléphone" },
  { value: "admin", label: "Saisie directe" },
];

export function NewOrderDialog({ open, onOpenChange, onCreated }) {
  const [source, setSource] = useState("whatsapp");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("unpaid");

  const [productSearch, setProductSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [cart, setCart] = useState([]); // [{ product, quantity }]

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const searchProducts = useCallback(async (q) => {
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const { data } = await api.get("/products", { params: { search: q, limit: 6 } });
      setSearchResults(data.data.products);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => searchProducts(productSearch), 300);
    return () => clearTimeout(timeout);
  }, [productSearch, searchProducts]);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setProductSearch("");
    setSearchResults([]);
  };

  const updateQuantity = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: Math.max(1, Math.min(item.product.stock, item.quantity + delta)) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const getEffectivePrice = (product) =>
    product.promoPrice && Number(product.promoPrice) < Number(product.price)
      ? Number(product.promoPrice)
      : Number(product.price);

  const total = cart.reduce((sum, item) => sum + getEffectivePrice(item.product) * item.quantity, 0);

  const resetAndClose = () => {
    setSource("whatsapp");
    setClientName("");
    setClientPhone("");
    setClientAddress("");
    setNotes("");
    setPaymentStatus("unpaid");
    setCart([]);
    setProductSearch("");
    setError("");
    onOpenChange(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (cart.length === 0) {
      setError("Ajoute au moins un produit à la commande.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data } = await api.post("/orders", {
        clientName,
        clientPhone,
        clientAddress: clientAddress || undefined,
        notes: notes || undefined,
        source,
        paymentStatus,
        items: cart.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
      });
      onCreated?.(data.data.order);
      resetAndClose();
    } catch (err) {
      setError(err.response?.data?.message || "Une erreur est survenue.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? onOpenChange(v) : resetAndClose())}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouvelle commande (saisie manuelle)</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="source">Source</Label>
            <select
              id="source"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-transparent px-2.5 text-sm"
            >
              {SOURCE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="clientName">Nom du client</Label>
              <Input
                id="clientName"
                required
                minLength={2}
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="clientPhone">Téléphone</Label>
              <Input
                id="clientPhone"
                required
                minLength={8}
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="clientAddress">Adresse (optionnel)</Label>
            <Input
              id="clientAddress"
              value={clientAddress}
              onChange={(e) => setClientAddress(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="paidNow"
              type="checkbox"
              checked={paymentStatus === "paid"}
              onChange={(e) => setPaymentStatus(e.target.checked ? "paid" : "unpaid")}
            />
            <Label htmlFor="paidNow">Déjà payée</Label>
          </div>

          <div className="space-y-2 pt-2 border-t border-border">
            <Label>Produits</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Rechercher un produit..."
                className="pl-9"
              />
            </div>

            {isSearching && <p className="text-xs text-muted-foreground">Recherche...</p>}

            {searchResults.length > 0 && (
              <div className="border border-input rounded-md divide-y divide-border max-h-40 overflow-y-auto">
                {searchResults.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => addToCart(product)}
                    disabled={product.stock === 0}
                    className="w-full flex items-center justify-between px-3 py-2 text-left text-sm hover:bg-sage-pale/50 disabled:opacity-40"
                  >
                    <span className="truncate">{product.name}</span>
                    <span className="text-muted-foreground shrink-0 ml-2">
                      {formatFCFA(getEffectivePrice(product))} · stock {product.stock}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {cart.length > 0 && (
              <div className="space-y-2 pt-2">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-3 text-sm">
                    <span className="flex-1 truncate">{item.product.name}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product.id, -1)}
                      className="h-6 w-6 flex items-center justify-center rounded-full border border-input"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-5 text-center">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product.id, 1)}
                      disabled={item.quantity >= item.product.stock}
                      className="h-6 w-6 flex items-center justify-center rounded-full border border-input disabled:opacity-40"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                    <span className="w-24 text-right text-charcoal">
                      {formatFCFA(getEffectivePrice(item.product) * item.quantity)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex items-center justify-between pt-3 border-t border-border">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="font-display text-xl text-emerald-deep">{formatFCFA(total)}</span>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={resetAndClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Création..." : "Créer la commande"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}