import { useState, useEffect, useRef } from "react";
import { Image as ImageIcon, Check } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { vibrate } from "@/lib/haptics";

function SiteNameForm({ currentName, onUpdated }) {
  const [siteName, setSiteName] = useState(currentName);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => setSiteName(currentName), [currentName]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    vibrate(10);
    setIsSubmitting(true);
    setSuccess(false);
    try {
      const { data } = await api.patch("/settings/site-name", { siteName });
      vibrate([10, 40, 10]);
      onUpdated(data.data.settings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      vibrate(30);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="siteName">Nom du site</Label>
        <Input
          id="siteName"
          required
          minLength={2}
          value={siteName}
          onChange={(e) => setSiteName(e.target.value)}
        />
        <p className="text-xs text-ivory-warm/40">
          Affiché dans l'en-tête et le titre des pages du site.
        </p>
      </div>

      <Button type="submit" disabled={isSubmitting || siteName === currentName} className="gap-2">
        {success && <Check className="h-4 w-4" />}
        {isSubmitting ? "Enregistrement..." : success ? "Enregistré" : "Enregistrer"}
      </Button>
    </form>
  );
}

function SiteLogoForm({ currentLogo, onUpdated }) {
  const [previewUrl, setPreviewUrl] = useState(currentLogo);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => setPreviewUrl(currentLogo), [currentLogo]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    vibrate(6);
    setSelectedFile(file);
    // Apercu avant envoi (exige section 2 du cahier des charges) : on utilise
    // une URL locale temporaire, jamais uploadee tant que "Enregistrer" n'est
    // pas confirme.
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    vibrate(10);
    setIsSubmitting(true);
    setSuccess(false);

    const formData = new FormData();
    formData.append("logo", selectedFile);

    try {
      const { data } = await api.patch("/settings/site-logo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      vibrate([10, 40, 10]);
      onUpdated(data.data.settings);
      setSelectedFile(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      vibrate(30);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-5">
        <div className="h-20 w-20 rounded-2xl bg-ivory-warm/5 border border-ivory-warm/10 flex items-center justify-center overflow-hidden shrink-0">
          {previewUrl ? (
            <img src={previewUrl} alt="Logo du site" className="h-full w-full object-cover" />
          ) : (
            <ImageIcon className="h-6 w-6 text-ivory-warm/30" strokeWidth={1.5} />
          )}
        </div>

        <div>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              vibrate(6);
              fileInputRef.current?.click();
            }}
          >
            Choisir une image
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
            className="hidden"
          />
          <p className="text-xs text-ivory-warm/40 mt-2">JPEG, PNG, WEBP ou GIF, 5 Mo max.</p>
        </div>
      </div>

      {selectedFile && (
        <Button type="submit" disabled={isSubmitting} className="gap-2">
          {success && <Check className="h-4 w-4" />}
          {isSubmitting ? "Envoi en cours..." : success ? "Enregistré" : "Enregistrer le logo"}
        </Button>
      )}
    </form>
  );
}

export function SiteSettingsPage() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    api
      .get("/settings")
      .then(({ data }) => setSettings(data.data.settings))
      .catch(() => {});
  }, []);

  if (!settings) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-card rounded animate-pulse" />
        <div className="h-32 bg-card rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-3xl text-ivory-warm mb-8">Paramètres du site</h1>

      <section className="rounded-2xl border border-border bg-card p-5 mb-6">
        <h2 className="text-sm font-medium text-ivory-warm/90 mb-4">Identité</h2>
        <SiteNameForm
          currentName={settings.site_name}
          onUpdated={(newSettings) => setSettings(newSettings)}
        />
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-sm font-medium text-ivory-warm/90 mb-4">Logo</h2>
        <SiteLogoForm
          currentLogo={settings.site_logo}
          onUpdated={(newSettings) => setSettings(newSettings)}
        />
      </section>
    </div>
  );
}