import { ArrowRight, Calendar, Mail, Phone } from "lucide-react";
import { useState, type FormEvent } from "react";
import {
  EMAIL,
  EMAIL_HREF,
  PHONE,
  PHONE_HREF,
  quoteServiceOptions,
  siteCopy,
} from "../data/content";
import {
  FadeIn,
  inputClassName,
  labelClassName,
  SectionLabel,
  textareaClassName,
} from "./ui";
import { getVisitorId, trackLead } from "../lib/analytics-tracker";
import { getAttribution } from "../lib/attribution";
import { isValidPhone } from "../lib/validate";

export function QuoteForm() {
  const [submitted, setSubmitted] = useState(false);
  const [scheduleInspection, setScheduleInspection] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") ?? "").trim(),
      phone: String(data.get("phone") ?? "").trim(),
      service: String(data.get("service") ?? "").trim(),
      address: String(data.get("address") ?? "").trim(),
      message: String(data.get("message") ?? "").trim(),
      inspectionDate: String(data.get("inspection-date") ?? "").trim(),
      inspectionTime: String(data.get("inspection-time") ?? "").trim(),
      source: "quote form",
      visitorId: getVisitorId(),
      attribution: getAttribution(),
      // Honeypot: real users never see or fill this; bots do.
      company: String(data.get("company") ?? "").trim(),
    };

    if (!payload.name || !payload.phone || !payload.service) {
      setError("Please add your name, phone, and the service you need.");
      return;
    }

    if (!isValidPhone(payload.phone)) {
      setError("Please enter a valid phone number (10 digits with area code).");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(body?.error ?? "Failed to submit. Please try again.");
      }

      trackLead("Quote form submitted");
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
            {submitted ? (
              <div className="py-8 text-center">
                <h3 className="font-display text-2xl font-bold">
                  {siteCopy.quote.successTitle}
                </h3>
                <p className="mt-3 text-foreground/70">
                  {siteCopy.quote.successBody}
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                noValidate
              >
                {/* Honeypot — hidden from real users, catches bots. */}
                <input
                  type="text"
                  name="company"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="absolute left-[-9999px] h-0 w-0 opacity-0"
                />
                <div>
                  <label className={labelClassName} htmlFor="quote-name">
                    Name
                  </label>
                  <input
                    id="quote-name"
                    name="name"
                    type="text"
                    placeholder="Full name"
                    autoComplete="name"
                    required
                    className={`mt-2 ${inputClassName}`}
                  />
                </div>
                <div>
                  <label className={labelClassName} htmlFor="quote-phone">
                    Phone
                  </label>
                  <input
                    id="quote-phone"
                    name="phone"
                    type="tel"
                    placeholder="(213) 000-0000"
                    autoComplete="tel"
                    required
                    className={`mt-2 ${inputClassName}`}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClassName} htmlFor="quote-address">
                    Address
                  </label>
                  <input
                    id="quote-address"
                    name="address"
                    type="text"
                    placeholder="Street, City"
                    autoComplete="street-address"
                    className={`mt-2 ${inputClassName}`}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClassName} htmlFor="quote-service">
                    Service needed
                  </label>
                  <select
                    id="quote-service"
                    name="service"
                    required
                    defaultValue=""
                    className={`mt-2 ${inputClassName}`}
                  >
                    <option value="" disabled>
                      Select a service
                    </option>
                    {quoteServiceOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClassName} htmlFor="quote-message">
                    Message
                  </label>
                  <textarea
                    id="quote-message"
                    name="message"
                    rows={4}
                    placeholder="Tell us a bit about your roof…"
                    className={`mt-2 ${textareaClassName}`}
                  />
                </div>
                <div className="sm:col-span-2">
                  <div className="rounded-xl border border-border bg-background/50 p-4">
                    <label className="flex cursor-pointer items-start gap-3">
                      <input
                        type="checkbox"
                        checked={scheduleInspection}
                        onChange={(event) =>
                          setScheduleInspection(event.target.checked)
                        }
                        className="mt-1 h-4 w-4 accent-[var(--color-accent-cobalt)]"
                      />
                      <span>
                        <span className="flex items-center gap-2 font-display text-base font-semibold">
                          <Calendar
                            className="h-4 w-4 text-primary"
                            aria-hidden="true"
                          />
                          Schedule a free inspection (optional)
                        </span>
                        <span className="mt-1 block text-xs text-foreground/60">
                          Pick a date and time that work for you. We&apos;ll
                          confirm by email.
                        </span>
                      </span>
                    </label>
                    {scheduleInspection ? (
                      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <input
                          type="date"
                          name="inspection-date"
                          className={inputClassName}
                        />
                        <input
                          type="time"
                          name="inspection-time"
                          className={inputClassName}
                        />
                      </div>
                    ) : null}
                  </div>
                </div>
                {error ? (
                  <p className="text-sm text-primary sm:col-span-2" role="alert">
                    {error}
                  </p>
                ) : null}
                <button
                  type="submit"
                  disabled={submitting}
                  className="group inline-flex h-14 items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-60 sm:col-span-2 cobalt-glow"
                >
                  {submitting ? "Sending…" : "Get my free quote"}
                  {submitting ? null : (
                    <ArrowRight
                      className="h-4 w-4 transition group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  )}
                </button>
              </form>
            )}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
