import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useState, type FormEvent } from "react";
import { siteCopy } from "../data/content";
import { FadeIn, inputClassName } from "./ui";
import { trackLead } from "../lib/analytics-tracker";
import { isValidPhone } from "../lib/validate";

export function Hero() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [zip, setZip] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    if (!name.trim() || !phone.trim()) {
      setError("Please add your name and phone number.");
      return;
    }

    if (!isValidPhone(phone)) {
      setError("Please enter a valid phone number (10 digits with area code).");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          zip: zip.trim(),
          service: "Free roof estimate",
          source: "hero form",
        }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(body?.error ?? "Failed to submit. Please try again.");
      }

      trackLead("Hero form submitted", "top");
      setSubmitted(true);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong. Please call (213) 415-6146.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="top" className="relative w-full overflow-hidden pt-28 md:pt-36">
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 bg-cover bg-right bg-no-repeat"
        style={{ backgroundImage: "url(/images/hero-bg.png)" }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 bg-gradient-to-r from-background via-background/45 to-transparent"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 z-0 h-32 bg-gradient-to-t from-background to-transparent"
      />
      <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-5 pb-20 md:grid-cols-12 md:gap-12 md:px-8 md:pb-28">
        <div className="md:col-span-7">
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
          {submitted ? (
            <div className="relative mx-auto w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-[0_30px_80px_-30px_rgba(0,0,0,0.35)] md:max-w-none md:p-10">
              <CheckCircle2
                className="mx-auto h-12 w-12 text-primary"
                aria-hidden="true"
              />
              <h2 className="mt-4 font-display text-2xl font-bold leading-tight md:text-3xl">
                {siteCopy.quote.successTitle}
              </h2>
              <p className="mt-3 text-sm text-foreground/65">
                {siteCopy.quote.successBody}
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="relative mx-auto w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.35)] md:max-w-none md:p-8"
              noValidate
            >
              <div className="mb-1 flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-foreground/60">
                  {siteCopy.hero.formLabel}
                </span>
              </div>
              <h2 className="font-display text-2xl font-bold leading-tight md:text-3xl">
                {siteCopy.hero.formTitle}
              </h2>
              <p className="mt-1.5 text-sm text-foreground/60">
                {siteCopy.hero.formSubtitle}
              </p>

              <div className="mt-5 space-y-3">
                <input
                  type="text"
                  placeholder="Full name"
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className={inputClassName}
                />
                <input
                  type="tel"
                  placeholder="Phone number"
                  autoComplete="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className={inputClassName}
                />
                <input
                  type="text"
                  placeholder="ZIP code"
                  autoComplete="postal-code"
                  inputMode="numeric"
                  value={zip}
                  onChange={(event) => setZip(event.target.value)}
                  className={inputClassName}
                />
              </div>

              {error ? (
                <p className="mt-4 text-sm text-primary" role="alert">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className="group mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-60 cobalt-glow"
              >
                {submitting ? "Sending…" : "Get my free quote"}
                {submitting ? null : (
                  <ArrowRight
                    className="h-4 w-4 transition group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                )}
              </button>
              <p className="mt-3 text-center text-[11px] text-foreground/50">
                {siteCopy.hero.formDisclaimer}
              </p>
            </form>
          )}
        </FadeIn>
      </div>
    </section>
  );
}
