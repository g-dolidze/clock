import { SetupPage } from "./pages/SetupPage";
import { DashboardPage } from "./pages/DashboardPage";
import { useSessionStore } from "./store/sessionStore";

export default function App() {
  const restaurantId = useSessionStore((s) => s.restaurantId);
  return restaurantId ? <DashboardPage /> : <SetupPage />;
}
