import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
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
  image: "",
  parentId: "",
  isActive: true,
};

export function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get("/categories");
      setCategories(data.data.categories);
    } catch {
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const openCreateDialog = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setDialogOpen(true);
  };

  const openEditDialog = (cat) => {
    setEditingId(cat.id);
    setForm({
      name: cat.name,
      description: cat.description || "",
      image: cat.image || "",
      parentId: cat.parentId || "",
      isActive: cat.isActive,
    });
    setFormError("");
    setDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setFormError("");
    try {
      const payload = {
        name: form.name,
        description: form.description || undefined,
        image: form.image || undefined,
        parentId: form.parentId || null,
        isActive: form.isActive,
      };
      if (editingId) {
        await api.patch(`/categories/${editingId}`, payload);
      } else {
        await api.post("/categories", payload);
      }
      setDialogOpen(false);
      loadCategories();
    } catch (err) {
      setFormError(err.response?.data?.message || "Une erreur est survenue.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (cat) => {
    if (!window.confirm(`Supprimer la catégorie "${cat.name}" ?`)) return;
    try {
      await api.delete(`/categories/${cat.id}`);
      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
    } catch (err) {
      window.alert(err.response?.data?.message || "Suppression impossible.");
    }
  };

  const getParentName = (parentId) => categories.find((c) => c.id === parentId)?.name;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl text-emerald-deep mb-1">Catégories</h1>
          <p className="text-muted-foreground">
            {categories.length} catégorie{categories.length > 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4" /> Nouvelle catégorie
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-sage-pale overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 rounded-lg bg-sage-pale animate-pulse" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <p className="text-muted-foreground py-12 text-center">Aucune catégorie.</p>
        ) : (
          <div className="divide-y divide-sage-pale">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center gap-4 px-5 py-3">
                <div className="h-10 w-10 rounded-lg bg-sage-pale shrink-0 overflow-hidden flex items-center justify-center text-emerald-deep text-sm font-medium">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="h-full w-full object-cover" />
                  ) : (
                    cat.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-charcoal truncate">{cat.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {cat._count.products} produit{cat._count.products > 1 ? "s" : ""}
                    {cat.parentId && ` · Sous-catégorie de ${getParentName(cat.parentId) || "?"}`}
                    {!cat.isActive && " · Inactive"}
                  </p>
                </div>
                <Button variant="ghost" size="icon-sm" onClick={() => openEditDialog(cat)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(cat)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Modifier la catégorie" : "Nouvelle catégorie"}</DialogTitle>
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
              <Label htmlFor="description">Description (optionnel)</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="image">URL de l'image (optionnel)</Label>
              <Input
                id="image"
                type="url"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="parentId">Catégorie parente (optionnel)</Label>
              <select
                id="parentId"
                value={form.parentId}
                onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                className="h-9 w-full rounded-md border border-input bg-transparent px-2.5 text-sm"
              >
                <option value="">Aucune (catégorie principale)</option>
                {categories
                  .filter((c) => c.id !== editingId)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>

            <label className="flex items-center gap-2 text-sm text-charcoal">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
              Active (visible sur le site)
            </label>

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