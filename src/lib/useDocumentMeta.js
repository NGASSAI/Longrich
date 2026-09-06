import { useEffect } from "react";

// Definit le titre de la page et sa meta description, sans dependance
// externe (react-helmet, etc.) — juste des manipulations directes du DOM,
// annulees proprement au demontage pour ne pas polluer la page suivante.
export function useDocumentMeta({ title, description }) {
  useEffect(() => {
    const previousTitle = document.title;
    if (title) {
      document.title = `${title} — Multinationale Longrich`;
    }

    let metaDescription = document.querySelector('meta[name="description"]');
    const previousDescription = metaDescription?.getAttribute("content");

    if (description) {
      if (!metaDescription) {
        metaDescription = document.createElement("meta");
        metaDescription.setAttribute("name", "description");
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute("content", description);
    }

    return () => {
      document.title = previousTitle;
      if (metaDescription && previousDescription !== undefined) {
        metaDescription.setAttribute("content", previousDescription || "");
      }
    };
  }, [title, description]);
}