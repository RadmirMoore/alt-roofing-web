import { ArrowUpRight } from "lucide-react";
import { services, siteCopy } from "../data/content";
import { FadeIn, SectionLabel } from "./ui";

export function Services() {
  return (
    <section id="services" className="relative overflow-hidden py-24 md:py-32">
      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <FadeIn className="mb-14 max-w-3xl md:mb-20">
          <SectionLabel>{siteCopy.services.label}</SectionLabel>
          <h2 className="font-display text-balance text-4xl font-bold leading-[1.02] sm:text-5xl md:text-6xl">
            {siteCopy.services.titleLead}
            <br />
            <span className="text-foreground/55">
              {siteCopy.services.titleMuted}
            </span>
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-foreground/65">
            {siteCopy.services.intro}
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <FadeIn key={service.title} delay={index * 0.05}>
                <a
                  href="#quote"
                  className="group relative block h-full w-full overflow-hidden rounded-2xl border border-border bg-card p-7 text-left md:p-8"
                  aria-label={`Request a quote for ${service.title}`}
                >
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-0 transition group-hover:opacity-100" />
                  <div className="mb-8 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <ArrowUpRight
                      className="h-5 w-5 text-foreground/30 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="font-display text-xl font-semibold">
                    {service.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-foreground/65">
                    {service.description}
                  </p>
                  <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                    {siteCopy.services.cta}
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                </a>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
