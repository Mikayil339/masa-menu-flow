import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BellRing, LayoutDashboard, PowerOff } from "lucide-react";
import { T } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/kitchen")({
  head: () => ({ meta: [{ title: "Mətbəx — MasaQR" }] }),
  component: KitchenDeactivated,
});

function KitchenDeactivated() {
  const nav = useNavigate();

  // If a kitchen-role user lands here, send them onward to /waiter automatically.
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data: profile } = await supabase
        .from("masaqr_users")
        .select("role")
        .eq("id", session.user.id)
        .maybeSingle();
      if (profile?.role === "kitchen" || profile?.role === "staff") {
        nav({ to: "/waiter", replace: true });
      }
    })();
  }, [nav]);

  return (
    <div className="min-h-screen grid place-items-center bg-background p-6">
      <div className="max-w-md text-center">
        <div className="mx-auto h-14 w-14 rounded-full bg-muted text-muted-foreground grid place-items-center">
          <PowerOff className="h-6 w-6" />
        </div>
        <h1 className="font-display text-2xl mt-4">{T.kitchenDeactivated.title}</h1>
        <p className="text-sm text-muted-foreground mt-2">{T.kitchenDeactivated.body}</p>
        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          <Button asChild className="bg-ember hover:bg-ember/90 text-ember-foreground">
            <Link to="/waiter"><BellRing className="h-4 w-4 mr-1.5" />{T.kitchenDeactivated.goWaiter}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/app"><LayoutDashboard className="h-4 w-4 mr-1.5" />{T.kitchenDeactivated.goDashboard}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
