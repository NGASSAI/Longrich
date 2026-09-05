import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import { vibrate } from "@/lib/haptics";

export function AuthTopBar() {
  const navigate = useNavigate();

  const handleBack = () => {
    vibrate(8);
    navigate(-1);
  };

  const handleLogoClick = () => {
    vibrate(8);
    navigate("/");
  };

  return (
    <div className="lg:hidden flex items-center justify-between px-4 py-4 bg-ivory-warm sticky top-0 z-10">
      <button
        type="button"
        onClick={handleBack}
        aria-label="Retour"
        className="h-9 w-9 flex items-center justify-center rounded-full text-emerald-deep active:bg-sage-pale transition-colors active:scale-90 duration-150"
      >
        <ArrowLeft className="h-5 w-5" strokeWidth={2} />
      </button>

      <button
        type="button"
        onClick={handleLogoClick}
        className="font-display text-lg text-emerald-deep flex items-center gap-1.5 focus:outline-none"
      >
        <Sparkles className="h-4 w-4 text-amber-gold" strokeWidth={1.5} />
        Longrich
      </button>

      <div className="h-9 w-9" />
    </div>
  );
}