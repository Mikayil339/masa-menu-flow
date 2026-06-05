import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useEffect, useMemo, useState } from "react";
import { Edit2, ImagePlus, Plus, Search, Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { fetchMenu, fetchOwnerContext, localName, money, type CategoryRow, type MenuItemRow, type Profile, type RestaurantRow } from "@/lib/masaqr";
import type { Lang } from "@/lib/store";

export const Route = createFileRoute("/app/menu")({
  head: () => ({ meta: [{ title: "Menyu — MasaQR" }] }),
  component: MenuBuilder,
});

function MenuBuilder() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [restaurant, setRestaurant] = useState<RestaurantRow | null>(null);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [items, setItems] = useState<MenuItemRow[]>([]);
  const [activeCat, setActiveCat] = useState<string>();
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<MenuItemRow | null>(null);
  const [newCatOpen, setNewCatOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const ctx = await fetchOwnerContext();
      setProfile(ctx.profile);
      setRestaurant(ctx.restaurant);
      if (!ctx.profile?.restaurant_id) { setCategories([]); setItems([]); return; }
      const menu = await fetchMenu(ctx.profile.restaurant_id);
      // also pull items with price_local/price_foreign
      const { data: extra } = await supabase.from("masaqr_menu_items").select("id, price_local, price_foreign").eq("restaurant_id", ctx.profile.restaurant_id);
      const extraMap = new Map((extra ?? []).map((r: any) => [r.id, r]));
      const enriched = menu.items.map(i => ({ ...i, ...(extraMap.get(i.id) ?? {}) } as MenuItemRow));
      setCategories(menu.categories);
      setItems(enriched);
      setActiveCat(c => c ?? menu.categories[0]?.id);
    } catch (err: any) {
      toast.error(err.message ?? "Menyu yüklənmədi");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const activeCategory = categories.find(c => c.id === activeCat);
  const visibleItems = useMemo(() => items
    .filter(i => i.category_id === activeCat)
    .filter(i => q ? localName(i.name, i.name_i18n, "az").toLowerCase().includes(q.toLowerCase()) : true), [items, activeCat, q]);

  async function toggleSoldOut(item: MenuItemRow) {
    const { error } = await supabase.from("masaqr_menu_items").update({ is_sold_out: !item.is_sold_out }).eq("id", item.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Status yeniləndi");
    load();
  }


  async function deleteCategory(category: CategoryRow) {
    const itemCount = items.filter((item) => item.category_id === category.id).length;
    const categoryName = localName(category.name, category.name_i18n, "az") || "kateqoriya";
    const ok = window.confirm(
      itemCount > 0
        ? `"${categoryName}" kateqoriyasını silmək istəyirsiniz? Bu kateqoriyadakı ${itemCount} məhsul da menyudan gizlədiləcək.`
        : `"${categoryName}" kateqoriyasını silmək istəyirsiniz?`
    );
    if (!ok) return;

    const { error: categoryError } = await supabase
      .from("masaqr_categories")
      .update({ is_active: false })
      .eq("id", category.id);

    if (categoryError) {
      toast.error(categoryError.message);
      return;
    }

    if (itemCount > 0) {
      const { error: itemError } = await supabase
        .from("masaqr_menu_items")
        .update({ is_available: false })
        .eq("category_id", category.id);

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

  if (loading) return <div className="p-6 text-sm text-muted-foreground">Yüklənir…</div>;
  if (!profile?.restaurant_id) {
    return <div><PageHeader title="Menyu" subtitle="Əvvəlcə restoran quraşdırın." /><div className="p-6"><Card className="p-6 text-sm text-muted-foreground">Restoran tapılmadı.</Card></div></div>;
  }

  return (
    <div>
      <PageHeader
        title="Menyu"
        subtitle="Real kateqoriyalar, məhsullar, qiymətlər (yerli/əcnəbi) və tövsiyələr."
        actions={
          <Button disabled={!activeCat} onClick={() => activeCat ? setEditing(blankItem(profile.restaurant_id!, activeCat)) : setNewCatOpen(true)} className="bg-ember hover:bg-ember/90 text-ember-foreground">
            <Plus className="mr-2 h-4 w-4" />Məhsul əlavə et
          </Button>
        }
      />

      <div className="grid gap-6 p-6 xl:grid-cols-[280px_1fr]">
        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Kateqoriyalar</h2>
              <p className="text-xs text-muted-foreground">{categories.length} kateqoriya</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setNewCatOpen(true)}>Yeni</Button>
          </div>
          <div className="space-y-1">
            {categories.map(c => {
              const count = items.filter(i => i.category_id === c.id).length;
              return (
                <div
                  key={c.id}
                  className={`group flex items-center gap-1 rounded-lg transition hover:bg-muted ${activeCat === c.id ? "bg-ember/10 text-ember" : ""}`}
                >
                  <button
                    type="button"
                    onClick={() => setActiveCat(c.id)}
                    className={`flex min-w-0 flex-1 items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${activeCat === c.id ? "font-medium" : ""}`}
                  >
                    <span className="truncate">{localName(c.name, c.name_i18n, "az")}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{count}</span>
                  </button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="mr-1 h-8 w-8 opacity-70 hover:text-destructive md:opacity-0 md:group-hover:opacity-100"
                    onClick={(event) => {
                      event.stopPropagation();
                      deleteCategory(c);
                    }}
                    title="Kateqoriyanı sil"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
            {categories.length === 0 && <div className="rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground">Kateqoriya yoxdur.</div>}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-semibold">{activeCategory ? localName(activeCategory.name, activeCategory.name_i18n, "az") : "Menyu"}</h2>
                <p className="text-sm text-muted-foreground">{visibleItems.length} məhsul · {restaurant?.currency ?? "AZN"}</p>
              </div>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Axtarış…" className="pl-9" />
              </div>
            </div>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleItems.map(item => (
              <Card key={item.id} className="overflow-hidden">
                <div className="aspect-video bg-muted">
                  {item.image_url ? <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" /> :
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Şəkil yoxdur</div>}
                </div>
                <div className="space-y-3 p-4">
                  <div>
                    <h3 className="font-semibold">{localName(item.name, item.name_i18n, "az")}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{localName(item.description, item.description_i18n, "az") || "Təsvir yoxdur"}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{money(item.price, restaurant?.currency ?? "AZN")}</span>
                    <span className={`rounded-full border px-2 py-1 text-xs ${item.is_sold_out ? "text-destructive" : "text-emerald-600"}`}>
                      {item.is_sold_out ? "Bitib" : "Mövcuddur"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t pt-3">
                    <label className="flex items-center gap-2 text-sm">
                      <Switch checked={!item.is_sold_out} onCheckedChange={() => toggleSoldOut(item)} />
                      Açıq
                    </label>
                    <Button variant="outline" size="sm" onClick={() => setEditing(item)}><Edit2 className="mr-2 h-4 w-4" />Redaktə</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {activeCat && visibleItems.length === 0 && <Card className="p-8 text-center text-sm text-muted-foreground">Bu kateqoriyada məhsul yoxdur.</Card>}
        </div>
      </div>

      {editing ? <ItemEditor item={editing} allItems={items} onClose={() => setEditing(null)} onSaved={load} /> : null}
      <NewCategoryDialog open={newCatOpen} onClose={() => setNewCatOpen(false)} restaurantId={profile.restaurant_id} onSaved={load} />
    </div>
  );
}

function blankItem(restaurantId: string, categoryId: string): MenuItemRow {
  return {
    id: "",
    restaurant_id: restaurantId,
    category_id: categoryId,
    name: "",
    name_i18n: { az: "", en: "", ru: "" },
    description: "",
    description_i18n: { az: "", en: "", ru: "" },
    price: 0,
    image_url: "",
    is_available: true,
    is_sold_out: false,
    sort_order: 0,
  };
}

function sanitizeFileName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

function publicStorageUrl(path: string) {
  const { data } = supabase.storage.from("masaqr-menu-images").getPublicUrl(path);
  return data.publicUrl;
}

type ExtendedItem = MenuItemRow & { price_local?: number | string | null; price_foreign?: number | string | null };

function ItemEditor({ item, allItems, onClose, onSaved }: { item: MenuItemRow; allItems: MenuItemRow[]; onClose: () => void; onSaved: () => void; }) {
  const [draft, setDraft] = useState<ExtendedItem>(item as ExtendedItem);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [suggestionIds, setSuggestionIds] = useState<string[]>([]);
  const isNew = !item.id;

  useEffect(() => {
    if (!item.id) return;
    supabase.from("masaqr_menu_item_suggestions").select("suggested_item_id").eq("source_item_id", item.id).eq("is_active", true)
      .then(({ data }) => setSuggestionIds((data ?? []).map((r: any) => r.suggested_item_id)));
  }, [item.id]);

  const i18n = (draft.name_i18n ?? {}) as Record<string, string>;
  const dI18n = (draft.description_i18n ?? {}) as Record<string, string>;

  function setLangName(lang: Lang, value: string) {
    setDraft({ ...draft, name_i18n: { ...i18n, [lang]: value }, ...(lang === "az" ? { name: value } : {}) });
  }
  function setLangDesc(lang: Lang, value: string) {
    setDraft({ ...draft, description_i18n: { ...dI18n, [lang]: value }, ...(lang === "az" ? { description: value } : {}) });
  }

  async function uploadImageIfNeeded() {
    if (!imageFile) return draft.image_url || null;
    setUploading(true);
    const fileName = sanitizeFileName(imageFile.name || "menu-image.jpg");
    const path = `${draft.restaurant_id}/${Date.now()}-${fileName}`;
    const { error } = await supabase.storage.from("masaqr-menu-images").upload(path, imageFile, { cacheControl: "3600", upsert: false });
    setUploading(false);
    if (error) throw error;
    return publicStorageUrl(path);
  }

  async function saveSuggestions(itemId: string) {
    await supabase.from("masaqr_menu_item_suggestions").delete().eq("source_item_id", itemId);
    if (suggestionIds.length === 0) return;
    const rows = suggestionIds.map((sid, idx) => ({
      restaurant_id: draft.restaurant_id,
      source_item_id: itemId,
      suggested_item_id: sid,
      sort_order: idx,
      is_active: true,
    }));
    await supabase.from("masaqr_menu_item_suggestions").insert(rows);
  }

  async function save() {
    const azName = (i18n.az || draft.name || "").trim();
    if (!azName) { toast.error("Ad (AZ) tələb olunur"); return; }
    try {
      const imageUrl = await uploadImageIfNeeded();
      const payload: any = {
        restaurant_id: draft.restaurant_id,
        category_id: draft.category_id,
        name: azName,
        name_i18n: { az: i18n.az || azName, en: i18n.en || "", ru: i18n.ru || "" },
        description: (dI18n.az || draft.description || "").trim() || null,
        description_i18n: { az: dI18n.az || "", en: dI18n.en || "", ru: dI18n.ru || "" },
        price: Number(draft.price ?? 0),
        price_local: draft.price_local != null && draft.price_local !== "" ? Number(draft.price_local) : null,
        price_foreign: draft.price_foreign != null && draft.price_foreign !== "" ? Number(draft.price_foreign) : null,
        image_url: imageUrl,
        is_available: draft.is_available,
        is_sold_out: draft.is_sold_out,
        sort_order: draft.sort_order,
      };
      let savedId = draft.id;
      if (isNew) {
        const { data, error } = await supabase.from("masaqr_menu_items").insert(payload).select("id").single();
        if (error) throw error;
        savedId = data.id;
      } else {
        const { error } = await supabase.from("masaqr_menu_items").update(payload).eq("id", draft.id);
        if (error) throw error;
      }
      if (savedId) await saveSuggestions(savedId);
      toast.success("Yadda saxlanıldı");
      onSaved();
      onClose();
    } catch (error: any) {
      toast.error(error.message ?? "Saxlamaq alınmadı");
    }
  }

  async function remove() {
    if (!item.id) return;
    const { error } = await supabase.from("masaqr_menu_items").update({ is_available: false }).eq("id", item.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Gizlədildi");
    onSaved();
    onClose();
  }

  const otherItems = allItems.filter(i => i.id !== item.id);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{isNew ? "Yeni məhsul" : "Məhsulu redaktə et"}</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-2">

          <div className="rounded-xl border p-3 space-y-2">
            <Label className="text-xs uppercase text-muted-foreground">Ad (3 dil)</Label>
            {(["az", "en", "ru"] as Lang[]).map(l => (
              <div key={l} className="grid grid-cols-[40px_1fr] gap-2 items-center">
                <span className="text-xs font-mono uppercase text-muted-foreground">{l}</span>
                <Input value={i18n[l] ?? ""} onChange={e => setLangName(l, e.target.value)} placeholder={l === "az" ? "Tələb olunur" : "İstəyə bağlı"} />
              </div>
            ))}
          </div>

          <div className="rounded-xl border p-3 space-y-2">
            <Label className="text-xs uppercase text-muted-foreground">Təsvir (3 dil)</Label>
            {(["az", "en", "ru"] as Lang[]).map(l => (
              <div key={l} className="grid grid-cols-[40px_1fr] gap-2 items-start">
                <span className="text-xs font-mono uppercase text-muted-foreground pt-2">{l}</span>
                <Textarea rows={2} value={dI18n[l] ?? ""} onChange={e => setLangDesc(l, e.target.value)} />
              </div>
            ))}
          </div>

          <div className="rounded-xl border p-3 space-y-3">
            <Label className="text-xs uppercase text-muted-foreground">Qiymət</Label>
            <div className="grid gap-3 md:grid-cols-3">
              <div><Label className="text-xs">Əsas</Label><Input type="number" step="0.01" value={draft.price as any} onChange={e => setDraft({ ...draft, price: Number(e.target.value) })} /></div>
              <div><Label className="text-xs">Yerli müştəri</Label><Input type="number" step="0.01" value={(draft.price_local ?? "") as any} onChange={e => setDraft({ ...draft, price_local: e.target.value })} placeholder="Əsas" /></div>
              <div><Label className="text-xs">Əcnəbi müştəri</Label><Input type="number" step="0.01" value={(draft.price_foreign ?? "") as any} onChange={e => setDraft({ ...draft, price_foreign: e.target.value })} placeholder="Əsas" /></div>
            </div>
            <p className="text-xs text-muted-foreground">Boş buraxılsa əsas qiymət. QR-da <code>?type=foreign</code> əcnəbi qiyməti aktiv edir.</p>
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_180px]">
            <div className="space-y-1.5">
              <Label>Şəkil linki</Label>
              <Input value={draft.image_url ?? ""} onChange={e => setDraft({ ...draft, image_url: e.target.value })} placeholder="https://..." />
            </div>
            <div className="overflow-hidden rounded-xl border bg-muted">
              {imageFile ? <img src={URL.createObjectURL(imageFile)} className="h-full min-h-32 w-full object-cover" /> :
                draft.image_url ? <img src={draft.image_url} className="h-full min-h-32 w-full object-cover" /> :
                <div className="flex h-full min-h-32 items-center justify-center text-xs text-muted-foreground"><ImagePlus className="mr-2 h-4 w-4" />Yoxdur</div>}
            </div>
          </div>

          <div className="rounded-2xl border border-dashed p-4">
            <Label className="mb-2 block">Kompüterdən yüklə</Label>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border bg-background px-4 py-3 text-sm hover:bg-muted">
              <UploadCloud className="h-4 w-4" />
              {imageFile ? imageFile.name : "Şəkil seç"}
              <input type="file" accept="image/*" className="hidden" onChange={e => setImageFile(e.target.files?.[0] ?? null)} />
            </label>
          </div>

          <div className="rounded-xl border p-3 space-y-2">
            <Label className="text-xs uppercase text-muted-foreground">Tövsiyə olunan məhsullar</Label>
            <p className="text-xs text-muted-foreground">Müştəri bu məhsulu seçəndə göstərilir.</p>
            <div className="max-h-48 overflow-y-auto rounded border divide-y">
              {otherItems.length === 0 ? <div className="p-3 text-xs text-muted-foreground">Başqa məhsul yoxdur.</div> :
                otherItems.map(o => {
                  const checked = suggestionIds.includes(o.id);
                  return (
                    <label key={o.id} className="flex items-center justify-between p-2 text-sm hover:bg-muted/40 cursor-pointer">
                      <span className="truncate">{localName(o.name, o.name_i18n, "az")}</span>
                      <input type="checkbox" checked={checked} onChange={() => setSuggestionIds(checked ? suggestionIds.filter(x => x !== o.id) : [...suggestionIds, o.id])} />
                    </label>
                  );
                })}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <Switch checked={!draft.is_sold_out} onCheckedChange={v => setDraft({ ...draft, is_sold_out: !v })} />
            Sifariş üçün açıq
          </label>
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          {!isNew ? <Button variant="ghost" className="text-destructive" onClick={remove}>Gizlət</Button> : <div />}
          <div className="ml-auto flex gap-2">
            <Button variant="outline" onClick={onClose}>Ləğv et</Button>
            <Button disabled={uploading} className="bg-ember hover:bg-ember/90 text-ember-foreground" onClick={save}>
              {uploading ? "Yüklənir..." : "Yadda saxla"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NewCategoryDialog({ open, onClose, restaurantId, onSaved }: { open: boolean; onClose: () => void; restaurantId: string | null; onSaved: () => void; }) {
  const [name, setName] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [nameRu, setNameRu] = useState("");

  async function create() {
    if (!restaurantId || !name.trim()) return;
    const value = name.trim();
    const { error } = await supabase.from("masaqr_categories").insert({
      restaurant_id: restaurantId,
      name: value,
      name_i18n: { az: value, en: nameEn.trim() || value, ru: nameRu.trim() || value },
      is_active: true,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Kateqoriya əlavə edildi");
    setName(""); setNameEn(""); setNameRu("");
    onSaved();
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>Yeni kateqoriya</DialogTitle></DialogHeader>
        <div className="space-y-2">
          <div><Label>Ad (AZ)</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
          <div><Label>Name (EN)</Label><Input value={nameEn} onChange={e => setNameEn(e.target.value)} /></div>
          <div><Label>Название (RU)</Label><Input value={nameRu} onChange={e => setNameRu(e.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Ləğv et</Button>
          <Button className="bg-ember hover:bg-ember/90 text-ember-foreground" onClick={create}>Yarat</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
