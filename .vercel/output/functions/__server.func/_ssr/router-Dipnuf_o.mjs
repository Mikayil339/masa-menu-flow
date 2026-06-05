import { Q as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { Q as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { c as createRouter, a as createRootRouteWithContext, u as useRouter, L as Link, O as Outlet, H as HeadContent, S as Scripts, b as createFileRoute, l as lazyRouteComponent } from "../_libs/tanstack__react-router.mjs";
import { Q as redirect } from "../_libs/tanstack__router-core.mjs";
import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { T as Toaster$1 } from "../_libs/sonner.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "node:stream";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
const appCss = "/assets/styles-BGbpvdsg.css";
function reportLovableError(error, context = {}) {
  if (typeof window === "undefined") return;
  window.__lovableEvents?.captureException?.(
    error,
    {
      source: "react_error_boundary",
      route: window.location.pathname,
      ...context
    },
    {
      mechanism: "react_error_boundary",
      handled: false,
      severity: "error"
    }
  );
}
const Toaster = ({ ...props }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Toaster$1,
    {
      className: "toaster group",
      toastOptions: {
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
        }
      },
      ...props
    }
  );
};
function NotFoundComponent() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-7xl font-bold text-foreground", children: "404" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 text-xl font-semibold text-foreground", children: "Page not found" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "The page you're looking for doesn't exist or has been moved." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Link,
      {
        to: "/",
        className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
        children: "Go home"
      }
    ) })
  ] }) });
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  const router = useRouter();
  reactExports.useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold tracking-tight text-foreground", children: "This page didn't load" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Something went wrong on our end. You can try refreshing or head back home." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => {
            router.invalidate();
            reset();
          },
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
          children: "Try again"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "a",
        {
          href: "/",
          className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
          children: "Go home"
        }
      )
    ] })
  ] }) });
}
const Route$n = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "MasaQR — QR menus and waiter workflows for restaurants" },
      { name: "description", content: "MasaQR is a SaaS platform for restaurants to manage QR menus, table sessions, waiter workflows, and operations." },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "MasaQR — QR menus and waiter workflows for restaurants" },
      { property: "og:description", content: "MasaQR is a SaaS platform for restaurants to manage QR menus, table sessions, waiter workflows, and operations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "MasaQR — QR menus and waiter workflows for restaurants" },
      { name: "twitter:description", content: "MasaQR is a SaaS platform for restaurants to manage QR menus, table sessions, waiter workflows, and operations." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b159afb7-9cbe-4789-818b-43163764b460/id-preview-2e623edc--da82fa25-b621-48b7-8f18-752b48807eaf.lovable.app-1780318031750.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b159afb7-9cbe-4789-818b-43163764b460/id-preview-2e623edc--da82fa25-b621-48b7-8f18-752b48807eaf.lovable.app-1780318031750.png" }
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss
      }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("head", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  const { queryClient } = Route$n.useRouteContext();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(QueryClientProvider, { client: queryClient, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Toaster, { position: "top-right", richColors: true })
  ] });
}
const $$splitComponentImporter$l = () => import("./waiter-BAOVmToE.mjs");
const Route$m = createFileRoute("/waiter")({
  head: () => ({
    meta: [{
      title: "Ofisiant — MasaQR"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$l, "component")
});
const $$splitComponentImporter$k = () => import("./setup-4jE3rcHL.mjs");
const Route$l = createFileRoute("/setup")({
  head: () => ({
    meta: [{
      title: "Set up — MasaQR"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$k, "component")
});
const $$splitComponentImporter$j = () => import("./reset-password-BmBw8f0z.mjs");
const Route$k = createFileRoute("/reset-password")({
  head: () => ({
    meta: [{
      title: "Set new password — MasaQR"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$j, "component")
});
const $$splitComponentImporter$i = () => import("./register-BEgtjSSc.mjs");
const Route$j = createFileRoute("/register")({
  head: () => ({
    meta: [{
      title: "Pulsuz sınaq — MasaQR"
    }, {
      name: "description",
      content: "MasaQR hesabınızı yaradın. 1 ay pulsuz, kart tələb olunmur."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$i, "component")
});
const Route$i = createFileRoute("/pricing")({
  beforeLoad: () => {
    throw redirect({ to: "/", hash: "pricing" });
  }
});
const $$splitComponentImporter$h = () => import("./login-D5cotxUt.mjs");
const Route$h = createFileRoute("/login")({
  head: () => ({
    meta: [{
      title: "Daxil ol — MasaQR"
    }, {
      name: "description",
      content: "MasaQR restoran hesabınıza daxil olun."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$h, "component")
});
const $$splitComponentImporter$g = () => import("./kitchen-BZSzmhvM.mjs");
const Route$g = createFileRoute("/kitchen")({
  head: () => ({
    meta: [{
      title: "Mətbəx — MasaQR"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$g, "component")
});
const $$splitComponentImporter$f = () => import("./join-CaUtp73k.mjs");
const Route$f = createFileRoute("/join")({
  head: () => ({
    meta: [{
      title: "Join your team — MasaQR"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$f, "component")
});
const $$splitComponentImporter$e = () => import("./forgot-password-NurxRoLm.mjs");
const Route$e = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [{
      title: "Reset password — MasaQR"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$e, "component")
});
const $$splitComponentImporter$d = () => import("./app-BIbyCXxz.mjs");
const Route$d = createFileRoute("/app")({
  component: lazyRouteComponent($$splitComponentImporter$d, "component")
});
const $$splitComponentImporter$c = () => import("./index-D6bD48bL.mjs");
const Route$c = createFileRoute("/")({
  head: () => ({
    meta: [{
      title: "MasaQR — Restoranlar üçün QR menyu və ofisiant iş axını"
    }, {
      name: "description",
      content: "Çap olunmuş menyunu QR ilə əvəzləyin, masa sessiyalarını idarə edin və ofisiantları anında məlumatlandırın. 1 ay pulsuz sınaq."
    }, {
      property: "og:title",
      content: "MasaQR — Restoranlar üçün QR menyu və ofisiant iş axını"
    }, {
      property: "og:description",
      content: "3 dildə QR menyu, gözəl PDF ixrac, masa və sessiya idarəetməsi, ofisiant bildirişləri."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$c, "component")
});
const $$splitComponentImporter$b = () => import("./index-CJye7NFL.mjs");
const Route$b = createFileRoute("/app/")({
  head: () => ({
    meta: [{
      title: "Dashboard — MasaQR"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$b, "component")
});
const $$splitComponentImporter$a = () => import("./tables-GA--eBZY.mjs");
const Route$a = createFileRoute("/app/tables")({
  head: () => ({
    meta: [{
      title: "Masalar və QR — MasaQR"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$a, "component")
});
const $$splitComponentImporter$9 = () => import("./support-CIwUzehD.mjs");
const Route$9 = createFileRoute("/app/support")({
  head: () => ({
    meta: [{
      title: "Support — MasaQR"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
const $$splitComponentImporter$8 = () => import("./staff-DT-nDWi3.mjs");
const Route$8 = createFileRoute("/app/staff")({
  head: () => ({
    meta: [{
      title: "Ofisiantlar — MasaQR"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
const $$splitComponentImporter$7 = () => import("./settings-DYKj4YoM.mjs");
const Route$7 = createFileRoute("/app/settings")({
  head: () => ({
    meta: [{
      title: "Ayarlar — MasaQR"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./plan-OIMlHW8Y.mjs");
const Route$6 = createFileRoute("/app/plan")({
  head: () => ({
    meta: [{
      title: "Plan — MasaQR"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./pdf-BaoXK7Kr.mjs");
const Route$5 = createFileRoute("/app/pdf")({
  head: () => ({
    meta: [{
      title: "PDF Menyu — MasaQR"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./orders-CASl3pvC.mjs");
const Route$4 = createFileRoute("/app/orders")({
  head: () => ({
    meta: [{
      title: "Sifarişlər və Sessiyalar — MasaQR"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./menu-BNd4U3KJ.mjs");
const Route$3 = createFileRoute("/app/menu")({
  head: () => ({
    meta: [{
      title: "Menyu — MasaQR"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./branches-DtsjM2IV.mjs");
const Route$2 = createFileRoute("/app/branches")({
  head: () => ({
    meta: [{
      title: "Filiallar deaktivdir — MasaQR"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./analytics-D1lAwdcB.mjs");
const Route$1 = createFileRoute("/app/analytics")({
  head: () => ({
    meta: [{
      title: "Analitika — MasaQR"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./m._slug._table-CH9RvR0p.mjs");
const Route = createFileRoute("/m/$slug/$table")({
  head: () => ({
    meta: [{
      title: "Menyu — MasaQR"
    }]
  }),
  validateSearch: (s) => ({
    type: s.type === "foreign" ? "foreign" : s.type === "local" ? "local" : void 0,
    lang: ["az", "en", "ru"].includes(s.lang) ? s.lang : void 0
  }),
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const WaiterRoute = Route$m.update({
  id: "/waiter",
  path: "/waiter",
  getParentRoute: () => Route$n
});
const SetupRoute = Route$l.update({
  id: "/setup",
  path: "/setup",
  getParentRoute: () => Route$n
});
const ResetPasswordRoute = Route$k.update({
  id: "/reset-password",
  path: "/reset-password",
  getParentRoute: () => Route$n
});
const RegisterRoute = Route$j.update({
  id: "/register",
  path: "/register",
  getParentRoute: () => Route$n
});
const PricingRoute = Route$i.update({
  id: "/pricing",
  path: "/pricing",
  getParentRoute: () => Route$n
});
const LoginRoute = Route$h.update({
  id: "/login",
  path: "/login",
  getParentRoute: () => Route$n
});
const KitchenRoute = Route$g.update({
  id: "/kitchen",
  path: "/kitchen",
  getParentRoute: () => Route$n
});
const JoinRoute = Route$f.update({
  id: "/join",
  path: "/join",
  getParentRoute: () => Route$n
});
const ForgotPasswordRoute = Route$e.update({
  id: "/forgot-password",
  path: "/forgot-password",
  getParentRoute: () => Route$n
});
const AppRoute = Route$d.update({
  id: "/app",
  path: "/app",
  getParentRoute: () => Route$n
});
const IndexRoute = Route$c.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$n
});
const AppIndexRoute = Route$b.update({
  id: "/",
  path: "/",
  getParentRoute: () => AppRoute
});
const AppTablesRoute = Route$a.update({
  id: "/tables",
  path: "/tables",
  getParentRoute: () => AppRoute
});
const AppSupportRoute = Route$9.update({
  id: "/support",
  path: "/support",
  getParentRoute: () => AppRoute
});
const AppStaffRoute = Route$8.update({
  id: "/staff",
  path: "/staff",
  getParentRoute: () => AppRoute
});
const AppSettingsRoute = Route$7.update({
  id: "/settings",
  path: "/settings",
  getParentRoute: () => AppRoute
});
const AppPlanRoute = Route$6.update({
  id: "/plan",
  path: "/plan",
  getParentRoute: () => AppRoute
});
const AppPdfRoute = Route$5.update({
  id: "/pdf",
  path: "/pdf",
  getParentRoute: () => AppRoute
});
const AppOrdersRoute = Route$4.update({
  id: "/orders",
  path: "/orders",
  getParentRoute: () => AppRoute
});
const AppMenuRoute = Route$3.update({
  id: "/menu",
  path: "/menu",
  getParentRoute: () => AppRoute
});
const AppBranchesRoute = Route$2.update({
  id: "/branches",
  path: "/branches",
  getParentRoute: () => AppRoute
});
const AppAnalyticsRoute = Route$1.update({
  id: "/analytics",
  path: "/analytics",
  getParentRoute: () => AppRoute
});
const MSlugTableRoute = Route.update({
  id: "/m/$slug/$table",
  path: "/m/$slug/$table",
  getParentRoute: () => Route$n
});
const AppRouteChildren = {
  AppAnalyticsRoute,
  AppBranchesRoute,
  AppMenuRoute,
  AppOrdersRoute,
  AppPdfRoute,
  AppPlanRoute,
  AppSettingsRoute,
  AppStaffRoute,
  AppSupportRoute,
  AppTablesRoute,
  AppIndexRoute
};
const AppRouteWithChildren = AppRoute._addFileChildren(AppRouteChildren);
const rootRouteChildren = {
  IndexRoute,
  AppRoute: AppRouteWithChildren,
  ForgotPasswordRoute,
  JoinRoute,
  KitchenRoute,
  LoginRoute,
  PricingRoute,
  RegisterRoute,
  ResetPasswordRoute,
  SetupRoute,
  WaiterRoute,
  MSlugTableRoute
};
const routeTree = Route$n._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient();
  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router;
};
export {
  getRouter
};
