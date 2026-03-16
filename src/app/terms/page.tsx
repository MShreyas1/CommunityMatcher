import Link from "next/link";

export const metadata = {
  title: "Terms of Service | SamuDate",
};

export default function TermsOfServicePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 space-y-8">
      <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
      <p className="text-sm text-muted-foreground">
        Last updated: March 15, 2026
      </p>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
        <p className="text-muted-foreground leading-relaxed">
          By accessing or using SamuDate (&quot;the Service&quot;), you agree to
          be bound by these Terms of Service. If you do not agree, do not use
          the Service.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">2. Eligibility</h2>
        <p className="text-muted-foreground leading-relaxed">
          You must be at least 18 years old to use SamuDate. By creating an
          account, you represent and warrant that you are at least 18 years of
          age and have the legal capacity to enter into these Terms.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">3. Account Security</h2>
        <p className="text-muted-foreground leading-relaxed">
          You are responsible for maintaining the confidentiality of your
          account credentials and for all activities that occur under your
          account. You agree to immediately notify us of any unauthorized use of
          your account.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">
          4. Community Vetting Consent
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          SamuDate uses a community-driven vetting system. By using the Service,
          you consent to:
        </p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>
            Your profile being visible to vetters (friends, family, colleagues,
            or mentors) that other users have invited to their community circle.
          </li>
          <li>
            Vetters viewing your profile information to evaluate potential
            compatibility with the person they are vetting for.
          </li>
          <li>
            Vetters submitting votes and comments about your profile, which are
            visible to the person who invited them.
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">5. User Conduct</h2>
        <p className="text-muted-foreground leading-relaxed">
          You agree not to:
        </p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>Provide false or misleading information in your profile.</li>
          <li>Harass, abuse, or threaten other users.</li>
          <li>
            Use the Service for any commercial purpose without our consent.
          </li>
          <li>
            Attempt to gain unauthorized access to other user accounts or our
            systems.
          </li>
          <li>
            Use automated means (bots, scrapers) to access the Service.
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">6. Prohibited Content</h2>
        <p className="text-muted-foreground leading-relaxed">
          You may not upload, share, or transmit content that is:
        </p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>Illegal, harmful, threatening, abusive, or defamatory.</li>
          <li>Sexually explicit or pornographic.</li>
          <li>Promoting violence, discrimination, or hatred.</li>
          <li>
            Infringing on the intellectual property rights of others.
          </li>
          <li>Spam or unsolicited advertising.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">7. Termination</h2>
        <p className="text-muted-foreground leading-relaxed">
          We reserve the right to suspend or terminate your account at any time,
          with or without cause, with or without notice. You may delete your
          account at any time by contacting us. Upon termination, your right to
          use the Service ceases immediately.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">8. Limitation of Liability</h2>
        <p className="text-muted-foreground leading-relaxed">
          SamuDate is provided &quot;as is&quot; without warranties of any kind.
          We are not liable for any damages arising from your use of the
          Service, including but not limited to direct, indirect, incidental, or
          consequential damages. We do not guarantee that matches or
          connections made through the Service will be successful.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">9. Governing Law</h2>
        <p className="text-muted-foreground leading-relaxed">
          These Terms shall be governed by and construed in accordance with the
          laws of the United States. Any disputes arising under these Terms
          shall be resolved in the appropriate courts.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">10. Contact</h2>
        <p className="text-muted-foreground leading-relaxed">
          For questions about these Terms, contact us at{" "}
          <a
            href="mailto:legal@samudate.com"
            className="text-primary hover:underline"
          >
            legal@samudate.com
          </a>
          .
        </p>
      </section>

      <div className="pt-8 border-t border-border/30">
        <Link
          href="/privacy"
          className="text-primary hover:underline text-sm"
        >
          Privacy Policy
        </Link>
      </div>
    </div>
  );
}
