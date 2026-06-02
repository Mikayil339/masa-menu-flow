import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PublicNav, PublicFooter } from "@/components/PublicNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Set new password — MasaQR" }] }),
  component: () => {
    const nav = useNavigate();
    const [p, setP] = useState("");
    return (
      <div>
        <PublicNav />
        <div className="mx-auto max-w-md px-6 py-16">
          <h1 className="font-display text-3xl">Set a new password</h1>
          <form className="mt-8 space-y-4" onSubmit={e => { e.preventDefault(); toast.success("Password updated"); nav({ to: "/login" }); }}>
            <div className="space-y-1.5"><Label>New password</Label><Input type="password" required value={p} onChange={e => setP(e.target.value)} placeholder="Min 8 characters" /></div>
            <Button type="submit" className="w-full bg-ember hover:bg-ember/90 text-ember-foreground">Update password</Button>
          </form>
        </div>
        <PublicFooter />
      </div>
    );
  },
});
