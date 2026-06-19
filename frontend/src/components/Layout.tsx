import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/store/auth";
import {
  LayoutDashboard, Car, CalendarCheck, Users2, Sparkles, CreditCard,
  Shield, LogOut, Menu, X, Bot, Building2,
} from "lucide-react";
import { useState } from "react";

const nav = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/app/vehicles", label: "Vehicles", icon: Car },
  { to: "/app/trips", label: "My Trips", icon: CalendarCheck },
  { to: "/app/payments", label: "Payments", icon: CreditCard },
  { to: "/app/carpool", label: "Carpool", icon: Users2 },
  { to: "/app/assistant", label: "AI Assistant", icon: Bot },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const items = [...nav];
  if (user?.role === "owner" || user?.role === "admin")
    items.push({ to: "/app/owner", label: "Owner Panel", icon: Building2 });
  if (user?.role === "admin")
    items.push({ to: "/app/admin", label: "Admin Analytics", icon: Shield });

  return (
    <div className="min-h-screen flex bg-bg">
      {/* sidebar */}
      <aside
        className={`fixed lg:static z-40 inset-y-0 left-0 w-64 bg-surface border-r border-border
          transform ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 transition-transform`}
      >
        <div className="h-16 flex items-center gap-2 px-5 border-b border-border">
          <Sparkles className="w-5 h-5 text-accent" />
          <span className="font-semibold tracking-tight">Smart<span className="grad-text">Mobility</span></span>
        </div>
        <nav className="p-3 space-y-1">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              end={(it as any).end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition
                 ${isActive ? "bg-grad-primary text-white shadow-glow" : "text-muted hover:text-text hover:bg-surface2"}`
              }
            >
              <it.icon className="w-4 h-4" />
              {it.label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-0 inset-x-0 p-3 border-t border-border">
          <div className="px-3 py-2">
            <div className="text-sm font-medium truncate">{user?.name}</div>
            <div className="text-xs text-muted truncate">{user?.email}</div>
            <div className="chip mt-2 text-accent border-accent/40">{user?.role}</div>
          </div>
          <button
            onClick={() => { logout(); navigate("/"); }}
            className="btn-ghost w-full mt-2 text-sm"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* main */}
      <div className="flex-1 min-w-0">
        <header className="h-16 sticky top-0 z-30 bg-bg/80 backdrop-blur border-b border-border flex items-center px-4 lg:px-8">
          <button className="lg:hidden btn-ghost mr-3" onClick={() => setOpen((o) => !o)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="text-sm text-muted">Welcome back, <span className="text-text font-medium">{user?.name?.split(" ")[0]}</span></div>
        </header>
        <main className="p-4 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setOpen(false)} />
      )}
    </div>
  );
}
