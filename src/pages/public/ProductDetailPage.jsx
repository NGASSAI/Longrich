import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Heart, MessageCircle, ShoppingBag, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ProductGallery } from "@/components/product/ProductGallery";
import { OrderDialog } from "@/components/product/OrderDialog";
import { vibrate } from "@/lib/haptics";

const formatPrice = (value) =>
  new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(Number(value)) + " FCFA";

function CommentForm({ onSubmit, placeholder = "Partagez votre avis...", autoFocus = false, compact = false }) {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    vibrate(8);
    setIsSubmitting(true);
    try {
      await onSubmit(text.trim());
      setText("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={`flex-1 rounded-md border border-input bg-background px-3 text-sm text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-gold ${compact ? "h-8" : "h-10"}`}
      />
      <Button type="submit" size={compact ? "sm" : "default"} disabled={isSubmitting || !text.trim()}>
        Envoyer
      </Button>
    </form>
  );
}

function Comment({ comment, onReply }) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const { isAuthenticated } = useAuth();

  return (
    <div className="py-4 border-b border-border last:border-0">
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 rounded-full bg-sage-pale flex items-center justify-center shrink-0 text-emerald-deep font-medium text-sm">
          {comment.user.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-charcoal">{comment.user.name}</p>
          <p className="text-sm text-charcoal/80 mt-0.5">{comment.comment}</p>
          {isAuthenticated && (
            <button
              type="button"
              onClick={() => {
                vibrate(6);
                setShowReplyForm((v) => !v);
              }}
              className="text-xs text-muted-foreground hover:text-emerald-deep transition-colors mt-1"
            >
              Répondre
            </button>
          )}

          {showReplyForm && (
            <div className="mt-2">
              <CommentForm
                compact
                autoFocus
                placeholder="Votre réponse..."
                onSubmit={async (text) => {
                  await onReply(comment.id, text);
                  setShowReplyForm(false);
                }}
              />
            </div>
          )}

          {comment.replies?.length > 0 && (
            <div className="mt-3 pl-4 border-l-2 border-sage-pale space-y-3">
              {comment.replies.map((reply) => (
                <div key={reply.id} className="flex items-start gap-2">
                  <div className="h-7 w-7 rounded-full bg-sage-pale flex items-center justify-center shrink-0 text-emerald-deep font-medium text-xs">
                    {reply.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-charcoal">{reply.user.name}</p>
                    <p className="text-sm text-charcoal/80 mt-0.5">{reply.comment}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ProductDetailPage() {
  const { slug } = useParams();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);

  const loadProduct = useCallback(async () => {
    setIsLoading(true);
    setNotFound(false);
    try {
      const { data } = await api.get(`/products/${slug}`);
      setProduct(data.data.product);
    } catch (err) {
      if (err.response?.status === 404) setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  const handleToggleLike = async () => {
    if (!isAuthenticated || !product) return;
    vibrate(10);
    try {
      const { data } = await api.post(`/interactions/products/${product.id}/like`);
      setProduct((p) => ({ ...p, isLikedByMe: data.data.liked, likesCount: data.data.likesCount }));
    } catch {
      // Echec silencieux.
    }
  };

  const handleAddComment = async (text, parentId = null) => {
    const { data } = await api.post(`/interactions/products/${product.id}/comments`, {
      comment: text,
      parentId,
    });
    setProduct((p) => {
      if (parentId) {
        return {
          ...p,
          comments: p.comments.map((c) =>
            c.id === parentId ? { ...c, replies: [...(c.replies || []), data.data.comment] } : c
          ),
        };
      }
      return { ...p, comments: [data.data.comment, ...p.comments], commentsCount: p.commentsCount + 1 };
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid lg:grid-cols-2 gap-10">
        <div className="aspect-square rounded-2xl bg-sage-pale animate-pulse" />
        <div className="space-y-4">
          <div className="h-8 w-2/3 bg-sage-pale rounded animate-pulse" />
          <div className="h-5 w-1/3 bg-sage-pale rounded animate-pulse" />
          <div className="h-24 w-full bg-sage-pale rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-20 text-center">
        <p className="font-display text-2xl text-emerald-deep mb-4">Produit introuvable</p>
        <Button asChild>
          <Link to="/produits">Retour au catalogue</Link>
        </Button>
      </div>
    );
  }

  const hasPromo = product.promoPrice && Number(product.promoPrice) < Number(product.price);
  const outOfStock = product.stock <= 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-14">
        <div className="animate-in fade-in slide-in-from-left-3 duration-500">
          <ProductGallery images={product.images} productName={product.name} />
        </div>

        <div className="animate-in fade-in slide-in-from-right-3 duration-500">
          <Link
            to={`/produits?categorie=${product.category.id}`}
            className="text-xs text-muted-foreground uppercase tracking-wide hover:text-emerald-deep transition-colors"
          >
            {product.category.name}
          </Link>

          <div className="flex items-start justify-between gap-4 mt-2">
            <h1 className="font-display text-3xl sm:text-4xl text-emerald-deep leading-tight">
              {product.name}
            </h1>
            <button
              type="button"
              onClick={handleToggleLike}
              disabled={!isAuthenticated}
              aria-label={product.isLikedByMe ? "Retirer le like" : "Aimer ce produit"}
              className="shrink-0 h-11 w-11 flex items-center justify-center rounded-full bg-sage-pale hover:bg-sage-pale/70 transition-all active:scale-90 disabled:opacity-50"
            >
              <Heart
                className={`h-5 w-5 transition-colors ${product.isLikedByMe ? "fill-destructive text-destructive" : "text-charcoal"}`}
                strokeWidth={1.75}
              />
            </button>
          </div>

          <div className="flex items-baseline gap-3 mt-4">
            {hasPromo ? (
              <>
                <span className="font-display text-2xl text-emerald-deep">{formatPrice(product.promoPrice)}</span>
                <span className="text-muted-foreground line-through">{formatPrice(product.price)}</span>
              </>
            ) : (
              <span className="font-display text-2xl text-emerald-deep">{formatPrice(product.price)}</span>
            )}
          </div>

          <p className="text-charcoal/80 leading-relaxed mt-6">{product.description}</p>

          <div className="flex items-center gap-4 mt-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Heart className="h-4 w-4" strokeWidth={1.75} /> {product.likesCount}
            </span>
            <span className="flex items-center gap-1.5">
              <MessageCircle className="h-4 w-4" strokeWidth={1.75} /> {product.commentsCount}
            </span>
            <span className={outOfStock ? "text-destructive" : ""}>
              {outOfStock ? "Rupture de stock" : `${product.stock} en stock`}
            </span>
          </div>

          <Button
            size="lg"
            className="w-full mt-8 gap-2 shadow-sm hover:shadow-md transition-transform active:scale-[0.98]"
            disabled={outOfStock}
            onClick={() => {
              vibrate(10);
              setOrderDialogOpen(true);
            }}
          >
            <ShoppingBag className="h-5 w-5" />
            {outOfStock ? "Indisponible" : "Commander"}
          </Button>
        </div>
      </div>

      {/* Commentaires */}
      <div className="max-w-2xl mt-16 pt-10 border-t border-border">
        <h2 className="font-display text-2xl text-emerald-deep mb-6 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-gold" strokeWidth={1.5} />
          Avis ({product.commentsCount})
        </h2>

        {isAuthenticated ? (
          <div className="mb-6">
            <CommentForm onSubmit={(text) => handleAddComment(text)} />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground mb-6">
            <Link to="/connexion" className="text-emerald-deep hover:text-amber-gold transition-colors">
              Connectez-vous
            </Link>{" "}
            pour laisser un avis.
          </p>
        )}

        {product.comments.length > 0 ? (
          <div>
            {product.comments.map((comment) => (
              <Comment
                key={comment.id}
                comment={comment}
                onReply={(parentId, text) => handleAddComment(text, parentId)}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Aucun avis pour le moment.</p>
        )}
      </div>

      <OrderDialog product={product} open={orderDialogOpen} onOpenChange={setOrderDialogOpen} />
    </div>
  );
}