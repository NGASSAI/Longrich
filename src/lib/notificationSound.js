// Les navigateurs bloquent l'autoplay audio tant qu'aucune interaction
// utilisateur n'a eu lieu sur la page. On "deverrouille" le son au premier
// clic/tap n'importe ou sur l'app (voir unlockOnFirstInteraction), ce qui
// suffit ensuite pour jouer le son sur les evenements temps reel recus
// plus tard dans la session — y compris en PWA installee.
const audio = new Audio("/notification.mp3");
audio.preload = "auto";
let isUnlocked = false;

export const unlockOnFirstInteraction = () => {
  if (isUnlocked) return;
  const unlock = () => {
    audio
      .play()
      .then(() => {
        audio.pause();
        audio.currentTime = 0;
        isUnlocked = true;
      })
      .catch(() => {
        // Toujours bloque (rare) : on retentera a la prochaine interaction.
      });
    window.removeEventListener("click", unlock);
    window.removeEventListener("touchstart", unlock);
  };
  window.addEventListener("click", unlock, { once: true });
  window.addEventListener("touchstart", unlock, { once: true });
};

export const playNotificationSound = () => {
  // Rejoue depuis le debut meme si plusieurs notifications arrivent vite.
  audio.currentTime = 0;
  audio.play().catch(() => {
    // Echec silencieux (son non deverrouille, ou navigateur restrictif) :
    // la notification visuelle (badge, dropdown) reste fonctionnelle sans le son.
  });
};