import { useState } from "react";
import { KeyRound, Lock, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthTopBar } from "@/components/auth/AuthTopBar";
import { vibrate } from "@/lib/haptics";

const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: "Mot de passe actuel incorrect.",
};

export function SetSecretNamePage() {
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
      setError(ERROR_MESSAGES[code] || "Une erreur est survenue. Réessayez.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory-warm flex flex-col">
      <AuthTopBar />

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-500">
            <h1 className="font-display text-4xl text-emerald-deep mb-2">Mon profil</h1>
            <p className="text-muted-foreground mb-6">Connecté en tant que {user?.name}.</p>
          </div>

          <div
            className="mb-6 p-4 rounded-lg bg-sage-pale flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500"
            style={{ animationDelay: "80ms", animationFillMode: "backwards" }}
          >
            <ShieldCheck
              className={`h-5 w-5 shrink-0 ${user?.hasSecretName ? "text-emerald-deep" : "text-muted-foreground"}`}
            />
            <p className="text-sm">
              Nom secret :{" "}
              <span className="font-medium">{user?.hasSecretName ? "défini ✓" : "non défini"}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div
              className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-500"
              style={{ animationDelay: "130ms", animationFillMode: "backwards" }}
            >
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

            <div
              className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-500"
              style={{ animationDelay: "180ms", animationFillMode: "backwards" }}
            >
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
              <p role="alert" className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2 animate-in fade-in duration-200">
                {error}
              </p>
            )}
            {success && (
              <p className="text-sm text-emerald-deep bg-sage-pale rounded-md px-3 py-2 animate-in fade-in duration-200">
                Nom secret enregistré avec succès.
              </p>
            )}

            <div
              className="animate-in fade-in slide-in-from-bottom-2 duration-500"
              style={{ animationDelay: "230ms", animationFillMode: "backwards" }}
            >
              <Button
                type="submit"
                className="w-full transition-transform active:scale-[0.98] shadow-sm hover:shadow-md"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}