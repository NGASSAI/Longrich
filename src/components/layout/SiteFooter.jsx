import { Mail } from "lucide-react";
import { vibrate } from "@/lib/haptics";

const CONTACT_LINKS = [
  {
    name: "WhatsApp",
    href: "https://wa.me/242067189888",
    external: true,
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
        <path d="M17.6 6.32A7.85 7.85 0 0 0 12.05 4a7.94 7.94 0 0 0-6.9 11.9L4 20l4.2-1.1a7.93 7.93 0 0 0 3.85 1h.01A7.94 7.94 0 0 0 20 12a7.86 7.86 0 0 0-2.4-5.68Zm-5.55 12.2h-.01a6.6 6.6 0 0 1-3.36-.92l-.24-.14-2.5.65.67-2.44-.16-.25a6.62 6.62 0 0 1 10.3-8.2 6.55 6.55 0 0 1 1.96 4.68 6.63 6.63 0 0 1-6.66 6.62Zm3.63-4.96c-.2-.1-1.17-.58-1.35-.64-.18-.07-.31-.1-.45.1-.13.19-.51.64-.62.77-.11.13-.23.15-.42.05a5.4 5.4 0 0 1-1.6-.99 6 6 0 0 1-1.1-1.37c-.12-.2 0-.3.09-.4.09-.1.2-.24.3-.36.1-.12.13-.2.2-.34.06-.13.03-.25-.02-.35-.05-.1-.45-1.08-.61-1.48-.16-.39-.33-.33-.45-.34h-.38c-.13 0-.35.05-.53.24-.18.19-.7.68-.7 1.66 0 .98.72 1.92.82 2.06.1.13 1.4 2.15 3.4 3 .48.2.85.33 1.14.42.48.15.91.13 1.26.08.38-.06 1.17-.48 1.34-.94.16-.46.16-.86.11-.94-.05-.09-.18-.14-.38-.24Z" />
      </svg>
    ),
  },
  {
    name: "Email",
    href: "mailto:okabamariam@05gmail.com",
    external: false,
    icon: <Mail className="h-5 w-5" strokeWidth={1.75} />,
  },
  {
    name: "TikTok",
    href: "https://www.tiktok.com/@mariamokaba?_r=1&_t=ZS-99Mur2d77Rs",
    external: true,
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
        <path d="M16.6 5.82c-.97-.86-1.55-2.1-1.55-3.47h-3.18v13.44a3.14 3.14 0 1 1-2.23-3.01v-3.25a6.3 6.3 0 1 0 5.41 6.24V9.5a6.86 6.86 0 0 0 4.03 1.3V7.63a3.98 3.98 0 0 1-2.48-1.81Z" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/share/1UAYKTudEW/",
    external: true,
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
        <path d="M13.5 22v-8.4h2.82l.42-3.27H13.5V8.24c0-.95.26-1.6 1.63-1.6h1.74V3.7A23.4 23.4 0 0 0 14.35 3.5c-2.5 0-4.22 1.53-4.22 4.33v2.5H7.3v3.27h2.83V22h3.37Z" />
      </svg>
    ),
  },
];

export function SiteFooter() {
  const handleClick = () => vibrate(8);

  return (
    <footer className="bg-emerald-deep text-ivory-warm mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col items-center gap-8">
        <span className="font-display text-2xl tracking-tight">Longrich</span>

        {/* Boutons icone uniquement, jamais les coordonnees en clair (cahier des charges section 6) */}
        <div className="flex items-center gap-4">
          {CONTACT_LINKS.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={handleClick}
              {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              aria-label={link.name}
              className="h-11 w-11 flex items-center justify-center rounded-full bg-ivory-warm/10 text-ivory-warm hover:bg-amber-gold hover:text-emerald-deep transition-all duration-200 hover:-translate-y-0.5 active:scale-90"
            >
              {link.icon}
            </a>
          ))}
        </div>

        <p className="text-sm text-ivory-warm/50 text-center">
          © {new Date().getFullYear()}dds Multinationale Longrich — Cosmétiques &amp; bien-être
        </p>
      </div>
    </footer>
  );
}