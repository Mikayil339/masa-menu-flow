import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { L as Logo } from "./Logo-g-ujtk54.mjs";
import { B as Button } from "./button-DjOZMqFS.mjs";
import { I as Input } from "./input-D_U8fI25.mjs";
import { L as Label } from "./label-C8WJLhmR.mjs";
import { u as useStore } from "./store-MU1TcehK.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { a as Check, b as ChevronRight } from "../_libs/lucide-react.mjs";
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
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/zustand.mjs";
const steps = ["Restaurant", "Languages", "First menu", "Tables", "Invite staff", "Done"];
function Setup() {
  const nav = useNavigate();
  const {
    restaurant,
    setRestaurant,
    completeSetup,
    inviteStaff
  } = useStore();
  const [step, setStep] = reactExports.useState(0);
  const [r, setR] = reactExports.useState({
    name: restaurant.name,
    slug: restaurant.slug,
    currency: restaurant.currency,
    mode: restaurant.serviceMode
  });
  const [langs, setLangs] = reactExports.useState(["az", "en", "ru"]);
  const [tables, setTables] = reactExports.useState(12);
  const [invites, setInvites] = reactExports.useState([{
    email: "",
    role: "waiter"
  }]);
  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen flex", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "hidden md:flex w-72 flex-col bg-sidebar text-sidebar-foreground p-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, { className: "text-sidebar-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-12 space-y-4", children: steps.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-center gap-3 ${i === step ? "" : "opacity-60"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `h-7 w-7 rounded-full grid place-items-center text-xs ${i < step ? "bg-sage text-white" : i === step ? "bg-ember text-ember-foreground" : "bg-sidebar-accent"}`, children: i < step ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4" }) : i + 1 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: s })
      ] }, s)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-auto text-xs text-sidebar-foreground/60", children: [
        "Step ",
        step + 1,
        " of ",
        steps.length
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex-1 grid place-items-center p-8 bg-background", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase tracking-widest text-ember", children: "Setup" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl mt-2", children: steps[step] }),
      step === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Restaurant name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: r.name, onChange: (e) => setR({
            ...r,
            name: e.target.value
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "URL slug" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: r.slug, onChange: (e) => setR({
            ...r,
            slug: e.target.value
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Currency" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: r.currency, onChange: (e) => setR({
              ...r,
              currency: e.target.value
            }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Service mode" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "w-full h-10 rounded-md border bg-card px-3 text-sm", value: r.mode, onChange: (e) => setR({
              ...r,
              mode: e.target.value
            }), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "dine_in", children: "Dine-in only" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "qr_only", children: "QR-only" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "hybrid", children: "Hybrid" })
            ] })
          ] })
        ] })
      ] }),
      step === 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Guests will pick from these on the menu. You can add translations later." }),
        [["az", "Azerbaijani"], ["en", "English"], ["ru", "Russian"]].map(([code, label]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: langs.includes(code), onChange: (e) => setLangs((l) => e.target.checked ? [...l, code] : l.filter((x) => x !== code)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto text-xs text-muted-foreground uppercase", children: code })
        ] }, code))
      ] }),
      step === 2 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "We've pre-loaded a sample menu so you can explore. You can edit everything in the Menu Builder." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 rounded-xl border bg-card p-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium", children: "Sample menu loaded" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "mt-2 text-xs text-muted-foreground grid grid-cols-2 gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "✓ Starters · 2 items" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "✓ Mains · 2 items" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "✓ Drinks · 2 items" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "✓ Desserts · 2 items" })
          ] })
        ] })
      ] }),
      step === 3 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Number of tables" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 1, value: tables, onChange: (e) => setTables(+e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Each table gets its own QR code. You can rename, regenerate, or add more later." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border bg-card p-5 grid grid-cols-6 gap-2", children: Array.from({
          length: Math.min(tables, 18)
        }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "aspect-square rounded-md bg-muted grid place-items-center text-xs", children: [
          "T",
          i + 1
        ] }, i)) })
      ] }),
      step === 4 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Invite your staff. They'll get a code to join." }),
        invites.map((inv, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[1fr_140px] gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "staff@restaurant.com", value: inv.email, onChange: (e) => setInvites((arr) => arr.map((x, idx) => idx === i ? {
            ...x,
            email: e.target.value
          } : x)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: inv.role, onChange: (e) => setInvites((arr) => arr.map((x, idx) => idx === i ? {
            ...x,
            role: e.target.value
          } : x)), className: "h-10 rounded-md border bg-card px-3 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "manager", children: "Menecer" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "waiter", children: "Ofisiant" })
          ] })
        ] }, i)),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: () => setInvites([...invites, {
          email: "",
          role: "waiter"
        }]), children: "+ Add another" })
      ] }),
      step === 5 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto h-16 w-16 rounded-full bg-sage/15 text-sage grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-8 w-8" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 font-display text-2xl", children: "You're ready to go." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-2", children: "Your restaurant workspace is ready. Print your QRs from QR & Tables when you're ready." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-10 flex justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: back, disabled: step === 0, children: "Back" }),
        step < steps.length - 1 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
          if (step === 0) setRestaurant({
            name: r.name,
            slug: r.slug,
            currency: r.currency,
            serviceMode: r.mode
          });
          if (step === 4) invites.filter((i) => i.email).forEach((i) => inviteStaff(i.email, i.role));
          next();
        }, className: "bg-ember hover:bg-ember/90 text-ember-foreground", children: [
          "Continue ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "ml-1 h-4 w-4" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => {
          completeSetup();
          toast.success("Setup complete");
          nav({
            to: "/app"
          });
        }, className: "bg-ember hover:bg-ember/90 text-ember-foreground", children: "Go to dashboard" })
      ] })
    ] }) })
  ] });
}
export {
  Setup as component
};
