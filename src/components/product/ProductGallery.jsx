import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, X, Expand } from "lucide-react";
import { vibrate } from "@/lib/haptics";

export function ProductGallery({ images = [], productName }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const touchStartX = useRef(null);
  const thumbRefs = useRef([]);

  const hasImages = images.length > 0;
  const activeImage = hasImages ? images[activeIndex] : null;

  const goTo = useCallback(
    (index) => {
      if (!hasImages) return;
      const clamped = (index + images.length) % images.length;
      setActiveIndex(clamped);
    },
    [hasImages, images.length]
  );

  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  // Navigation clavier (fleches) — active en permanence sur la galerie inline,
  // et dans la lightbox (avec Echap pour fermer en plus).
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") {
        vibrate(6);
        goNext();
      } else if (e.key === "ArrowLeft") {
        vibrate(6);
        goPrev();
      } else if (e.key === "Escape" && isLightboxOpen) {
        setIsLightboxOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goPrev, isLightboxOpen]);

  // Garde la miniature active visible dans la bande de defilement horizontal.
  useEffect(() => {
    thumbRefs.current[activeIndex]?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [activeIndex]);

  // Swipe tactile mobile — seuil de 40px pour eviter les faux positifs sur un simple tap.
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(deltaX) > 40) {
      vibrate(8);
      deltaX > 0 ? goPrev() : goNext();
    }
    touchStartX.current = null;
  };

  const openLightbox = () => {
    vibrate(10);
    setIsLightboxOpen(true);
  };

  if (!hasImages) {
    return (
      <div className="aspect-square rounded-2xl bg-sage-pale flex items-center justify-center text-muted-foreground">
        Aucune image disponible
      </div>
    );
  }

  return (
    <div>
      {/* Image principale */}
      <div
        className="relative aspect-square rounded-2xl overflow-hidden bg-sage-pale group cursor-zoom-in"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={openLightbox}
        role="button"
        tabIndex={0}
        aria-label={`Agrandir l'image ${activeIndex + 1} sur ${images.length} de ${productName}`}
        onKeyDown={(e) => e.key === "Enter" && openLightbox()}
      >
        <img
          key={activeImage.id}
          src={activeImage.path}
          alt={`${productName} — image ${activeIndex + 1}`}
          className="h-full w-full object-cover motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300"
        />

        <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/10 transition-colors duration-200 flex items-center justify-center">
          <Expand className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 drop-shadow" />
        </div>

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                vibrate(6);
                goPrev();
              }}
              aria-label="Image précédente"
              className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 flex items-center justify-center rounded-full bg-ivory-warm/90 text-charcoal opacity-0 group-hover:opacity-100 transition-opacity focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-amber-gold"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                vibrate(6);
                goNext();
              }}
              aria-label="Image suivante"
              className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 flex items-center justify-center rounded-full bg-ivory-warm/90 text-charcoal opacity-0 group-hover:opacity-100 transition-opacity focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-amber-gold"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Bande de miniatures — defilement horizontal mobile, wrap sur desktop */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto sm:overflow-visible sm:flex-wrap pb-1 -mx-1 px-1">
          {images.map((img, i) => (
            <button
              key={img.id}
              ref={(el) => (thumbRefs.current[i] = el)}
              type="button"
              onClick={() => {
                vibrate(6);
                setActiveIndex(i);
              }}
              aria-label={`Voir l'image ${i + 1}`}
              aria-current={i === activeIndex}
              className={`shrink-0 h-16 w-16 rounded-lg overflow-hidden border-2 transition-colors focus-visible:outline-2 focus-visible:outline-amber-gold ${
                i === activeIndex ? "border-emerald-deep" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <img src={img.path} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox plein ecran */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-charcoal/95 flex items-center justify-center motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          role="dialog"
          aria-modal="true"
          aria-label={`Galerie d'images de ${productName}`}
        >
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            aria-label="Fermer la galerie"
            className="absolute top-4 right-4 h-11 w-11 flex items-center justify-center rounded-full bg-ivory-warm/10 text-ivory-warm hover:bg-ivory-warm/20 transition-colors focus-visible:outline-2 focus-visible:outline-amber-gold"
          >
            <X className="h-6 w-6" />
          </button>

          <img
            key={activeImage.id}
            src={activeImage.path}
            alt={`${productName} — image ${activeIndex + 1} sur ${images.length}`}
            className="max-h-[85vh] max-w-[90vw] object-contain motion-safe:animate-in motion-safe:zoom-in-95 motion-safe:duration-200"
          />

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={goPrev}
                aria-label="Image précédente"
                className="absolute left-4 top-1/2 -translate-y-1/2 h-11 w-11 flex items-center justify-center rounded-full bg-ivory-warm/10 text-ivory-warm hover:bg-ivory-warm/20 transition-colors focus-visible:outline-2 focus-visible:outline-amber-gold"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label="Image suivante"
                className="absolute right-4 top-1/2 -translate-y-1/2 h-11 w-11 flex items-center justify-center rounded-full bg-ivory-warm/10 text-ivory-warm hover:bg-ivory-warm/20 transition-colors focus-visible:outline-2 focus-visible:outline-amber-gold"
              >
                <ChevronRight className="h-6 w-6" />
              </button>

              <span className="absolute bottom-6 left-1/2 -translate-x-1/2 text-ivory-warm/70 text-sm">
                {activeIndex + 1} / {images.length}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}