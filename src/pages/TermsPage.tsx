import type { ReactNode } from "react";
import {
  LegalPageLayout,
  LegalSection,
  legalLinkClassName,
  legalParagraphClassName,
} from "../components/LegalPageLayout";
import { EMAIL, EMAIL_HREF, PHONE, PHONE_HREF } from "../data/content";

// Update this date whenever the Terms text changes.
export const TERMS_EFFECTIVE_DATE = "October 26, 2026";

function P({ children }: { children: ReactNode }) {
  return <p className={legalParagraphClassName}>{children}</p>;
}

function H3({ children }: { children: ReactNode }) {
  return (
    <h3 className="mt-8 font-display text-lg font-semibold">{children}</h3>
  );
}

function Site() {
  return (
    <a href="/" className={legalLinkClassName}>
      https://altroofingsolutions.com
    </a>
  );
}

function PrivacyLink({ children }: { children: ReactNode }) {
  return (
    <a href="/privacy" className={legalLinkClassName}>
      {children}
    </a>
  );
}

function Email() {
  return (
    <a href={EMAIL_HREF} className={legalLinkClassName}>
      {EMAIL}
    </a>
  );
}

function Phone() {
  return (
    <a href={PHONE_HREF} className={legalLinkClassName}>
      {PHONE}
    </a>
  );
}

