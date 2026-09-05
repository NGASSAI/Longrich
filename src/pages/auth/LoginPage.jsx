import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthTopBar } from "@/components/auth/AuthTopBar";
import { vibrate } from "@/lib/haptics";

const getRedirectPath = (role, from) => {
  if (role === "super_admin") return "/super-admin";
  if (role === "admin") return "/admin";
  return from || "/";
};

const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: "Email ou mot de passe incorrect.",
  ACCOUNT_BLOCKED: "Ce compte a été bloqué. Contactez l'administrateur.",
  TOO_MANY_REQUESTS: "Trop de tentatives. Réessayez dans quelques minutes.",
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
        d="M40 80 Q 90 20, 150 60 Q 190 90, 160 140 Q 120 180, 60 150 Q 10 120, 40 80Z"
        fill="var(--color-amber-gold)"
      />
      <path
        d="M320 480 Q 380 440, 390 510 Q 395 570, 330 560 Q 280 550, 290 500 Q 300 460, 320 480Z"
        fill="var(--color-amber-gold)"
      />
      <path
        d="M250 200 Q 300 170, 310 230 Q 315 280, 265 270 Q 225 260, 230 220 Q 235 195, 250 200Z"
        fill="var(--color-amber-gold)"
      />
    </svg>
  );
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    vibrate(10);

    try {
      const user = await login(email, password);
      vibrate([10, 40, 10]);
      navigate(getRedirectPath(user.role, from), { replace: true });
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
              "radial-gradient(circle at 15% 15%, rgba(200,155,60,0.18) 0%, transparent 42%), radial-gradient(circle at 85% 85%, rgba(200,155,60,0.14) 0%, transparent 45%)",
          }}
        />
        <span className="relative font-display text-2xl tracking-tight flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-gold" strokeWidth={1.5} />
          Longrich
        </span>

        <div className="relative animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="h-px w-12 bg-amber-gold mb-6" />
          <p className="font-display text-5xl leading-[1.1] mb-5">
            Le naturel,
            <br />
            sublimé.
          </p>
          <p className="text-ivory-warm/70 max-w-sm leading-relaxed">
            Retrouvez votre catalogue, vos commandes et votre échange direct avec notre équipe.
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
              <h1 className="font-display text-4xl text-emerald-deep mb-2">Connexion</h1>
              <p className="text-muted-foreground mb-10">Accédez à votre espace Longrich.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div
                className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-500"
                style={{ animationDelay: "80ms", animationFillMode: "backwards" }}
              >
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@exemple.com"
                    className="pl-9 transition-shadow focus-visible:ring-amber-gold"
                  />
                </div>
              </div>

              <div
                className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-500"
                style={{ animationDelay: "150ms", animationFillMode: "backwards" }}
              >
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-9 pr-10 transition-shadow focus-visible:ring-amber-gold"
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

              {error && (
                <p
                  role="alert"
                  className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2 animate-in fade-in duration-200"
                >
                  {error}
                </p>
              )}

              <div
                className="animate-in fade-in slide-in-from-bottom-2 duration-500"
                style={{ animationDelay: "220ms", animationFillMode: "backwards" }}
              >
                <Button
                  type="submit"
                  className="w-full transition-transform active:scale-[0.98] shadow-sm hover:shadow-md"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Connexion..." : "Se connecter"}
                </Button>
              </div>
            </form>

            <div
              className="mt-6 flex items-center justify-between text-sm animate-in fade-in duration-500"
              style={{ animationDelay: "280ms", animationFillMode: "backwards" }}
            >
              <Link
                to="/mot-de-passe-oublie"
                className="text-emerald-deep hover:text-amber-gold transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-amber-gold after:transition-all hover:after:w-full"
              >
                Mot de passe oublié ?
              </Link>
              <Link
                to="/inscription"
                className="text-emerald-deep hover:text-amber-gold transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-amber-gold after:transition-all hover:after:w-full"
              >
                Créer un compte
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}