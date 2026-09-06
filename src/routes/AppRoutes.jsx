import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { SiteLayout } from "../layouts/SiteLayout";
import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterPage } from "../pages/auth/RegisterPage";
import { ForgotPasswordPage } from "../pages/auth/ForgotPasswordPage";
import { ProfilePage } from "../pages/account/ProfilePage";
import { HomePage } from "../pages/public/HomePage";
import { CatalogPage } from "../pages/public/CatalogPage";
import { ProductDetailPage } from "../pages/public/ProductDetailPage";
import { MyOrdersPage } from "../pages/account/MyOrdersPage";
import { MessagingPage } from "../pages/chat/MessagingPage";
import { AdminLayout } from "../layouts/AdminLayout";
import { DashboardPage } from "../pages/admin/DashboardPage";
import { ProductsPage } from "../pages/admin/ProductsPage";
import { OrdersPage } from "../pages/admin/OrdersPage";

const Placeholder = ({ label }) => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <p className="font-display text-2xl text-emerald-deep">{label}</p>
  </div>
);

export function AppRoutes() {
  return (
    <Routes>
      {/* --- Pages pleine page, sans header/footer --- */}
      <Route path="/connexion" element={<LoginPage />} />
      <Route path="/inscription" element={<RegisterPage />} />
      <Route path="/mot-de-passe-oublie" element={<ForgotPasswordPage />} />

      {/* --- Public / Client, avec header + footer (SiteLayout) --- */}
      <Route element={<SiteLayout />}>
        <Route path="/" element={<HomePage />} />
       <Route path="/produits" element={<CatalogPage />} />
        <Route path="/produits/:slug" element={<ProductDetailPage />} />
        <Route
  path="/mon-compte"
  element={
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  }
/>
        <Route
  path="/mes-commandes"
  element={
    <ProtectedRoute>
      <MyOrdersPage />
    </ProtectedRoute>
  }
/>
       <Route
  path="/messagerie"
  element={
    <ProtectedRoute>
      <MessagingPage />
    </ProtectedRoute>
  }
/>

        <Route path="*" element={<Placeholder label="Page introuvable (404)" />} />
      </Route>

        {/* --- Admin --- */}
      <Route
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin" element={<DashboardPage />} />
       <Route path="/admin/produits" element={<ProductsPage />} />
        <Route path="/admin/commandes" element={<OrdersPage />} />
        <Route path="/admin/clients" element={<Placeholder label="Gestion clients" />} />
        <Route path="/admin/messagerie" element={<Placeholder label="Conversations clients" />} />
        <Route path="/admin/statistiques" element={<Placeholder label="Statistiques" />} />
      </Route>
     
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
    </Routes>
  );
}