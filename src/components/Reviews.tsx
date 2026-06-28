import { Quote, Star } from "lucide-react";
import { reviews, siteCopy } from "../data/content";
import { FadeIn, SectionLabel } from "./ui";

export function Reviews() {
  return (
    <section id="reviews" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <FadeIn className="mb-14 max-w-3xl md:mb-20">
          <SectionLabel>{siteCopy.reviews.label}</SectionLabel>
          <h2 className="font-display text-balance text-4xl font-bold leading-[1.02] sm:text-5xl md:text-6xl">
            {siteCopy.reviews.titleLead}{" "}
            <span className="text-primary">{siteCopy.reviews.titleAccent}</span>{" "}
            {siteCopy.reviews.titleEnd}
          </h2>
        </FadeIn>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          {reviews.map((review, index) => (
            <FadeIn key={review.name} delay={index * 0.1}>
              <article className="relative h-full rounded-2xl border border-border bg-card p-8 md:p-10">
                <Quote
                  className="absolute top-8 right-8 h-10 w-10 text-primary/15"
                  aria-hidden="true"
                />
                <div className="mb-5 flex gap-1">
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <Star
                      key={starIndex}
                      className="h-4 w-4 fill-primary text-primary"
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <p className="text-base leading-relaxed text-foreground/80">
                  &ldquo;{review.quote}&rdquo;
                </p>
                <div className="mt-8 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary font-display text-lg font-bold text-primary-foreground">
                    {review.initial}
                  </div>
                  <div>
                    <div className="font-display text-base font-semibold">
                      {review.name}
                    </div>
                    <div className="text-sm text-foreground/50">
                      {review.location}
                    </div>
                  </div>
                </div>
              </article>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
