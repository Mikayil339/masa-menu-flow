import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { ReactNode } from "react";
import {
  LayoutDashboard, ShoppingBag, BookOpen, FileText, QrCode, Users, BarChart3,
  CreditCard, LifeBuoy, Settings, Bell, LogOut, ExternalLink, Lock, ArrowLeft
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Logo } from "./Logo";
import { useStore, type Role } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { T } from "@/lib/i18n";

type NavItem = { to: string; label: string; icon: any; exact?: boolean; allow: Role[] };

const nav: NavItem[] = [
  { to: "/app", label: T.nav.panel, icon: LayoutDashboard, exact: true, allow: ["owner", "manager"] },
  { to: "/app/orders", label: T.nav.sessions, icon: ShoppingBag, allow: ["owner", "manager"] },
  { to: "/app/menu", label: T.nav.menu, icon: BookOpen, allow: ["owner", "manager"] },
  { to: "/app/tables", label: T.nav.tablesQr, icon: QrCode, allow: ["owner", "manager"] },
  { to: "/app/staff", label: T.nav.waiters, icon: Users, allow: ["owner", "manager"] },
  { to: "/app/pdf", label: T.nav.pdf, icon: FileText, allow: ["owner", "manager"] },
  { to: "/app/analytics", label: T.nav.analytics, icon: BarChart3, allow: ["owner", "manager"] },
  { to: "/app/settings", label: T.nav.settings, icon: Settings, allow: ["owner", "manager"] },
  { to: "/app/plan", label: T.nav.plan, icon: CreditCard, allow: ["owner"] },
  { to: "/app/support", label: T.nav.support, icon: LifeBuoy, allow: ["owner", "manager"] },
];

export function AppShell({ children }: { children: ReactNode }) {
  const loc = useLocation();
  const nav2 = useNavigate();
  const { auth, restaurant, branches, activeBranchId, setActiveBranch, alerts, plan, logout } = useStore();
  const role: Role = auth.role ?? "owner";
  const openAlerts = alerts.filter(a => !a.resolved).length;
  const trialDays = Math.max(0, Math.ceil((plan.trialEndsAt - Date.now()) / 86400000));

  // Role gate — kitchen/waiter can never see admin shell
  if (role === "kitchen" || role === "waiter") {
    const goTo = role === "kitchen" ? "/kitchen" : "/waiter";
    return (
      <div className="min-h-screen grid place-items-center p-6 bg-background">
        <div className="max-w-md text-center">
          <div className="mx-auto h-14 w-14 rounded-full bg-warning/10 text-warning grid place-items-center"><Lock className="h-6 w-6" /></div>
          <h1 className="font-display text-2xl mt-4">You don't have permission to view this area</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Your account is set up as <b>{role}</b>. The restaurant admin dashboard is only available to owners and managers. Head back to your workspace.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 justify-center">
            <Button onClick={() => nav2({ to: goTo })} className="bg-ember hover:bg-ember/90 text-ember-foreground">
              <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to {role} workspace
            </Button>
            <Button variant="outline" onClick={() => { supabase.auth.signOut(); logout(); nav2({ to: "/login" }); }}>Sign out</Button>
          </div>
        </div>
      </div>
    );
  }

  const visibleNav = nav.filter(n => n.allow.includes(role));

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden md:flex w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
        <div className="p-5 border-b border-sidebar-border">
          <Logo className="text-sidebar-foreground" />
          <div className="mt-4 text-xs uppercase tracking-wider text-sidebar-foreground/60">Restaurant</div>
          <div className="text-sm font-medium truncate flex items-center gap-2">
            {restaurant.logo && <img src={restaurant.logo} alt="" className="h-5 w-5 rounded-full object-cover" />}
            {restaurant.name}
          </div>
          <select
            className="mt-2 w-full text-xs bg-sidebar-accent border border-sidebar-border rounded-md px-2 py-1.5 text-sidebar-accent-foreground"
            value={activeBranchId}
            onChange={e => setActiveBranch(e.target.value)}
          >
            {branches.filter(b => b.active).map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {visibleNav.map(n => {
            const active = n.exact ? loc.pathname === n.to : loc.pathname.startsWith(n.to);
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-ember text-ember-foreground shadow-sm"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{n.label}</span>
                {n.to === "/app/orders" && openAlerts > 0 && (
                  <span className="ml-auto text-[10px] bg-ember-foreground text-ember rounded-full px-1.5 py-0.5 font-semibold">{openAlerts}</span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-sidebar-border space-y-2">
          <Link to="/waiter" className="flex items-center gap-2 text-xs text-sidebar-foreground/70 hover:text-sidebar-foreground">
            <Bell className="h-3.5 w-3.5" /> {T.nav.waiterView} <ExternalLink className="h-3 w-3 ml-auto" />
          </Link>
          <div className="pt-2 mt-2 border-t border-sidebar-border">
            <div className="text-[10px] uppercase text-sidebar-foreground/50">Plan</div>
            <div className="text-xs">{plan.tier === "trial" ? `Trial · ${trialDays}d left` : plan.tier}</div>
            <div className="text-[10px] uppercase text-sidebar-foreground/50 mt-2">{T.nav.role}</div>
            <div className="text-xs capitalize">{T.roles.manager}</div>
          </div>
          <button onClick={() => { supabase.auth.signOut(); logout(); nav2({ to: "/login" }); }} className="flex items-center gap-2 text-xs text-sidebar-foreground/70 hover:text-sidebar-foreground">
            <LogOut className="h-3.5 w-3.5" /> Sign out · {auth.email}
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <div className="md:hidden flex items-center justify-between p-4 bg-sidebar text-sidebar-foreground">
          <Logo className="text-sidebar-foreground" />
          <Button asChild size="sm" variant="secondary"><Link to="/app">Menu</Link></Button>
        </div>
        {children}
      </main>
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div>
        <h1 className="font-display text-3xl">{title}</h1>
        {subtitle && <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}
