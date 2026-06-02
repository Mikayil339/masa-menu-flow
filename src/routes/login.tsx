import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { PublicNav, PublicFooter } from "@/components/PublicNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleButton } from "@/components/GoogleButton";
import { useStore, type Role } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — MasaQR" },
      { name: "description", content: "Sign in to your MasaQR restaurant account." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const nav = useNavigate();
  const { login } = useStore();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error || !data.user) {
        toast.error(error?.message ?? "Sign-in failed");
        return;
      }
      const { data: profile, error: pErr } = await supabase
        .from("masaqr_users")
        .select("id,email,full_name,role,restaurant_id,branch_id,status")
        .eq("id", data.user.id)
        .maybeSingle();
      if (pErr || !profile) {
        await supabase.auth.signOut();
        toast.error(pErr?.message ?? "No profile found for this account. Contact your administrator.");
        return;
      }
      const role = (profile.role as Role) ?? "owner";
      login({
        email: profile.email ?? data.user.email ?? email,
        role,
        name: profile.full_name ?? (data.user.email ?? email).split("@")[0],
        branchId: profile.branch_id ?? null,
      });
      toast.success("Signed in");
      if (role === "kitchen") nav({ to: "/kitchen" });
      else if (role === "waiter") nav({ to: "/waiter" });
      else nav({ to: "/app" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PublicNav />
      <div className="mx-auto max-w-md px-6 py-16">
        <h1 className="font-display text-3xl">Welcome back</h1>
        <p className="text-sm text-muted-foreground mt-1">Sign in to manage your restaurant.</p>

        <div className="mt-8 space-y-3">
          <GoogleButton onClick={() => toast.error("Google sign-in is not enabled yet. Use email and password.")} label="Sign in with Google" />
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex-1 h-px bg-border" /> or with email <span className="flex-1 h-px bg-border" />
          </div>
        </div>

        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between"><Label>Password</Label><Link to="/forgot-password" className="text-xs text-ember">Forgot?</Link></div>
            <Input type="password" value={pass} onChange={e => setPass(e.target.value)} required />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-ember hover:bg-ember/90 text-ember-foreground">
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          New to MasaQR? <Link to="/register" className="text-ember font-medium">Start your free trial</Link>
        </div>
        <div className="mt-2 text-center text-xs text-muted-foreground">
          Joining a team? <Link to="/join" className="underline">Use your invite code</Link>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
