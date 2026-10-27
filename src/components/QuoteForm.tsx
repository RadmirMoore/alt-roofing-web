import { Mail, Phone } from "lucide-react";
import { EMAIL, EMAIL_HREF, PHONE, PHONE_HREF, siteCopy } from "../data/content";
import { EstimateForm } from "./EstimateForm";
import { FadeIn, SectionLabel } from "./ui";

export function QuoteForm() {
  return (
    <section id="quote" className="relative py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-5 md:grid-cols-5 md:gap-16 md:px-8">
        <FadeIn className="md:col-span-2">
          <SectionLabel>{siteCopy.quote.label}</SectionLabel>
          <h2 className="font-display text-balance text-4xl font-bold leading-[1.02] sm:text-5xl md:text-6xl">
            {siteCopy.quote.title}
          </h2>
          <p className="mt-6 max-w-md text-base text-foreground/70">
            {siteCopy.quote.intro}
          </p>

          <div className="mt-10 space-y-3">
            <a
              href={PHONE_HREF}
              aria-label="Call ALT Roofing"
              className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition hover:border-primary/50"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Phone className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <div className="text-[11px] tracking-widest text-foreground/50 uppercase">
                  Phone
                </div>
                <div className="font-display text-lg font-semibold">{PHONE}</div>
              </div>
            </a>
            <a
              href={EMAIL_HREF}
              className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition hover:border-primary/50"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Mail className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <div className="text-[11px] tracking-widest text-foreground/50 uppercase">
                  Email
                </div>
                <div className="truncate font-display text-sm font-semibold sm:text-base">
                  {EMAIL}
                </div>
              </div>
            </a>
          </div>
        </FadeIn>

        <FadeIn delay={0.1} className="md:col-span-3">
          <div className="relative rounded-2xl border border-border bg-card p-6 md:p-10">
            <EstimateForm
              idPrefix="quote"
              source="quote form"
              trackLabel="Quote form submitted"
            />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
