import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  MessageCircle,
  BarChart3,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { vibrate } from "@/lib/haptics";

const NAV_ITEMS = [
  { label: "Tableau de bord", to: "/admin", icon: LayoutDashboard, end: true },
  { label: "Produits", to: "/admin/produits", icon: Package },
  { label: "Commandes", to: "/admin/commandes", icon: ShoppingCart },
  { label: "Clients", to: "/admin/clients", icon: Users },
  { label: "Messagerie", to: "/admin/messagerie", icon: MessageCircle },
  { label: "Statistiques", to: "/admin/statistiques", icon: BarChart3 },
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
      <div className="px-5 py-6">
        <span className="font-display text-xl text-ivory-warm">Longrich</span>
        <p className="text-xs text-ivory-warm/50 mt-0.5">Espace administration</p>
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
                  ? "bg-amber-gold text-charcoal font-medium"
                  : "text-ivory-warm/70 hover:bg-ivory-warm/10 hover:text-ivory-warm"
              }`
            }
          >
            <item.icon className="h-4.5 w-4.5" strokeWidth={1.75} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-4 pt-2 border-t border-ivory-warm/10">
        <div className="flex items-center gap-3 px-3 py-2.5">
          <div className="h-8 w-8 rounded-full bg-amber-gold flex items-center justify-center text-charcoal text-sm font-medium shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm text-ivory-warm truncate">{user?.name}</p>
            <p className="text-xs text-ivory-warm/50">Administrateur</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-ivory-warm/70 hover:bg-ivory-warm/10 hover:text-ivory-warm transition-colors mt-1"
        >
          <LogOut className="h-4.5 w-4.5" strokeWidth={1.75} />
          Déconnexion
        </button>
      </div>
    </div>
  );
}

export function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-ivory-warm flex">
      {/* Sidebar desktop */}
      <aside className="hidden lg:block w-64 shrink-0 bg-emerald-deep">
        <div className="sticky top-0 h-screen">
          <SidebarContent />
        </div>
      </aside>

      {/* Sidebar mobile (drawer) */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-charcoal/50 animate-in fade-in duration-200"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 bg-emerald-deep animate-in slide-in-from-left duration-300">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute top-5 right-4 h-8 w-8 flex items-center justify-center rounded-full text-ivory-warm/70 hover:bg-ivory-warm/10"
              aria-label="Fermer le menu"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Contenu */}
      <div className="flex-1 min-w-0">
        <header className="lg:hidden sticky top-0 z-30 h-14 bg-emerald-deep flex items-center px-4">
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
          <span className="font-display text-lg text-ivory-warm ml-2">Longrich Admin</span>
          <div className="ml-auto">
  <NotificationDropdown />
</div>
        </header>
<div className="hidden lg:flex items-center justify-end h-14 px-6 border-b border-sage-pale">
  <NotificationDropdown />
</div>
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}