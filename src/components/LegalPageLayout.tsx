import { ArrowLeft } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { Footer } from "./Footer";

export const legalParagraphClassName = "mt-4 leading-relaxed text-foreground/75";
export const legalLinkClassName = "text-foreground underline underline-offset-4";

export function LegalSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="mt-12 scroll-mt-6">
      <h2 className="font-display text-2xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export function LegalPageLayout({
  pageTitle,
  title,
  subtitle,
  effectiveDate,
  children,
}: {
  pageTitle: string;
  title: string;
  subtitle?: string;
  effectiveDate: string;
  children: ReactNode;
}) {
  useEffect(() => {
    document.title = pageTitle;
    // The page renders after load, so the browser can't jump to #section itself.
    const target = window.location.hash
      ? document.getElementById(decodeURIComponent(window.location.hash.slice(1)))
      : null;
    if (target) target.scrollIntoView();
    else window.scrollTo(0, 0);
  }, [pageTitle]);

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background">
      <header className="border-b border-border pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          <a href="/" className="flex items-center gap-2.5">
            <img
              src="/images/alt-logo.png"
              alt="ALT Roofing Solutions"
              className="h-9 w-auto md:h-11"
            />
          </a>
          <a
            href="/"
            className="flex items-center gap-2 text-sm text-foreground/80 transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to home
          </a>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-5 py-14 md:px-8 md:py-20">
        <h1 className="font-display text-4xl font-bold md:text-5xl">{title}</h1>
        <p className="mt-3 text-lg text-foreground/80">
          ALT Roofing Solutions Inc.
        </p>
        {subtitle ? (
          <p className="mt-1 text-foreground/65">{subtitle}</p>
        ) : null}
        <p className="mt-2 text-sm text-foreground/55">
          Effective date and last updated: {effectiveDate}
        </p>
        {children}
      </article>

      <Footer />
    </main>
  );
}
