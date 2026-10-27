import { ShieldCheck, Sparkles, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { siteCopy } from "../data/content";
import { EstimateForm } from "./EstimateForm";
import { FadeIn } from "./ui";

export function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Visitors who ask their device for less motion get the still poster.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      videoRef.current?.pause();
    }
  }, []);

  return (
    <section id="top" className="relative w-full overflow-hidden pt-28 md:pt-36">
      <video
        ref={videoRef}
        aria-hidden="true"
        className="absolute inset-0 z-0 h-full w-full object-cover"
        poster="/images/hero-poster.jpg"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      >
        <source
          src="/videos/hero-540.mp4"
          type="video/mp4"
          media="(max-width: 767px)"
        />
        <source src="/videos/hero-720.mp4" type="video/mp4" />
      </video>
      {/* Inline because --background is not a Tailwind theme color, so
          from-background / via-background/45 render transparent. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(to right, var(--background), color-mix(in srgb, var(--background) 60%, transparent) 55%, color-mix(in srgb, var(--background) 30%, transparent))",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 z-0 h-32"
        style={{
          background: "linear-gradient(to top, var(--background), transparent)",
        }}
      />
      <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-start gap-10 px-5 pb-20 md:grid-cols-12 md:gap-12 md:px-8 md:pb-28">
        <div className="md:col-span-7 md:pt-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-5 flex items-center gap-3"
          >
            <span className="h-px w-10 bg-primary" />
            <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-foreground/60">
              {siteCopy.hero.eyebrow}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-display text-balance text-[44px] font-bold leading-[0.95] tracking-tight sm:text-6xl md:text-[80px] lg:text-[96px]"
          >
            {siteCopy.hero.titleLead}{" "}
            <span className="text-primary">{siteCopy.hero.titleAccent}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-6 max-w-lg text-base text-foreground/65 md:text-lg"
          >
            {siteCopy.hero.subtitle}
          </motion.p>

          <motion.ul
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-foreground/70"
          >
            {siteCopy.hero.bullets.map((item) => (
              <li key={item} className="flex items-center gap-2">
                {item === "Licensed & Insured" ? (
                  <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
                ) : item === "5-Star Rated" ? (
                  <Star className="h-4 w-4 text-primary" aria-hidden="true" />
                ) : (
                  <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
                )}
                {item}
              </li>
            ))}
          </motion.ul>
        </div>

        <FadeIn className="relative md:col-span-5" delay={0.2}>
          <div className="relative mx-auto w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.35)] md:max-w-none md:p-8">
            <div className="mb-1 flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-primary" />
              <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-foreground/60">
                {siteCopy.hero.formLabel}
              </span>
            </div>
            <h2 className="font-display text-2xl font-bold leading-tight md:text-3xl">
              {siteCopy.hero.formTitle}
            </h2>
            <p className="mt-1.5 mb-5 text-sm text-foreground/60">
              {siteCopy.hero.formSubtitle}
            </p>
            <EstimateForm
              idPrefix="hero"
              source="hero form"
              trackLabel="Hero form submitted"
              trackSection="top"
            />
            <p className="mt-3 text-center text-[11px] text-foreground/50">
              {siteCopy.hero.formDisclaimer}
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
