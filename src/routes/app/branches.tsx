import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, PowerOff } from "lucide-react";

export const Route = createFileRoute("/app/branches")({
  head: () => ({ meta: [{ title: "Filiallar — MasaQR" }] }),
  component: BranchesDisabled,
});

function BranchesDisabled() {
  return (
    <div className="min-h-screen grid place-items-center bg-background p-6">
      <div className="max-w-md text-center">
        <div className="mx-auto h-14 w-14 rounded-full bg-muted text-muted-foreground grid place-items-center">
          <PowerOff className="h-6 w-6" />
        </div>
        <h1 className="font-display text-2xl mt-4">Bu bölmə deaktiv edilib</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Filial idarəetməsi artıq istifadə olunmur. Restoran ayarlarınız vahid iş yerində aparılır.
        </p>
        <div className="mt-6">
          <Button asChild className="bg-ember hover:bg-ember/90 text-ember-foreground">
            <Link to="/app"><LayoutDashboard className="h-4 w-4 mr-1.5" />Panelə qayıt</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
