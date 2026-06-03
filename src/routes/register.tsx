import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { PublicNav, PublicFooter } from "@/components/PublicNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleButton } from "@/components/GoogleButton";
import { useStore } from "@/lib/store";
import { T } from "@/lib/i18n";
import { useState } from "react";
import { toast } from "sonner";
import { Check } from "lucide-react";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Pulsuz sınaq — MasaQR" },
      { name: "description", content: "MasaQR hesabınızı yaradın. 1 ay pulsuz, kart tələb olunmur." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const nav = useNavigate();
  const { register } = useStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [restaurant, setRestaurant] = useState("");
  const [slug, setSlug] = useState("");

  return (
    <div>
      <PublicNav />
      <div className="mx-auto max-w-5xl px-6 py-12 grid md:grid-cols-[1.1fr_1fr] gap-12 items-start">
        <div>
          <span className="text-xs uppercase tracking-widest text-ember">{T.auth.register.badge}</span>
          <h1 className="font-display text-4xl mt-2">{T.auth.register.heading}</h1>
          <p className="mt-3 text-muted-foreground">{T.auth.register.subhead}</p>
          <ul className="mt-6 space-y-2 text-sm">
            {T.auth.register.features.map(x => <li key={x} className="flex items-center gap-2"><Check className="h-4 w-4 text-sage" />{x}</li>)}
          </ul>
        </div>
        <div className="rounded-2xl border bg-card p-7 shadow-sm">
          <form
            className="space-y-4"
            onSubmit={e => {
              e.preventDefault();
              register(email, name, restaurant, slug || restaurant.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
              toast.success(T.auth.register.success);
              nav({ to: "/setup" });
            }}
          >
            <div className="space-y-1.5"><Label>{T.auth.register.yourName}</Label><Input required value={name} onChange={e => setName(e.target.value)} placeholder="Aysel Məmmədova" /></div>
            <div className="space-y-1.5"><Label>{T.auth.email}</Label><Input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="siz@restoran.az" /></div>
            <div className="space-y-1.5"><Label>{T.auth.password}</Label><Input required type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder={T.auth.register.passwordMin} /></div>
            <div className="space-y-1.5"><Label>{T.auth.register.restaurantName}</Label><Input required value={restaurant} onChange={e => { setRestaurant(e.target.value); setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-")); }} placeholder="Olive & Ember" /></div>
            <div className="space-y-1.5">
              <Label>{T.auth.register.slugLabel}</Label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 bg-muted text-xs text-muted-foreground">masaqr.app/m/</span>
                <Input className="rounded-l-none" required value={slug} onChange={e => setSlug(e.target.value)} placeholder="olive-ember" />
              </div>
            </div>
            <Button type="submit" className="w-full bg-ember hover:bg-ember/90 text-ember-foreground">{T.auth.register.submit}</Button>
            <p className="text-xs text-muted-foreground text-center">{T.auth.register.already} <Link to="/login" className="text-ember">{T.auth.signIn}</Link></p>
          </form>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
