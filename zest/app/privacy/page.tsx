"use client";

import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="page">
      <Link href="/" className="back-link">
        ← Back to home
      </Link>
      <h1>Privacy Policy</h1>
      <div className="content">
        <p>Last updated: September 2026</p>

        <h2>1. What we collect</h2>
        <p>
          We collect your name, email address, and password when you create an
          account. Your password is never stored in a form we could read or
          recover: it is salted and hashed with bcrypt, and we only ever verify
          a sign-in attempt against that hash. We also store the event types,
          availability, intake questions, and bookings you create.
        </p>

        <h2>2. Client data</h2>
        <p>
          When clients book through your links, we store their name, email, and
          the answers they provide to your intake questions. This data belongs
          to you, and it is only used to power your booking dashboard.
        </p>

        <h2>3. How we use data, and our lawful basis</h2>
        <p>
          Your data is used to operate the service: to authenticate you, to show
          you bookings and responses, to send you messages about your account and
          your bookings, and to confirm payments on your account.
        </p>
        <p>
          Our lawful basis is performance of our contract with you for the
          service itself, and our legitimate interests in operating and securing
          the service for the messages we send to practitioners. Where a client
          of yours gives us sensitive information, the lawful basis for that
          processing is set by you, as the controller of that information, and
          is not ours to determine.
        </p>

        <h2>4. Service providers and where data is stored</h2>
        <p>
          We use a small number of third-party providers, each acting as a
          processor on our instructions:
        </p>
        <ul>
          <li>
            <strong>Neon</strong> — managed Postgres hosting. Your database is
            hosted on infrastructure in the United States.
          </li>
          <li>
            <strong>Netlify</strong> — application hosting and deployment.
          </li>
          <li>
            <strong>Google (Gmail)</strong> — used to read your bank transfer
            confirmations and to send account and booking emails.
          </li>
        </ul>
        <p>
          Your data may therefore be processed outside Nigeria. If you require
          your data to remain in a particular jurisdiction, contact us before
          you rely on the service.
        </p>

        <h2>5. Data retention and deletion</h2>
        <p>
          You can delete your account at any time from Settings, which removes
          your event types, bookings, and responses.
        </p>
        <p>
          Payment records are retained separately after deletion for the
          period required to meet our accounting and statutory record-keeping
          obligations. These records are not linked back to your account and are
          not used for any marketing purpose. Beyond that statutory period they
          are deleted.
        </p>

        <h2>6. Security</h2>
        <p>
          Passwords are hashed and never stored in plain text. Sessions use
          secure, http-only cookies. Data is transmitted over TLS in transit.
          Database access is restricted to the services that need it.
        </p>
        <p>
          No system is perfectly secure. If we become aware of a breach
          affecting your data, we will notify you and the relevant authority as
          required by applicable law.
        </p>

        <h2>7. Your rights</h2>
        <p>
          Under the Nigeria Data Protection Act you have rights of access,
          correction, and deletion of your personal data. You can exercise these
          for most data through Settings, or contact us and we will respond
          within a reasonable period.
        </p>

        <h2>8. Contact</h2>
        <p>
          For privacy questions, contact{" "}
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
        .content strong {
          font-weight: 600;
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
        a {
          color: #c08b00;
        }
      `}</style>
    </div>
  );
}