import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { Copy, Plus, RefreshCcw, UserRound, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { fetchOwnerContext, type Profile } from "@/lib/masaqr";

export const Route = createFileRoute("/app/staff")({
  head: () => ({
    meta: [{ title: "Ofisiantlar — MasaQR" }],
  }),
  component: StaffPage,
});

type StaffInvite = {
  id: string;
  restaurant_id: string;
  code: string;
  role: "waiter";
  status: "active" | "used" | "expired";
  created_by: string;
  used_by: string | null;
  expires_at: string | null;
  created_at: string;
};

function getRoleLabel(role?: string | null) {
  if (role === "waiter") return "Ofisiant";
  if (role === "manager" || role === "owner") return "Menecer";
  return "İşçi";
}

function getStatusLabel(status?: string | null) {
  if (status === "active") return "Aktiv";
  if (status === "inactive") return "Deaktiv";
  if (status === "used") return "İstifadə olunub";
  if (status === "expired") return "Müddəti bitib";
  return status || "Naməlum";
}

function StaffPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [staff, setStaff] = useState<Profile[]>([]);
  const [invites, setInvites] = useState<StaffInvite[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  async function loadStaff() {
    try {
      const ctx = await fetchOwnerContext();

      setProfile(ctx.profile);

      if (!ctx.profile?.restaurant_id) {
        setStaff([]);
        setInvites([]);
        return;
      }

      const restaurantId = ctx.profile.restaurant_id;

      const [staffResult, invitesResult] = await Promise.all([
        supabase
          .from("masaqr_users")
          .select("id,email,full_name,role,restaurant_id,status,created_at")
          .eq("restaurant_id", restaurantId)
          .in("role", ["waiter", "manager"])
          .order("created_at", { ascending: false }),

        supabase
          .from("masaqr_staff_invites")
          .select("*")
          .eq("restaurant_id", restaurantId)
          .order("created_at", { ascending: false }),
      ]);

      if (staffResult.error) throw staffResult.error;
      if (invitesResult.error) throw invitesResult.error;

      const staffRows: Profile[] = (staffResult.data ?? []).map((row: any) => ({
        id: String(row.id),
        restaurant_id: row.restaurant_id ?? null,
        email: row.email ?? null,
        full_name: row.full_name ?? null,
        role: "waiter" as const,
        branch_id: null,
        status: row.status ?? null,
      }));

      const inviteRows: StaffInvite[] = (invitesResult.data ?? []).map((row: any) => ({
        id: String(row.id),
        restaurant_id: String(row.restaurant_id),
        code: String(row.code),
        role: "waiter" as const,
        status: row.status ?? "active",
        created_by: String(row.created_by ?? ""),
        used_by: row.used_by ?? null,
        expires_at: row.expires_at ?? null,
        created_at: row.created_at ?? new Date().toISOString(),
      }));

      setStaff(staffRows);
      setInvites(inviteRows);
    } catch (error: any) {
      toast.error(error.message ?? "Ofisiant məlumatları yüklənmədi");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStaff();

    const channel = supabase
      .channel("staff-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "masaqr_users" },
        () => loadStaff()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "masaqr_staff_invites" },
        () => loadStaff()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  function makeInviteCode() {
    return `MQ-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  }

  async function createInvite() {
    if (!profile?.restaurant_id || !profile.id) {
      toast.error("Restoran profili tapılmadı");
      return;
    }

    setCreating(true);

    try {
      const code = makeInviteCode();

      const { error } = await supabase.from("masaqr_staff_invites").insert({
        restaurant_id: profile.restaurant_id,
        code,
        role: "waiter",
        status: "active",
        created_by: profile.id,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });

      if (error) throw error;

      toast.success(`Dəvət kodu yaradıldı: ${code}`);
      setOpen(false);
      await loadStaff();
    } catch (error: any) {
      toast.error(error.message ?? "Dəvət kodu yaradıla bilmədi");
    } finally {
      setCreating(false);
    }
  }

  async function cancelInvite(inviteId: string) {
    const { error } = await supabase
      .from("masaqr_staff_invites")
      .update({ status: "expired" })
      .eq("id", inviteId);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Dəvət ləğv edildi");
    await loadStaff();
  }

  async function deactivateStaff(userId: string) {
    const { error } = await supabase
      .from("masaqr_users")
      .update({ status: "inactive" })
      .eq("id", userId);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("İstifadəçi deaktiv edildi");
    await loadStaff();
  }

  const activeInvites = invites.filter((invite) => invite.status === "active");
  const inactiveInvites = invites.filter((invite) => invite.status !== "active");

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Ofisiantlar yüklənir…</div>;
  }

  if (!profile?.restaurant_id) {
    return (
      <div>
        <PageHeader
          title="Ofisiantlar"
          subtitle="Ofisiant dəvət etmək üçün əvvəl restoran qurulumunu tamamlayın."
        />
        <div className="p-6">
          <Card className="p-6 text-sm text-muted-foreground">
            Bu hesaba restoran qoşulmayıb.
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Ofisiantlar"
        subtitle="Komandanı real Supabase dəvət kodları ilə idarə edin."
        actions={
          <Button
            onClick={() => setOpen(true)}
            className="bg-ember hover:bg-ember/90 text-ember-foreground"
          >
            <Plus className="mr-2 h-4 w-4" />
            Ofisiant dəvət et
          </Button>
        }
      />

      <div className="grid gap-6 p-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Komanda ({staff.length})</h2>
              <p className="text-sm text-muted-foreground">
                Restorana bağlı real istifadəçi profilləri.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={loadStaff}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Yenilə
            </Button>
          </div>

          <div className="space-y-3">
            {staff.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-2xl border bg-card p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <UserRound className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="font-medium">
                      {member.full_name || member.email || "Komanda üzvü"}
                    </p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-full border px-3 py-1 text-xs">
                    {getRoleLabel(member.role)}
                  </span>
                  <span className="rounded-full border px-3 py-1 text-xs">
                    {getStatusLabel(member.status)}
                  </span>
                  {member.status !== "inactive" ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deactivateStaff(member.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}

            {staff.length === 0 ? (
              <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                Hələ ofisiant profili yoxdur. Dəvət kodu yaradın və ofisiant qoşulsun.
              </div>
            ) : null}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-lg font-semibold">
            Aktiv dəvətlər ({activeInvites.length})
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Dəvət kodları Supabase-də real saxlanılır.
          </p>

          <div className="space-y-3">
            {activeInvites.map((invite) => (
              <div
                key={invite.id}
                className="rounded-2xl border bg-card p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">Ofisiant</p>
                    <p className="text-xs text-muted-foreground">
                      Bitmə tarixi:{" "}
                      {invite.expires_at
                        ? new Date(invite.expires_at).toLocaleDateString()
                        : "Limitsiz"}
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => cancelInvite(invite.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(invite.code);
                    toast.success("Dəvət kodu kopyalandı");
                  }}
                  className="mt-3 flex w-full items-center justify-between rounded-xl border bg-background px-3 py-2 font-mono text-sm hover:bg-muted"
                >
                  {invite.code}
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            ))}

            {activeInvites.length === 0 ? (
              <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                Aktiv dəvət yoxdur.
              </div>
            ) : null}
          </div>

          {inactiveInvites.length > 0 ? (
            <div className="mt-6">
              <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                Əvvəlki dəvətlər
              </h3>

              <div className="space-y-2">
                {inactiveInvites.slice(0, 5).map((invite) => (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between border-b pb-2 text-sm"
                  >
                    <span className="font-mono">{invite.code}</span>
                    <span className="text-muted-foreground">
                      {getStatusLabel(invite.status)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ofisiant dəvət et</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Vəzifə</Label>
              <div className="h-10 w-full rounded-md border bg-muted px-3 py-2 text-sm">
                Ofisiant
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Bu əməliyyat Supabase-də real dəvət kodu yaradır. Ofisiant həmin kodla qoşulma səhifəsindən qeydiyyatdan keçə bilər.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Bağla
            </Button>
            <Button disabled={creating} onClick={createInvite}>
              {creating ? "Yaradılır..." : "Dəvət yarat"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
