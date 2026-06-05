import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate, O as Outlet } from "../_libs/tanstack__react-router.mjs";
import { A as AppShell } from "./AppShell-DE5YGknu.mjs";
import { u as useStore } from "./store-MU1TcehK.mjs";
import { s as supabase } from "./supabase-C_P_XQd2.mjs";
import { f as fetchOwnerContext } from "./masaqr-BQ3x-CAL.mjs";
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
import "./Logo-g-ujtk54.mjs";
import "./button-DjOZMqFS.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "./i18n-BZSpJObU.mjs";
import "../_libs/lucide-react.mjs";
import "../_libs/zustand.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
function AppGate() {
  const nav = useNavigate();
  const {
    auth,
    login,
    logout
  } = useStore();
  const [ready, setReady] = reactExports.useState(false);
  reactExports.useEffect(() => {
    let active = true;
    async function load() {
      try {
        const {
          session,
          profile,
          restaurant
        } = await fetchOwnerContext();
        if (!session) {
          if (auth.loggedIn) logout();
          nav({
            to: "/login",
            replace: true
          });
          return;
        }
        if (!profile) {
          await supabase.auth.signOut();
          logout();
          nav({
            to: "/login",
            replace: true
          });
          return;
        }
        login({
          email: profile.email ?? session.user.email ?? "",
          role: profile.role ?? "owner",
          name: profile.full_name ?? (session.user.email ?? "").split("@")[0]
        });
        if (restaurant) {
          useStore.setState((st) => ({
            restaurant: {
              ...st.restaurant,
              name: restaurant.name,
              slug: restaurant.slug,
              logo: restaurant.logo_url ?? void 0,
              cover: restaurant.cover_url ?? st.restaurant.cover,
              primaryLang: restaurant.default_language ?? "az",
              langs: restaurant.enabled_languages ?? ["az", "en", "ru"],
              currency: restaurant.currency ?? "AZN"
            }
          }));
        } else if (profile.role === "owner") {
          nav({
            to: "/setup",
            replace: true
          });
          return;
        }
      } finally {
        if (active) setReady(true);
      }
    }
    load();
    const {
      data: sub
    } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) {
        logout();
        nav({
          to: "/login",
          replace: true
        });
      }
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);
  if (!ready && !auth.loggedIn) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen grid place-items-center text-sm text-muted-foreground", children: "Loading…" });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}) });
}
export {
  AppGate as component
};
