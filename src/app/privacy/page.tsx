import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | SamuDate",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 space-y-8">
      <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground">
        Last updated: March 15, 2026
      </p>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">1. Data We Collect</h2>
        <p className="text-muted-foreground leading-relaxed">
          When you use SamuDate, we collect the following information:
        </p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>
            <strong>Account data:</strong> Name, email address, and password
            (hashed).
          </li>
          <li>
            <strong>Profile data:</strong> Display name, bio, date of birth,
            gender, location, occupation, photos, and dating preferences.
          </li>
          <li>
            <strong>Community data:</strong> Your community circle memberships,
            vetting relationships, votes, and comments.
          </li>
          <li>
            <strong>Messages:</strong> Content of messages exchanged with
            matches.
          </li>
          <li>
            <strong>Usage data:</strong> Interactions with the Service, device
            and browser information, IP address.
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">
          2. Community Vetting Data Sharing
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          SamuDate&apos;s core feature is community-driven vetting. This means:
        </p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>
            Vetters invited by other users can view your profile information
            (display name, bio, photos, age, location, and occupation) to
            evaluate compatibility.
          </li>
          <li>
            Votes and comments submitted by vetters about your profile are
            shared with the user who invited them.
          </li>
          <li>
            Community scores calculated from vetter input are visible to the
            user considering a match.
          </li>
        </ul>
        <p className="text-muted-foreground leading-relaxed">
          By using SamuDate, you consent to this data sharing as an essential
          part of the Service.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">3. How We Use Your Data</h2>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>To provide and maintain the Service.</li>
          <li>
            To facilitate community vetting, matching, and messaging.
          </li>
          <li>To send verification and transactional emails.</li>
          <li>To enforce our Terms of Service.</li>
          <li>To improve the Service.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">4. Data Retention & Deletion</h2>
        <p className="text-muted-foreground leading-relaxed">
          We retain your data for as long as your account is active. You may
          request deletion of your account and associated data by contacting us
          at{" "}
          <a
            href="mailto:privacy@samudate.com"
            className="text-primary hover:underline"
          >
            privacy@samudate.com
          </a>
          . Upon deletion, your personal data will be removed within 30 days,
          except where retention is required by law.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">5. Third-Party Services</h2>
        <p className="text-muted-foreground leading-relaxed">
          We use the following third-party services:
        </p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>
            <strong>Google OAuth:</strong> For optional social sign-in.
            Google&apos;s privacy policy applies to data collected by Google
            during authentication.
          </li>
          <li>
            <strong>UploadThing:</strong> For photo uploads and storage. Files
            are stored securely on UploadThing&apos;s infrastructure.
          </li>
          <li>
            <strong>Resend:</strong> For sending transactional emails
            (verification, notifications).
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">6. Your Rights</h2>
        <p className="text-muted-foreground leading-relaxed">
          You have the right to:
        </p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>Access the personal data we hold about you.</li>
          <li>Request correction of inaccurate data.</li>
          <li>Request deletion of your data.</li>
          <li>Object to or restrict processing of your data.</li>
          <li>
            Request a copy of your data in a portable format.
          </li>
        </ul>
        <p className="text-muted-foreground leading-relaxed">
          To exercise these rights, contact{" "}
          <a
            href="mailto:privacy@samudate.com"
            className="text-primary hover:underline"
          >
            privacy@samudate.com
          </a>
          .
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">7. Cookies</h2>
        <p className="text-muted-foreground leading-relaxed">
          We use essential cookies for authentication and session management.
          These cookies are strictly necessary for the Service to function and
          cannot be disabled.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">8. Contact</h2>
        <p className="text-muted-foreground leading-relaxed">
          For privacy-related questions or requests, contact us at{" "}
          <a
            href="mailto:privacy@samudate.com"
            className="text-primary hover:underline"
          >
            privacy@samudate.com
          </a>
          .
        </p>
      </section>

      <div className="pt-8 border-t border-border/30">
        <Link
          href="/terms"
          className="text-primary hover:underline text-sm"
        >
          Terms of Service
        </Link>
      </div>
    </div>
  );
}
