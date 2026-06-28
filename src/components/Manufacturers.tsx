import { siteCopy } from "../data/content";
import { FadeIn, SectionLabelCentered } from "./ui";

export function Manufacturers() {
  return (
    <section className="relative py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <FadeIn className="mb-10 text-center">
          <SectionLabelCentered>{siteCopy.manufacturers.label}</SectionLabelCentered>
          <h2 className="font-display text-balance text-3xl font-bold leading-[1.02] sm:text-4xl md:text-5xl">
            {siteCopy.manufacturers.titleLead}{" "}
            <span className="text-primary">{siteCopy.manufacturers.titleAccent}</span>
          </h2>
        </FadeIn>
        <FadeIn delay={0.1}>
          <img
            src="/images/trusted-manufacturers.png"
            alt="Trusted manufacturers: Owens Corning, Polyglass, and Westlake Royal Roofing Solutions"
            className="w-full rounded-2xl border border-border"
            loading="lazy"
            decoding="async"
          />
        </FadeIn>
      </div>
    </section>
  );
}
