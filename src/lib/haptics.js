// Retour haptique leger sur les interactions cle (tap bouton, changement
// d'etape...). Fonctionne sur Android/Chrome (PWA installee ou navigateur),
// pas supporte sur iOS Safari — l'appel echoue silencieusement dans ce cas,
// jamais bloquant pour l'action elle-meme.
export const vibrate = (pattern = 10) => {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Vibration non supportee ou refusee par le navigateur : on ignore.
    }
  }
};