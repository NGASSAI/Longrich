import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Package, MessageCircle, CheckCheck } from "lucide-react";
import { api } from "@/lib/api";
import { useSocketEvent } from "@/context/SocketContext";
import { playNotificationSound } from "@/lib/notificationSound";

import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { vibrate } from "@/lib/haptics";

const formatRelativeTime = (value) => {
  const diffMs = Date.now() - new Date(value).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "À l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH} h`;
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(new Date(value));
};

const NOTIF_CONFIG = {
  "order.new": { icon: Package, label: (d) => `Nouvelle commande ${d.orderNumber}` },
  "order.status_changed": { icon: Package, label: (d) => `Commande ${d.orderNumber} : ${d.status}` },
  "chat.new_message": { icon: MessageCircle, label: (d) => d.messagePreview || "Nouveau message" },
};

const getNotifPath = (notif, role) => {
  const isAdmin = role === "admin" || role === "super_admin";
  if (notif.type === "chat.new_message") return isAdmin ? "/admin/messagerie" : "/messagerie";
  if (notif.type.startsWith("order.")) return isAdmin ? "/admin/commandes" : "/mes-commandes";
  return isAdmin ? "/admin" : "/";
};
export function NotificationDropdown() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const loadNotifications = useCallback(async () => {
    try {
      const { data } = await api.get("/notifications", { params: { limit: 15 } });
      setNotifications(data.data.notifications);
      setUnreadCount(data.data.unreadCount);
    } catch {
      // Echec silencieux.
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Reception temps reel : ajoute en tete, joue le son, vibre.
  useSocketEvent("notification:new", (notification) => {
    setNotifications((prev) => [notification, ...prev].slice(0, 15));
    setUnreadCount((count) => count + 1);
    playNotificationSound();
    vibrate([15, 30, 15]);
  });

  const handleOpenChange = (open) => {
    vibrate(6);
    setIsOpen(open);
  };

  const handleNotificationClick = async (notif) => {
    vibrate(8);
    setIsOpen(false);

    if (!notif.readAt) {
      setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, readAt: new Date().toISOString() } : n)));
      setUnreadCount((count) => Math.max(0, count - 1));
      api.patch(`/notifications/${notif.id}/read`).catch(() => {});
    }

    navigate(getNotifPath(notif, role));
  };

  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    vibrate(8);
    setNotifications((prev) => prev.map((n) => ({ ...n, readAt: n.readAt || new Date().toISOString() })));
    setUnreadCount(0);
    try {
      await api.patch("/notifications/read-all");
    } catch {
      // Echec silencieux : au pire l'etat visuel reste "lu" jusqu'au prochain chargement.
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
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
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <p className="font-medium text-charcoal">Notifications</p>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="flex items-center gap-1 text-xs text-emerald-deep hover:text-amber-gold transition-colors"
            >
              <CheckCheck className="h-3.5 w-3.5" /> Tout marquer comme lu
            </button>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8 px-4">
              Aucune notification pour le moment.
            </p>
          ) : (
            notifications.map((notif) => {
              const config = NOTIF_CONFIG[notif.type] || { icon: Bell, label: () => "Notification" };
              const Icon = config.icon;
              return (
                <button
                  key={notif.id}
                  type="button"
                  onClick={() => handleNotificationClick(notif)}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-sage-pale/50 ${
                    !notif.readAt ? "bg-sage-pale/30" : ""
                  }`}
                >
                  <div className="h-8 w-8 rounded-full bg-sage-pale flex items-center justify-center shrink-0 text-emerald-deep">
                    <Icon className="h-4 w-4" strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-charcoal line-clamp-2">{config.label(notif.data)}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatRelativeTime(notif.createdAt)}</p>
                  </div>
                  {!notif.readAt && <span className="h-2 w-2 rounded-full bg-amber-gold shrink-0 mt-1.5" />}
                </button>
              );
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}