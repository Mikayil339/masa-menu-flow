import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { PublicNav, PublicFooter } from "@/components/PublicNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleButton } from "@/components/GoogleButton";
import { useStore, type Role } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
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
  const [email, setEmail] = useState(() => localStorage.getItem("masaqr_remember_email") ?? "");
  const [pass, setPass] = useState("");
  const [rememberMe, setRememberMe] = useState(() => Boolean(localStorage.getItem("masaqr_remember_email")));
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  function redirectByRole(role: Role) {
    if (role === "kitchen") nav({ to: "/kitchen" });
    else if (role === "waiter") nav({ to: "/waiter" });
    else nav({ to: "/app" });
  }

  async function loadProfileAndEnter(userId: string, fallbackEmail?: string | null) {
    const { data: profile, error: pErr } = await supabase
      .from("masaqr_users")
      .select("id,email,full_name,role,restaurant_id,branch_id,status")
      .eq("id", userId)
      .maybeSingle();

    if (pErr || !profile) {
      await supabase.auth.signOut();
      toast.error(pErr?.message ?? "No profile found for this account. Contact your administrator.");
      return;
    }

    if (profile.status === "inactive") {
      await supabase.auth.signOut();
      toast.error("This account is inactive. Contact your manager.");
      return;
    }

    const role = (profile.role as Role) ?? "owner";

    login({
      email: profile.email ?? fallbackEmail ?? email,
      role,
      name: profile.full_name ?? (profile.email ?? fallbackEmail ?? email).split("@")[0],
      branchId: profile.branch_id ?? null,
    });

    redirectByRole(role);
  }

  useEffect(() => {
    let alive = true;

    async function restoreSession() {
      const { data } = await supabase.auth.getSession();
      if (!alive) return;

      const user = data.session?.user;
      if (user) {
        await loadProfileAndEnter(user.id, user.email);
      }

      if (alive) setCheckingSession(false);
    }

    restoreSession();

    return () => {
      alive = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: pass,
      });

      if (error || !data.user) {
        toast.error(error?.message ?? "Sign-in failed");
        return;
      }

      if (rememberMe) {
        localStorage.setItem("masaqr_remember_email", normalizedEmail);
      } else {
        localStorage.removeItem("masaqr_remember_email");
      }

      await loadProfileAndEnter(data.user.id, data.user.email);
      toast.success("Signed in");
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div>
        <PublicNav />
        <div className="mx-auto max-w-md px-6 py-16 text-sm text-muted-foreground">
          Checking your session…
        </div>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div>
      <PublicNav />
      <div className="mx-auto max-w-md px-6 py-16">
        <h1 className="font-display text-3xl">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sign in to manage your restaurant.</p>

        <div className="mt-8 space-y-3">
          <GoogleButton
            onClick={() => toast.error("Google sign-in is not enabled yet. Use email and password.")}
            label="Sign in with Google"
          />
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or with email <span className="h-px flex-1 bg-border" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between">
              <Label>Password</Label>
              <Link to="/forgot-password" className="text-xs text-ember">Forgot?</Link>
            </div>
            <Input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              required
            />
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            Remember me on this device
          </label>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-ember text-ember-foreground hover:bg-ember/90"
          >
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          New to MasaQR? <Link to="/register" className="font-medium text-ember">Start your free trial</Link>
        </div>
        <div className="mt-2 text-center text-xs text-muted-foreground">
          Joining a team? <Link to="/join" className="underline">Use your invite code</Link>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
