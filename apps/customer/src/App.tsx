import type { ReactNode } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { NavBar } from "./components/NavBar";
import { useCustomerRealtime } from "./hooks/useRealtime";
import { useAuthStore } from "./store/authStore";
import { DiscoveryPage } from "./pages/DiscoveryPage";
import { RestaurantDetailPage } from "./pages/RestaurantDetailPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { OrderStatusPage } from "./pages/OrderStatusPage";
import { ReservationStatusPage } from "./pages/ReservationStatusPage";
import { AccountPage } from "./pages/AccountPage";
import { LoginPage } from "./pages/LoginPage";
import { NotFoundPage } from "./pages/NotFoundPage";

function Layout() {
  useCustomerRealtime();
  return (
    <div className="min-h-screen bg-[#211714]">
      <NavBar />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}

function RequireAuth({ children }: { children: ReactNode }) {
  const customer = useAuthStore((s) => s.customer);
  if (!customer) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<DiscoveryPage />} />
        <Route path="restaurants/:id" element={<RestaurantDetailPage />} />
        <Route
          path="checkout"
          element={
            <RequireAuth>
              <CheckoutPage />
            </RequireAuth>
          }
        />
        <Route
          path="orders/:id"
          element={
            <RequireAuth>
              <OrderStatusPage />
            </RequireAuth>
          }
        />
        <Route
          path="reservations/:id"
          element={
            <RequireAuth>
              <ReservationStatusPage />
            </RequireAuth>
          }
        />
        <Route
          path="account"
          element={
            <RequireAuth>
              <AccountPage />
            </RequireAuth>
          }
        />
        <Route path="login" element={<LoginPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
