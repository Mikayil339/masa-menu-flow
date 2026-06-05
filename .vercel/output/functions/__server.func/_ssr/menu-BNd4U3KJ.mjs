import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { P as PageHeader } from "./AppShell-DE5YGknu.mjs";
import { C as Card } from "./card-BdXDhg5r.mjs";
import { B as Button } from "./button-DjOZMqFS.mjs";
import { I as Input } from "./input-D_U8fI25.mjs";
import { L as Label } from "./label-C8WJLhmR.mjs";
import { T as Textarea } from "./textarea-F69quoCd.mjs";
import { S as Switch } from "./switch-DkA5ZPe7.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogFooter } from "./dialog-Fr-Qmdjb.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { s as supabase } from "./supabase-C_P_XQd2.mjs";
import { l as localName, a as money, f as fetchOwnerContext, e as fetchMenu } from "./masaqr-BQ3x-CAL.mjs";
import { o as Plus, T as Trash2, G as Search, J as Pen, K as ImagePlus, N as CloudUpload } from "../_libs/lucide-react.mjs";
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
import "./store-MU1TcehK.mjs";
import "../_libs/zustand.mjs";
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
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/react-remove-scroll.mjs";
import "tslib";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "../_libs/supabase__functions-js.mjs";
function MenuBuilder() {
  const [profile, setProfile] = reactExports.useState(null);
  const [restaurant, setRestaurant] = reactExports.useState(null);
  const [categories, setCategories] = reactExports.useState([]);
  const [items, setItems] = reactExports.useState([]);
  const [activeCat, setActiveCat] = reactExports.useState();
  const [q, setQ] = reactExports.useState("");
  const [editing, setEditing] = reactExports.useState(null);
  const [newCatOpen, setNewCatOpen] = reactExports.useState(false);
  const [loading, setLoading] = reactExports.useState(true);
  async function load() {
    try {
      const ctx = await fetchOwnerContext();
      setProfile(ctx.profile);
      setRestaurant(ctx.restaurant);
      if (!ctx.profile?.restaurant_id) {
        setCategories([]);
        setItems([]);
        return;
      }
      const menu = await fetchMenu(ctx.profile.restaurant_id);
      const {
        data: extra
      } = await supabase.from("masaqr_menu_items").select("id, price_local, price_foreign").eq("restaurant_id", ctx.profile.restaurant_id);
      const extraMap = new Map((extra ?? []).map((r) => [r.id, r]));
      const enriched = menu.items.map((i) => ({
        ...i,
        ...extraMap.get(i.id) ?? {}
      }));
      setCategories(menu.categories);
      setItems(enriched);
      setActiveCat((c) => c ?? menu.categories[0]?.id);
    } catch (err) {
      toast.error(err.message ?? "Menyu yüklənmədi");
    } finally {
      setLoading(false);
    }
  }
  reactExports.useEffect(() => {
    load();
  }, []);
  const activeCategory = categories.find((c) => c.id === activeCat);
  const visibleItems = reactExports.useMemo(() => items.filter((i) => i.category_id === activeCat).filter((i) => q ? localName(i.name, i.name_i18n, "az").toLowerCase().includes(q.toLowerCase()) : true), [items, activeCat, q]);
  async function toggleSoldOut(item) {
    const {
      error
    } = await supabase.from("masaqr_menu_items").update({
      is_sold_out: !item.is_sold_out
    }).eq("id", item.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Status yeniləndi");
    load();
  }
  async function deleteCategory(category) {
    const itemCount = items.filter((item) => item.category_id === category.id).length;
    const categoryName = localName(category.name, category.name_i18n, "az") || "kateqoriya";
    const ok = window.confirm(itemCount > 0 ? `"${categoryName}" kateqoriyasını silmək istəyirsiniz? Bu kateqoriyadakı ${itemCount} məhsul da menyudan gizlədiləcək.` : `"${categoryName}" kateqoriyasını silmək istəyirsiniz?`);
    if (!ok) return;
    const {
      error: categoryError
    } = await supabase.from("masaqr_categories").update({
      is_active: false
    }).eq("id", category.id);
    if (categoryError) {
      toast.error(categoryError.message);
      return;
    }
    if (itemCount > 0) {
      const {
        error: itemError
      } = await supabase.from("masaqr_menu_items").update({
        is_available: false
      }).eq("category_id", category.id);
      if (itemError) {
        toast.error(itemError.message);
        return;
      }
    }
    toast.success("Kateqoriya silindi");
    const nextCategory = categories.find((candidate) => candidate.id !== category.id)?.id;
    setActiveCat(nextCategory);
    await load();
  }
  if (loading) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-sm text-muted-foreground", children: "Yüklənir…" });
  if (!profile?.restaurant_id) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "Menyu", subtitle: "Əvvəlcə restoran quraşdırın." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-6 text-sm text-muted-foreground", children: "Restoran tapılmadı." }) })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "Menyu", subtitle: "Real kateqoriyalar, məhsullar, qiymətlər (yerli/əcnəbi) və tövsiyələr.", actions: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { disabled: !activeCat, onClick: () => activeCat ? setEditing(blankItem(profile.restaurant_id, activeCat)) : setNewCatOpen(true), className: "bg-ember hover:bg-ember/90 text-ember-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-2 h-4 w-4" }),
      "Məhsul əlavə et"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 p-6 xl:grid-cols-[280px_1fr]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold", children: "Kateqoriyalar" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
              categories.length,
              " kateqoriya"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: () => setNewCatOpen(true), children: "Yeni" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          categories.map((c) => {
            const count = items.filter((i) => i.category_id === c.id).length;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `group flex items-center gap-1 rounded-lg transition hover:bg-muted ${activeCat === c.id ? "bg-ember/10 text-ember" : ""}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setActiveCat(c.id), className: `flex min-w-0 flex-1 items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${activeCat === c.id ? "font-medium" : ""}`, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: localName(c.name, c.name_i18n, "az") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 text-xs text-muted-foreground", children: count })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", size: "icon", className: "mr-1 h-8 w-8 opacity-70 hover:text-destructive md:opacity-0 md:group-hover:opacity-100", onClick: (event) => {
                event.stopPropagation();
                deleteCategory(c);
              }, title: "Kateqoriyanı sil", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
            ] }, c.id);
          }),
          categories.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground", children: "Kateqoriya yoxdur." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3 md:flex-row md:items-center md:justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold", children: activeCategory ? localName(activeCategory.name, activeCategory.name_i18n, "az") : "Menyu" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
              visibleItems.length,
              " məhsul · ",
              restaurant?.currency ?? "AZN"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full md:w-80", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: q, onChange: (e) => setQ(e.target.value), placeholder: "Axtarış…", className: "pl-9" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 md:grid-cols-2 xl:grid-cols-3", children: visibleItems.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-video bg-muted", children: item.image_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: item.image_url, alt: item.name, className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full items-center justify-center text-sm text-muted-foreground", children: "Şəkil yoxdur" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: localName(item.name, item.name_i18n, "az") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 line-clamp-2 text-sm text-muted-foreground", children: localName(item.description, item.description_i18n, "az") || "Təsvir yoxdur" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: money(item.price, restaurant?.currency ?? "AZN") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `rounded-full border px-2 py-1 text-xs ${item.is_sold_out ? "text-destructive" : "text-emerald-600"}`, children: item.is_sold_out ? "Bitib" : "Mövcuddur" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-t pt-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: !item.is_sold_out, onCheckedChange: () => toggleSoldOut(item) }),
                "Açıq"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => setEditing(item), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { className: "mr-2 h-4 w-4" }),
                "Redaktə"
              ] })
            ] })
          ] })
        ] }, item.id)) }),
        activeCat && visibleItems.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-8 text-center text-sm text-muted-foreground", children: "Bu kateqoriyada məhsul yoxdur." })
      ] })
    ] }),
    editing ? /* @__PURE__ */ jsxRuntimeExports.jsx(ItemEditor, { item: editing, allItems: items, onClose: () => setEditing(null), onSaved: load }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsx(NewCategoryDialog, { open: newCatOpen, onClose: () => setNewCatOpen(false), restaurantId: profile.restaurant_id, onSaved: load })
  ] });
}
function blankItem(restaurantId, categoryId) {
  return {
    id: "",
    restaurant_id: restaurantId,
    category_id: categoryId,
    name: "",
    name_i18n: {
      az: "",
      en: "",
      ru: ""
    },
    description: "",
    description_i18n: {
      az: "",
      en: "",
      ru: ""
    },
    price: 0,
    image_url: "",
    is_available: true,
    is_sold_out: false,
    sort_order: 0
  };
}
function sanitizeFileName(name) {
  return name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}
function publicStorageUrl(path) {
  const {
    data
  } = supabase.storage.from("masaqr-menu-images").getPublicUrl(path);
  return data.publicUrl;
}
function ItemEditor({
  item,
  allItems,
  onClose,
  onSaved
}) {
  const [draft, setDraft] = reactExports.useState(item);
  const [imageFile, setImageFile] = reactExports.useState(null);
  const [uploading, setUploading] = reactExports.useState(false);
  const [suggestionIds, setSuggestionIds] = reactExports.useState([]);
  const isNew = !item.id;
  reactExports.useEffect(() => {
    if (!item.id) return;
    supabase.from("masaqr_menu_item_suggestions").select("suggested_item_id").eq("source_item_id", item.id).eq("is_active", true).then(({
      data
    }) => setSuggestionIds((data ?? []).map((r) => r.suggested_item_id)));
  }, [item.id]);
  const i18n = draft.name_i18n ?? {};
  const dI18n = draft.description_i18n ?? {};
  function setLangName(lang, value) {
    setDraft({
      ...draft,
      name_i18n: {
        ...i18n,
        [lang]: value
      },
      ...lang === "az" ? {
        name: value
      } : {}
    });
  }
  function setLangDesc(lang, value) {
    setDraft({
      ...draft,
      description_i18n: {
        ...dI18n,
        [lang]: value
      },
      ...lang === "az" ? {
        description: value
      } : {}
    });
  }
  async function uploadImageIfNeeded() {
    if (!imageFile) return draft.image_url || null;
    setUploading(true);
    const fileName = sanitizeFileName(imageFile.name || "menu-image.jpg");
    const path = `${draft.restaurant_id}/${Date.now()}-${fileName}`;
    const {
      error
    } = await supabase.storage.from("masaqr-menu-images").upload(path, imageFile, {
      cacheControl: "3600",
      upsert: false
    });
    setUploading(false);
    if (error) throw error;
    return publicStorageUrl(path);
  }
  async function saveSuggestions(itemId) {
    await supabase.from("masaqr_menu_item_suggestions").delete().eq("source_item_id", itemId);
    if (suggestionIds.length === 0) return;
    const rows = suggestionIds.map((sid, idx) => ({
      restaurant_id: draft.restaurant_id,
      source_item_id: itemId,
      suggested_item_id: sid,
      sort_order: idx,
      is_active: true
    }));
    await supabase.from("masaqr_menu_item_suggestions").insert(rows);
  }
  async function save() {
    const azName = (i18n.az || draft.name || "").trim();
    if (!azName) {
      toast.error("Ad (AZ) tələb olunur");
      return;
    }
    try {
      const imageUrl = await uploadImageIfNeeded();
      const payload = {
        restaurant_id: draft.restaurant_id,
        category_id: draft.category_id,
        name: azName,
        name_i18n: {
          az: i18n.az || azName,
          en: i18n.en || "",
          ru: i18n.ru || ""
        },
        description: (dI18n.az || draft.description || "").trim() || null,
        description_i18n: {
          az: dI18n.az || "",
          en: dI18n.en || "",
          ru: dI18n.ru || ""
        },
        price: Number(draft.price ?? 0),
        price_local: draft.price_local != null && draft.price_local !== "" ? Number(draft.price_local) : null,
        price_foreign: draft.price_foreign != null && draft.price_foreign !== "" ? Number(draft.price_foreign) : null,
        image_url: imageUrl,
        is_available: draft.is_available,
        is_sold_out: draft.is_sold_out,
        sort_order: draft.sort_order
      };
      let savedId = draft.id;
      if (isNew) {
        const {
          data,
          error
        } = await supabase.from("masaqr_menu_items").insert(payload).select("id").single();
        if (error) throw error;
        savedId = data.id;
      } else {
        const {
          error
        } = await supabase.from("masaqr_menu_items").update(payload).eq("id", draft.id);
        if (error) throw error;
      }
      if (savedId) await saveSuggestions(savedId);
      toast.success("Yadda saxlanıldı");
      onSaved();
      onClose();
    } catch (error) {
      toast.error(error.message ?? "Saxlamaq alınmadı");
    }
  }
  async function remove() {
    if (!item.id) return;
    const {
      error
    } = await supabase.from("masaqr_menu_items").update({
      is_available: false
    }).eq("id", item.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Gizlədildi");
    onSaved();
    onClose();
  }
  const otherItems = allItems.filter((i) => i.id !== item.id);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sm:max-w-3xl max-h-[90vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: isNew ? "Yeni məhsul" : "Məhsulu redaktə et" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 py-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border p-3 space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs uppercase text-muted-foreground", children: "Ad (3 dil)" }),
        ["az", "en", "ru"].map((l) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[40px_1fr] gap-2 items-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-mono uppercase text-muted-foreground", children: l }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: i18n[l] ?? "", onChange: (e) => setLangName(l, e.target.value), placeholder: l === "az" ? "Tələb olunur" : "İstəyə bağlı" })
        ] }, l))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border p-3 space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs uppercase text-muted-foreground", children: "Təsvir (3 dil)" }),
        ["az", "en", "ru"].map((l) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[40px_1fr] gap-2 items-start", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-mono uppercase text-muted-foreground pt-2", children: l }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: dI18n[l] ?? "", onChange: (e) => setLangDesc(l, e.target.value) })
        ] }, l))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border p-3 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs uppercase text-muted-foreground", children: "Qiymət" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 md:grid-cols-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Əsas" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: draft.price, onChange: (e) => setDraft({
              ...draft,
              price: Number(e.target.value)
            }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Yerli müştəri" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: draft.price_local ?? "", onChange: (e) => setDraft({
              ...draft,
              price_local: e.target.value
            }), placeholder: "Əsas" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Əcnəbi müştəri" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: draft.price_foreign ?? "", onChange: (e) => setDraft({
              ...draft,
              price_foreign: e.target.value
            }), placeholder: "Əsas" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          "Boş buraxılsa əsas qiymət. QR-da ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "?type=foreign" }),
          " əcnəbi qiyməti aktiv edir."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 md:grid-cols-[1fr_180px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Şəkil linki" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: draft.image_url ?? "", onChange: (e) => setDraft({
            ...draft,
            image_url: e.target.value
          }), placeholder: "https://..." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-hidden rounded-xl border bg-muted", children: imageFile ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: URL.createObjectURL(imageFile), className: "h-full min-h-32 w-full object-cover" }) : draft.image_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: draft.image_url, className: "h-full min-h-32 w-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-full min-h-32 items-center justify-center text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ImagePlus, { className: "mr-2 h-4 w-4" }),
          "Yoxdur"
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-dashed p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "mb-2 block", children: "Kompüterdən yüklə" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex cursor-pointer items-center justify-center gap-2 rounded-xl border bg-background px-4 py-3 text-sm hover:bg-muted", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CloudUpload, { className: "h-4 w-4" }),
          imageFile ? imageFile.name : "Şəkil seç",
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", accept: "image/*", className: "hidden", onChange: (e) => setImageFile(e.target.files?.[0] ?? null) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border p-3 space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs uppercase text-muted-foreground", children: "Tövsiyə olunan məhsullar" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Müştəri bu məhsulu seçəndə göstərilir." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-48 overflow-y-auto rounded border divide-y", children: otherItems.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 text-xs text-muted-foreground", children: "Başqa məhsul yoxdur." }) : otherItems.map((o) => {
          const checked = suggestionIds.includes(o.id);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center justify-between p-2 text-sm hover:bg-muted/40 cursor-pointer", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: localName(o.name, o.name_i18n, "az") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked, onChange: () => setSuggestionIds(checked ? suggestionIds.filter((x) => x !== o.id) : [...suggestionIds, o.id]) })
          ] }, o.id);
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: !draft.is_sold_out, onCheckedChange: (v) => setDraft({
          ...draft,
          is_sold_out: !v
        }) }),
        "Sifariş üçün açıq"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "flex justify-between sm:justify-between", children: [
      !isNew ? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", className: "text-destructive", onClick: remove, children: "Gizlət" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", {}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-auto flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onClose, children: "Ləğv et" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: uploading, className: "bg-ember hover:bg-ember/90 text-ember-foreground", onClick: save, children: uploading ? "Yüklənir..." : "Yadda saxla" })
      ] })
    ] })
  ] }) });
}
function NewCategoryDialog({
  open,
  onClose,
  restaurantId,
  onSaved
}) {
  const [name, setName] = reactExports.useState("");
  const [nameEn, setNameEn] = reactExports.useState("");
  const [nameRu, setNameRu] = reactExports.useState("");
  async function create() {
    if (!restaurantId || !name.trim()) return;
    const value = name.trim();
    const {
      error
    } = await supabase.from("masaqr_categories").insert({
      restaurant_id: restaurantId,
      name: value,
      name_i18n: {
        az: value,
        en: nameEn.trim() || value,
        ru: nameRu.trim() || value
      },
      is_active: true
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Kateqoriya əlavə edildi");
    setName("");
    setNameEn("");
    setNameRu("");
    onSaved();
    onClose();
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Yeni kateqoriya" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ad (AZ)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: name, onChange: (e) => setName(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Name (EN)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: nameEn, onChange: (e) => setNameEn(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Название (RU)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: nameRu, onChange: (e) => setNameRu(e.target.value) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onClose, children: "Ləğv et" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "bg-ember hover:bg-ember/90 text-ember-foreground", onClick: create, children: "Yarat" })
    ] })
  ] }) });
}
export {
  MenuBuilder as component
};
