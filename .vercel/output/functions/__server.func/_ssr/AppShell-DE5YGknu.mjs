import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useLocation, d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { s as supabase } from "./supabase-C_P_XQd2.mjs";
import { L as Logo } from "./Logo-g-ujtk54.mjs";
import { u as useStore } from "./store-MU1TcehK.mjs";
import { B as Button } from "./button-DjOZMqFS.mjs";
import { T } from "./i18n-BZSpJObU.mjs";
import { O as Lock, A as ArrowLeft, L as LayoutDashboard, j as ShoppingBag, m as BookOpen, Q as QrCode, U as Users, F as FileText, h as ChartColumn, V as Settings, Y as CreditCard, Z as LifeBuoy, B as Bell, _ as ExternalLink, $ as LogOut } from "../_libs/lucide-react.mjs";
const nav = [
  { to: "/app", label: T.nav.panel, icon: LayoutDashboard, exact: true, allow: ["owner", "manager"] },
  { to: "/app/orders", label: T.nav.sessions, icon: ShoppingBag, allow: ["owner", "manager"] },
  { to: "/app/menu", label: T.nav.menu, icon: BookOpen, allow: ["owner", "manager"] },
  { to: "/app/tables", label: T.nav.tablesQr, icon: QrCode, allow: ["owner", "manager"] },
  { to: "/app/staff", label: T.nav.waiters, icon: Users, allow: ["owner", "manager"] },
  { to: "/app/pdf", label: T.nav.pdf, icon: FileText, allow: ["owner", "manager"] },
  { to: "/app/analytics", label: T.nav.analytics, icon: ChartColumn, allow: ["owner", "manager"] },
  { to: "/app/settings", label: T.nav.settings, icon: Settings, allow: ["owner", "manager"] },
  { to: "/app/plan", label: T.nav.plan, icon: CreditCard, allow: ["owner"] },
  { to: "/app/support", label: T.nav.support, icon: LifeBuoy, allow: ["owner", "manager"] }
];
function AppShell({ children }) {
  const loc = useLocation();
  const nav2 = useNavigate();
  const { auth, restaurant, alerts, plan, logout } = useStore();
  const rawRole = auth.role ?? "manager";
  const role = rawRole === "owner" ? "manager" : rawRole;
  const openAlerts = alerts.filter((a) => !a.resolved).length;
  const trialDays = Math.max(0, Math.ceil((plan.trialEndsAt - Date.now()) / 864e5));
  if (role === "waiter" || rawRole === "kitchen" || rawRole === "staff") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen grid place-items-center p-6 bg-background", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto h-14 w-14 rounded-full bg-warning/10 text-warning grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-6 w-6" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-2xl mt-4", children: "Bu bölməyə icazəniz yoxdur" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground mt-2", children: [
        "Hesabınız ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: T.roles.waiter }),
        " kimi qurulub. Menecer paneli yalnız menecerlər üçündür."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-wrap gap-2 justify-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => nav2({ to: "/waiter" }), className: "bg-ember hover:bg-ember/90 text-ember-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4 mr-1.5" }),
          " ",
          T.nav.waiterView
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          supabase.auth.signOut();
          logout();
          nav2({ to: "/login" });
        }, children: T.nav.signOut })
      ] })
    ] }) });
  }
  const visibleNav = nav.filter((n) => n.allow.includes(rawRole) || n.allow.includes(role));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "hidden md:flex w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5 border-b border-sidebar-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, { className: "text-sidebar-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 text-xs uppercase tracking-wider text-sidebar-foreground/60", children: T.nav.restaurant }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-medium truncate flex items-center gap-2", children: [
          restaurant.logo && /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: restaurant.logo, alt: "", className: "h-5 w-5 rounded-full object-cover" }),
          restaurant.name
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "flex-1 overflow-y-auto p-3 space-y-1", children: visibleNav.map((n) => {
        const active = n.exact ? loc.pathname === n.to : loc.pathname.startsWith(n.to);
        const Icon = n.icon;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Link,
          {
            to: n.to,
            className: `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${active ? "bg-ember text-ember-foreground shadow-sm" : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: n.label }),
              n.to === "/app/orders" && openAlerts > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto text-[10px] bg-ember-foreground text-ember rounded-full px-1.5 py-0.5 font-semibold", children: openAlerts })
            ]
          },
          n.to
        );
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 border-t border-sidebar-border space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/waiter", className: "flex items-center gap-2 text-xs text-sidebar-foreground/70 hover:text-sidebar-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-3.5 w-3.5" }),
          " ",
          T.nav.waiterView,
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-3 w-3 ml-auto" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-2 mt-2 border-t border-sidebar-border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase text-sidebar-foreground/50", children: "Plan" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs", children: plan.tier === "trial" ? `Sınaq · ${trialDays} gün qalıb` : plan.tier }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase text-sidebar-foreground/50 mt-2", children: T.nav.role }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs", children: T.roles.manager })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
          supabase.auth.signOut();
          logout();
          nav2({ to: "/login" });
        }, className: "flex items-center gap-2 text-xs text-sidebar-foreground/70 hover:text-sidebar-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-3.5 w-3.5" }),
          " ",
          T.nav.signOut,
          " · ",
          auth.email
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "flex-1 min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:hidden flex items-center justify-between p-4 bg-sidebar text-sidebar-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, { className: "text-sidebar-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, size: "sm", variant: "secondary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/app", children: T.nav.panel }) })
      ] }),
      children
    ] })
  ] });
}
function PageHeader({ title, subtitle, actions }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-end justify-between gap-4 mb-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl", children: title }),
      subtitle && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm mt-1", children: subtitle })
    ] }),
    actions && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2", children: actions })
  ] });
}
export {
  AppShell as A,
  PageHeader as P
};
