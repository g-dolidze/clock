import { Link, NavLink } from "react-router-dom";
import { ShoppingBag, User } from "lucide-react";
import { Button } from "@ontime/web-shared";
import { useAuthStore } from "../store/authStore";
import { useCartStore } from "../store/cartStore";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium transition-colors ${isActive ? "text-white" : "text-white/60 hover:text-white"}`;

export function NavBar() {
  const customer = useAuthStore((s) => s.customer);
  const cartCount = useCartStore((s) => s.lines.reduce((n, l) => n + l.quantity, 0));

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#211714]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="text-lg font-black tracking-tight text-white">
          ontime<span className="text-[#e3572c]">.ge</span>
        </Link>

        <nav className="hidden items-center gap-6 sm:flex">
          <NavLink to="/" end className={navLinkClass}>
            Discover
          </NavLink>
          <NavLink to="/account" className={navLinkClass}>
            Orders &amp; reservations
          </NavLink>
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/checkout" className="relative">
            <Button variant="ghost" className="!px-3">
              <ShoppingBag className="h-4 w-4" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#e3572c] text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Button>
          </Link>
          <Link to={customer ? "/account" : "/login"}>
            <Button variant="secondary" className="!px-3">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">{customer ? customer.name : "Sign in"}</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
