import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { PublicNav, PublicFooter } from "@/components/PublicNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleButton } from "@/components/GoogleButton";
import { useStore, type Role } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { T } from "@/lib/i18n";
import { useEffect, useState } from "react";
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

type SupabaseUserForLogin = {
  id: string;
  email?: string | null;
  user_metadata?: {
    full_name?: string;
    name?: string;
    avatar_url?: string;
    [key: string]: unknown;
  };
};

type MasaQrUserProfile = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: Role | string | null;
  restaurant_id: string | null;
  status: string | null;
};

function normalizeRole(role: unknown): Role {
  return ((role as Role) ?? "owner") as Role;
}

function destinationForProfile(profile: MasaQrUserProfile) {
  const role = normalizeRole(profile.role);

  if (!profile.restaurant_id && role !== "waiter" && role !== "kitchen") {
    return "/setup";
  }

  return role === "waiter" ? "/waiter" : "/app";
}

function displayNameFromEmail(email: string) {
  return email.split("@")[0] || "MasaQR user";
}

function getUserDisplayName(user: SupabaseUserForLogin, fallbackEmail: string) {
  return (
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    displayNameFromEmail(fallbackEmail)
  );
}

function isOAuthProviderError(message: string) {
  const lower = message.toLowerCase();

  return (
    lower.includes("provider") ||
    lower.includes("oauth") ||
    lower.includes("google") ||
    lower.includes("unsupported")
  );
}

function LoginPage() {
  const nav = useNavigate();
  const { login } = useStore();

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  async function findProfileByAuthUser(user: SupabaseUserForLogin) {
    const userEmail = user.email?.trim().toLowerCase();

    const { data: profileById, error: idError } = await supabase
      .from("masaqr_users")
      .select("id,email,full_name,role,restaurant_id,status")
      .eq("id", user.id)
      .maybeSingle();

    if (idError) {
      return { profile: null, error: idError };
    }

    if (profileById) {
      return {
        profile: profileById as MasaQrUserProfile,
        error: null,
      };
    }

    if (!userEmail) {
      return {
        profile: null,
        error: null,
      };
    }

    const { data: profileByEmail, error: emailError } = await supabase
      .from("masaqr_users")
      .select("id,email,full_name,role,restaurant_id,status")
      .ilike("email", userEmail)
      .maybeSingle();

    if (emailError) {
      return { profile: null, error: emailError };
    }

    return {
      profile: (profileByEmail as MasaQrUserProfile | null) ?? null,
      error: null,
    };
  }

  async function createGoogleProfile(user: SupabaseUserForLogin) {
    const userEmail = user.email?.trim().toLowerCase();

    if (!userEmail) {
      return {
        profile: null,
        errorMessage: "Google hesabından e-poçt məlumatı alınmadı.",
      };
    }

    const fullName = getUserDisplayName(user, userEmail);

    const { data: newProfile, error: insertError } = await supabase
      .from("masaqr_users")
      .insert({
        id: user.id,
        email: userEmail,
        full_name: fullName,
        role: "owner",
        restaurant_id: null,
        status: "active",
      })
      .select("id,email,full_name,role,restaurant_id,status")
      .maybeSingle();

    if (insertError || !newProfile) {
      return {
        profile: null,
        errorMessage:
          insertError?.message ??
          "Google hesabı üçün profil yaradıla bilmədi.",
      };
    }

    return {
      profile: newProfile as MasaQrUserProfile,
      errorMessage: null,
    };
  }

  async function finishLoginFromUser(user: SupabaseUserForLogin) {
    const userEmail = user.email?.trim().toLowerCase();

    if (!userEmail) {
      await supabase.auth.signOut();
      toast.error("Bu hesabda e-poçt tapılmadı.");
      return;
    }

    const { profile: existingProfile, error: profileError } =
      await findProfileByAuthUser(user);

    if (profileError) {
      await supabase.auth.signOut();
      toast.error(profileError.message);
      return;
    }

    let profile = existingProfile;

    if (!profile) {
      const { profile: createdProfile, errorMessage } =
        await createGoogleProfile(user);

      if (!createdProfile) {
        await supabase.auth.signOut();
        toast.error(errorMessage ?? "Profil yaradıla bilmədi.");
        return;
      }

      profile = createdProfile;
      toast.success("Google hesabınız yaradıldı.");
    }

    if (profile.status && profile.status !== "active") {
      await supabase.auth.signOut();
      toast.error("Hesabınız aktiv deyil.");
      return;
    }

    const role = normalizeRole(profile.role);
    const finalEmail = profile.email ?? userEmail;

    login({
      email: finalEmail,
      role,
      name:
        profile.full_name ??
        user.user_metadata?.full_name ??
        user.user_metadata?.name ??
        displayNameFromEmail(finalEmail),
    });

    toast.success(T.auth.welcomeBack);

    nav({
      to: destinationForProfile(profile) as any,
    });
  }

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (!active) return;

        if (error) {
          toast.error(error.message);
          return;
        }

        if (data.session?.user) {
          await finishLoginFromUser(data.session.user);
        }
      } finally {
        if (active) setCheckingSession(false);
      }
    }

    restoreSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) return;

      setTimeout(() => {
        finishLoginFromUser(session.user);
      }, 0);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };

    // finishLoginFromUser intentionally not included to avoid repeated redirects.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);

    try {
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/login`
          : undefined;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          queryParams: {
            access_type: "offline",
            prompt: "select_account",
          },
        },
      });

      if (error) {
        const message = error.message ?? "";

        if (isOAuthProviderError(message)) {
          toast.error(
            "Google login Supabase-də aktiv deyil. Supabase Authentication → Providers → Google bölməsində Enable edin."
          );
        } else {
          toast.error(message || T.auth.signInFailed);
        }

        setGoogleLoading(false);
      }
    } catch (error: any) {
      toast.error(error?.message ?? T.auth.signInFailed);
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: pass,
      });

      if (error || !data.user) {
        toast.error(error?.message ?? T.auth.signInFailed);
        return;
      }

      await finishLoginFromUser(data.user);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PublicNav />

      <div className="mx-auto max-w-md px-6 py-16">
        <h1 className="font-display text-3xl">{T.auth.welcomeBack}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {T.auth.signInSubtitle}
        </p>

        <div className="mt-8 space-y-3">
          <GoogleButton
            onClick={handleGoogleLogin}
            label={
              googleLoading || checkingSession
                ? T.auth.signingIn
                : T.auth.signInWithGoogle
            }
          />

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex-1 h-px bg-border" />
            {T.auth.or}
            <span className="flex-1 h-px bg-border" />
          </div>
        </div>

        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <Label>{T.auth.email}</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between">
              <Label>{T.auth.password}</Label>
              <Link to="/forgot-password" className="text-xs text-ember">
                {T.auth.forgot}
              </Link>
            </div>

            <Input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading || checkingSession}
            className="w-full bg-ember hover:bg-ember/90 text-ember-foreground"
          >
            {loading ? T.auth.signingIn : T.auth.signIn}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          {T.auth.newToMasaQr}{" "}
          <Link to="/register" className="text-ember font-medium">
            {T.auth.startTrial}
          </Link>
        </div>

        <div className="mt-2 text-center text-xs text-muted-foreground">
          {T.auth.joining}{" "}
          <Link to="/join" className="underline">
            {T.auth.useInvite}
          </Link>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}