export function TermsPage() {
  return (
    <LegalPageLayout
      pageTitle="Terms and Conditions | ALT Roofing Solutions"
      title="Terms and Conditions"
      subtitle="Website and text messaging terms"
      effectiveDate={TERMS_EFFECTIVE_DATE}
    >
      <p className="mt-6 leading-relaxed text-foreground/75">
        These Terms and Conditions (&quot;Terms&quot;) describe the rules for
        using <Site /> and the text messaging programs offered by ALT Roofing
        Solutions Inc. (&quot;ALT,&quot; &quot;we,&quot; &quot;us,&quot; or
        &quot;our&quot;). Where we ask you to accept these Terms, your
        affirmative acceptance constitutes agreement to the version presented.
        The text messaging provisions apply when you opt in through a disclosed
        messaging consent process.
      </p>
      <P>
        Roofing work is governed by your separate written project agreement and
        applicable law. These website Terms do not replace that agreement,
        change an agreed project price or warranty, authorize work, or waive a
        legally protected consumer right.
      </P>
      <nav aria-label="Quick links" className="mt-6 text-sm text-foreground/75">
        <a href="#sms-terms" className={legalLinkClassName}>
          Text messaging terms
        </a>
        {" · "}
        <PrivacyLink>Privacy Policy</PrivacyLink>
        {" · "}
        <a href="#contact" className={legalLinkClassName}>
          Contact us
        </a>
      </nav>

      <LegalSection id="requests" title="Requests and appointments">
        <P>
          Provide accurate contact and property information when requesting an
          estimate, inspection, or service, and tell us if that information
          changes. You must be at least 18 and authorized to request access to
          the property or act for the property owner when arranging an
          inspection or work.
        </P>
        <P>
          Submitting an inquiry, selecting a preferred appointment time, or
          receiving an automated acknowledgement does not by itself confirm an
          appointment or authorize paid work. An appointment is confirmed when
          our team confirms it. Contact us promptly if you need to reschedule.
          We will communicate any changes that affect a confirmed appointment.
        </P>
        <P>
          Forms, chat, email, and texts are not emergency-response channels. We
          do not promise immediate review or response through them. For urgent
          roofing assistance, call <Phone />; for an immediate threat to
          personal safety, contact emergency services.
        </P>
      </LegalSection>

      <LegalSection
        id="estimates"
        title="Estimates pricing and project agreements"
      >
        <P>
          General website prices, examples, and online estimates depend on the
          scope and conditions stated with them. A project may require an
          inspection, measurements, material selection, and confirmation of
          roof conditions before a final written proposal can be prepared.
        </P>
        <P>
          Your project agreement identifies the agreed scope, price, payment
          schedule, included and excluded items, timing, and applicable
          warranties. Required changes to the scope or price must follow the
          written change-order process and applicable law. A website update or
          correction does not permit us to unilaterally change an accepted
          project agreement.
        </P>
        <P>
          Promotions, coupons, price guarantees, and financing offers are
          subject to their clearly disclosed terms and applicable law. We honor
          valid offers on that basis. Any financing is subject to the
          lender&apos;s eligibility, approval, and written terms; a website
          example does not guarantee approval or a particular payment or rate.
        </P>
        <P>
          Manufacturer warranties and ALT workmanship warranties are governed by
          their applicable written terms and any rights provided by law. These
          website Terms do not shorten a warranty, limit a legally required
          cancellation period, or make any deposit nonrefundable. Your project
          documents must supply the required contract disclosures and
          cancellation notices.
        </P>
      </LegalSection>

      <LegalSection id="ai-chat" title="Website information and AI chat">
        <P>
          Website descriptions, photos, and educational materials provide
          general roofing information. They do not establish the condition of
          your property or replace an inspection, project-specific advice, or a
          written agreement.
        </P>
        <P>
          The website may provide an automated AI assistant to answer general
          questions and help with inquiries. AI responses can be incomplete or
          incorrect. Confirm pricing, scope, material suitability, scheduling,
          warranty details, and other project commitments with an authorized
          ALT representative. An AI reply alone does not approve a contract or
          change order.
        </P>
        <P>
          We may correct errors and update website information. Corrections do
          not remove rights arising from misleading statements or change an
          existing agreement without the process required by law.
        </P>
      </LegalSection>

      <LegalSection id="privacy" title="Privacy and information you provide">
        <P>
          Our Privacy Policy at{" "}
          <PrivacyLink>https://altroofingsolutions.com/privacy</PrivacyLink>{" "}
          explains how we handle website activity, inquiries, chat, customer
          records, and communications. Reading these Terms, viewing the site, or
          submitting an inquiry is not by itself permission to send promotional
          texts or make automated marketing calls.
        </P>
        <P>
          Submit only information and files you are authorized to provide. You
          retain ownership of your materials. You allow ALT and providers acting
          for ALT to use them as reasonably needed to evaluate your request,
          perform your project, and provide related support, consistent with the
          Privacy Policy. Submitting material does not grant an unrestricted
          license to use your name, property, or photographs in advertising; we
          seek separate permission for that use.
        </P>
        <P>
          Do not submit passwords, Social Security numbers, complete payment
          card numbers, card security codes, bank account credentials, or other
          unnecessary sensitive information through public forms or chat. Use
          the designated payment or financing channel when appropriate.
        </P>
      </LegalSection>

      <LegalSection id="sms-terms" title="SMS and MMS messaging terms">
        <H3>Program and message types</H3>
        <P>
          The ALT Roofing Solutions Inc. messaging program provides text
          messages about inquiries, requested estimates, inspection
          confirmations and reminders, scheduling, project updates, payments,
          and customer support. If you separately opt in to promotional
          messages, that program may also include roofing offers and discounts.
          Messages may be recurring, automated, and delivered by SMS or MMS.
        </P>
        <H3>Consent and eligibility</H3>
        <P>
          You enroll by taking the affirmative opt-in action described at the
          point of enrollment. You must be at least 18 and the subscriber or
          authorized user of the mobile number provided. Consent applies to ALT
          and the message types you selected. Promotional messaging requires
          separate express written consent. Agreeing to general website terms
          alone does not enroll you in texts.
        </P>
        <P>
          Consent to receive texts is optional and is not a condition of
          purchasing any goods or services. You can request roofing services
          without subscribing to texts. Tell us if you change or give up the
          mobile number associated with your subscription.
        </P>
        <H3>Frequency and charges</H3>
        <P>
          Message frequency varies with your requests, appointments, and project
          activity and with any promotional program you select; appointment
          messages are typically about 4–6 messages per appointment. Message and
          data rates may apply. Your wireless provider determines the charges
          under your mobile plan.
        </P>
        <H3>Stopping messages and getting help</H3>
        <P>
          Reply STOP to the number that sent the message to stop texts. You may
          also ask us to stop through another reasonable method, including email
          to <Email /> or a call to <Phone />. We honor valid opt-out requests
          promptly. We may send one non-promotional confirmation, then stop
          further texts unless you provide a new valid opt-in through the
          enrollment process. For recurring promotional texts, a new opt-in must
          include the required express written consent.
        </P>
        <P>
          Reply HELP for assistance, email <Email />, or call <Phone />. Opting
          out of texts does not cancel a roofing agreement or appointment.
          Contact our team separately for project or scheduling changes. We may
          use another permitted channel to communicate necessary service
          information, consistent with your preferences and applicable law.
        </P>
        <H3>Delivery and carrier responsibility</H3>
        <P>
          Text delivery depends on your device, carrier, coverage, and other
          systems and is not guaranteed. Carriers are not liable for delayed or
          undelivered messages. This statement applies only to the extent
          permitted by law. Do not rely on text messaging for emergencies or
          time-critical instructions.
        </P>
        <H3>Mobile information and program changes</H3>
        <P>
          Mobile numbers, SMS opt-in records, and messaging consent are not
          sold, rented, or supplied to affiliates, lead generators, or other
          third parties for marketing or promotional use. Providers supporting
          delivery and customer support may process this information only to
          perform those services for us, under appropriate confidentiality and
          use restrictions. Messaging consent is not transferred to another
          business for its own use. See our{" "}
          <PrivacyLink>Privacy Policy</PrivacyLink> for further details.
        </P>
        <P>
          We may change or discontinue a messaging program with notice when
          required. A change does not expand your consent to new message types
          or enroll you in marketing. We obtain new consent when required before
          making such a change.
        </P>
      </LegalSection>

      <LegalSection id="acceptable-use" title="Permitted website use">
        <P>
          Use the site lawfully. Do not impersonate someone else, submit
          fraudulent requests, upload malicious content, interfere with site
          operation, attempt unauthorized access, bypass access controls, or
          collect other people&apos;s nonpublic information without
          authorization. We may restrict access reasonably necessary to address
          misuse or protect the site.
        </P>
        <P>
          These rules do not restrict honest reviews, lawful criticism, reports
          to regulators, or the exercise of consumer or privacy rights.
        </P>
      </LegalSection>

      <LegalSection
        id="content"
        title="Website content and third party services"
      >
        <P>
          Website text, designs, logos, and other materials belong to ALT or
          their respective owners. You may view, save, and print reasonable
          portions to evaluate or use our services. Other use requires
          permission unless applicable law permits it. Do not misrepresent an
          affiliation with ALT or remove ownership notices.
        </P>
        <P>
          Independent payment, financing, manufacturer, and other linked
          services operate under their own terms and privacy notices. Review
          those terms before using the service. Their terms do not change
          ALT&apos;s obligations to you under your project agreement or
          applicable law.
        </P>
      </LegalSection>

      <LegalSection
        id="availability"
        title="Website availability and your rights"
      >
        <P>
          We work to keep the website useful and available, but interruptions
          and errors may occur. To the extent permitted by law, the website is
          provided as available without a promise of uninterrupted or error-free
          operation.
        </P>
        <P>
          This provision concerns website availability. It does not limit our
          roofing workmanship obligations, written warranties, or duties under a
          signed agreement or applicable law. Nothing in these Terms excludes
          liability where exclusion is prohibited, excuses fraud or willful
          misconduct, or waives a legally protected consumer right.
        </P>
      </LegalSection>

      <LegalSection id="disputes" title="Questions disputes and governing law">
        <P>
          Please contact us about a concern so we can try to resolve it.
          Contacting us first is not a condition of exercising a legal right,
          filing a regulatory complaint, or bringing a claim. These Terms do not
          impose mandatory arbitration, a class-action waiver, or a shortened
          legal filing deadline.
        </P>
        <P>
          California law governs these website Terms to the extent applicable,
          together with controlling federal law and any mandatory consumer
          protections that otherwise apply. A dispute may be brought before a
          court with lawful jurisdiction, including small claims court when
          appropriate. Nothing prevents a complaint to the California
          Contractors State License Board or another relevant agency.
        </P>
      </LegalSection>

      <LegalSection id="changes" title="Changes to these Terms">
        <P>
          We will post revisions on this page and update the effective and
          last-updated date. We will provide additional notice of material
          changes and obtain affirmative agreement where required. Revisions
          apply prospectively and do not change an existing roofing agreement,
          withdraw accrued rights, or create new marketing consent.
        </P>
        <P>
          If a provision is unenforceable, the remaining provisions continue to
          apply to the extent permitted by law. A separate signed project
          agreement controls project-specific matters, subject to mandatory law.
        </P>
      </LegalSection>

      <LegalSection id="contact" title="Contact ALT Roofing Solutions">
        <address className={`${legalParagraphClassName} not-italic`}>
          ALT Roofing Solutions Inc.
          <br />
          Email: <Email />
          <br />
          Phone: <Phone />
          <br />
          Website: <Site />
          <br />
          California C-39 Contractor License #1154302
        </address>
      </LegalSection>
    </LegalPageLayout>
  );
}
