import { ArrowRight, Calendar, CheckCircle2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { consentSubmission } from "../data/consent";
import { quoteServiceOptions, siteCopy } from "../data/content";
import { getVisitorId, trackLead } from "../lib/analytics-tracker";
import { getAttribution } from "../lib/attribution";
import { isValidEmail, isValidPhone, isValidZip } from "../lib/validate";
import { ConsentCheckboxes } from "./ConsentCheckboxes";
import { inputClassName, labelClassName, textareaClassName } from "./ui";

// The full estimate form, used at the top of the page and in the #quote
// section. Name, phone, email, address, ZIP and service are required.
export function EstimateForm({
  idPrefix,
  source,
  trackLabel,
  trackSection,
}: {
  idPrefix: string;
  source: string;
  trackLabel: string;
  trackSection?: string;
}) {
  const [submitted, setSubmitted] = useState(false);
  const [scheduleInspection, setScheduleInspection] = useState(false);
  const [smsConsent, setSmsConsent] = useState(false);
  const [termsAck, setTermsAck] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const id = (name: string) => `${idPrefix}-${name}`;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    const data = new FormData(event.currentTarget);
    const payload = {
      name: String(data.get("name") ?? "").trim(),
      phone: String(data.get("phone") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      address: String(data.get("address") ?? "").trim(),
      zip: String(data.get("zip") ?? "").trim(),
      service: String(data.get("service") ?? "").trim(),
      message: String(data.get("message") ?? "").trim(),
      inspectionDate: String(data.get("inspection-date") ?? "").trim(),
      inspectionTime: String(data.get("inspection-time") ?? "").trim(),
      source,
      visitorId: getVisitorId(),
      attribution: getAttribution(),
      consent: consentSubmission(smsConsent, termsAck),
      // Honeypot: real users never see or fill this; bots do.
      company: String(data.get("company") ?? "").trim(),
    };

    const missing = [
      !payload.name && "name",
      !payload.phone && "phone",
      !payload.email && "email",
      !payload.address && "address",
      !payload.zip && "ZIP code",
      !payload.service && "the service you need",
    ].filter((item): item is string => Boolean(item));
    if (missing.length) {
      const list =
        missing.length > 1
          ? `${missing.slice(0, -1).join(", ")} and ${missing.at(-1)}`
          : missing[0];
      setError(`Please fill in your ${list}.`);
      return;
    }
    if (!isValidPhone(payload.phone)) {
      setError("Please enter a valid phone number (10 digits with area code).");
      return;
    }
    if (!isValidEmail(payload.email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!isValidZip(payload.zip)) {
      setError("Please enter a valid 5-digit ZIP code.");
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

      trackLead(trackLabel, trackSection);
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

  if (submitted) {
    return (
      <div className="py-8 text-center">
        <CheckCircle2
          className="mx-auto h-12 w-12 text-primary"
          aria-hidden="true"
        />
        <h3 className="mt-4 font-display text-2xl font-bold">
          {siteCopy.quote.successTitle}
        </h3>
        <p className="mt-3 text-foreground/70">{siteCopy.quote.successBody}</p>
      </div>
    );
  }

  return (
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
        <label className={labelClassName} htmlFor={id("name")}>
          Name
        </label>
        <input
          id={id("name")}
          name="name"
          type="text"
          placeholder="Full name"
          autoComplete="name"
          required
          className={`mt-2 ${inputClassName}`}
        />
      </div>
      <div>
        <label className={labelClassName} htmlFor={id("phone")}>
          Phone
        </label>
        <input
          id={id("phone")}
          name="phone"
          type="tel"
          placeholder="(213) 000-0000"
          autoComplete="tel"
          required
          className={`mt-2 ${inputClassName}`}
        />
      </div>
      <div className="sm:col-span-2">
        <ConsentCheckboxes
          idPrefix={idPrefix}
          sms={smsConsent}
          terms={termsAck}
          onSmsChange={setSmsConsent}
          onTermsChange={setTermsAck}
        />
      </div>
      <div className="sm:col-span-2">
        <label className={labelClassName} htmlFor={id("email")}>
          Email
        </label>
        <input
          id={id("email")}
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
          className={`mt-2 ${inputClassName}`}
        />
      </div>
      <div className="sm:col-span-2">
        <label className={labelClassName} htmlFor={id("address")}>
          Address
        </label>
        <input
          id={id("address")}
          name="address"
          type="text"
          placeholder="Street, City"
          autoComplete="street-address"
          required
          className={`mt-2 ${inputClassName}`}
        />
      </div>
      <div>
        <label className={labelClassName} htmlFor={id("zip")}>
          ZIP code
        </label>
        <input
          id={id("zip")}
          name="zip"
          type="text"
          placeholder="90012"
          autoComplete="postal-code"
          inputMode="numeric"
          maxLength={10}
          required
          className={`mt-2 ${inputClassName}`}
        />
      </div>
      <div>
        <label className={labelClassName} htmlFor={id("service")}>
          Service needed
        </label>
        <select
          id={id("service")}
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
        <label className={labelClassName} htmlFor={id("message")}>
          Message (optional)
        </label>
        <textarea
          id={id("message")}
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
              onChange={(event) => setScheduleInspection(event.target.checked)}
              className="mt-1 h-4 w-4 accent-[var(--color-accent-cobalt)]"
            />
            <span>
              <span className="flex items-center gap-2 font-display text-base font-semibold">
                <Calendar className="h-4 w-4 text-primary" aria-hidden="true" />
                Schedule a free inspection (optional)
              </span>
              <span className="mt-1 block text-xs text-foreground/60">
                Pick a date and time that work for you. We&apos;ll confirm by
                email.
              </span>
            </span>
          </label>
          {scheduleInspection ? (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                type="date"
                name="inspection-date"
                aria-label="Preferred inspection date"
                className={inputClassName}
              />
              <input
                type="time"
                name="inspection-time"
                aria-label="Preferred inspection time"
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
  );
}
