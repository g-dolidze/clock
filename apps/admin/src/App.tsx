import { SetupPage } from "./pages/SetupPage";
import { DashboardPage } from "./pages/DashboardPage";
import { useSessionStore } from "./store/sessionStore";

export default function App() {
  const adminKey = useSessionStore((s) => s.adminKey);
  return adminKey ? <DashboardPage /> : <SetupPage />;
}
