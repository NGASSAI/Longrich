import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";
import { vibrate } from "@/lib/haptics";

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem("installPromptDismissed") === "true"
  );

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  useEffect(() => {
    const handleInstalled = () => {
      setVisible(false);
      setDeferredPrompt(null);
    };
    window.addEventListener("appinstalled", handleInstalled);
    return () => window.removeEventListener("appinstalled", handleInstalled);
  }, []);

  if (!visible || dismissed || !deferredPrompt) return null;

  const handleInstall = async () => {
    vibrate(8);
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setVisible(false);
  };

  const handleDismiss = () => {
    vibrate(6);
    sessionStorage.setItem("installPromptDismissed", "true");
    setDismissed(true);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-50 bg-emerald-deep text-ivory-warm rounded-2xl shadow-lg p-4 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="h-10 w-10 rounded-xl bg-ivory-warm/10 flex items-center justify-center shrink-0">
        <Download className="h-5 w-5" strokeWidth={1.75} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium mb-0.5">Installer Longrich</p>
        <p className="text-xs text-ivory-warm/70 mb-3">
          Ajoutez l'application à votre écran d'accueil pour un accès rapide.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleInstall}
            className="px-3 py-1.5 rounded-full bg-amber-gold text-charcoal text-xs font-medium"
          >
            Installer
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="px-3 py-1.5 rounded-full text-ivory-warm/70 text-xs"
          >
            Plus tard
          </button>
        </div>
      </div>
      <button
        type="button"
        onClick={handleDismiss}
        className="shrink-0 text-ivory-warm/50 hover:text-ivory-warm"
        aria-label="Fermer"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}