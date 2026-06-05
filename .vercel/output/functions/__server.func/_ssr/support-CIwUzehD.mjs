import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { P as PageHeader } from "./AppShell-DE5YGknu.mjs";
import { u as useStore } from "./store-MU1TcehK.mjs";
import { C as Card } from "./card-BdXDhg5r.mjs";
import { B as Button } from "./button-DjOZMqFS.mjs";
import { I as Input } from "./input-D_U8fI25.mjs";
import { L as Label } from "./label-C8WJLhmR.mjs";
import { T as Textarea } from "./textarea-F69quoCd.mjs";
import { t as toast } from "../_libs/sonner.mjs";
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
import "../_libs/lucide-react.mjs";
import "../_libs/zustand.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
const SplitComponent = () => {
  const {
    tickets,
    openTicket
  } = useStore();
  const [subj, setSubj] = reactExports.useState("");
  const [type, setType] = reactExports.useState("other");
  const [msg, setMsg] = reactExports.useState("");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 md:p-10", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "Support", subtitle: "We typically reply within 4 hours." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-[1fr_360px] gap-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-lg mb-3", children: "Open a ticket" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Subject" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: subj, onChange: (e) => setSubj(e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Issue type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: type, onChange: (e) => setType(e.target.value), className: "w-full h-10 rounded-md border bg-card px-2 text-sm", children: ["PDF export", "QR code", "Waiter alert", "Staff invite", "Plan/account", "Other"].map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: t }, t)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Message" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 5, value: msg, onChange: (e) => setMsg(e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Attach screenshot (demo)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "file" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "bg-ember hover:bg-ember/90 text-ember-foreground", onClick: () => {
            if (!subj) return;
            openTicket(subj, type, msg);
            setSubj("");
            setMsg("");
            toast.success("Ticket submitted");
          }, children: "Send ticket" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-lg mb-3", children: "Your tickets" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          tickets.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "No tickets yet." }),
          tickets.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-lg border", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: t.subject }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase bg-muted px-2 py-0.5 rounded", children: t.status })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mt-1", children: t.type })
          ] }, t.id))
        ] })
      ] })
    ] })
  ] });
};
export {
  SplitComponent as component
};
