import { ArrowRight, Menu, Phone, X } from "lucide-react";
import { useEffect, useState } from "react";
import { navLinks, PHONE, PHONE_HREF } from "../data/content";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top)] transition-all duration-500 ${
          scrolled
            ? "border-b border-border mobile-bar-blur"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          <a href="#top" className="group flex items-center gap-2.5">
            <img
              src="/images/alt-logo.png"
              alt="ALT Roofing Solutions"
              className="h-9 w-auto md:h-11"
            />
            <span className="sr-only">ALT Roofing Solutions</span>
          </a>

          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-foreground/80 transition hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <a
              href={PHONE_HREF}
              className="flex items-center gap-2 text-sm text-foreground/80 transition hover:text-foreground"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              {PHONE}
            </a>
            <a
              href="#quote"
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110 cobalt-glow"
            >
              Free Quote
            </a>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((open) => !open)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border"
            >
              {menuOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </header>

      {menuOpen ? (
        <div className="fixed inset-0 z-40 bg-background/95 backdrop-blur-xl md:hidden">
          <div className="flex h-full flex-col px-5 pt-24 pb-8">
            <nav className="flex flex-col gap-6">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="font-display text-3xl font-bold"
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="mt-auto space-y-4">
              <a
                href={PHONE_HREF}
                className="flex items-center gap-3 text-lg text-foreground/80"
              >
                <Phone className="h-5 w-5 text-primary" aria-hidden="true" />
                {PHONE}
              </a>
              <a
                href="#quote"
                onClick={() => setMenuOpen(false)}
                className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground cobalt-glow"
              >
                Free Quote
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
