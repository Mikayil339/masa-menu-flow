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
import { fetchOwnerContext, type BranchRow, type Profile } from "@/lib/masaqr";

export const Route = createFileRoute("/app/staff")({
  head: () => ({
    meta: [{ title: "Staff — MasaQR" }],
  }),
  component: StaffPage,
});

type StaffInvite = {
  id: string;
  restaurant_id: string;
  branch_id: string | null;
  code: string;
  role: "waiter" | "kitchen" | "staff";
  status: "active" | "used" | "expired";
  created_by: string;
  used_by: string | null;
  expires_at: string | null;
  created_at: string;
};

function StaffPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [branches, setBranches] = useState<BranchRow[]>([]);
  const [staff, setStaff] = useState<Profile[]>([]);
  const [invites, setInvites] = useState<StaffInvite[]>([]);
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<"waiter" | "kitchen" | "staff">("waiter");
  const [branchId, setBranchId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  async function loadStaff() {
    try {
      const ctx = await fetchOwnerContext();

      setProfile(ctx.profile);
      setBranches(ctx.branches);

      if (!ctx.profile?.restaurant_id) {
        setStaff([]);
        setInvites([]);
        return;
      }

      const restaurantId = ctx.profile.restaurant_id;

      const [staffResult, invitesResult] = await Promise.all([
        supabase
          .from("masaqr_users")
          .select("id,email,full_name,role,restaurant_id,branch_id,status,created_at")
          .eq("restaurant_id", restaurantId)
          .neq("role", "owner")
          .order("created_at", { ascending: false }),

        supabase
          .from("masaqr_staff_invites")
          .select("*")
          .eq("restaurant_id", restaurantId)
          .order("created_at", { ascending: false }),
      ]);

      if (staffResult.error) throw staffResult.error;
      if (invitesResult.error) throw invitesResult.error;

      setStaff((staffResult.data ?? []) as Profile[]);
      setInvites((invitesResult.data ?? []) as StaffInvite[]);

      if (!branchId && ctx.branches[0]?.id) {
        setBranchId(ctx.branches[0].id);
      }
    } catch (error: any) {
      toast.error(error.message ?? "Could not load staff");
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
      toast.error("Restaurant profile not found");
      return;
    }

    setCreating(true);

    try {
      const code = makeInviteCode();

      const { error } = await supabase.from("masaqr_staff_invites").insert({
        restaurant_id: profile.restaurant_id,
        branch_id: branchId || null,
        code,
        role,
        status: "active",
        created_by: profile.id,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });

      if (error) throw error;

      toast.success(`Invite created: ${code}`);
      setOpen(false);
      await loadStaff();
    } catch (error: any) {
      toast.error(error.message ?? "Could not create invite");
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

    toast.success("Invite cancelled");
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

    toast.success("Staff member deactivated");
    await loadStaff();
  }

  const activeInvites = invites.filter((invite) => invite.status === "active");
  const inactiveInvites = invites.filter((invite) => invite.status !== "active");

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading staff…</div>;
  }

  if (!profile?.restaurant_id) {
    return (
      <div>
        <PageHeader
          title="Staff"
          subtitle="Complete restaurant setup before inviting staff."
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
        title="Staff"
        subtitle="Manage real staff profiles and Supabase invite codes."
        actions={
          <Button
            onClick={() => setOpen(true)}
            className="bg-ember hover:bg-ember/90 text-ember-foreground"
          >
            <Plus className="mr-2 h-4 w-4" />
            Invite staff
          </Button>
        }
      />

      <div className="grid gap-6 p-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Team ({staff.length})</h2>
              <p className="text-sm text-muted-foreground">
                Real staff rows from masaqr_users.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={loadStaff}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh
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
                      {member.full_name || member.email || "Staff member"}
                    </p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-full border px-3 py-1 text-xs capitalize">
                    {member.role}
                  </span>
                  <span className="rounded-full border px-3 py-1 text-xs capitalize">
                    {member.status}
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
                No staff profiles yet. Create an invite code and let staff join.
              </div>
            ) : null}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-lg font-semibold">
            Active invites ({activeInvites.length})
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Real invite codes from masaqr_staff_invites.
          </p>

          <div className="space-y-3">
            {activeInvites.map((invite) => (
              <div
                key={invite.id}
                className="rounded-2xl border bg-card p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium capitalize">{invite.role}</p>
                    <p className="text-xs text-muted-foreground">
                      Expires:{" "}
                      {invite.expires_at
                        ? new Date(invite.expires_at).toLocaleDateString()
                        : "No expiry"}
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
                    toast.success("Invite code copied");
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
                No active invites.
              </div>
            ) : null}
          </div>

          {inactiveInvites.length > 0 ? (
            <div className="mt-6">
              <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                Previous invites
              </h3>

              <div className="space-y-2">
                {inactiveInvites.slice(0, 5).map((invite) => (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between border-b pb-2 text-sm"
                  >
                    <span className="font-mono">{invite.code}</span>
                    <span className="capitalize text-muted-foreground">
                      {invite.status}
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
            <DialogTitle>Invite staff</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Role</Label>
              <select
                value={role}
                onChange={(event) =>
                  setRole(event.target.value as "waiter" | "kitchen" | "staff")
                }
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="waiter">Waiter</option>
                <option value="kitchen">Kitchen</option>
                <option value="staff">Staff</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label>Branch</Label>
              <select
                value={branchId}
                onChange={(event) => setBranchId(event.target.value)}
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="">All branches</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>

            <p className="text-xs text-muted-foreground">
              This creates a real invite code in Supabase. Staff can use it on the
              join page.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button disabled={creating} onClick={createInvite}>
              {creating ? "Creating..." : "Create invite"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
