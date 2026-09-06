import { useState } from "react";
import { User, Mail, Phone, KeyRound, Lock, ShieldCheck, BadgeCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthTopBar } from "@/components/auth/AuthTopBar";
import { vibrate } from "@/lib/haptics";

const ROLE_LABELS = {
  client: "Client",
  admin: "Administrateur",
  super_admin: "Super Administrateur",
};

const SECRET_ERROR_MESSAGES = {
  INVALID_CREDENTIALS: "Mot de passe actuel incorrect.",
};

function ProfileInfoForm() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    vibrate(10);
    setIsSubmitting(true);

    try {
      await api.patch("/auth/me", { name, phone: phone || null });
      await refreshUser();
      vibrate([10, 40, 10]);
      setSuccess(true);
    } catch {
      vibrate(30);
      setError("Une erreur est survenue. Réessayez.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="name">Nom complet</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="name"
            required
            minLength={2}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="pl-9 focus-visible:ring-amber-gold"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input id="email" value={user?.email || ""} disabled className="pl-9 opacity-60" />
        </div>
        <p className="text-xs text-muted-foreground">L'email ne peut pas être modifié.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Téléphone</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+242 ..."
            className="pl-9 focus-visible:ring-amber-gold"
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
          {error}
        </p>
      )}
      {success && (
        <p className="text-sm text-emerald-deep bg-sage-pale rounded-md px-3 py-2">
          Profil mis à jour avec succès.
        </p>
      )}

      <Button type="submit" disabled={isSubmitting} className="transition-transform active:scale-[0.98]">
        {isSubmitting ? "Enregistrement..." : "Enregistrer les modifications"}
      </Button>
    </form>
  );
}

function SecretNameForm() {
  const { user, refreshUser } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [secretName, setSecretName] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    vibrate(10);
    setIsSubmitting(true);

    try {
      await api.patch("/auth/me/secret-name", { currentPassword, secretName });
      await refreshUser();
      vibrate([10, 40, 10]);
      setSuccess(true);
      setCurrentPassword("");
      setSecretName("");
    } catch (err) {
      vibrate(30);
      const code = err.response?.data?.code;
      setError(SECRET_ERROR_MESSAGES[code] || "Une erreur est survenue. Réessayez.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-5 p-4 rounded-lg bg-sage-pale">
        <ShieldCheck
          className={`h-5 w-5 shrink-0 ${user?.hasSecretName ? "text-emerald-deep" : "text-muted-foreground"}`}
        />
        <p className="text-sm">
          Nom secret :{" "}
          <span className="font-medium">{user?.hasSecretName ? "défini ✓" : "non défini"}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="currentPassword">Mot de passe actuel</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="currentPassword"
              type="password"
              autoComplete="current-password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="pl-9 focus-visible:ring-amber-gold"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="secretName">Nouveau nom secret</Label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="secretName"
              required
              minLength={4}
              value={secretName}
              onChange={(e) => setSecretName(e.target.value)}
              placeholder="Une phrase ou un mot que vous seul connaissez"
              className="pl-9 focus-visible:ring-amber-gold"
            />
          </div>
        </div>

        {error && (
          <p role="alert" className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
            {error}
          </p>
        )}
        {success && (
          <p className="text-sm text-emerald-deep bg-sage-pale rounded-md px-3 py-2">
            Nom secret enregistré avec succès.
          </p>
        )}

        <Button type="submit" disabled={isSubmitting} className="transition-transform active:scale-[0.98]">
          {isSubmitting ? "Enregistrement..." : "Enregistrer le nom secret"}
        </Button>
      </form>
    </div>
  );
}

export function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-ivory-warm flex flex-col">
      <AuthTopBar />

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-10">
        {/* En-tete profil */}
              <div className="flex items-center gap-4 mb-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="h-16 w-16 rounded-full bg-emerald-deep flex items-center justify-center text-ivory-warm font-display text-2xl shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-3xl text-emerald-deep truncate">{user?.name}</h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <BadgeCheck className="h-4 w-4 text-amber-gold" strokeWidth={1.75} />
                {ROLE_LABELS[user?.role] || user?.role}
              </p>
              {user?.createdAt && (
                <p className="text-sm text-muted-foreground">
                  Membre depuis{" "}
                  {new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(
                    new Date(user.createdAt)
                  )}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-10">
          <section
            className="animate-in fade-in slide-in-from-bottom-2 duration-500"
            style={{ animationDelay: "80ms", animationFillMode: "backwards" }}
          >
            <h2 className="font-display text-xl text-emerald-deep mb-4">Informations personnelles</h2>
            <ProfileInfoForm />
          </section>

          <section
            className="pt-10 border-t border-border animate-in fade-in slide-in-from-bottom-2 duration-500"
            style={{ animationDelay: "150ms", animationFillMode: "backwards" }}
          >
            <h2 className="font-display text-xl text-emerald-deep mb-2">Sécurité</h2>
            <p className="text-sm text-muted-foreground mb-5">
              Le nom secret permet de réinitialiser votre mot de passe sans email.
            </p>
            <SecretNameForm />
          </section>
        </div>
      </div>
    </div>
  );
}