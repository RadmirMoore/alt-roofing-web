import { marqueeItems } from "../data/content";

function MarqueeTrack() {
  const items = [...marqueeItems, ...marqueeItems];

  return (
    <>
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <div
            key={`${item.label}-${index}`}
            className="flex shrink-0 items-center gap-3 text-background/85"
          >
            <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
            <span className="font-display text-xl font-semibold tracking-tight md:text-2xl">
              {item.label}
            </span>
            <span className="ml-4 text-primary md:ml-8">●</span>
          </div>
        );
      })}
    </>
  );
}

export function Marquee() {
  return (
    <section className="relative overflow-hidden border-y border-border bg-foreground text-background">
      <div className="relative py-5">
        <div className="flex animate-marquee gap-10 pr-10 whitespace-nowrap md:animate-marquee-md md:gap-14">
          <MarqueeTrack />
          <MarqueeTrack />
        </div>
      </div>
    </section>
  );
}
