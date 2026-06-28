import { MapPin } from "lucide-react";
import { serviceAreas, siteCopy } from "../data/content";
import { FadeIn, SectionLabel } from "./ui";

export function ServiceArea() {
  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.04]"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="topo"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1" cy="1" r="1" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#topo)" />
      </svg>

      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <FadeIn className="mb-12 max-w-3xl">
          <SectionLabel>{siteCopy.serviceArea.label}</SectionLabel>
          <h2 className="font-display text-balance text-4xl font-bold leading-[1.02] sm:text-5xl md:text-6xl">
            {siteCopy.serviceArea.titleLead}{" "}
            <span className="text-primary">{siteCopy.serviceArea.titleAccent}</span>
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-foreground/65">
            {siteCopy.serviceArea.intro}
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(serviceAreas).map(([region, cities], index) => (
            <FadeIn key={region} delay={index * 0.05}>
              <div className="rounded-2xl border border-border bg-card/60 p-6 backdrop-blur">
                <div className="mb-4 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
                  <h3 className="font-display text-lg font-semibold">{region}</h3>
                </div>
                <ul className="flex flex-wrap gap-2">
                  {cities.map((city) => (
                    <li
                      key={city}
                      className="rounded-full border border-border bg-background/60 px-3 py-1.5 text-sm text-foreground/80 transition hover:border-primary/50 hover:text-foreground"
                    >
                      {city}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
