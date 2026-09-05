import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, User, Mail, Phone, Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthTopBar } from "@/components/auth/AuthTopBar";
import { vibrate } from "@/lib/haptics";

const ERROR_MESSAGES = {
  EMAIL_TAKEN: "Un compte existe déjà avec cet email.",
  VALIDATION_ERROR: "Vérifiez les informations saisies.",
};

function OrganicPattern() {
  return (
    <svg
      className="absolute inset-0 h-full w-full opacity-[0.07]"
      viewBox="0 0 400 600"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M60 100 Q 110 40, 170 80 Q 210 110, 180 160 Q 140 200, 80 170 Q 30 140, 60 100Z"
        fill="var(--color-amber-gold)"
      />
      <path
        d="M300 460 Q 360 420, 370 490 Q 375 550, 310 540 Q 260 530, 270 480 Q 280 440, 300 460Z"
        fill="var(--color-amber-gold)"
      />
      <path
        d="M230 260 Q 280 230, 290 290 Q 295 340, 245 330 Q 205 320, 210 280 Q 215 255, 230 260Z"
        fill="var(--color-amber-gold)"
      />
    </svg>
  );
}

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    vibrate(10);

    if (form.password !== form.confirmPassword) {
      vibrate(30);
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (form.password.length < 8) {
      vibrate(30);
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        password: form.password,
      });
      vibrate([10, 40, 10]);
      navigate("/", { replace: true });
    } catch (err) {
      vibrate(30);
      const code = err.response?.data?.code;
      setError(ERROR_MESSAGES[code] || "Une erreur est survenue. Réessayez.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePassword = () => {
    vibrate(8);
    setShowPassword((v) => !v);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-ivory-warm">
      {/* Panneau visuel — desktop uniquement */}
      <div className="hidden lg:flex relative flex-col justify-between bg-emerald-deep text-ivory-warm p-12 overflow-hidden">
        <OrganicPattern />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 30%, rgba(200,155,60,0.18) 0%, transparent 45%), radial-gradient(circle at 75% 80%, rgba(200,155,60,0.14) 0%, transparent 40%)",
          }}
        />
        <span className="relative font-display text-2xl tracking-tight">Longrich</span>
        <div className="relative animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="h-px w-12 bg-amber-gold mb-6" />
          <p className="font-display text-5xl leading-[1.1] mb-5">
            Rejoignez
            <br />
            l'aventure.
          </p>
          <p className="text-ivory-warm/70 max-w-sm leading-relaxed">
            Créez votre compte pour suivre vos commandes et échanger directement avec notre équipe.
          </p>
        </div>
        <span className="relative text-sm text-ivory-warm/50 tracking-wide uppercase">
          Cosmétiques &amp; bien-être
        </span>
      </div>

      {/* Colonne formulaire (avec barre mobile en haut) */}
      <div className="flex flex-col">
        <AuthTopBar />

        <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-sm">
            <div className="animate-in fade-in slide-in-from-bottom-3 duration-500">
              <h1 className="font-display text-4xl text-emerald-deep mb-2">Créer un compte</h1>
              <p className="text-muted-foreground mb-8">Rejoignez Multinationale Longrich.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div
                className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-500"
                style={{ animationDelay: "60ms", animationFillMode: "backwards" }}
              >
                <Label htmlFor="name">Nom complet</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    required
                    minLength={2}
                    value={form.name}
                    onChange={updateField("name")}
                    placeholder="Votre nom"
                    className="pl-9 focus-visible:ring-amber-gold"
                  />
                </div>
              </div>

              <div
                className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-500"
                style={{ animationDelay: "110ms", animationFillMode: "backwards" }}
              >
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={form.email}
                    onChange={updateField("email")}
                    placeholder="vous@exemple.com"
                    className="pl-9 focus-visible:ring-amber-gold"
                  />
                </div>
              </div>

              <div
                className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-500"
                style={{ animationDelay: "160ms", animationFillMode: "backwards" }}
              >
                <Label htmlFor="phone">Téléphone (optionnel)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={updateField("phone")}
                    placeholder="+242 ..."
                    className="pl-9 focus-visible:ring-amber-gold"
                  />
                </div>
              </div>

              <div
                className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-500"
                style={{ animationDelay: "210ms", animationFillMode: "backwards" }}
              >
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={form.password}
                    onChange={updateField("password")}
                    placeholder="8 caractères minimum"
                    className="pl-9 pr-10 focus-visible:ring-amber-gold"
                  />
                  <button
                    type="button"
                    onClick={togglePassword}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-emerald-deep transition-colors active:scale-90 duration-150"
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div
                className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-500"
                style={{ animationDelay: "260ms", animationFillMode: "backwards" }}
              >
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={form.confirmPassword}
                    onChange={updateField("confirmPassword")}
                    placeholder="••••••••"
                    className="pl-9 focus-visible:ring-amber-gold"
                  />
                </div>
              </div>

              {error && (
                <p
                  role="alert"
                  className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2 animate-in fade-in duration-200"
                >
                  {error}
                </p>
              )}

              <p
                className="text-xs text-muted-foreground animate-in fade-in duration-500"
                style={{ animationDelay: "300ms", animationFillMode: "backwards" }}
              >
                Après inscription, pensez à définir un « nom secret » dans votre profil : il vous
                permettra de réinitialiser votre mot de passe sans email.
              </p>

              <div
                className="animate-in fade-in slide-in-from-bottom-2 duration-500"
                style={{ animationDelay: "320ms", animationFillMode: "backwards" }}
              >
                <Button
                  type="submit"
                  className="w-full transition-transform active:scale-[0.98] shadow-sm hover:shadow-md"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Création..." : "Créer mon compte"}
                </Button>
              </div>
            </form>

            <div
              className="mt-6 text-center text-sm animate-in fade-in duration-500"
              style={{ animationDelay: "380ms", animationFillMode: "backwards" }}
            >
              <span className="text-muted-foreground">Déjà un compte ? </span>
              <Link
                to="/connexion"
                className="text-emerald-deep hover:text-amber-gold transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-amber-gold after:transition-all hover:after:w-full"
              >
                Se connecter
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}