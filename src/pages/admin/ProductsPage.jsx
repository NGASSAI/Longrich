import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, X, Search } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  promoPrice: "",
  stock: "0",
  categoryId: "",
  isFeatured: false,
  isActive: true,
};

function formatFCFA(amount) {
  return new Intl.NumberFormat("fr-FR").format(Number(amount)) + " FCFA";
}

export function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFiles, setImageFiles] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    api
      .get("/categories")
      .then(({ data }) => setCategories(data.data.categories))
      .catch(() => {});
  }, []);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get("/products", {
        params: { search: search || undefined, page, limit: 12 },
      });
      setProducts(data.data.products);
      setPagination(data.data.pagination);
    } catch {
      setProducts([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const openCreateDialog = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setImageFiles([]);
    setFormError("");
    setDialogOpen(true);
  };

  const openEditDialog = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description || "",
      price: String(product.price),
      promoPrice: product.promoPrice ? String(product.promoPrice) : "",
      stock: String(product.stock),
      categoryId: product.categoryId,
      isFeatured: product.isFeatured,
      isActive: product.isActive,
    });
    setImageFiles([]);
    setFormError("");
    setDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setFormError("");
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("description", form.description);
      fd.append("price", form.price);
      if (form.promoPrice) fd.append("promoPrice", form.promoPrice);
      fd.append("stock", form.stock);
      fd.append("categoryId", form.categoryId);
      fd.append("isFeatured", String(form.isFeatured));
      fd.append("isActive", String(form.isActive));
      imageFiles.forEach((file) => fd.append("images", file));

      if (editingId) {
        await api.patch(`/products/${editingId}`, fd);
      } else {
        await api.post("/products", fd);
      }
      setDialogOpen(false);
      loadProducts();
    } catch (err) {
      setFormError(
        err.response?.data?.message || "Une erreur est survenue, verifie les champs."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Supprimer "${product.name}" definitivement ?`)) return;
    try {
      await api.delete(`/products/${product.id}`);
      loadProducts();
    } catch {
      window.alert("Suppression impossible pour le moment.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl text-emerald-deep mb-1">Produits</h1>
          <p className="text-muted-foreground">
            {pagination ? `${pagination.total} produit${pagination.total > 1 ? "s" : ""}` : "Chargement..."}
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4" /> Nouveau produit
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          placeholder="Rechercher un produit..."
          className="pl-9"
        />
      </div>

      <div className="bg-white rounded-2xl border border-sage-pale overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 rounded-lg bg-sage-pale animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="text-muted-foreground py-12 text-center">Aucun produit trouve.</p>
        ) : (
          <div className="divide-y divide-sage-pale">
            {products.map((product) => (
              <div key={product.id} className="flex items-center gap-4 px-5 py-3">
                <div className="h-12 w-12 rounded-lg bg-sage-pale shrink-0 overflow-hidden">
                  {product.images?.[0] && (
                    <img
                      src={product.images[0].path}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-charcoal truncate">{product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFCFA(product.price)} · Stock : {product.stock}
                    {!product.isActive && " · Inactif"}
                  </p>
                </div>
                <Button variant="ghost" size="icon-sm" onClick={() => openEditDialog(product)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(product)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Modifier le produit" : "Nouveau produit"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nom</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="price">Prix (FCFA)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="1"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="promoPrice">Prix promo (optionnel)</Label>
                <Input
                  id="promoPrice"
                  type="number"
                  min="0"
                  step="1"
                  value={form.promoPrice}
                  onChange={(e) => setForm({ ...form, promoPrice: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  step="1"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="categoryId">Categorie</Label>
                <select
                  id="categoryId"
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  required
                  className="h-9 w-full rounded-md border border-input bg-transparent px-2.5 text-sm"
                >
                  <option value="" disabled>
                    Choisir...
                  </option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm text-charcoal">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                />
                Coup de coeur
              </label>
              <label className="flex items-center gap-2 text-sm text-charcoal">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
                Actif (visible sur le site)
              </label>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="images">
                Images {editingId && "(laisser vide pour garder les images actuelles)"}
              </Label>
              <Input
                id="images"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
              />
              {imageFiles.length > 0 && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  {imageFiles.length} fichier(s) selectionne(s)
                  <button
                    type="button"
                    onClick={() => setImageFiles([])}
                    className="text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </p>
              )}
            </div>

            {formError && <p className="text-sm text-destructive">{formError}</p>}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}