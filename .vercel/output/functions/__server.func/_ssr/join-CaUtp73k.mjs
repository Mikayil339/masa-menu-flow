import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { P as PublicNav, a as PublicFooter } from "./PublicNav-DKh8CTvy.mjs";
import { B as Button } from "./button-DjOZMqFS.mjs";
import { I as Input } from "./input-D_U8fI25.mjs";
import { L as Label } from "./label-C8WJLhmR.mjs";
import { u as useStore } from "./store-MU1TcehK.mjs";
import { s as supabase } from "./supabase-C_P_XQd2.mjs";
import { t as toast } from "../_libs/sonner.mjs";
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
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
function JoinPage() {
  const nav = useNavigate();
  const {
    login
  } = useStore();
  const [code, setCode] = reactExports.useState("");
  const [name, setName] = reactExports.useState("");
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  async function handleJoin(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const inviteCode = code.trim().toUpperCase();
      const cleanEmail = email.trim().toLowerCase();
      const cleanName = name.trim();
      const {
        data: invite,
        error: inviteError
      } = await supabase.from("masaqr_staff_invites").select("id,restaurant_id,code,role,status,expires_at").eq("code", inviteCode).eq("status", "active").maybeSingle();
      if (inviteError) throw inviteError;
      if (!invite) {
        toast.error("Invalid or expired code");
        return;
      }
      if (invite.expires_at && new Date(invite.expires_at).getTime() < Date.now()) {
        toast.error("Invalid or expired code");
        return;
      }
      const {
        data: signUpData,
        error: signUpError
      } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: cleanName
          }
        }
      });
      if (signUpError) throw signUpError;
      let userId = signUpData.user?.id ?? null;
      if (!userId || !signUpData.session) {
        const {
          data: signInData,
          error: signInError
        } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password
        });
        if (signInError) {
          toast.error("Account created, but email confirmation may be required before login.");
          return;
        }
        userId = signInData.user?.id ?? null;
      }
      if (!userId) {
        toast.error("Could not create staff user");
        return;
      }
      const role = invite.role;
      const {
        error: profileError
      } = await supabase.from("masaqr_users").upsert({
        id: userId,
        email: cleanEmail,
        full_name: cleanName,
        role,
        restaurant_id: invite.restaurant_id,
        status: "active"
      });
      if (profileError) throw profileError;
      const {
        error: usedError
      } = await supabase.from("masaqr_staff_invites").update({
        status: "used",
        used_by: userId
      }).eq("id", invite.id);
      if (usedError) throw usedError;
      login({
        email: cleanEmail,
        role,
        name: cleanName
      });
      toast.success(`Xoş gəlmisiniz, ${cleanName}`);
      if (role === "waiter" || role === "kitchen" || role === "staff") nav({
        to: "/waiter"
      });
      else nav({
        to: "/app"
      });
    } catch (error) {
      toast.error(error.message ?? "Komandaya qoşulmaq mümkün olmadı");
    } finally {
      setLoading(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PublicNav, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-md px-6 py-16", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl", children: "Komandaya qoşul" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Restoran rəhbərindən aldığınız dəvət kodunu daxil edin." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { className: "mt-8 space-y-4", onSubmit: handleJoin, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Dəvət kodu" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: code, onChange: (e) => setCode(e.target.value.toUpperCase()), placeholder: "MQ-ABC123", className: "font-mono tracking-widest", required: true })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Adınız" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: name, onChange: (e) => setName(e.target.value), placeholder: "Samir", required: true })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "E-poçt" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "ofisiant@restoran.az", required: true })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Şifrə yarat" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "password", value: password, onChange: (e) => setPassword(e.target.value), required: true, minLength: 6 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: loading, className: "w-full", children: loading ? "Qoşulunur…" : "Komandaya qoşul" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 text-center text-sm", children: [
        "Komandadasınız? ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/login", className: "text-ember", children: "Daxil ol" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(PublicFooter, {})
  ] });
}
export {
  JoinPage as component
};
