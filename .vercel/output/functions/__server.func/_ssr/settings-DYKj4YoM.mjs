import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { P as PageHeader } from "./AppShell-DE5YGknu.mjs";
import { C as Card } from "./card-BdXDhg5r.mjs";
import { B as Button } from "./button-DjOZMqFS.mjs";
import { I as Input } from "./input-D_U8fI25.mjs";
import { L as Label } from "./label-C8WJLhmR.mjs";
import { T as Textarea } from "./textarea-F69quoCd.mjs";
import { S as Switch } from "./switch-DkA5ZPe7.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { s as supabase } from "./supabase-C_P_XQd2.mjs";
import { f as fetchOwnerContext, d as uploadImage } from "./masaqr-BQ3x-CAL.mjs";
import { u as useStore } from "./store-MU1TcehK.mjs";
import { w as LoaderCircle, f as Languages, x as Upload, y as Phone, M as MapPin, W as Wifi, U as Users } from "../_libs/lucide-react.mjs";
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
import "./Logo-g-ujtk54.mjs";
import "./i18n-BZSpJObU.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/radix-ui__react-switch.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/zustand.mjs";
const LANGS = [{
  code: "az",
  label: "Azərbaycan"
}, {
  code: "en",
  label: "English"
}, {
  code: "ru",
  label: "Русский"
}];
function SettingsPage() {
  const [profile, setProfile] = reactExports.useState(null);
  const [draft, setDraft] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [saving, setSaving] = reactExports.useState(false);
  const [uploadingLogo, setUploadingLogo] = reactExports.useState(false);
  const [uploadingCover, setUploadingCover] = reactExports.useState(false);
  const setRestaurantState = useStore((state) => state.setRestaurant);
  const logoInput = reactExports.useRef(null);
  const coverInput = reactExports.useRef(null);
  async function load() {
    try {
      const ctx = await fetchOwnerContext();
      setProfile(ctx.profile);
      setDraft(ctx.restaurant);
    } catch (e) {
      toast.error(e.message ?? "Ayarları yükləmək alınmadı");
    } finally {
      setLoading(false);
    }
  }
  reactExports.useEffect(() => {
    load();
  }, []);
  async function handleUpload(kind, file) {
    if (!profile?.restaurant_id || !draft) return;
    const setter = kind === "logo" ? setUploadingLogo : setUploadingCover;
    setter(true);
    try {
      const bucket = kind === "logo" ? "masaqr-logos" : "masaqr-covers";
      const url = await uploadImage(bucket, file, profile.restaurant_id);
      const col = kind === "logo" ? "logo_url" : "cover_url";
      const {
        error
      } = await supabase.from("masaqr_restaurants").update({
        [col]: url
      }).eq("id", profile.restaurant_id);
      if (error) throw error;
      const nextDraft = {
        ...draft,
        [col]: url
      };
      setDraft(nextDraft);
      setRestaurantState({
        logo: kind === "logo" ? url : nextDraft.logo_url ?? void 0,
        cover: kind === "cover" ? url : nextDraft.cover_url ?? void 0
      });
      toast.success(kind === "logo" ? "Loqo yeniləndi" : "Üz şəkli yeniləndi");
    } catch (e) {
      toast.error(e.message ?? "Yükləmə alınmadı. Storage bucket-ları yoxlayın.");
    } finally {
      setter(false);
    }
  }
  async function save() {
    if (!draft || !profile?.restaurant_id) return;
    setSaving(true);
    try {
      const enabledLangs = draft.enabled_languages?.length ? draft.enabled_languages : [draft.default_language];
      const payload = {
        name: draft.name?.trim() || "",
        slug: draft.slug?.trim() || "",
        currency: draft.currency || "AZN",
        default_language: draft.default_language || "az",
        enabled_languages: enabledLangs,
        phone: draft.phone || null,
        address: draft.address || null,
        wifi_name: draft.wifi_name || null,
        wifi_password: draft.wifi_password || null,
        description: draft.description || null,
        description_i18n: draft.description_i18n || {},
        waiter_assignment_mode: draft.waiter_assignment_mode || "first_confirming_waiter",
        show_wifi_on_menu: draft.show_wifi_on_menu ?? true,
        show_phone_on_menu: draft.show_phone_on_menu ?? true
      };
      const {
        error
      } = await supabase.from("masaqr_restaurants").update(payload).eq("id", profile.restaurant_id);
      if (error) throw error;
      setRestaurantState({
        name: payload.name,
        slug: payload.slug,
        currency: payload.currency,
        primaryLang: payload.default_language,
        langs: payload.enabled_languages,
        logo: draft.logo_url ?? void 0,
        cover: draft.cover_url ?? void 0
      });
      toast.success("Ayarlar yadda saxlanıldı");
      await load();
    } catch (e) {
      toast.error(e.message ?? "Yadda saxlamaq alınmadı");
    } finally {
      setSaving(false);
    }
  }
  function toggleLang(lang) {
    if (!draft) return;
    const cur = draft.enabled_languages ?? [draft.default_language];
    const has = cur.includes(lang);
    let next = has ? cur.filter((l) => l !== lang) : [...cur, lang];
    if (next.length === 0) next = [draft.default_language];
    setDraft({
      ...draft,
      enabled_languages: next
    });
  }
  if (loading) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-sm text-muted-foreground", children: "Yüklənir…" });
  if (!profile?.restaurant_id || !draft) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "Ayarlar", subtitle: "Restoran bu hesabla əlaqəli deyil." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-6 text-sm text-muted-foreground", children: "Əvvəlcə restoran quraşdırın." }) })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "Ayarlar", subtitle: "Bütün dəyişikliklər birbaşa Supabase-də saxlanılır və müştəri menyusunda dərhal göstərilir.", actions: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: save, disabled: saving, className: "bg-ember hover:bg-ember/90 text-ember-foreground", children: saving ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }),
      "Yadda saxlanılır…"
    ] }) : "Yadda saxla" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 p-6 xl:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-lg", children: "Restoran məlumatı" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 md:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Restoran adı" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: draft.name ?? "", onChange: (e) => setDraft({
              ...draft,
              name: e.target.value
            }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "URL ünvanı (slug)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: draft.slug ?? "", onChange: (e) => setDraft({
              ...draft,
              slug: e.target.value
            }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Valyuta" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: draft.currency ?? "AZN", onChange: (e) => setDraft({
              ...draft,
              currency: e.target.value
            }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Əsas dil" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("select", { className: "w-full h-9 rounded-md border bg-background px-3 text-sm", value: draft.default_language, onChange: (e) => setDraft({
              ...draft,
              default_language: e.target.value
            }), children: LANGS.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: l.code, children: l.label }, l.code)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Qısa təsvir" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 3, value: draft.description ?? "", onChange: (e) => setDraft({
            ...draft,
            description: e.target.value
          }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-display text-lg flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Languages, { className: "h-5 w-5" }),
          "Müştəri dilləri"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Müştərinin QR menyusunda görəcəyi dilləri seçin." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: LANGS.map((l) => {
          const checked = (draft.enabled_languages ?? [draft.default_language]).includes(l.code);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center justify-between rounded-xl border p-3 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: l.label }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked, onCheckedChange: () => toggleLang(l.code) })
          ] }, l.code);
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-lg", children: "Loqo" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-24 w-24 rounded-2xl border bg-muted overflow-hidden flex items-center justify-center", children: draft.logo_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: draft.logo_url, alt: "logo", className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "Yoxdur" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ref: logoInput, type: "file", accept: "image/*", className: "hidden", onChange: (e) => {
              const f = e.target.files?.[0];
              if (f) handleUpload("logo", f);
            } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => logoInput.current?.click(), disabled: uploadingLogo, children: uploadingLogo ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }),
              "Yüklənir…"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "mr-2 h-4 w-4" }),
              "Loqo yüklə"
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs text-muted-foreground", children: "PNG/JPG. Müştəri menyusunda və QR kartda görünür." })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-lg", children: "Üz şəkli" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-video rounded-2xl border bg-muted overflow-hidden", children: draft.cover_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: draft.cover_url, alt: "cover", className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full items-center justify-center text-xs text-muted-foreground", children: "Yoxdur" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ref: coverInput, type: "file", accept: "image/*", className: "hidden", onChange: (e) => {
          const f = e.target.files?.[0];
          if (f) handleUpload("cover", f);
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => coverInput.current?.click(), disabled: uploadingCover, children: uploadingCover ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }),
          "Yüklənir…"
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "mr-2 h-4 w-4" }),
          "Üz şəkli yüklə"
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-display text-lg flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-5 w-5" }),
          "Əlaqə"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Telefon" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: draft.phone ?? "", onChange: (e) => setDraft({
            ...draft,
            phone: e.target.value
          }), placeholder: "+994..." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-4 w-4" }),
            "Ünvan"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: draft.address ?? "", onChange: (e) => setDraft({
            ...draft,
            address: e.target.value
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center justify-between text-sm rounded-xl border p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Telefonu müştəri menyusunda göstər" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: draft.show_phone_on_menu ?? true, onCheckedChange: (v) => setDraft({
            ...draft,
            show_phone_on_menu: v
          }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-display text-lg flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Wifi, { className: "h-5 w-5" }),
          "Wi-Fi"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 md:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Şəbəkə adı" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: draft.wifi_name ?? "", onChange: (e) => setDraft({
              ...draft,
              wifi_name: e.target.value
            }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Şifrə" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: draft.wifi_password ?? "", onChange: (e) => setDraft({
              ...draft,
              wifi_password: e.target.value
            }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center justify-between text-sm rounded-xl border p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Wi-Fi məlumatını müştəri menyusunda göstər" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: draft.show_wifi_on_menu ?? true, onCheckedChange: (v) => setDraft({
            ...draft,
            show_wifi_on_menu: v
          }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5 space-y-4 xl:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-display text-lg flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-5 w-5" }),
          "Ofisiant təyinatı"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Yeni sifariş gələndə hansı ofisianta təyin edilməsi." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 md:grid-cols-3", children: [{
          v: "first_confirming_waiter",
          t: "İlk təsdiqləyən ofisiant",
          d: "Sifarişi ilk təsdiqləyən ofisiant bütün sessiyaya təyin olunur."
        }, {
          v: "manual_table_ranges",
          t: "Masa təyinatları üzrə",
          d: "Hər masa əvvəlcədən müəyyən ofisianta bağlanır."
        }, {
          v: "disabled",
          t: "Avtomatik təyinat yoxdur",
          d: "Bütün ofisiantlar bütün sifarişləri görür."
        }].map((opt) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setDraft({
          ...draft,
          waiter_assignment_mode: opt.v
        }), className: `text-left rounded-xl border p-4 transition ${draft.waiter_assignment_mode === opt.v ? "border-ember bg-ember/5 ring-1 ring-ember" : "hover:border-foreground/30"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-sm", children: opt.t }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-xs text-muted-foreground", children: opt.d })
        ] }, opt.v)) })
      ] })
    ] })
  ] });
}
export {
  SettingsPage as component
};
