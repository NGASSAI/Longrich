import { Link } from "react-router-dom";
import { Heart, Sparkles } from "lucide-react";
import { vibrate } from "@/lib/haptics";

const formatPrice = (value) =>
  new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(Number(value)) + " FCFA";

export function ProductCard({ product, onToggleLike, isLiked, className = "" }) {
  const mainImage = product.images?.find((img) => img.isMain) || product.images?.[0];
  const hasPromo = product.promoPrice && Number(product.promoPrice) < Number(product.price);

  const handleLikeClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    vibrate(hasPromo ? 10 : 8);
    onToggleLike?.(product);
  };

  return (
    <Link
      to={`/produits/${product.slug}`}
      onClick={() => vibrate(6)}
      className={`group block ${className}`}
    >
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-sage-pale">
        {mainImage ? (
          <img
            src={mainImage.path}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-muted-foreground">
            <Sparkles className="h-8 w-8" strokeWidth={1.25} />
          </div>
        )}

        {product.isFeatured && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-amber-gold text-charcoal text-xs font-medium tracking-wide">
            Coup de cœur
          </span>
        )}

        {onToggleLike && (
          <button
            type="button"
            onClick={handleLikeClick}
            aria-label={isLiked ? "Retirer le like" : "Aimer ce produit"}
            className="absolute top-3 right-3 h-9 w-9 flex items-center justify-center rounded-full bg-ivory-warm/90 backdrop-blur-sm text-charcoal hover:text-destructive transition-all active:scale-90 shadow-sm"
          >
            <Heart
              className={`h-4 w-4 transition-colors ${isLiked ? "fill-destructive text-destructive" : ""}`}
              strokeWidth={1.75}
            />
          </button>
        )}
      </div>

      <div className="mt-3 space-y-1">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">
          {product.category?.name}
        </p>
        <h3 className="font-display text-lg text-charcoal leading-snug line-clamp-1 group-hover:text-emerald-deep transition-colors">
          {product.name}
        </h3>
        <div className="flex items-baseline gap-2">
          {hasPromo ? (
            <>
              <span className="font-medium text-emerald-deep">{formatPrice(product.promoPrice)}</span>
              <span className="text-sm text-muted-foreground line-through">{formatPrice(product.price)}</span>
            </>
          ) : (
            <span className="font-medium text-emerald-deep">{formatPrice(product.price)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}