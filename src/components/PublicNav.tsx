import { Link, useLocation } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";

export function PublicNav() {
  const loc = useLocation();
  const onAuth = loc.pathname.startsWith("/login") || loc.pathname.startsWith("/register");
  return (
    <header className="sticky top-0 z-40 glass border-b">
      <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
        <Logo />
        <nav className="hidden md:flex items-center gap-7 text-sm">
          <Link to="/" hash="features" className="text-muted-foreground hover:text-foreground">Features</Link>
          <Link to="/pricing" className="text-muted-foreground hover:text-foreground">Pricing</Link>
          <Link to="/" hash="faq" className="text-muted-foreground hover:text-foreground">FAQ</Link>
          <Link to="/m/olive-ember/t3" className="text-muted-foreground hover:text-foreground">Live demo ↗</Link>
        </nav>
        <div className="flex items-center gap-2">
          {!onAuth && (
            <>
              <Button asChild variant="ghost" size="sm"><Link to="/login">Sign in</Link></Button>
              <Button asChild size="sm" className="bg-ember hover:bg-ember/90 text-ember-foreground"><Link to="/register">Start free trial</Link></Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t mt-24">
      <div className="mx-auto max-w-7xl px-6 py-12 grid gap-8 md:grid-cols-4 text-sm">
        <div>
          <Logo />
          <p className="mt-3 text-muted-foreground text-xs leading-relaxed">QR menus, kitchen flow & waiter alerts — without the payment headaches.</p>
        </div>
        <div>
          <div className="font-medium mb-2">Product</div>
          <ul className="space-y-1.5 text-muted-foreground">
            <li><Link to="/" hash="features">Features</Link></li>
            <li><Link to="/pricing">Pricing</Link></li>
            <li><Link to="/m/olive-ember/t3">Demo menu</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-medium mb-2">For staff</div>
          <ul className="space-y-1.5 text-muted-foreground">
            <li><Link to="/join">Join with invite code</Link></li>
            <li><Link to="/login">Sign in</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-medium mb-2">Company</div>
          <ul className="space-y-1.5 text-muted-foreground">
            <li><Link to="/" hash="faq">FAQ</Link></li>
            <li><a href="mailto:hi@masaqr.app">Contact</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t py-5 text-center text-xs text-muted-foreground">© MasaQR — Crafted for restaurants.</div>
    </footer>
  );
}
