import { Check } from "lucide-react";
import { siteCopy, whyAltFeatures } from "../data/content";
import { FadeIn, SectionLabel } from "./ui";

export function WhyAlt() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-5 md:grid-cols-2 md:gap-16 md:px-8">
        <FadeIn className="relative">
          <div className="relative overflow-hidden rounded-2xl border border-border">
            <img
              src="/images/alt4.webp"
              alt={siteCopy.whyAlt.imageAlt}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="pointer-events-none absolute -right-4 -bottom-4 hidden h-32 w-32 rounded-2xl border border-primary/40 md:block" />
        </FadeIn>

        <FadeIn delay={0.1} className="flex flex-col justify-center">
          <SectionLabel>{siteCopy.whyAlt.label}</SectionLabel>
          <h2 className="font-display text-balance text-4xl font-bold leading-[1.02] sm:text-5xl md:text-6xl">
            {siteCopy.whyAlt.titleLead}{" "}
            <span className="text-primary">{siteCopy.whyAlt.titleAccent}</span>
          </h2>
          <p className="mt-6 max-w-lg text-base text-foreground/70 md:text-lg">
            {siteCopy.whyAlt.intro}
          </p>
          <ul className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {whyAltFeatures.map((feature) => (
              <li key={feature.title} className="flex gap-3">
                <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <div>
                  <div className="font-display text-base font-semibold">
                    {feature.title}
                  </div>
                  <div className="mt-1 text-sm text-foreground/60">
                    {feature.description}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </FadeIn>
      </div>
    </section>
  );
}
