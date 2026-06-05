import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { P as PublicNav, a as PublicFooter } from "./PublicNav-DKh8CTvy.mjs";
import { B as Button } from "./button-DjOZMqFS.mjs";
import { I as Input } from "./input-D_U8fI25.mjs";
import { L as Label } from "./label-C8WJLhmR.mjs";
import { u as useStore } from "./store-MU1TcehK.mjs";
import { T } from "./i18n-BZSpJObU.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { a as Check } from "../_libs/lucide-react.mjs";
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
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/zustand.mjs";
function RegisterPage() {
  const nav = useNavigate();
  const {
    register
  } = useStore();
  const [name, setName] = reactExports.useState("");
  const [email, setEmail] = reactExports.useState("");
  const [pass, setPass] = reactExports.useState("");
  const [restaurant, setRestaurant] = reactExports.useState("");
  const [slug, setSlug] = reactExports.useState("");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PublicNav, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-5xl px-6 py-12 grid md:grid-cols-[1.1fr_1fr] gap-12 items-start", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-widest text-ember", children: T.auth.register.badge }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-4xl mt-2", children: T.auth.register.heading }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-muted-foreground", children: T.auth.register.subhead }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-6 space-y-2 text-sm", children: T.auth.register.features.map((x) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4 text-sage" }),
          x
        ] }, x)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border bg-card p-7 shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { className: "space-y-4", onSubmit: (e) => {
        e.preventDefault();
        register(email, name, restaurant, slug || restaurant.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
        toast.success(T.auth.register.success);
        nav({
          to: "/setup"
        });
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: T.auth.register.yourName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { required: true, value: name, onChange: (e) => setName(e.target.value), placeholder: "Aysel Məmmədova" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: T.auth.email }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { required: true, type: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "siz@restoran.az" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: T.auth.password }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { required: true, type: "password", value: pass, onChange: (e) => setPass(e.target.value), placeholder: T.auth.register.passwordMin })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: T.auth.register.restaurantName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { required: true, value: restaurant, onChange: (e) => {
            setRestaurant(e.target.value);
            setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
          }, placeholder: "Olive & Ember" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: T.auth.register.slugLabel }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center px-3 rounded-l-md border border-r-0 bg-muted text-xs text-muted-foreground", children: "masaqr.app/m/" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "rounded-l-none", required: true, value: slug, onChange: (e) => setSlug(e.target.value), placeholder: "olive-ember" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "w-full bg-ember hover:bg-ember/90 text-ember-foreground", children: T.auth.register.submit }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground text-center", children: [
          T.auth.register.already,
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/login", className: "text-ember", children: T.auth.signIn })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(PublicFooter, {})
  ] });
}
export {
  RegisterPage as component
};
