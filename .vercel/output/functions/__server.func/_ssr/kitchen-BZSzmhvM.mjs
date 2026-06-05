import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { B as Button } from "./button-DjOZMqFS.mjs";
import { T } from "./i18n-BZSpJObU.mjs";
import { s as supabase } from "./supabase-C_P_XQd2.mjs";
import { P as PowerOff, c as BellRing, L as LayoutDashboard } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
function KitchenDeactivated() {
  const nav = useNavigate();
  reactExports.useEffect(() => {
    (async () => {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      if (!session) return;
      const {
        data: profile
      } = await supabase.from("masaqr_users").select("role").eq("id", session.user.id).maybeSingle();
      if (profile?.role === "kitchen" || profile?.role === "staff") {
        nav({
          to: "/waiter",
          replace: true
        });
      }
    })();
  }, [nav]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen grid place-items-center bg-background p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto h-14 w-14 rounded-full bg-muted text-muted-foreground grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PowerOff, { className: "h-6 w-6" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-2xl mt-4", children: T.kitchenDeactivated.title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-2", children: T.kitchenDeactivated.body }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-wrap gap-2 justify-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, className: "bg-ember hover:bg-ember/90 text-ember-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/waiter", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(BellRing, { className: "h-4 w-4 mr-1.5" }),
        T.kitchenDeactivated.goWaiter
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "outline", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/app", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LayoutDashboard, { className: "h-4 w-4 mr-1.5" }),
        T.kitchenDeactivated.goDashboard
      ] }) })
    ] })
  ] }) });
}
export {
  KitchenDeactivated as component
};
