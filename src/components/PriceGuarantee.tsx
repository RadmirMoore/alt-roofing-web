import { Phone } from "lucide-react";
import { PHONE, PHONE_HREF, siteCopy } from "../data/content";
import { FadeIn, SectionLabelCentered } from "./ui";

export function PriceGuarantee() {
  return (
    <section className="relative py-16 md:py-24">
      <div className="mx-auto max-w-4xl px-5 md:px-8">
        <FadeIn>
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-8 text-center md:p-12">
            <SectionLabelCentered>{siteCopy.priceGuarantee.label}</SectionLabelCentered>
            <h2 className="font-display text-balance text-3xl font-bold leading-[1.02] sm:text-4xl md:text-5xl">
              {siteCopy.priceGuarantee.title}
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base text-foreground/70 md:text-lg">
              {siteCopy.priceGuarantee.body}{" "}
              <span className="font-semibold text-primary">
                {siteCopy.priceGuarantee.highlight}
              </span>{" "}
              {siteCopy.priceGuarantee.bodyEnd}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href={PHONE_HREF}
                className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:brightness-110 cobalt-glow"
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                {PHONE}
              </a>
              <a
                href="#quote"
                className="inline-flex h-12 items-center gap-2 rounded-full border border-border bg-background px-6 text-sm font-semibold text-foreground transition hover:border-primary/50"
              >
                {siteCopy.priceGuarantee.ctaSecondary}
              </a>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
