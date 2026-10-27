import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { Footer } from "../components/Footer";
import { EMAIL, EMAIL_HREF, PHONE, PHONE_HREF } from "../data/content";
import {
  PRIVACY_EFFECTIVE_DATE,
  privacyIntro,
  privacySections,
  type PolicyBlock,
} from "../data/privacy-policy";

function Block({ block }: { block: PolicyBlock }) {
  if (block.type === "p") {
    return (
      <p className="mt-4 leading-relaxed text-foreground/75">{block.text}</p>
    );
  }

  return (
    <ul className="mt-4 list-disc space-y-3 pl-5 leading-relaxed text-foreground/75 marker:text-primary">
      {block.items.map((item) => (
        <li key={item.text}>
          {item.label && (
            <span className="font-semibold text-foreground">
              {item.label}:{" "}
            </span>
          )}
          {item.text}
        </li>
      ))}
    </ul>
  );
}

export function PrivacyPolicyPage() {
  useEffect(() => {
    document.title = "Privacy Policy | ALT Roofing Solutions";
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background">
      <header className="border-b border-border pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          <a href="/" className="flex items-center gap-2.5">
            <img
              src="/images/alt-logo.png"
              alt="ALT Roofing Solutions"
              className="h-9 w-auto md:h-11"
            />
          </a>
          <a
            href="/"
            className="flex items-center gap-2 text-sm text-foreground/80 transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to home
          </a>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-5 py-14 md:px-8 md:py-20">
        <h1 className="font-display text-4xl font-bold md:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-3 text-lg text-foreground/80">
          ALT Roofing Solutions Inc.
        </p>
        <p className="mt-2 text-sm text-foreground/55">
          Effective date and last updated: {PRIVACY_EFFECTIVE_DATE}
        </p>

        {privacyIntro.map((text) => (
          <p key={text} className="mt-6 leading-relaxed text-foreground/75">
            {text}
          </p>
        ))}

        {privacySections.map((section) => (
          <section key={section.id} id={section.id} className="mt-12">
            <h2 className="font-display text-2xl font-semibold">
              {section.title}
            </h2>
            {section.blocks.map((block, index) => (
              <Block key={index} block={block} />
            ))}
          </section>
        ))}

        <section id="contact" className="mt-12">
          <h2 className="font-display text-2xl font-semibold">Contact us</h2>
          <address className="mt-4 leading-relaxed text-foreground/75 not-italic">
            ALT Roofing Solutions Inc.
            <br />
            Attention: Privacy Requests
            <br />
            Email:{" "}
            <a
              href={EMAIL_HREF}
              className="text-foreground underline underline-offset-4"
            >
              {EMAIL}
            </a>
            <br />
            Phone:{" "}
            <a
              href={PHONE_HREF}
              className="text-foreground underline underline-offset-4"
            >
              {PHONE}
            </a>
            <br />
            Website:{" "}
            <a
              href="/"
              className="text-foreground underline underline-offset-4"
            >
              https://altroofingsolutions.com
            </a>
            <br />
            California C-39 Contractor License #1154302
          </address>
        </section>
      </article>

      <Footer />
    </main>
  );
}
