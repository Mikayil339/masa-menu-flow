import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/app/branches")({
  head: () => ({ meta: [{ title: "Filiallar deaktivdir — MasaQR" }] }),
  component: () => (
    <div className="p-6 md:p-10">
      <PageHeader title="Filial sistemi deaktivdir" subtitle="MasaQR artıq filiallarla işləmir. Bütün masalar və sifarişlər birbaşa restorana bağlıdır." />
      <Card className="p-6 max-w-xl">
        <p className="text-sm text-muted-foreground">
          Bu bölmə əvvəlki versiyadan qalıb. İdarəetmə üçün Masalar və QR, Ofisiantlar və Ayarlar bölmələrindən istifadə edin.
        </p>
        <Button asChild className="mt-4">
          <Link to="/app/tables">Masalar və QR-a keç</Link>
        </Button>
      </Card>
    </div>
  ),
});
