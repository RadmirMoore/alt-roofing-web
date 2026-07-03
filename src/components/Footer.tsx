import { Clock, Mail, Phone } from "lucide-react";
import { EMAIL, EMAIL_HREF, PHONE, PHONE_HREF, siteCopy } from "../data/content";

export function Footer() {
  return (
    <footer className="relative border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-primary shadow-[0_0_18px_var(--color-accent-cobalt-glow)]" />
              <span className="font-display text-lg font-semibold tracking-tight">
                ALT / Roofing Solutions
              </span>
            </div>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-foreground/65">
              {siteCopy.footer.tagline}
            </p>
          </div>

          <div>
            <div className="text-[11px] font-medium tracking-[0.25em] text-foreground/45 uppercase">
              Contact
            </div>
            <ul className="mt-5 space-y-3 text-sm text-foreground/80">
              <li>
                <a
                  href={PHONE_HREF}
                  aria-label="Call ALT Roofing"
                  className="flex items-center gap-2 transition hover:text-foreground"
                >
                  <Phone className="h-4 w-4 text-primary" aria-hidden="true" />
                  {PHONE}
                </a>
              </li>
              <li>
                <a
                  href={EMAIL_HREF}
                  className="flex items-center gap-2 transition hover:text-foreground"
                >
                  <Mail className="h-4 w-4 text-primary" aria-hidden="true" />
                  {EMAIL}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-[11px] font-medium tracking-[0.25em] text-foreground/45 uppercase">
              Hours
            </div>
            <ul className="mt-5 space-y-3 text-sm text-foreground/80">
              <li className="flex items-start gap-2">
                <Clock
                  className="mt-0.5 h-4 w-4 text-primary"
                  aria-hidden="true"
                />
                <span>
                  Mon–Sat · 8:00a – 5:00p
                  <br />
                  <span className="text-foreground/55">
                    Free inspections available
                  </span>
                </span>
              </li>
              <li className="text-foreground/55">
                {siteCopy.footer.serviceArea}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-8 text-sm text-foreground/50 md:flex-row md:items-center md:justify-between">
          <p>© 2026 ALT Roofing Solutions Inc. All rights reserved.</p>
          <p>Licensed & Insured · Lic. #1154302 · Los Angeles, CA</p>
        </div>
      </div>
    </footer>
  );
}
