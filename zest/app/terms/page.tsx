"use client";

import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="page">
      <Link href="/" className="back-link">
        ← Back to home
      </Link>
      <h1>Terms of Service</h1>
      <div className="content">
        <p>Last updated: September 2026</p>

        <h2>1. Your use of Zest</h2>
        <p>
          Zest provides scheduling and intake-form tools for service-based
          businesses. By creating an account, you agree to use the platform
          lawfully and responsibly.
        </p>

        <h2>2. Subscriptions and payment</h2>
        <p>
          Zest offers a free plan (1 event type) and a paid Pro plan (currently
          NGN 4,000/month). All new accounts include a 7-day Pro trial. Pro is
          paid by bank transfer to the account shown on the billing page; access
          is activated once we confirm your payment. You are responsible for the
          accuracy of any payment reference you include when paying.
        </p>

        <h2>3. Your content</h2>
        <p>
          You retain ownership of your event types, bookings, intake questions,
          and client responses. You are responsible for the content you collect
          from your clients and for complying with any laws that apply to that
          data.
        </p>

        <h2>4. Sensitive information and client data</h2>
        <p>
          Zest is built to help you collect information from your own clients,
          and that information may include sensitive personal data — for example
          health, counselling, or therapy information. Collecting it through
          Zest is permitted, subject to the following.
        </p>
        <p>
          Where you collect such information, you are the controller of that
          data. You must:
        </p>
        <ul>
          <li>
            have a lawful basis for collecting it under applicable law,
            including the Nigeria Data Protection Act and any rules that apply to
            sensitive data;
          </li>
          <li>
            tell your clients what you collect and why, and obtain their
            consent;
          </li>
          <li>
            configure your intake questions so you only ask for what you need to
            run your sessions;
          </li>
          <li>
            keep the information secure and handle it in line with your
            professional, ethical, and legal obligations, including any duties
            of confidentiality you owe your clients.
          </li>
        </ul>
        <p>
          We store this data on your behalf to power your booking dashboard. We
          do not use it to build advertising profiles, we do not share it with
          third parties for their own purposes, and we do not use it to train
          machine learning models.
        </p>
        <p>
          You may not use Zest to engage in unlawful activity. We may suspend
          accounts where we reasonably believe data is being collected
          unlawfully, or where we are directed to do so by a competent authority.
        </p>

        <h2>5. Limitation of liability</h2>
        <p>
          Zest is provided as-is. To the maximum extent permitted by law, we are
          not liable for any indirect or consequential losses arising from your
          use of the service.
        </p>

        <h2>6. Changes</h2>
        <p>
          We may update these terms from time to time. Continued use of Zest
          after changes are posted means you accept the updated terms.
        </p>

        <p className="contact">
          Questions? Contact{" "}
          <a href="mailto:cuwawah@gmail.com">cuwawah@gmail.com</a>.
        </p>
      </div>

      <style jsx>{`
        .page {
          max-width: 720px;
          margin: 0 auto;
          padding: 3rem 1.5rem;
          background: #fffbf0;
          min-height: 100vh;
          font-family: "DM Sans", sans-serif;
          color: #1a1a0f;
        }
        h1 {
          font-family: "Fraunces", serif;
          font-weight: 600;
          font-size: 2rem;
          margin: 0 0 0.5rem;
        }
        .content p {
          color: #3a3a28;
          line-height: 1.7;
        }
        .content ul {
          color: #3a3a28;
          line-height: 1.7;
          padding-left: 1.25rem;
          margin: 0.75rem 0;
        }
        .content li {
          margin-bottom: 0.5rem;
        }
        .content h2 {
          font-family: "Fraunces", serif;
          font-size: 1.25rem;
          margin: 1.5rem 0 0.5rem;
        }
        .back-link {
          color: #c08b00;
          text-decoration: none;
          font-weight: 500;
        }
        .back-link:hover {
          text-decoration: underline;
        }
        .contact {
          margin-top: 2rem;
        }
        a {
          color: #c08b00;
        }
      `}</style>
    </div>
  );
}