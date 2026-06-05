import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { P as PageHeader } from "./AppShell-DE5YGknu.mjs";
import { u as useStore } from "./store-MU1TcehK.mjs";
import { C as Card } from "./card-BdXDhg5r.mjs";
import { B as Button } from "./button-DjOZMqFS.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { a as Check } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__react-router.mjs";
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
import "./supabase-C_P_XQd2.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "./Logo-g-ujtk54.mjs";
import "./i18n-BZSpJObU.mjs";
import "../_libs/zustand.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
const SplitComponent = () => {
  const {
    plan,
    setPlan
  } = useStore();
  const trialDays = Math.max(0, Math.ceil((plan.trialEndsAt - Date.now()) / 864e5));
  const tiers = [{
    id: "starter",
    n: "Starter",
    p: 29,
    f: ["12 tables", "Ofisiant ekranı", "QR menu"]
  }, {
    id: "pro",
    n: "Pro",
    p: 69,
    best: true,
    f: ["40 tables", "Modifiers", "Analytics", "Print templates"]
  }, {
    id: "business",
    n: "Business",
    p: 149,
    f: ["Unlimited tables", "Advanced analytics", "Priority support"]
  }];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 md:p-10", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "Plan", subtitle: "Your MasaQR subscription. Customer payments are never part of this." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-5 mb-5 bg-ember/5 border-ember/30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "Current" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-display text-2xl capitalize", children: [
          plan.tier,
          " ",
          plan.tier === "trial" && `· ${trialDays} days left`
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => toast.success("Trial extended by 7 days"), children: "Extend trial" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", className: "text-destructive", onClick: () => toast.success("Cancellation requested"), children: "Cancel plan" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid md:grid-cols-3 gap-4", children: tiers.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: `p-5 ${t.best ? "border-ember" : ""}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-xl", children: t.n }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 font-display text-3xl", children: [
        "€",
        t.p,
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground", children: "/mo" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-4 space-y-1.5 text-sm", children: t.f.map((x) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4 text-sage" }),
        x
      ] }, x)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => {
        setPlan(t.id);
        toast.success(`Plan changed to ${t.n}`);
      }, className: `mt-5 w-full ${t.best ? "bg-ember hover:bg-ember/90 text-ember-foreground" : ""}`, variant: t.best ? "default" : "outline", children: plan.tier === t.id ? "Current" : "Switch" })
    ] }, t.id)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "mt-5 p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-lg", children: "Invoices" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground mt-2", children: "No invoices yet — you're on the free trial." })
    ] })
  ] });
};
export {
  SplitComponent as component
};
