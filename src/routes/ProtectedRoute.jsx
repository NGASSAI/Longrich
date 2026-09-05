import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Usage :
//   <ProtectedRoute> ... </ProtectedRoute>                     -> connecte, n'importe quel role
//   <ProtectedRoute roles={["admin"]}> ... </ProtectedRoute>   -> connecte ET role autorise
export function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, isLoading, role } = useAuth();
  const location = useLocation();

  // Tant qu'on ne sait pas encore si une session existe (verification /auth/me
  // en cours au premier chargement), on n'affiche rien plutot que de rediriger
  // a tort vers /login.
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ivory-warm">
        <div className="h-8 w-8 rounded-full border-2 border-emerald-deep border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // On garde l'URL demandee pour y renvoyer l'utilisateur apres connexion.
    return <Navigate to="/connexion" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}