import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/ProductCard";
import { vibrate } from "@/lib/haptics";
import { useDocumentMeta } from "@/lib/useDocumentMeta";

const SORT_OPTIONS = [
  { value: "createdAt_desc", label: "Nouveautés" },
  { value: "price_asc", label: "Prix croissant" },
  { value: "price_desc", label: "Prix décroissant" },
];

export function CatalogPage() {
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [likedIds, setLikedIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(searchParams.get("recherche") || "");

  const activeCategory = searchParams.get("categorie") || "";
  const activeSort = searchParams.get("tri") || "createdAt_desc";
  const currentPage = Number(searchParams.get("page") || 1);
    useDocumentMeta({
    title: "Catalogue",
    description: "Parcourez tous nos produits de cosmétiques et bien-être : soins, beauté, naturel.",
  });

  // Categories chargees une seule fois pour les filtres.
  useEffect(() => {
    api
      .get("/categories")
      .then(({ data }) => setCategories(data.data.categories))
      .catch(() => {});
  }, []);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const [sortBy, order] = activeSort.split("_");
      const { data } = await api.get("/products", {
        params: {
          categoryId: activeCategory || undefined,
          search: searchParams.get("recherche") || undefined,
          sortBy: sortBy === "price" ? "price" : "createdAt",
          order: sortBy === "price" ? order : "desc",
          page: currentPage,
          limit: 12,
        },
      });
      setProducts(data.data.products);
      setPagination(data.data.pagination);
      setLikedIds(new Set(data.data.products.filter((p) => p.isLikedByMe).map((p) => p.id)));
    } catch {
      setProducts([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  }, [activeCategory, activeSort, currentPage, searchParams]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.delete("page"); // toute nouvelle recherche/filtre repart de la page 1
    setSearchParams(next);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    vibrate(8);
    updateParam("recherche", searchInput);
  };

  const goToPage = (page) => {
    vibrate(6);
    const next = new URLSearchParams(searchParams);
    next.set("page", String(page));
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToggleLike = async (product) => {
    if (!isAuthenticated) return;
    try {
      const { data } = await api.post(`/interactions/products/${product.id}/like`);
      setLikedIds((prev) => {
        const next = new Set(prev);
        data.data.liked ? next.add(product.id) : next.delete(product.id);
        return next;
      });
    } catch {
      // Echec silencieux.
    }
  };

  const hasActiveFilters = activeCategory || searchParams.get("recherche");

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <h1 className="font-display text-4xl text-emerald-deep mb-2">Le catalogue</h1>
        <p className="text-muted-foreground">
          {pagination ? `${pagination.total} produit${pagination.total > 1 ? "s" : ""}` : "Chargement..."}
        </p>
      </div>

      {/* Barre de recherche + tri */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Rechercher un produit..."
            className="pl-9 focus-visible:ring-amber-gold"
          />
        </form>

        <select
          value={activeSort}
          onChange={(e) => {
            vibrate(6);
            updateParam("tri", e.target.value);
          }}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-gold"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => {
            vibrate(8);
            setFiltersOpen((v) => !v);
          }}
          className="sm:hidden h-9 px-3 rounded-md border border-input flex items-center justify-center gap-2 text-sm text-charcoal"
        >
          <SlidersHorizontal className="h-4 w-4" /> Filtres
        </button>
      </div>

      <div className="grid lg:grid-cols-[220px_1fr] gap-8">
        {/* Filtres categories — sidebar desktop, panneau repliable mobile */}
        <aside className={`${filtersOpen ? "block" : "hidden"} lg:block`}>
          <div className="lg:sticky lg:top-24 space-y-1">
            <p className="text-sm font-medium text-charcoal mb-2">Catégories</p>
            <button
              type="button"
              onClick={() => {
                vibrate(6);
                updateParam("categorie", "");
              }}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                !activeCategory ? "bg-emerald-deep text-ivory-warm" : "text-charcoal hover:bg-sage-pale"
              }`}
            >
              Toutes
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  vibrate(6);
                  updateParam("categorie", cat.id);
                }}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  activeCategory === cat.id ? "bg-emerald-deep text-ivory-warm" : "text-charcoal hover:bg-sage-pale"
                }`}
              >
                {cat.name}
              </button>
            ))}

            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => {
                  vibrate(6);
                  setSearchInput("");
                  setSearchParams({});
                }}
                className="w-full flex items-center gap-1.5 text-left px-3 py-2 rounded-md text-sm text-destructive hover:bg-destructive/10 transition-colors mt-2"
              >
                <X className="h-3.5 w-3.5" /> Réinitialiser
              </button>
            )}
          </div>
        </aside>

        {/* Grille produits */}
        <div>
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-5 gap-y-8">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-2xl bg-sage-pale animate-pulse" />
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-5 gap-y-8">
                {products.map((product, i) => (
                  <div
                    key={product.id}
                    className="animate-in fade-in slide-in-from-bottom-2 duration-500"
                    style={{ animationDelay: `${Math.min(i * 50, 250)}ms`, animationFillMode: "backwards" }}
                  >
                    <ProductCard
                      product={product}
                      onToggleLike={isAuthenticated ? handleToggleLike : undefined}
                      isLiked={likedIds.has(product.id)}
                    />
                  </div>
                ))}
              </div>

              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => goToPage(page)}
                      className={`h-9 w-9 rounded-full text-sm transition-colors ${
                        page === currentPage
                          ? "bg-emerald-deep text-ivory-warm"
                          : "text-charcoal hover:bg-sage-pale"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="text-muted-foreground py-12 text-center">
              Aucun produit ne correspond à votre recherche.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}