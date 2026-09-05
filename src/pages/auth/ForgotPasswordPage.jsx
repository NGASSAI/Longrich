import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, KeyRound, Lock, Eye, EyeOff, ArrowLeft as ArrowLeftIcon } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthTopBar } from "@/components/auth/AuthTopBar";
import { vibrate } from "@/lib/haptics";

const STEP_LABELS = ["Email", "Nom secret", "Nouveau mot de passe"];

const ERROR_MESSAGES = {
  INVALID_SECRET_NAME: "Email ou nom secret incorrect.",
  ACCOUNT_BLOCKED: "Ce compte a été bloqué. Contactez l'administrateur.",
  TOO_MANY_REQUESTS: "Trop de tentatives. Réessayez dans quelques minutes.",
  INVALID_RESET_SESSION: "Votre session de réinitialisation a expiré. Recommencez depuis le début.",
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
        d="M50 90 Q 100 30, 160 70 Q 200 100, 170 150 Q 130 190, 70 160 Q 20 130, 50 90Z"
        fill="var(--color-amber-gold)"
      />
      <path
        d="M310 470 Q 370 430, 380 500 Q 385 560, 320 550 Q 270 540, 280 490 Q 290 450, 310 470Z"
        fill="var(--color-amber-gold)"
      />
      <path
        d="M240 220 Q 290 190, 300 250 Q 305 300, 255 290 Q 215 280, 220 240 Q 225 215, 240 220Z"
        fill="var(--color-amber-gold)"
      />
    </svg>
  );
}

function StepIndicator({ current }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {STEP_LABELS.map((label, i) => {
        const step = i + 1;
        const isActive = step === current;
        const isDone = step < current;
        return (
          <div
            key={label}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${
              isActive || isDone ? "bg-emerald-deep" : "bg-sage-pale"
            }`}
          />
        );
      })}
    </div>
  );
}

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [secretName, setSecretName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const togglePassword = () => {
    vibrate(8);
    setShowPassword((v) => !v);
  };

  const handleStep1Submit = (e) => {
    e.preventDefault();
    if (!email) return;
    vibrate(10);
    setError(null);
    setStep(2);
  };

  const handleStep2Submit = async (e) => {
    e.preventDefault();
    setError(null);
    vibrate(10);
    setIsSubmitting(true);
    try {
      await api.post("/auth/password-reset/verify-secret-name", { email, secretName });
      vibrate([10, 30, 10]);
      setStep(3);
    } catch (err) {
      vibrate(30);
      const code = err.response?.data?.code;
      setError(ERROR_MESSAGES[code] || "Une erreur est survenue. Réessayez.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStep3Submit = async (e) => {
    e.preventDefault();
    setError(null);
    vibrate(10);

    if (newPassword !== confirmPassword) {
      vibrate(30);
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (newPassword.length < 8) {
      vibrate(30);
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/auth/password-reset/confirm", { newPassword });
      vibrate([10, 40, 10]);
      navigate("/connexion", { replace: true, state: { resetSuccess: true } });
    } catch (err) {
      vibrate(30);
      const code = err.response?.data?.code;
      setError(ERROR_MESSAGES[code] || "Une erreur est survenue. Réessayez.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBackToStep1 = () => {
    vibrate(8);
    setStep(1);
    setError(null);
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
              "radial-gradient(circle at 30% 25%, rgba(200,155,60,0.18) 0%, transparent 45%), radial-gradient(circle at 70% 75%, rgba(200,155,60,0.14) 0%, transparent 40%)",
          }}
        />
        <span className="relative font-display text-2xl tracking-tight">Longrich</span>
        <div className="relative animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="h-px w-12 bg-amber-gold mb-6" />
          <p className="font-display text-5xl leading-[1.1] mb-5">
            Un accès
            <br />
            retrouvé.
          </p>
          <p className="text-ivory-warm/70 max-w-sm leading-relaxed">
            Votre nom secret vous permet de réinitialiser votre mot de passe en toute sécurité,
            sans email.
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
            <StepIndicator current={step} />

            {step === 1 && (
              <div key="step1" className="animate-in fade-in slide-in-from-right-3 duration-400">
                <h1 className="font-display text-4xl text-emerald-deep mb-2">Mot de passe oublié</h1>
                <p className="text-muted-foreground mb-8">Indiquez l'email de votre compte.</p>

                <form onSubmit={handleStep1Submit} className="space-y-5">
                  <div className="space-y-2">
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
                        className="pl-9 focus-visible:ring-amber-gold"
                        autoFocus
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full transition-transform active:scale-[0.98] shadow-sm hover:shadow-md">
                    Continuer
                  </Button>
                </form>
              </div>
            )}

            {step === 2 && (
              <div key="step2" className="animate-in fade-in slide-in-from-right-3 duration-400">
                <h1 className="font-display text-4xl text-emerald-deep mb-2">Nom secret</h1>
                <p className="text-muted-foreground mb-8">
                  Saisissez le nom secret que vous avez défini dans votre profil.
                </p>

                <form onSubmit={handleStep2Submit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="secretName">Nom secret</Label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="secretName"
                        required
                        value={secretName}
                        onChange={(e) => setSecretName(e.target.value)}
                        placeholder="Votre nom secret"
                        className="pl-9 focus-visible:ring-amber-gold"
                        autoFocus
                      />
                    </div>
                  </div>

                  {error && (
                    <p role="alert" className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2 animate-in fade-in duration-200">
                      {error}
                    </p>
                  )}

                  <Button
                    type="submit"
                    className="w-full transition-transform active:scale-[0.98] shadow-sm hover:shadow-md"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Vérification..." : "Vérifier"}
                  </Button>

                  <button
                    type="button"
                    onClick={goBackToStep1}
                    className="w-full flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-emerald-deep transition-colors"
                  >
                    <ArrowLeftIcon className="h-3.5 w-3.5" />
                    Modifier l'email
                  </button>
                </form>
              </div>
            )}

            {step === 3 && (
              <div key="step3" className="animate-in fade-in slide-in-from-right-3 duration-400">
                <h1 className="font-display text-4xl text-emerald-deep mb-2">Nouveau mot de passe</h1>
                <p className="text-muted-foreground mb-8">
                  Choisissez un nouveau mot de passe. Vous avez 10 minutes pour le confirmer.
                </p>

                <form onSubmit={handleStep3Submit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="newPassword"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        required
                        minLength={8}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="8 caractères minimum"
                        className="pl-9 pr-10 focus-visible:ring-amber-gold"
                        autoFocus
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

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="pl-9 focus-visible:ring-amber-gold"
                      />
                    </div>
                  </div>

                  {error && (
                    <p role="alert" className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2 animate-in fade-in duration-200">
                      {error}
                    </p>
                  )}

                  <Button
                    type="submit"
                    className="w-full transition-transform active:scale-[0.98] shadow-sm hover:shadow-md"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
                  </Button>
                </form>
              </div>
            )}

            <div className="mt-6 text-center text-sm">
              <Link
                to="/connexion"
                className="text-emerald-deep hover:text-amber-gold transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-amber-gold after:transition-all hover:after:w-full"
              >
                ← Retour à la connexion
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}