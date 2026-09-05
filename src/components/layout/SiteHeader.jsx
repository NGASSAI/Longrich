import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Bell, User, LogOut, MessageCircle, Package } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { vibrate } from "@/lib/haptics";

const NAV_LINKS = [
  { label: "Accueil", to: "/" },
  { label: "Catalogue", to: "/produits" },
];

export function SiteHeader() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [siteName, setSiteName] = useState("Multinationale Longrich");
  const [siteLogo, setSiteLogo] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    api
      .get("/settings")
      .then(({ data }) => {
        setSiteName(data.data.settings.site_name);
        setSiteLogo(data.data.settings.site_logo);
      })
      .catch(() => {
        // Echec silencieux : le nom par defaut deja affiche suffit, pas
        // besoin de bloquer l'affichage du header pour cette information.
      });
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const { data } = await api.get("/notifications", { params: { limit: 1 } });
      setUnreadCount(data.data.unreadCount);
    } catch {
      // Echec silencieux, on retentera au prochain intervalle.
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchUnreadCount();
    // Sondage temporaire toutes les 30s en attendant le contexte Socket.IO
    // (prochaine etape) qui remplacera ce polling par du vrai temps reel.
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  const handleLogout = async () => {
    vibrate(10);
    await logout();
    navigate("/");
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-30 bg-ivory-warm/90 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link
          to="/"
          onClick={() => vibrate(6)}
          className="flex items-center gap-2 font-display text-xl text-emerald-deep shrink-0"
        >
          {siteLogo ? (
            <img src={siteLogo} alt={siteName} className="h-8 w-8 rounded-full object-cover" />
          ) : null}
          <span className="truncate max-w-[160px] sm:max-w-none">{siteName}</span>
        </Link>

        {/* Navigation desktop */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm font-medium text-charcoal hover:text-emerald-deep transition-colors relative after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-amber-gold after:transition-all hover:after:w-full"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions desktop */}
        <div className="hidden md:flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Link
                to="/messagerie"
                onClick={() => vibrate(6)}
                className="h-9 w-9 flex items-center justify-center rounded-full text-charcoal hover:bg-sage-pale transition-colors"
                aria-label="Messagerie"
              >
                <MessageCircle className="h-5 w-5" strokeWidth={1.75} />
              </Link>

              <Link
                to="/mes-commandes"
                onClick={() => vibrate(6)}
                className="h-9 w-9 flex items-center justify-center rounded-full text-charcoal hover:bg-sage-pale transition-colors"
                aria-label="Mes commandes"
              >
                <Package className="h-5 w-5" strokeWidth={1.75} />
              </Link>

              <button
                type="button"
                onClick={() => vibrate(6)}
                className="relative h-9 w-9 flex items-center justify-center rounded-full text-charcoal hover:bg-sage-pale transition-colors"
                aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} non lues)` : ""}`}
              >
                <Bell className="h-5 w-5" strokeWidth={1.75} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-amber-gold text-[10px] font-semibold text-charcoal flex items-center justify-center animate-in zoom-in duration-200">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              <Link
                to="/mon-compte"
                onClick={() => vibrate(6)}
                className="h-9 w-9 flex items-center justify-center rounded-full text-charcoal hover:bg-sage-pale transition-colors"
                aria-label="Mon compte"
              >
                <User className="h-5 w-5" strokeWidth={1.75} />
              </Link>

              <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Déconnexion">
                <LogOut className="h-5 w-5" strokeWidth={1.75} />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild onClick={() => vibrate(6)}>
                <Link to="/connexion">Connexion</Link>
              </Button>
              <Button asChild onClick={() => vibrate(6)}>
                <Link to="/inscription">Créer un compte</Link>
              </Button>
            </>
          )}
        </div>

        {/* Bouton menu mobile */}
        <button
          type="button"
          onClick={() => {
            vibrate(8);
            setMobileOpen((v) => !v);
          }}
          className="md:hidden h-9 w-9 flex items-center justify-center rounded-full text-emerald-deep active:bg-sage-pale transition-colors"
          aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Menu mobile */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-ivory-warm animate-in slide-in-from-top-2 fade-in duration-200">
          <nav className="flex flex-col px-4 py-4 gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={closeMobile}
                className="py-3 text-base font-medium text-charcoal active:text-emerald-deep transition-colors"
              >
                {link.label}
              </Link>
            ))}

            <div className="h-px bg-border my-2" />

            {isAuthenticated ? (
              <>
                <Link to="/messagerie" onClick={closeMobile} className="py-3 flex items-center gap-3 text-base text-charcoal">
                  <MessageCircle className="h-5 w-5" strokeWidth={1.75} /> Messagerie
                </Link>
                <Link to="/mes-commandes" onClick={closeMobile} className="py-3 flex items-center gap-3 text-base text-charcoal">
                  <Package className="h-5 w-5" strokeWidth={1.75} /> Mes commandes
                </Link>
                <Link to="/mon-compte" onClick={closeMobile} className="py-3 flex items-center gap-3 text-base text-charcoal">
                  <User className="h-5 w-5" strokeWidth={1.75} />
                  Mon compte
                  {unreadCount > 0 && (
                    <span className="h-5 min-w-5 px-1 rounded-full bg-amber-gold text-xs font-semibold text-charcoal flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    closeMobile();
                    handleLogout();
                  }}
                  className="py-3 flex items-center gap-3 text-base text-destructive text-left"
                >
                  <LogOut className="h-5 w-5" strokeWidth={1.75} /> Déconnexion
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Button variant="outline" asChild onClick={closeMobile}>
                  <Link to="/connexion">Connexion</Link>
                </Button>
                <Button asChild onClick={closeMobile}>
                  <Link to="/inscription">Créer un compte</Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}