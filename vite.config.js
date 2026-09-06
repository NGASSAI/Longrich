import path from "node:path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // On garde le manifest.json statique existant (deja reference dans
      // index.html) plutot que de laisser le plugin en generer un autre.
      manifest: false,
      registerType: 'autoUpdate',
      includeAssets: ['192x192.png', '512x512.png'],
      workbox: {
        // Precache l'app shell (JS/CSS/HTML buildes) pour qu'elle se charge
        // meme hors connexion ; les appels API restent en NetworkOnly par
        // defaut (pas de donnees perimees affichees comme si elles etaient a jour).
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})