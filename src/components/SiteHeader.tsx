import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 glass border-b">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/"><Logo /></Link>
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link to="/" className="text-muted-foreground transition hover:text-foreground">Home</Link>
          <Link to="/order" className="text-muted-foreground transition hover:text-foreground">Order</Link>
          <Link to="/admin" className="text-muted-foreground transition hover:text-foreground">Admin</Link>
        </nav>
        <Link
          to="/order"
          className="inline-flex items-center rounded-full bg-cyan-gradient px-5 py-2 text-sm font-semibold text-white shadow-glow transition hover:scale-[1.03]"
        >
          Order Now
        </Link>
      </div>
    </header>
  );
}
