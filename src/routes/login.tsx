import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { PublicNav, PublicFooter } from "@/components/PublicNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleButton } from "@/components/GoogleButton";
import { useStore, type Role } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { T } from "@/lib/i18n";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Daxil ol — MasaQR" },
      { name: "description", content: "MasaQR restoran hesabınıza daxil olun." },
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
        toast.error(error?.message ?? T.auth.signInFailed);
        return;
      }
      const { data: profile, error: pErr } = await supabase
        .from("masaqr_users")
        .select("id,email,full_name,role,restaurant_id,status")
        .eq("id", data.user.id)
        .maybeSingle();
      if (pErr || !profile) {
        await supabase.auth.signOut();
        toast.error(pErr?.message ?? T.auth.noProfile);
        return;
      }
      // Legacy roles: owner/kitchen/staff -> manager UI gating happens in AppShell.
      // kitchen users now land on /waiter (kitchen route auto-redirects them).
      const role = (profile.role as Role) ?? "owner";
      login({
        email: profile.email ?? data.user.email ?? email,
        role,
        name: profile.full_name ?? (data.user.email ?? email).split("@")[0],
      });
      toast.success(T.auth.welcomeBack);
      if (role === "waiter" || role === "kitchen") nav({ to: "/waiter" });
      else nav({ to: "/app" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PublicNav />
      <div className="mx-auto max-w-md px-6 py-16">
        <h1 className="font-display text-3xl">{T.auth.welcomeBack}</h1>
        <p className="text-sm text-muted-foreground mt-1">{T.auth.signInSubtitle}</p>

        <div className="mt-8 space-y-3">
          <GoogleButton onClick={() => toast.error(T.auth.googleNotEnabled)} label={T.auth.signInWithGoogle} />
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex-1 h-px bg-border" /> {T.auth.or} <span className="flex-1 h-px bg-border" />
          </div>
        </div>

        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <Label>{T.auth.email}</Label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between"><Label>{T.auth.password}</Label><Link to="/forgot-password" className="text-xs text-ember">{T.auth.forgot}</Link></div>
            <Input type="password" value={pass} onChange={e => setPass(e.target.value)} required />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-ember hover:bg-ember/90 text-ember-foreground">
            {loading ? T.auth.signingIn : T.auth.signIn}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          {T.auth.newToMasaQr} <Link to="/register" className="text-ember font-medium">{T.auth.startTrial}</Link>
        </div>
        <div className="mt-2 text-center text-xs text-muted-foreground">
          {T.auth.joining} <Link to="/join" className="underline">{T.auth.useInvite}</Link>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
