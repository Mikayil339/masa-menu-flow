import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { PublicNav, PublicFooter } from "@/components/PublicNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore, type Role } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/join")({
  head: () => ({
    meta: [{ title: "Join your team — MasaQR" }],
  }),
  component: JoinPage,
});

function JoinPage() {
  const nav = useNavigate();
  const { login } = useStore();

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const inviteCode = code.trim().toUpperCase();
      const cleanEmail = email.trim().toLowerCase();
      const cleanName = name.trim();

      const { data: invite, error: inviteError } = await supabase
        .from("masaqr_staff_invites")
        .select("id,restaurant_id,branch_id,code,role,status,expires_at")
        .eq("code", inviteCode)
        .eq("status", "active")
        .maybeSingle();

      if (inviteError) throw inviteError;

      if (!invite) {
        toast.error("Invalid or expired code");
        return;
      }

      if (invite.expires_at && new Date(invite.expires_at).getTime() < Date.now()) {
        toast.error("Invalid or expired code");
        return;
      }

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: cleanName,
          },
        },
      });

      if (signUpError) throw signUpError;

      let userId = signUpData.user?.id ?? null;

      if (!userId || !signUpData.session) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
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

      const role = invite.role as Role;

      const { error: profileError } = await supabase.from("masaqr_users").upsert({
        id: userId,
        email: cleanEmail,
        full_name: cleanName,
        role,
        restaurant_id: invite.restaurant_id,
        branch_id: invite.branch_id,
        status: "active",
      });

      if (profileError) throw profileError;

      const { error: usedError } = await supabase
        .from("masaqr_staff_invites")
        .update({ status: "used", used_by: userId })
        .eq("id", invite.id);

      if (usedError) throw usedError;

      login({
        email: cleanEmail,
        role,
        name: cleanName,
        branchId: invite.branch_id ?? null,
      });

      toast.success(`Xoş gəlmisiniz, ${cleanName}`);

      if (role === "waiter" || role === "kitchen" || role === "staff") nav({ to: "/waiter" });
      else nav({ to: "/app" });
    } catch (error: any) {
      toast.error(error.message ?? "Komandaya qoşulmaq mümkün olmadı");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PublicNav />

      <div className="mx-auto max-w-md px-6 py-16">
        <h1 className="font-display text-3xl">Komandaya qoşul</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Restoran rəhbərindən aldığınız dəvət kodunu daxil edin.
        </p>

        <form className="mt-8 space-y-4" onSubmit={handleJoin}>
          <div className="space-y-1.5">
            <Label>Dəvət kodu</Label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="MQ-ABC123"
              className="font-mono tracking-widest"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>Adınız</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Samir"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>E-poçt</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ofisiant@restoran.az"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>Şifrə yarat</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Qoşulunur…" : "Komandaya qoşul"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          Komandadasınız? <Link to="/login" className="text-ember">Daxil ol</Link>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
