import { SMS_CONSENT_BODY, TERMS_ACK_BODY } from "../data/consent";

const checkboxClassName =
  "mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-[var(--color-accent-cobalt)]";
const linkClassName =
  "font-semibold text-foreground underline underline-offset-4 hover:text-primary";

function PolicyLinks() {
  return (
    <>
      <a href="/privacy" target="_blank" rel="noopener" className={linkClassName}>
        Privacy Policy
      </a>
      {" · "}
      <a href="/terms" target="_blank" rel="noopener" className={linkClassName}>
        Terms
      </a>
    </>
  );
}

// Two separate, unticked boxes required for carrier (A2P 10DLC) texting
// registration. Neither is needed to submit the form.
export function ConsentCheckboxes({
  idPrefix,
  sms,
  terms,
  onSmsChange,
  onTermsChange,
}: {
  idPrefix: string;
  sms: boolean;
  terms: boolean;
  onSmsChange: (checked: boolean) => void;
  onTermsChange: (checked: boolean) => void;
}) {
  return (
    <div className="space-y-3 rounded-xl border border-border bg-background/50 p-4 text-sm leading-relaxed text-foreground/85">
      <div className="flex items-start gap-3">
        <input
          id={`${idPrefix}-sms-consent`}
          type="checkbox"
          checked={sms}
          onChange={(event) => onSmsChange(event.target.checked)}
          className={checkboxClassName}
        />
        <div>
          <label htmlFor={`${idPrefix}-sms-consent`} className="cursor-pointer">
            {SMS_CONSENT_BODY}
          </label>{" "}
          <PolicyLinks />
        </div>
      </div>
      <div className="flex items-start gap-3">
        <input
          id={`${idPrefix}-terms-ack`}
          type="checkbox"
          checked={terms}
          onChange={(event) => onTermsChange(event.target.checked)}
          className={checkboxClassName}
        />
        <div>
          <label htmlFor={`${idPrefix}-terms-ack`} className="cursor-pointer">
            {TERMS_ACK_BODY}
          </label>{" "}
          <PolicyLinks />
        </div>
      </div>
    </div>
  );
}
