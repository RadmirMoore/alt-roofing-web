import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { consentSubmission } from "../data/consent";
import {
  propertyKindOptions,
  quoteServiceOptions,
  roofAgeOptions,
  siteCopy,
} from "../data/content";
import { getVisitorId, trackLead } from "../lib/analytics-tracker";
import { getAttribution } from "../lib/attribution";
import { newId } from "../lib/ids";
import { revealTop } from "../lib/reveal";
import { isValidEmail, isValidPhone, isValidZip } from "../lib/validate";
import { ConsentCheckboxes } from "./ConsentCheckboxes";
import { InspectionTimes } from "./InspectionTimes";
import { inputClassName, labelClassName, textareaClassName } from "./ui";

// The full estimate form, used at the top of the page and in the #quote
// section. Every field except the message is required: the answers go into
// ALT's CRM, which then offers real inspection times (InspectionTimes).
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
  // The CRM's answer when it saved the request; "bookable" offers times.
  const [crm, setCrm] = useState<{ outcome: string; addressConfirmed: boolean } | null>(null);
  // One ID per filled-in form, so a retry (double click, slow connection)
  // never makes a second lead in the CRM.
  const [requestId] = useState(newId);
  const [propertyKind, setPropertyKind] = useState("");
  const [smsConsent, setSmsConsent] = useState(false);
  const [termsAck, setTermsAck] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const box = useRef<HTMLDivElement>(null);

  // The answer (times or thank-you) is much shorter than the form it replaces.
  useEffect(() => {
    if (submitted) revealTop(box.current);
  }, [submitted]);

  const id = (name: string) => `${idPrefix}-${name}`;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    const data = new FormData(event.currentTarget);
    const field = (name: string) => String(data.get(name) ?? "").trim();
    const owns = field("owns");
    const payload = {
      firstName: field("first-name"),
      lastName: field("last-name"),
      phone: field("phone"),
      email: field("email"),
      street: field("street"),
      city: field("city"),
      zip: field("zip"),
      service: field("service"),
      roofAge: field("roof-age"),
      propertyKind: field("property-kind"),
      propertyKindOther: field("property-kind-other"),
      ownsProperty: owns === "yes" ? true : owns === "no" ? false : null,
      message: field("message"),
      requestId,
      source,
      visitorId: getVisitorId(),
      attribution: getAttribution(),
      consent: consentSubmission(smsConsent, termsAck),
      // Honeypot: real users never see or fill this; bots do.
      company: String(data.get("company") ?? "").trim(),
    };

    const missing = [
      !payload.firstName && "first name",
      !payload.lastName && "last name",
      !payload.phone && "phone",
      !payload.email && "email",
      !payload.street && "street address",
      !payload.city && "city",
      !payload.zip && "ZIP code",
      !payload.service && "the service you need",
      !payload.roofAge && "the roof's age",
      !payload.propertyKind && "the type of property",
      payload.ownsProperty === null && "whether you own the property",
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

      const body = (await response.json().catch(() => null)) as {
        error?: string;
        crm?: { outcome: string; addressConfirmed: boolean };
      } | null;
      if (!response.ok) {
        throw new Error(body?.error ?? "Failed to submit. Please try again.");
      }

      trackLead(trackLabel, trackSection);
      setCrm(body?.crm ?? null);
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

  if (submitted && crm?.outcome === "bookable") {
    return (
      <div ref={box} className="scroll-mt-24">
        <InspectionTimes
          addressConfirmed={crm.addressConfirmed}
          doneTitle={siteCopy.quote.successTitle}
          doneBody={siteCopy.quote.successBody}
        />
      </div>
    );
  }

  if (submitted) {
    return (
      <div ref={box} className="scroll-mt-24 py-8 text-center">
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
        <label className={labelClassName} htmlFor={id("first-name")}>
          First name
        </label>
        <input
          id={id("first-name")}
          name="first-name"
          type="text"
          autoComplete="given-name"
          maxLength={80}
          required
          className={`mt-2 ${inputClassName}`}
        />
      </div>
      <div>
        <label className={labelClassName} htmlFor={id("last-name")}>
          Last name
        </label>
        <input
          id={id("last-name")}
          name="last-name"
          type="text"
          autoComplete="family-name"
          maxLength={80}
          required
          className={`mt-2 ${inputClassName}`}
        />
      </div>
      <div className="sm:col-span-2">
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
        <label className={labelClassName} htmlFor={id("street")}>
          Property street address
        </label>
        <input
          id={id("street")}
          name="street"
          type="text"
          placeholder="123 Main St"
          autoComplete="address-line1"
          maxLength={200}
          required
          className={`mt-2 ${inputClassName}`}
        />
      </div>
      <div>
        <label className={labelClassName} htmlFor={id("city")}>
          City
        </label>
        <input
          id={id("city")}
          name="city"
          type="text"
          autoComplete="address-level2"
          maxLength={100}
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
      <div>
        <label className={labelClassName} htmlFor={id("roof-age")}>
          How old is the roof?
        </label>
        <select
          id={id("roof-age")}
          name="roof-age"
          required
          defaultValue=""
          className={`mt-2 ${inputClassName}`}
        >
          <option value="" disabled>
            Select
          </option>
          {roofAgeOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClassName} htmlFor={id("property-kind")}>
          Type of property
        </label>
        <select
          id={id("property-kind")}
          name="property-kind"
          required
          value={propertyKind}
          onChange={(event) => setPropertyKind(event.target.value)}
          className={`mt-2 ${inputClassName}`}
        >
          <option value="" disabled>
            Select
          </option>
          {propertyKindOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClassName} htmlFor={id("owns")}>
          Do you own this property?
        </label>
        <select
          id={id("owns")}
          name="owns"
          required
          defaultValue=""
          className={`mt-2 ${inputClassName}`}
        >
          <option value="" disabled>
            Select
          </option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </div>
      {propertyKind === "other" ? (
        <div className="sm:col-span-2">
          <label className={labelClassName} htmlFor={id("property-kind-other")}>
            What kind of property? (optional)
          </label>
          <input
            id={id("property-kind-other")}
            name="property-kind-other"
            type="text"
            maxLength={100}
            className={`mt-2 ${inputClassName}`}
          />
        </div>
      ) : null}
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
