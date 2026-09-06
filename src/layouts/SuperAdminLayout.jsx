import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Activity,
  ShieldCheck,
  Settings,
  ScrollText,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { vibrate } from "@/lib/haptics";

const NAV_ITEMS = [
  { label: "Monitoring", to: "/super-admin", icon: Activity, end: true },
  { label: "Comptes admin", to: "/super-admin/comptes-admin", icon: ShieldCheck },
  { label: "Paramètres du site", to: "/super-admin/parametres", icon: Settings },
  { label: "Logs d'activité", to: "/super-admin/logs", icon: ScrollText },
];

function SidebarContent({ onNavigate }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    vibrate(10);
    await logout();
    navigate("/");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-6 flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-amber-gold" />
        <span className="font-display text-lg text-ivory-warm tracking-wide">
          Longrich <span className="text-amber-gold">Système</span>
        </span>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => {
              vibrate(6);
              onNavigate?.();
            }}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-amber-gold/15 text-amber-gold border border-amber-gold/30"
                  : "text-ivory-warm/60 hover:bg-ivory-warm/5 hover:text-ivory-warm"
              }`
            }
          >
            <item.icon className="h-4.5 w-4.5" strokeWidth={1.5} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-4 pt-2 border-t border-ivory-warm/10">
        <div className="flex items-center gap-3 px-3 py-2.5">
          <div className="h-8 w-8 rounded-full bg-amber-gold/20 border border-amber-gold/40 flex items-center justify-center text-amber-gold text-sm font-medium shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm text-ivory-warm truncate">{user?.name}</p>
            <p className="text-xs text-ivory-warm/40">Super Administrateur</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-ivory-warm/60 hover:bg-ivory-warm/5 hover:text-ivory-warm transition-colors mt-1"
        >
          <LogOut className="h-4.5 w-4.5" strokeWidth={1.5} />
          Déconnexion
        </button>
      </div>
    </div>
  );
}

// La classe "dark" applique la variante sombre definie dans index.css,
// reservee exclusivement a cet espace (jamais un mode sombre global site/admin).
export function SuperAdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="dark min-h-screen bg-background flex">
      <aside className="hidden lg:block w-64 shrink-0 bg-sidebar">
        <div className="sticky top-0 h-screen">
          <SidebarContent />
        </div>
      </aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/60 animate-in fade-in duration-200"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 bg-sidebar animate-in slide-in-from-left duration-300">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute top-5 right-4 h-8 w-8 flex items-center justify-center rounded-full text-ivory-warm/60 hover:bg-ivory-warm/10"
              aria-label="Fermer le menu"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <header className="lg:hidden sticky top-0 z-30 h-14 bg-sidebar flex items-center px-4">
          <button
            type="button"
            onClick={() => {
              vibrate(8);
              setMobileOpen(true);
            }}
            className="h-9 w-9 flex items-center justify-center rounded-full text-ivory-warm active:bg-ivory-warm/10 transition-colors"
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-display text-base text-ivory-warm ml-2">
            Longrich <span className="text-amber-gold">Système</span>
          </span>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}