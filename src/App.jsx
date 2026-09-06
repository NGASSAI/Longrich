import { useEffect, useState } from "react";
import { AppRoutes } from "./routes/AppRoutes";
import { unlockOnFirstInteraction } from "./lib/notificationSound";
import { OfflineScreen } from "./components/layout/OfflineScreen";
import { InstallPrompt } from "./components/layout/InstallPrompt";

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    unlockOnFirstInteraction();
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOnline) {
    return <OfflineScreen />;
  }

    return (
    <>
      <AppRoutes />
      <InstallPrompt />
    </>
  );
}

export default App;