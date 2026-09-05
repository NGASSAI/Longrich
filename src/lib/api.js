import axios from "axios";

// URL du backend definie via une variable d'environnement Vite (voir .env.example
// a creer juste apres) : permet de changer facilement entre local et Render
// sans toucher au code.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export const api = axios.create({
  baseURL: API_URL,
  // Indispensable : le backend authentifie via un cookie httpOnly (JWT),
  // sans ce flag le navigateur n'envoie jamais le cookie vers l'API.
  withCredentials: true,
});

// Intercepteur de reponse : centralise la gestion des erreurs 401 (session
// expiree/invalide) pour eviter de la re-ecrire dans chaque appel API.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const code = error.response?.data?.code;

    if (status === 401 && (code === "INVALID_TOKEN" || code === "UNAUTHORIZED")) {
      // La gestion concrete (redirection login, reset du contexte auth) sera
      // branchee depuis AuthContext une fois qu'il existera, via un event
      // plutot qu'un import direct ici (pour eviter une dependance circulaire).
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }

    return Promise.reject(error);
  }
);