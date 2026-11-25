import { ReactNode, useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { LogOut, Menu, Settings, UserRound, X, FileText } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../lib/api";
import { Avatar, Logo } from "./primitives";
import VerificationBanner from "../VerificationBanner";

interface NavItem {
  to: string;
  label: string;
}

const navFor = (role?: string, slug?: string): NavItem[] => {
  switch (role) {
    case "founder":
      return [
        { to: "/dashboard", label: "This week" },
        ...(slug ? [{ to: `/f/${slug}`, label: "My record" }] : []),
        { to: "/discover", label: "Founders" },
      ];
    case "investor":
      return [
        { to: "/discover", label: "Discover" },
        { to: "/watchlist", label: "Watchlist" },
      ];
    case "facilitator":
      return [
        { to: "/dashboard", label: "Cohort" },
        { to: "/discover", label: "Founders" },
      ];
    case "admin":
      return [
        { to: "/dashboard", label: "Overview" },
        { to: "/discover", label: "Founders" },
      ];
    default:
      return [{ to: "/discover", label: "Discover founders" }];
  }
};

const navClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "relative rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300",
    isActive
      ? "bg-lime/10 text-lime shadow-[inset_0_0_0_1px_rgb(163_230_53/0.2),0_0_15px_rgb(163_230_53/0.08)]"
      : "text-white/60 hover:bg-white/5 hover:text-white",
  );

export const TopNav = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const items = navFor(user?.role, user?.slug);

  useEffect(() => {
    setMenuOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menuOpen]);

  const signOut = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="no-print fixed inset-x-0 top-0 z-40 px-4 pt-4 md:px-8 md:pt-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div className="flex flex-1">
          <Logo to={user ? "/dashboard" : "/"} />
        </div>

        <nav className="glass hidden items-center gap-1 rounded-2xl p-1.5 shadow-2xl md:flex" aria-label="Primary">
          {items.map((item) => (
            <NavLink key={item.to} to={item.to} className={navClass} end>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex flex-1 items-center justify-end gap-2">
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                className="glass flex items-center gap-2 rounded-2xl py-1.5 pl-1.5 pr-3 transition hover:border-white/20"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <Avatar name={user.name} src={user.avatarUrl} size={28} />
                <span className="hidden max-w-[10rem] truncate text-sm text-ink sm:inline">{user.name.split(" ")[0]}</span>
              </button>
              {menuOpen && (
                <div role="menu" className="glass absolute right-0 mt-2 w-60 animate-fade overflow-hidden rounded-2xl p-1.5 shadow-2xl">
                  <div className="px-3 pb-2 pt-2">
                    <p className="truncate text-sm text-ink">{user.name}</p>
                    <p className="eyebrow mt-1 text-[10px]">{user.role}</p>
                  </div>
                  <div className="my-1 h-px bg-white/5" />
                  {user.role === "founder" && user.slug && (
                    <Link role="menuitem" to={`/f/${user.slug}`} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-subtle hover:bg-white/5 hover:text-ink">
                      <FileText className="h-4 w-4" /> My execution record
                    </Link>
                  )}
                  <Link role="menuitem" to="/settings" className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-subtle hover:bg-white/5 hover:text-ink">
                    <Settings className="h-4 w-4" /> Profile & settings
                  </Link>
                  <button role="menuitem" type="button" onClick={signOut} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-subtle hover:bg-white/5 hover:text-ink">
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost hidden sm:inline-flex">Sign in</Link>
              <Link to="/register" className="btn btn-primary">Get started</Link>
            </>
          )}
          <button
            type="button"
            className="glass grid h-10 w-10 place-items-center rounded-xl md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Open navigation"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="glass mx-auto mt-3 flex max-w-7xl animate-fade flex-col gap-1 rounded-2xl p-2 md:hidden" aria-label="Mobile">
          {items.map((item) => (
            <NavLink key={item.to} to={item.to} className={navClass} end>
              {item.label}
            </NavLink>
          ))}
          {user ? (
            <NavLink to="/settings" className={navClass}>
              <span className="inline-flex items-center gap-2"><UserRound className="h-4 w-4" /> Settings</span>
            </NavLink>
          ) : (
            <NavLink to="/login" className={navClass}>Sign in</NavLink>
          )}
        </nav>
      )}
    </header>
  );
};

export const Footer = () => (
  <footer className="no-print border-t border-white/5">
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between md:px-8">
      <Logo />
      <p className="eyebrow text-[10px]">Execution is the only signal that compounds</p>
      <p className="text-xs text-faint">© {new Date().getFullYear()} Ziptech Labs. All rights reserved.</p>
    </div>
  </footer>
);

const AppShell = ({ children, wide = false, bare = false }: { children: ReactNode; wide?: boolean; bare?: boolean }) => {
  const { user } = useAuth();
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <TopNav />
      <main className={cn("mx-auto w-full flex-1 px-4 pb-20 pt-28 md:px-8 md:pt-32", wide ? "max-w-7xl" : "max-w-6xl", bare && "px-0 pt-0 md:px-0 md:pt-0 max-w-none pb-0")}>
        {user && !user.isVerified && !bare && <VerificationBanner />}
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default AppShell;
