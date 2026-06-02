import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicNav, PublicFooter } from "@/components/PublicNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { Check } from "lucide-react";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Reset password — MasaQR" }] }),
  component: () => {
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);
    return (
      <div>
        <PublicNav />
        <div className="mx-auto max-w-md px-6 py-16">
          {sent ? (
            <div className="text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-sage/15 text-sage grid place-items-center"><Check /></div>
              <h1 className="font-display text-3xl mt-4">Check your inbox</h1>
              <p className="text-muted-foreground mt-2 text-sm">We sent a reset link to <b>{email}</b>.</p>
              <Button asChild className="mt-6"><Link to="/reset-password">Open reset link (demo)</Link></Button>
            </div>
          ) : (
            <>
              <h1 className="font-display text-3xl">Reset your password</h1>
              <p className="text-sm text-muted-foreground mt-1">Enter your email and we'll send you a reset link.</p>
              <form className="mt-8 space-y-4" onSubmit={e => { e.preventDefault(); setSent(true); toast.success("Reset email sent"); }}>
                <div className="space-y-1.5"><Label>Email</Label><Input type="email" required value={email} onChange={e => setEmail(e.target.value)} /></div>
                <Button type="submit" className="w-full bg-ember hover:bg-ember/90 text-ember-foreground">Send reset link</Button>
              </form>
              <div className="mt-4 text-center text-xs text-muted-foreground"><Link to="/login">Back to sign in</Link></div>
            </>
          )}
        </div>
        <PublicFooter />
      </div>
    );
  },
});
