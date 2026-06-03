import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MapPin, Phone, Plus, Power, RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { fetchOwnerContext, type BranchRow, type Profile } from "@/lib/masaqr";

export const Route = createFileRoute("/app/branches")({
  head: () => ({
    meta: [{ title: "Branches — MasaQR" }],
  }),
  component: BranchesPage,
});

function BranchesPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [branches, setBranches] = useState<BranchRow[]>([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadBranches() {
    try {
      const ctx = await fetchOwnerContext();
      setProfile(ctx.profile);

      if (!ctx.profile?.restaurant_id) {
        setBranches([]);
        return;
      }

      const { data, error } = await supabase
        .from("masaqr_branches")
        .select("id,restaurant_id,name,location,phone,is_active,created_at")
        .eq("restaurant_id", ctx.profile.restaurant_id)
        .order("created_at", { ascending: true });

      if (error) throw error;

      setBranches((data ?? []) as BranchRow[]);
    } catch (error: any) {
      toast.error(error.message ?? "Could not load branches");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBranches();

    const channel = supabase
      .channel("branches-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "masaqr_branches" },
        () => loadBranches()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function createBranch() {
    if (!profile?.restaurant_id) {
      toast.error("Restaurant profile not found");
      return;
    }

    if (!name.trim()) {
      toast.error("Branch name is required");
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase.from("masaqr_branches").insert({
        restaurant_id: profile.restaurant_id,
        name: name.trim(),
        location: location.trim() || null,
        phone: phone.trim() || null,
        is_active: true,
      });

      if (error) throw error;

      toast.success("Branch created");
      setName("");
      setLocation("");
      setPhone("");
      setOpen(false);
      await loadBranches();
    } catch (error: any) {
      toast.error(error.message ?? "Could not create branch");
    } finally {
      setSaving(false);
    }
  }

  async function toggleBranch(branch: BranchRow) {
    const { error } = await supabase
      .from("masaqr_branches")
      .update({ is_active: !branch.is_active })
      .eq("id", branch.id);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(branch.is_active ? "Branch disabled" : "Branch enabled");
    await loadBranches();
  }

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading branches…</div>;
  }

  if (!profile?.restaurant_id) {
    return (
      <div>
        <PageHeader
          title="Branches"
          subtitle="Complete restaurant setup before managing branches."
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
        title="Branches"
        subtitle="Manage real restaurant branches from Supabase."
        actions={
          <Button
            onClick={() => setOpen(true)}
            className="bg-ember hover:bg-ember/90 text-ember-foreground"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add branch
          </Button>
        }
      />

      <div className="p-6">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Branches ({branches.length})</h2>
              <p className="text-sm text-muted-foreground">
                Real rows from masaqr_branches.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={loadBranches}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {branches.map((branch) => (
              <Card key={branch.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{branch.name}</h3>
                    <span className="mt-2 inline-flex rounded-full border px-3 py-1 text-xs capitalize">
                      {branch.is_active ? "active" : "inactive"}
                    </span>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleBranch(branch)}
                    title={branch.is_active ? "Disable branch" : "Enable branch"}
                  >
                    <Power className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{branch.location || "No location"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{branch.phone || "No phone"}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {branches.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              No branches yet. Create your first branch.
            </div>
          ) : null}
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add branch</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Branch name</Label>
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Main Branch"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Location</Label>
              <Input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Baku"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+994..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button disabled={saving} onClick={createBranch}>
              {saving ? "Creating..." : "Create branch"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
