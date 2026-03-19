import Link from "next/link";
import { MoveRight } from "lucide-react";

export default function MarketingLayout({ children }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-brand-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link href="/" className="font-bold tracking-tight text-xl text-brand-foreground">
            MOTUS.
          </Link>
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-brand-muted">
            <Link href="#features" className="hover:text-brand-foreground transition-colors">Features</Link>
            <Link href="/pricing" className="hover:text-brand-foreground transition-colors">Pricing</Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link href="/login" className="text-sm font-medium text-brand-muted hover:text-brand-foreground transition-colors">
              Log in
            </Link>
            <Link href="/signup" className="group inline-flex h-9 items-center justify-center rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-brand-primaryHover focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-accent">
              Get Started
              <MoveRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-white/5 bg-brand-background">
        <div className="container mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center">
          <p className="text-xs text-brand-muted">
            &copy; {new Date().getFullYear()} Motus Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
