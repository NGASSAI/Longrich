import { useEffect } from "react";
import { AppRoutes } from "./routes/AppRoutes";
import { unlockOnFirstInteraction } from "./lib/notificationSound";

function App() {
  useEffect(() => {
    unlockOnFirstInteraction();
  }, []);

  return <AppRoutes />;
}

export default App;