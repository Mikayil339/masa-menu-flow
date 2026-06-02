import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { PublicNav, PublicFooter } from "@/components/PublicNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleButton } from "@/components/GoogleButton";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { toast } from "sonner";
import { Check } from "lucide-react";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Start free trial — MasaQR" },
      { name: "description", content: "Create your MasaQR account. 1 month free, no card." },
    ],
  }),
  component: RegisterPage,
});

function cleanSlug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function RegisterPage() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [restaurant, setRestaurant] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const finalSlug = cleanSlug(slug || restaurant);
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: { data: { full_name: name } },
      });
      if (error || !data.user) {
        toast.error(error?.message ?? "Registration failed");
        return;
      }

      const userId = data.user.id;
      const { error: profileError } = await supabase.from("masaqr_users").upsert({
        id: userId,
        email: data.user.email ?? email,
        full_name: name,
        role: "owner",
        status: "active",
      });
      if (profileError) {
        toast.error(profileError.message);
        return;
      }

      const { data: restaurantRow, error: restaurantError } = await supabase
        .from("masaqr_restaurants")
        .insert({
          name: restaurant,
          slug: finalSlug,
          owner_id: userId,
          default_language: "az",
          enabled_languages: ["az", "en", "ru"],
          currency: "AZN",
        })
        .select("id")
        .single();
      if (restaurantError || !restaurantRow) {
        toast.error(restaurantError?.message ?? "Could not create restaurant");
        return;
      }

      const { error: restaurantLinkError } = await supabase
        .from("masaqr_users")
        .update({ restaurant_id: restaurantRow.id })
        .eq("id", userId);
      if (restaurantLinkError) {
        toast.error(restaurantLinkError.message);
        return;
      }

      const { data: branchRow, error: branchError } = await supabase
        .from("masaqr_branches")
        .insert({ restaurant_id: restaurantRow.id, name: "Main Branch", location: "" })
        .select("id")
        .single();
      if (branchError || !branchRow) {
        toast.error(branchError?.message ?? "Could not create branch");
        return;
      }

      await supabase.from("masaqr_tables").insert({
        restaurant_id: restaurantRow.id,
        branch_id: branchRow.id,
        table_number: "1",
        table_name: "Table 1",
      });

      const { error: updateError } = await supabase
        .from("masaqr_users")
        .update({ restaurant_id: restaurantRow.id, branch_id: branchRow.id })
        .eq("id", userId);
      if (updateError) {
        toast.error(updateError.message);
        return;
      }

      toast.success("Account created. You can manage your restaurant now.");
      nav({ to: "/app" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PublicNav />
      <div className="mx-auto max-w-5xl px-6 py-12 grid md:grid-cols-[1.1fr_1fr] gap-12 items-start">
        <div>
          <span className="text-xs uppercase tracking-widest text-ember">Free for 30 days</span>
          <h1 className="font-display text-4xl mt-2">Get your restaurant online in minutes.</h1>
          <p className="mt-3 text-muted-foreground">No credit card. Full features. Cancel anytime.</p>
          <ul className="mt-6 space-y-2 text-sm">
            {[
              "Full QR menu with 3 languages",
              "Unlimited PDF exports",
              "Kitchen display + waiter alerts",
              "Up to 3 branches during trial",
              "Drop us an email anytime",
            ].map(x => <li key={x} className="flex items-center gap-2"><Check className="h-4 w-4 text-sage" />{x}</li>)}
          </ul>
        </div>
        <div className="rounded-2xl border bg-card p-7 shadow-sm">
          <form className="space-y-4" onSubmit={handleRegister}>
            <div className="space-y-1.5"><Label>Your name</Label><Input required value={name} onChange={e => setName(e.target.value)} placeholder="Aysel Mammadova" /></div>
            <div className="space-y-1.5"><Label>Email</Label><Input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@restaurant.com" /></div>
            <div className="space-y-1.5"><Label>Password</Label><Input required type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="Min 8 characters" /></div>
            <div className="space-y-1.5"><Label>Restaurant name</Label><Input required value={restaurant} onChange={e => { setRestaurant(e.target.value); setSlug(cleanSlug(e.target.value)); }} placeholder="Olive & Ember" /></div>
            <div className="space-y-1.5">
              <Label>Your URL slug</Label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 bg-muted text-xs text-muted-foreground">masaqr.online/m/</span>
                <Input className="rounded-l-none" required value={slug} onChange={e => setSlug(cleanSlug(e.target.value))} placeholder="olive-ember" />
              </div>
            </div>
            <Button disabled={loading} type="submit" className="w-full bg-ember hover:bg-ember/90 text-ember-foreground">{loading ? "Creating..." : "Start free trial"}</Button>
            <GoogleButton onClick={() => toast.error("Google registration is not enabled yet. Use email and password.")} label="Continue with Google" />
            <p className="text-xs text-muted-foreground text-center">Already have an account? <Link to="/login" className="text-ember">Sign in</Link></p>
          </form>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
