import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useStore, type Role } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { fetchOwnerContext } from "@/lib/masaqr";

export const Route = createFileRoute("/app")({ component: AppGate });

function AppGate() {
  const nav = useNavigate();
  const { auth, login, logout } = useStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const { session, profile, restaurant, branches } = await fetchOwnerContext();
        if (!session) {
          if (auth.loggedIn) logout();
          nav({ to: "/login", replace: true });
          return;
        }
        if (!profile) {
          await supabase.auth.signOut();
          logout();
          nav({ to: "/login", replace: true });
          return;
        }
        login({
          email: profile.email ?? session.user.email ?? "",
          role: (profile.role as Role) ?? "owner",
          name: profile.full_name ?? (session.user.email ?? "").split("@")[0],
          branchId: profile.branch_id ?? null,
        });
        if (restaurant) {
          useStore.setState(st => ({
            restaurant: {
              ...st.restaurant,
              name: restaurant.name,
              slug: restaurant.slug,
              logo: restaurant.logo_url ?? undefined,
              cover: restaurant.cover_url ?? st.restaurant.cover,
              primaryLang: restaurant.default_language ?? "az",
              langs: restaurant.enabled_languages ?? ["az", "en", "ru"],
              currency: restaurant.currency ?? "AZN",
            },
            branches: branches.map(b => ({ id: b.id, name: b.name, address: b.location ?? "", active: b.is_active })),
            activeBranchId: profile.branch_id ?? branches[0]?.id ?? st.activeBranchId,
          }));
        } else if (profile.role === "owner") {
          nav({ to: "/setup", replace: true });
          return;
        }
      } finally {
        if (active) setReady(true);
      }
    }
    load();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) {
        logout();
        nav({ to: "/login", replace: true });
      }
    });
    return () => { active = false; sub.subscription.unsubscribe(); };
  }, []);

  if (!ready && !auth.loggedIn) {
    return <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">Loading…</div>;
  }

  return <AppShell><Outlet /></AppShell>;
}
