import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useMemo, useState } from "react";
import { Edit2, GripVertical, ImagePlus, Plus, Search, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import {
  fetchMenu,
  fetchOwnerContext,
  localName,
  money,
  type CategoryRow,
  type MenuItemRow,
  type Profile,
  type RestaurantRow,
} from "@/lib/masaqr";

export const Route = createFileRoute("/app/menu")({
  head: () => ({
    meta: [{ title: "Menu Builder — MasaQR" }],
  }),
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

      if (!ctx.profile?.restaurant_id) {
        setCategories([]);
        setItems([]);
        return;
      }

      const menu = await fetchMenu(ctx.profile.restaurant_id);
      setCategories(menu.categories);
      setItems(menu.items);
      setActiveCat((current) => current ?? menu.categories[0]?.id);
    } catch (err: any) {
      toast.error(err.message ?? "Could not load menu");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const activeCategory = categories.find((category) => category.id === activeCat);

  const visibleItems = useMemo(
    () =>
      items
        .filter((item) => item.category_id === activeCat)
        .filter((item) =>
          q
            ? localName(item.name, item.name_i18n, "en")
                .toLowerCase()
                .includes(q.toLowerCase())
            : true
        ),
    [items, activeCat, q]
  );

  async function toggleSoldOut(item: MenuItemRow) {
    const { error } = await supabase
      .from("masaqr_menu_items")
      .update({ is_sold_out: !item.is_sold_out })
      .eq("id", item.id);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Availability updated");
    load();
  }

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading menu…</div>;
  }

  if (!profile?.restaurant_id) {
    return (
      <div>
        <PageHeader
          title="Menu Builder"
          subtitle="Complete restaurant setup before editing the menu."
        />
        <div className="p-6">
          <Card className="p-6 text-sm text-muted-foreground">
            No restaurant is connected to this account.
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Menu Builder"
        subtitle="Manage real categories, items, prices, availability, and menu images."
        actions={
          <Button
            disabled={!activeCat}
            onClick={() =>
              activeCat
                ? setEditing(blankItem(profile.restaurant_id!, activeCat))
                : setNewCatOpen(true)
            }
            className="bg-ember hover:bg-ember/90 text-ember-foreground"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add item
          </Button>
        }
      />

      <div className="grid gap-6 p-6 xl:grid-cols-[280px_1fr]">
        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Categories</h2>
              <p className="text-xs text-muted-foreground">
                {categories.length} real categories
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setNewCatOpen(true)}>
              New
            </Button>
          </div>

          <div className="space-y-1">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCat(category.id)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition hover:bg-muted ${
                  activeCat === category.id ? "bg-ember/10 font-medium text-ember" : ""
                }`}
              >
                <span>{localName(category.name, category.name_i18n, "en")}</span>
                <span className="text-xs text-muted-foreground">
                  {items.filter((item) => item.category_id === category.id).length}
                </span>
              </button>
            ))}

            {categories.length === 0 ? (
              <div className="rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground">
                No categories yet.
              </div>
            ) : null}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-semibold">
                  {activeCategory
                    ? localName(activeCategory.name, activeCategory.name_i18n, "en")
                    : "Menu items"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {visibleItems.length} item(s) shown · {restaurant?.currency ?? "AZN"}
                </p>
              </div>

              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(event) => setQ(event.target.value)}
                  placeholder="Search items…"
                  className="pl-9"
                />
              </div>
            </div>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <div className="aspect-video bg-muted">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                      No image
                    </div>
                  )}
                </div>

                <div className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">
                        {localName(item.name, item.name_i18n, "en")}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {localName(item.description, item.description_i18n, "en") ||
                          "No description"}
                      </p>
                    </div>
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {money(item.price, restaurant?.currency ?? "AZN")}
                    </span>
                    <span
                      className={`rounded-full border px-2 py-1 text-xs ${
                        item.is_sold_out ? "text-destructive" : "text-emerald-600"
                      }`}
                    >
                      {item.is_sold_out ? "Sold out" : "Available"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t pt-3">
                    <label className="flex items-center gap-2 text-sm">
                      <Switch
                        checked={!item.is_sold_out}
                        onCheckedChange={() => toggleSoldOut(item)}
                      />
                      Available
                    </label>

                    <Button variant="outline" size="sm" onClick={() => setEditing(item)}>
                      <Edit2 className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {activeCat && visibleItems.length === 0 ? (
            <Card className="p-8 text-center text-sm text-muted-foreground">
              No items in this category yet.
            </Card>
          ) : null}
        </div>
      </div>

      {editing ? (
        <ItemEditor
          item={editing}
          onClose={() => setEditing(null)}
          onSaved={load}
        />
      ) : null}

      <NewCategoryDialog
        open={newCatOpen}
        onClose={() => setNewCatOpen(false)}
        restaurantId={profile.restaurant_id}
        onSaved={load}
      />
    </div>
  );
}

function blankItem(restaurantId: string, categoryId: string): MenuItemRow {
  return {
    id: "",
    restaurant_id: restaurantId,
    category_id: categoryId,
    name: "",
    name_i18n: {},
    description: "",
    description_i18n: {},
    price: 0,
    image_url: "",
    is_available: true,
    is_sold_out: false,
    sort_order: 0,
  };
}

function sanitizeFileName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function publicStorageUrl(path: string) {
  const { data } = supabase.storage.from("masaqr-menu-images").getPublicUrl(path);
  return data.publicUrl;
}

function ItemEditor({
  item,
  onClose,
  onSaved,
}: {
  item: MenuItemRow;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState<MenuItemRow>(item);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const isNew = !item.id;

  async function uploadImageIfNeeded() {
    if (!imageFile) return draft.image_url || null;

    setUploading(true);

    const fileName = sanitizeFileName(imageFile.name || "menu-image.jpg");
    const path = `${draft.restaurant_id}/${Date.now()}-${fileName}`;

    const { error } = await supabase.storage
      .from("masaqr-menu-images")
      .upload(path, imageFile, {
        cacheControl: "3600",
        upsert: false,
      });

    setUploading(false);

    if (error) throw error;
    return publicStorageUrl(path);
  }

  async function save() {
    if (!draft.name.trim()) {
      toast.error("Item name is required");
      return;
    }

    try {
      const imageUrl = await uploadImageIfNeeded();

      const payload = {
        restaurant_id: draft.restaurant_id,
        category_id: draft.category_id,
        name: draft.name.trim(),
        name_i18n: {
          az: draft.name.trim(),
          en: draft.name.trim(),
          ru: draft.name.trim(),
        },
        description: draft.description?.trim() || null,
        description_i18n: {
          az: draft.description?.trim() ?? "",
          en: draft.description?.trim() ?? "",
          ru: draft.description?.trim() ?? "",
        },
        price: Number(draft.price),
        image_url: imageUrl,
        is_available: draft.is_available,
        is_sold_out: draft.is_sold_out,
        sort_order: draft.sort_order,
      };

      const res = isNew
        ? await supabase.from("masaqr_menu_items").insert(payload)
        : await supabase.from("masaqr_menu_items").update(payload).eq("id", draft.id);

      if (res.error) throw res.error;

      toast.success("Saved · guest menu updated");
      onSaved();
      onClose();
    } catch (error: any) {
      toast.error(error.message ?? "Could not save menu item");
    }
  }

  async function remove() {
    if (!item.id) return;

    const { error } = await supabase
      .from("masaqr_menu_items")
      .update({ is_available: false })
      .eq("id", item.id);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Item hidden");
    onSaved();
    onClose();
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isNew ? "New menu item" : "Edit item"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input
                value={draft.name}
                onChange={(event) => setDraft({ ...draft, name: event.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Price</Label>
              <Input
                type="number"
                step="0.01"
                value={draft.price}
                onChange={(event) =>
                  setDraft({ ...draft, price: Number(event.target.value) })
                }
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              value={draft.description ?? ""}
              onChange={(event) =>
                setDraft({ ...draft, description: event.target.value })
              }
            />
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_180px]">
            <div className="space-y-1.5">
              <Label>Image URL</Label>
              <Input
                value={draft.image_url ?? ""}
                onChange={(event) =>
                  setDraft({ ...draft, image_url: event.target.value })
                }
                placeholder="https://..."
              />
              <p className="text-xs text-muted-foreground">
                Use an image URL or upload a local file below.
              </p>
            </div>

            <div className="overflow-hidden rounded-xl border bg-muted">
              {imageFile ? (
                <img
                  src={URL.createObjectURL(imageFile)}
                  alt="Preview"
                  className="h-full min-h-32 w-full object-cover"
                />
              ) : draft.image_url ? (
                <img
                  src={draft.image_url}
                  alt="Preview"
                  className="h-full min-h-32 w-full object-cover"
                />
              ) : (
                <div className="flex h-full min-h-32 items-center justify-center text-xs text-muted-foreground">
                  <ImagePlus className="mr-2 h-4 w-4" />
                  No image
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-dashed p-4">
            <Label className="mb-2 block">Upload local image</Label>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border bg-background px-4 py-3 text-sm hover:bg-muted">
              <UploadCloud className="h-4 w-4" />
              {imageFile ? imageFile.name : "Choose image from computer"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <Switch
              checked={!draft.is_sold_out}
              onCheckedChange={(value) => setDraft({ ...draft, is_sold_out: !value })}
            />
            Available for ordering
          </label>
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          {!isNew ? (
            <Button variant="ghost" className="text-destructive" onClick={remove}>
              Hide item
            </Button>
          ) : (
            <div />
          )}

          <div className="ml-auto flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              disabled={uploading}
              className="bg-ember hover:bg-ember/90 text-ember-foreground"
              onClick={save}
            >
              {uploading ? "Uploading..." : "Save"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NewCategoryDialog({
  open,
  onClose,
  restaurantId,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  restaurantId: string | null;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");

  async function create() {
    if (!restaurantId || !name.trim()) return;

    const value = name.trim();

    const { error } = await supabase.from("masaqr_categories").insert({
      restaurant_id: restaurantId,
      name: value,
      name_i18n: { az: value, en: value, ru: value },
      is_active: true,
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Category added");
    setName("");
    onSaved();
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New category</DialogTitle>
        </DialogHeader>

        <div className="space-y-1.5">
          <Label>Name</Label>
          <Input value={name} onChange={(event) => setName(event.target.value)} />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button className="bg-ember hover:bg-ember/90 text-ember-foreground" onClick={create}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
