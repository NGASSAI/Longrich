import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterPage } from "../pages/auth/RegisterPage";
import { ForgotPasswordPage } from "../pages/auth/ForgotPasswordPage";
import { SetSecretNamePage } from "../pages/account/SetSecretNamePage";

// Pages "placeholder" temporaires : chaque route reelle du cahier des charges
// est deja posee ici avec le bon niveau de protection, mais le contenu sera
// remplace ecran par ecran dans les prochaines etapes.
const Placeholder = ({ label }) => (
  <div className="min-h-screen flex items-center justify-center bg-ivory-warm">
    <p className="font-display text-2xl text-emerald-deep">{label}</p>
  </div>
);

export function AppRoutes() {
  return (
    <Routes>
      {/* --- Public / Client --- */}
      <Route path="/" element={<Placeholder label="Accueil / Catalogue" />} />
      <Route path="/produits/:slug" element={<Placeholder label="Fiche produit" />} />
      <Route path="/connexion" element={<LoginPage />} />
      <Route path="/inscription" element={<RegisterPage />} />
      <Route path="/mot-de-passe-oublie" element={<ForgotPasswordPage />} />
      {/* --- Client connecte --- */}
      <Route
  path="/mon-compte"
  element={
    <ProtectedRoute>
      <SetSecretNamePage />
    </ProtectedRoute>
  }
/>
      <Route
        path="/mes-commandes"
        element={
          <ProtectedRoute>
            <Placeholder label="Mes commandes" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/messagerie"
        element={
          <ProtectedRoute>
            <Placeholder label="Chat avec l'admin" />
          </ProtectedRoute>
        }
      />

      {/* --- Admin --- */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["admin"]}>
            <Placeholder label="Dashboard Admin" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/produits"
        element={
          <ProtectedRoute roles={["admin"]}>
            <Placeholder label="Gestion produits" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/commandes"
        element={
          <ProtectedRoute roles={["admin"]}>
            <Placeholder label="Gestion commandes" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/clients"
        element={
          <ProtectedRoute roles={["admin"]}>
            <Placeholder label="Gestion clients" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/messagerie"
        element={
          <ProtectedRoute roles={["admin"]}>
            <Placeholder label="Conversations clients" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/statistiques"
        element={
          <ProtectedRoute roles={["admin"]}>
            <Placeholder label="Statistiques" />
          </ProtectedRoute>
        }
      />

      {/* --- Super Admin (interface totalement separee) --- */}
      <Route
        path="/super-admin"
        element={
          <ProtectedRoute roles={["super_admin"]}>
            <Placeholder label="Monitoring systeme" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/comptes-admin"
        element={
          <ProtectedRoute roles={["super_admin"]}>
            <Placeholder label="Gestion des comptes admin" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/parametres"
        element={
          <ProtectedRoute roles={["super_admin"]}>
            <Placeholder label="Parametres du site" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/logs"
        element={
          <ProtectedRoute roles={["super_admin"]}>
            <Placeholder label="Logs d'activite" />
          </ProtectedRoute>
        }
      />

      {/* --- 404 --- */}
      <Route path="*" element={<Placeholder label="Page introuvable (404)" />} />
    </Routes>
  );
}