import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Leaf, Truck, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/ProductCard";
import { vibrate } from "@/lib/haptics";
import { useDocumentMeta } from "@/lib/useDocumentMeta";
const VALUES = [
  { icon: Leaf, label: "Ingrédients naturels", desc: "Formules pensées pour votre bien-être" },
  { icon: Truck, label: "Paiement à la livraison", desc: "Réglez à réception, en toute confiance" },
  { icon: ShieldCheck, label: "Qualité garantie", desc: "Des produits sélectionnés avec soin" },
];

export function HomePage() {
  const { isAuthenticated } = useAuth();
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [likedIds, setLikedIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useDocumentMeta({
    title: "Accueil",
    description: "Découvrez notre catalogue de cosmétiques et produits de bien-être naturels. Paiement à la livraison.",
  });
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [categoriesRes, productsRes] = await Promise.all([
          api.get("/categories"),
          api.get("/products", { params: { featured: "true", limit: 8 } }),
        ]);
               if (cancelled) return;
        const products = productsRes.data.data.products;
        setCategories(categoriesRes.data.data.categories.slice(0, 4));
        setFeaturedProducts(products);
        // Initialise l'etat des coeurs depuis isLikedByMe renvoye par le backend,
        // au lieu de demarrer toujours vide.
        setLikedIds(new Set(products.filter((p) => p.isLikedByMe).map((p) => p.id)));
      } catch {
        // Echec silencieux : la page reste utilisable meme sans donnees
        // (sections simplement vides), pas d'ecran d'erreur bloquant sur l'accueil.
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

    const handleToggleLike = async (product) => {
    if (!isAuthenticated) return;

    // Route toggle unique cote backend : un seul appel POST bascule l'etat
    // et renvoie directement le resultat, pas besoin de deviner avant coup.
    try {
      const { data } = await api.post(`/interactions/products/${product.id}/like`);
      setLikedIds((prev) => {
        const next = new Set(prev);
        data.data.liked ? next.add(product.id) : next.delete(product.id);
        return next;
      });
    } catch {
      // Echec silencieux : l'etat du coeur reste inchange, l'utilisateur peut reessayer.
    }
  };

  return (
    <div>
      {/* Hero — mise en page asymetrique, pas de bandeau centre generique */}
      <section className="relative overflow-hidden bg-emerald-deep text-ivory-warm">
        <svg
          className="absolute inset-0 h-full w-full opacity-[0.06]"
          viewBox="0 0 800 500"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M100 150 Q 180 60, 280 120 Q 340 160, 290 230 Q 220 290, 130 250 Q 60 210, 100 150Z"
            fill="var(--color-amber-gold)"
          />
          <path
            d="M600 320 Q 690 270, 710 370 Q 720 450, 620 430 Q 550 415, 560 350 Q 570 310, 600 320Z"
            fill="var(--color-amber-gold)"
          />
        </svg>

        <div className="relative max-w-6xl mx-auto px-6 py-20 lg:py-28 grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="h-px w-14 bg-amber-gold mb-6" />
            <h1 className="font-display text-5xl lg:text-6xl leading-[1.05] mb-6">
              Le naturel,
              <br />
              <span className="text-amber-gold">sublimé.</span>
            </h1>
            <p className="text-ivory-warm/70 text-lg max-w-md mb-8 leading-relaxed">
              Découvrez notre catalogue de cosmétiques et de produits de bien-être, pensés pour
              révéler votre éclat naturel.
            </p>
            <Button
              size="lg"
              className="bg-amber-gold text-charcoal hover:bg-amber-gold/90 shadow-lg"
              asChild
              onClick={() => vibrate(10)}
            >
              <Link to="/produits" className="flex items-center gap-2">
                Découvrir le catalogue <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div
            className="hidden lg:block animate-in fade-in slide-in-from-right-6 duration-700"
            style={{ animationDelay: "150ms", animationFillMode: "backwards" }}
          >
            <div className="aspect-[4/5] rounded-3xl bg-gradient-to-br from-sage-pale/20 to-amber-gold/10 border border-ivory-warm/10 backdrop-blur-sm" />
          </div>
        </div>
      </section>

      {/* Valeurs de marque */}
      <section className="max-w-6xl mx-auto px-6 py-14 grid sm:grid-cols-3 gap-8">
        {VALUES.map(({ icon: Icon, label, desc }, i) => (
          <div
            key={label}
            className="flex flex-col items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500"
            style={{ animationDelay: `${i * 90}ms`, animationFillMode: "backwards" }}
          >
            <div className="h-11 w-11 flex items-center justify-center rounded-full bg-sage-pale text-emerald-deep">
              <Icon className="h-5 w-5" strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-medium text-charcoal">{label}</p>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 py-10">
          <h2 className="font-display text-3xl text-emerald-deep mb-6">Nos univers</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categories.map((category, i) => (
              <Link
                key={category.id}
                to={`/produits?categorie=${category.slug}`}
                onClick={() => vibrate(6)}
                className="group relative aspect-square rounded-2xl overflow-hidden bg-sage-pale animate-in fade-in slide-in-from-bottom-2 duration-500"
                style={{ animationDelay: `${i * 70}ms`, animationFillMode: "backwards" }}
              >
                {category.image && (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-emerald-deep/30 group-hover:bg-emerald-deep/40 transition-colors" />
                <span className="absolute bottom-3 left-3 font-display text-white text-lg">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Produits mis en avant */}
      <section className="max-w-6xl mx-auto px-6 py-14">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-3xl text-emerald-deep">Coups de cœur</h2>
          <Link
            to="/produits"
            onClick={() => vibrate(6)}
            className="text-sm font-medium text-emerald-deep hover:text-amber-gold transition-colors flex items-center gap-1"
          >
            Tout voir <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-2xl bg-sage-pale animate-pulse" />
            ))}
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-8">
            {featuredProducts.map((product, i) => (
              <div
                key={product.id}
                className="animate-in fade-in slide-in-from-bottom-2 duration-500"
                style={{ animationDelay: `${Math.min(i * 60, 300)}ms`, animationFillMode: "backwards" }}
              >
                <ProductCard
                  product={product}
                  onToggleLike={isAuthenticated ? handleToggleLike : undefined}
                  isLiked={likedIds.has(product.id)}
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">Aucun produit mis en avant pour le moment.</p>
        )}
      </section>
    </div>
  );
}