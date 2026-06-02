import { Link } from "@tanstack/react-router";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`inline-flex items-center gap-2 font-display text-xl tracking-tight ${className}`}>
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-ember text-ember-foreground shadow-sm">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="2" y="2" width="5" height="5" rx="1" fill="currentColor" />
          <rect x="9" y="2" width="5" height="5" rx="1" fill="currentColor" opacity="0.5" />
          <rect x="2" y="9" width="5" height="5" rx="1" fill="currentColor" opacity="0.5" />
          <rect x="9" y="9" width="5" height="5" rx="1" fill="currentColor" />
        </svg>
      </span>
      <span className="font-semibold">MasaQR</span>
    </Link>
  );
}
