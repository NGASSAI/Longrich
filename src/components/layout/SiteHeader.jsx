import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut, MessageCircle, Package } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
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
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    api
      .get("/settings")
      .then(({ data }) => {
        setSiteName(data.data.settings.site_name);
        setSiteLogo(data.data.settings.site_logo);
      })
      .catch(() => {});
  }, []);

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

              <NotificationDropdown />

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

        <div className="md:hidden flex items-center gap-1">
          {isAuthenticated && <NotificationDropdown />}
          <button
            type="button"
            onClick={() => {
              vibrate(8);
              setMobileOpen((v) => !v);
            }}
            className="h-9 w-9 flex items-center justify-center rounded-full text-emerald-deep active:bg-sage-pale transition-colors"
            aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

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
                  <User className="h-5 w-5" strokeWidth={1.75} /> Mon compte
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