import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useEffect, useMemo, useState } from "react";
import { Plus, Edit2, Search, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { fetchMenu, fetchOwnerContext, localName, money, type CategoryRow, type MenuItemRow, type Profile, type RestaurantRow } from "@/lib/masaqr";

export const Route = createFileRoute("/app/menu")({
  head: () => ({ meta: [{ title: "Menu Builder — MasaQR" }] }),
  component: MenuBuilder,
});

function MenuBuilder() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [restaurant, setRestaurant] = useState<RestaurantRow | null>(null);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [items, setItems] = useState<MenuItemRow[]>([]);
  const [activeCat, setActiveCat] = useState<string | undefined>();
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<MenuItemRow | null>(null);
  const [newCatOpen, setNewCatOpen] = useState(false);

  async function load() {
    try {
      const ctx = await fetchOwnerContext();
      setProfile(ctx.profile);
      setRestaurant(ctx.restaurant);
      if (!ctx.profile?.restaurant_id) return;
      const menu = await fetchMenu(ctx.profile.restaurant_id);
      setCategories(menu.categories);
      setItems(menu.items);
      setActiveCat(current => current ?? menu.categories[0]?.id);
    } catch (err: any) { toast.error(err.message ?? "Could not load menu"); }
  }
  useEffect(() => { load(); }, []);

  const visibleItems = useMemo(() => items.filter(i => i.category_id === activeCat).filter(i => !q || localName(i.name, i.name_i18n, "en").toLowerCase().includes(q.toLowerCase())), [items, activeCat, q]);

  async function toggleSoldOut(item: MenuItemRow) {
    const { error } = await supabase.from("masaqr_menu_items").update({ is_sold_out: !item.is_sold_out }).eq("id", item.id);
    if (error) toast.error(error.message); else { toast.success("Availability updated"); load(); }
  }

  return (
    <div className="p-6 md:p-10">
      <PageHeader title="Menu builder" subtitle="Edit once. Updates everywhere — guest menu, kitchen, and PDF." actions={<Button onClick={() => activeCat ? setEditing(blankItem(profile!.restaurant_id!, activeCat)) : setNewCatOpen(true)} className="bg-ember hover:bg-ember/90 text-ember-foreground"><Plus className="mr-1.5 h-4 w-4" /> Add item</Button>} />
      <div className="grid lg:grid-cols-[260px_1fr] gap-5">
        <Card className="p-3 h-fit">
          <div className="text-xs uppercase tracking-wider text-muted-foreground px-2 py-1.5">Categories</div>
          {categories.map(c => <button key={c.id} onClick={() => setActiveCat(c.id)} className={`w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm text-left hover:bg-muted ${activeCat === c.id ? "bg-ember/10 text-ember font-medium" : ""}`}><GripVertical className="h-3 w-3 text-muted-foreground" /><span className="flex-1 truncate">{localName(c.name, c.name_i18n, "en")}</span><span className="text-xs text-muted-foreground">{items.filter(i => i.category_id === c.id).length}</span></button>)}
          {categories.length === 0 && <div className="px-2 py-6 text-sm text-muted-foreground">No categories yet.</div>}
          <Button variant="ghost" size="sm" className="mt-2 w-full justify-start" onClick={() => setNewCatOpen(true)}><Plus className="h-4 w-4 mr-1" /> New category</Button>
        </Card>
        <div>
          <div className="relative mb-3 max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search items…" className="pl-9" /></div>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {visibleItems.map(item => <Card key={item.id} className="overflow-hidden group"><div className="aspect-[4/3] relative bg-muted">{item.image_url ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full grid place-items-center text-sm text-muted-foreground">No image</div>}{item.is_sold_out && <div className="absolute inset-0 bg-foreground/60 grid place-items-center"><span className="text-background text-sm font-medium uppercase tracking-wider">Sold out</span></div>}</div><div className="p-4"><div className="flex items-start justify-between gap-2"><h3 className="font-medium leading-tight">{localName(item.name, item.name_i18n, "en")}</h3><span className="text-ember font-semibold whitespace-nowrap">{money(item.price, restaurant?.currency ?? "AZN")}</span></div><p className="text-xs text-muted-foreground mt-1 line-clamp-2">{localName(item.description, item.description_i18n, "en")}</p><div className="mt-3 flex items-center gap-2 pt-3 border-t"><label className="flex items-center gap-1.5 text-xs"><Switch checked={!item.is_sold_out} onCheckedChange={() => toggleSoldOut(item)} />{item.is_sold_out ? "Sold out" : "Available"}</label><Button size="sm" variant="ghost" className="ml-auto h-7" onClick={() => setEditing(item)}><Edit2 className="h-3.5 w-3.5" /></Button></div></div></Card>)}
            {activeCat && <Card className="border-dashed grid place-items-center p-8 cursor-pointer hover:border-ember/40" onClick={() => setEditing(blankItem(profile!.restaurant_id!, activeCat))}><div className="text-center text-muted-foreground"><Plus className="h-8 w-8 mx-auto mb-2" /><div className="text-sm">Add item</div></div></Card>}
          </div>
        </div>
      </div>
      {editing && <ItemEditor item={editing} onClose={() => setEditing(null)} onSaved={load} />}
      <NewCategoryDialog open={newCatOpen} onClose={() => setNewCatOpen(false)} restaurantId={profile?.restaurant_id ?? null} onSaved={load} />
    </div>
  );
}

function blankItem(restaurantId: string, categoryId: string): MenuItemRow { return { id: "", restaurant_id: restaurantId, category_id: categoryId, name: "", name_i18n: {}, description: "", description_i18n: {}, price: 0, image_url: "", is_available: true, is_sold_out: false, sort_order: 0 }; }

function ItemEditor({ item, onClose, onSaved }: { item: MenuItemRow; onClose: () => void; onSaved: () => void }) {
  const [draft, setDraft] = useState<MenuItemRow>(item);
  const isNew = !item.id;
  async function save() {
    const payload = { restaurant_id: draft.restaurant_id, category_id: draft.category_id, name: draft.name, name_i18n: { az: draft.name, en: draft.name, ru: draft.name }, description: draft.description, description_i18n: { az: draft.description ?? "", en: draft.description ?? "", ru: draft.description ?? "" }, price: Number(draft.price), image_url: draft.image_url || null, is_available: draft.is_available, is_sold_out: draft.is_sold_out, sort_order: draft.sort_order };
    const res = isNew ? await supabase.from("masaqr_menu_items").insert(payload) : await supabase.from("masaqr_menu_items").update(payload).eq("id", draft.id);
    if (res.error) toast.error(res.error.message); else { toast.success("Saved · guest menu updated"); onSaved(); onClose(); }
  }
  async function remove() { if (!item.id) return; const { error } = await supabase.from("masaqr_menu_items").update({ is_available: false }).eq("id", item.id); if (error) toast.error(error.message); else { toast.success("Item hidden"); onSaved(); onClose(); } }
  return <Dialog open onOpenChange={onClose}><DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>{isNew ? "New menu item" : "Edit item"}</DialogTitle></DialogHeader><div className="space-y-3"><div><Label>Name</Label><Input value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} /></div><div><Label>Description</Label><Textarea rows={2} value={draft.description ?? ""} onChange={e => setDraft({ ...draft, description: e.target.value })} /></div><div className="grid grid-cols-2 gap-2"><div><Label>Price</Label><Input type="number" step="0.01" value={draft.price} onChange={e => setDraft({ ...draft, price: Number(e.target.value) })} /></div><div><Label>Image URL</Label><Input value={draft.image_url ?? ""} onChange={e => setDraft({ ...draft, image_url: e.target.value })} /></div></div><label className="flex items-center gap-2 text-sm"><Switch checked={!draft.is_sold_out} onCheckedChange={v => setDraft({ ...draft, is_sold_out: !v })} /> Available</label></div><DialogFooter className="flex justify-between sm:justify-between">{!isNew && <Button variant="ghost" className="text-destructive" onClick={remove}>Hide item</Button>}<div className="flex gap-2 ml-auto"><Button variant="outline" onClick={onClose}>Cancel</Button><Button className="bg-ember hover:bg-ember/90 text-ember-foreground" onClick={save}>Save</Button></div></DialogFooter></DialogContent></Dialog>;
}

function NewCategoryDialog({ open, onClose, restaurantId, onSaved }: { open: boolean; onClose: () => void; restaurantId: string | null; onSaved: () => void }) {
  const [name, setName] = useState("");
  async function create() { if (!restaurantId || !name.trim()) return; const { error } = await supabase.from("masaqr_categories").insert({ restaurant_id: restaurantId, name: name.trim(), name_i18n: { az: name, en: name, ru: name }, is_active: true }); if (error) toast.error(error.message); else { toast.success("Category added"); setName(""); onSaved(); onClose(); } }
  return <Dialog open={open} onOpenChange={onClose}><DialogContent><DialogHeader><DialogTitle>New category</DialogTitle></DialogHeader><div><Label>Name</Label><Input value={name} onChange={e => setName(e.target.value)} /></div><DialogFooter><Button variant="outline" onClick={onClose}>Cancel</Button><Button className="bg-ember hover:bg-ember/90 text-ember-foreground" onClick={create}>Create</Button></DialogFooter></DialogContent></Dialog>;
}
