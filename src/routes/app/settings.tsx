import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2, Upload, Wifi, Phone, MapPin, Languages, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { fetchOwnerContext, uploadImage, type Profile, type RestaurantRow, type WaiterAssignmentMode } from "@/lib/masaqr";
import type { Lang } from "@/lib/store";

export const Route = createFileRoute("/app/settings")({
  head: () => ({ meta: [{ title: "Ayarlar — MasaQR" }] }),
  component: SettingsPage,
});

type SettingsRow = RestaurantRow & {
  phone?: string | null;
  address?: string | null;
  wifi_name?: string | null;
  wifi_password?: string | null;
  description?: string | null;
  description_i18n?: Record<string, string> | null;
  waiter_assignment_mode?: WaiterAssignmentMode | null;
  show_wifi_on_menu?: boolean | null;
  show_phone_on_menu?: boolean | null;
};

const LANGS: { code: Lang; label: string }[] = [
  { code: "az", label: "Azərbaycan" },
  { code: "en", label: "English" },
  { code: "ru", label: "Русский" },
];

function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [draft, setDraft] = useState<SettingsRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const logoInput = useRef<HTMLInputElement>(null);
  const coverInput = useRef<HTMLInputElement>(null);

  async function load() {
    try {
      const ctx = await fetchOwnerContext();
      setProfile(ctx.profile);
      setDraft(ctx.restaurant as SettingsRow);
    } catch (e: any) {
      toast.error(e.message ?? "Ayarları yükləmək alınmadı");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleUpload(kind: "logo" | "cover", file: File) {
    if (!profile?.restaurant_id || !draft) return;
    const setter = kind === "logo" ? setUploadingLogo : setUploadingCover;
    setter(true);
    try {
      const bucket = kind === "logo" ? "masaqr-logos" : "masaqr-covers";
      const url = await uploadImage(bucket, file, profile.restaurant_id);
      const col = kind === "logo" ? "logo_url" : "cover_url";
      const { error } = await supabase.from("masaqr_restaurants").update({ [col]: url }).eq("id", profile.restaurant_id);
      if (error) throw error;
      setDraft({ ...draft, [col]: url } as SettingsRow);
      toast.success(kind === "logo" ? "Loqo yeniləndi" : "Üz şəkli yeniləndi");
    } catch (e: any) {
      toast.error(e.message ?? "Yükləmə alınmadı. Storage bucket-ları yoxlayın.");
    } finally {
      setter(false);
    }
  }

  async function save() {
    if (!draft || !profile?.restaurant_id) return;
    setSaving(true);
    try {
      const enabledLangs = (draft.enabled_languages?.length ? draft.enabled_languages : [draft.default_language]) as Lang[];
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
        show_phone_on_menu: draft.show_phone_on_menu ?? true,
      };
      const { error } = await supabase.from("masaqr_restaurants").update(payload).eq("id", profile.restaurant_id);
      if (error) throw error;
      toast.success("Ayarlar yadda saxlanıldı");
      await load();
    } catch (e: any) {
      toast.error(e.message ?? "Yadda saxlamaq alınmadı");
    } finally {
      setSaving(false);
    }
  }

  function toggleLang(lang: Lang) {
    if (!draft) return;
    const cur = (draft.enabled_languages ?? [draft.default_language]) as Lang[];
    const has = cur.includes(lang);
    let next = has ? cur.filter(l => l !== lang) : [...cur, lang];
    if (next.length === 0) next = [draft.default_language];
    setDraft({ ...draft, enabled_languages: next });
  }

  if (loading) return <div className="p-6 text-sm text-muted-foreground">Yüklənir…</div>;

  if (!profile?.restaurant_id || !draft) {
    return (
      <div>
        <PageHeader title="Ayarlar" subtitle="Restoran bu hesabla əlaqəli deyil." />
        <div className="p-6"><Card className="p-6 text-sm text-muted-foreground">Əvvəlcə restoran quraşdırın.</Card></div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Ayarlar"
        subtitle="Bütün dəyişikliklər birbaşa Supabase-də saxlanılır və müştəri menyusunda dərhal göstərilir."
        actions={
          <Button onClick={save} disabled={saving} className="bg-ember hover:bg-ember/90 text-ember-foreground">
            {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Yadda saxlanılır…</> : "Yadda saxla"}
          </Button>
        }
      />

      <div className="grid gap-6 p-6 xl:grid-cols-2">
        {/* Restaurant identity */}
        <Card className="p-5 space-y-4">
          <h3 className="font-display text-lg">Restoran məlumatı</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <div><Label>Restoran adı</Label><Input value={draft.name ?? ""} onChange={e => setDraft({ ...draft, name: e.target.value })} /></div>
            <div><Label>URL ünvanı (slug)</Label><Input value={draft.slug ?? ""} onChange={e => setDraft({ ...draft, slug: e.target.value })} /></div>
            <div><Label>Valyuta</Label><Input value={draft.currency ?? "AZN"} onChange={e => setDraft({ ...draft, currency: e.target.value })} /></div>
            <div>
              <Label>Əsas dil</Label>
              <select className="w-full h-9 rounded-md border bg-background px-3 text-sm" value={draft.default_language} onChange={e => setDraft({ ...draft, default_language: e.target.value as Lang })}>
                {LANGS.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <Label>Qısa təsvir</Label>
            <Textarea rows={3} value={draft.description ?? ""} onChange={e => setDraft({ ...draft, description: e.target.value })} />
          </div>
        </Card>

        {/* Languages */}
        <Card className="p-5 space-y-4">
          <h3 className="font-display text-lg flex items-center gap-2"><Languages className="h-5 w-5" />Müştəri dilləri</h3>
          <p className="text-sm text-muted-foreground">Müştərinin QR menyusunda görəcəyi dilləri seçin.</p>
          <div className="space-y-2">
            {LANGS.map(l => {
              const checked = (draft.enabled_languages ?? [draft.default_language]).includes(l.code);
              return (
                <label key={l.code} className="flex items-center justify-between rounded-xl border p-3 text-sm">
                  <span>{l.label}</span>
                  <Switch checked={checked} onCheckedChange={() => toggleLang(l.code)} />
                </label>
              );
            })}
          </div>
        </Card>

        {/* Logo */}
        <Card className="p-5 space-y-4">
          <h3 className="font-display text-lg">Loqo</h3>
          <div className="flex items-center gap-4">
            <div className="h-24 w-24 rounded-2xl border bg-muted overflow-hidden flex items-center justify-center">
              {draft.logo_url ? <img src={draft.logo_url} alt="logo" className="h-full w-full object-cover" /> : <span className="text-xs text-muted-foreground">Yoxdur</span>}
            </div>
            <div className="flex-1">
              <input ref={logoInput} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload("logo", f); }} />
              <Button variant="outline" onClick={() => logoInput.current?.click()} disabled={uploadingLogo}>
                {uploadingLogo ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Yüklənir…</> : <><Upload className="mr-2 h-4 w-4" />Loqo yüklə</>}
              </Button>
              <p className="mt-2 text-xs text-muted-foreground">PNG/JPG. Müştəri menyusunda və QR kartda görünür.</p>
            </div>
          </div>
        </Card>

        {/* Cover */}
        <Card className="p-5 space-y-4">
          <h3 className="font-display text-lg">Üz şəkli</h3>
          <div className="aspect-video rounded-2xl border bg-muted overflow-hidden">
            {draft.cover_url ? <img src={draft.cover_url} alt="cover" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xs text-muted-foreground">Yoxdur</div>}
          </div>
          <input ref={coverInput} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload("cover", f); }} />
          <Button variant="outline" onClick={() => coverInput.current?.click()} disabled={uploadingCover}>
            {uploadingCover ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Yüklənir…</> : <><Upload className="mr-2 h-4 w-4" />Üz şəkli yüklə</>}
          </Button>
        </Card>

        {/* Contact */}
        <Card className="p-5 space-y-4">
          <h3 className="font-display text-lg flex items-center gap-2"><Phone className="h-5 w-5" />Əlaqə</h3>
          <div><Label>Telefon</Label><Input value={draft.phone ?? ""} onChange={e => setDraft({ ...draft, phone: e.target.value })} placeholder="+994..." /></div>
          <div><Label className="flex items-center gap-1"><MapPin className="h-4 w-4" />Ünvan</Label><Textarea rows={2} value={draft.address ?? ""} onChange={e => setDraft({ ...draft, address: e.target.value })} /></div>
          <label className="flex items-center justify-between text-sm rounded-xl border p-3">
            <span>Telefonu müştəri menyusunda göstər</span>
            <Switch checked={draft.show_phone_on_menu ?? true} onCheckedChange={v => setDraft({ ...draft, show_phone_on_menu: v })} />
          </label>
        </Card>

        {/* Wifi */}
        <Card className="p-5 space-y-4">
          <h3 className="font-display text-lg flex items-center gap-2"><Wifi className="h-5 w-5" />Wi-Fi</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <div><Label>Şəbəkə adı</Label><Input value={draft.wifi_name ?? ""} onChange={e => setDraft({ ...draft, wifi_name: e.target.value })} /></div>
            <div><Label>Şifrə</Label><Input value={draft.wifi_password ?? ""} onChange={e => setDraft({ ...draft, wifi_password: e.target.value })} /></div>
          </div>
          <label className="flex items-center justify-between text-sm rounded-xl border p-3">
            <span>Wi-Fi məlumatını müştəri menyusunda göstər</span>
            <Switch checked={draft.show_wifi_on_menu ?? true} onCheckedChange={v => setDraft({ ...draft, show_wifi_on_menu: v })} />
          </label>
        </Card>

        {/* Waiter assignment */}
        <Card className="p-5 space-y-4 xl:col-span-2">
          <h3 className="font-display text-lg flex items-center gap-2"><Users className="h-5 w-5" />Ofisiant təyinatı</h3>
          <p className="text-sm text-muted-foreground">Yeni sifariş gələndə hansı ofisianta təyin edilməsi.</p>
          <div className="grid gap-3 md:grid-cols-3">
            {([
              { v: "first_confirming_waiter", t: "İlk təsdiqləyən ofisiant", d: "Sifarişi ilk təsdiqləyən ofisiant bütün sessiyaya təyin olunur." },
              { v: "manual_table_ranges", t: "Masa təyinatları üzrə", d: "Hər masa əvvəlcədən müəyyən ofisianta bağlanır." },
              { v: "disabled", t: "Avtomatik təyinat yoxdur", d: "Bütün ofisiantlar bütün sifarişləri görür." },
            ] as { v: WaiterAssignmentMode; t: string; d: string }[]).map(opt => (
              <button
                key={opt.v}
                onClick={() => setDraft({ ...draft, waiter_assignment_mode: opt.v })}
                className={`text-left rounded-xl border p-4 transition ${draft.waiter_assignment_mode === opt.v ? "border-ember bg-ember/5 ring-1 ring-ember" : "hover:border-foreground/30"}`}
              >
                <div className="font-medium text-sm">{opt.t}</div>
                <div className="mt-1 text-xs text-muted-foreground">{opt.d}</div>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
