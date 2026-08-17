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
        <p>Last updated: August 2026</p>

        <h2>1. What we collect</h2>
        <p>
          We collect your name, email address, and password (stored securely
          with encryption) when you create an account. We also store the event
          types, availability, intake questions, and bookings you create.
        </p>

        <h2>2. Client data</h2>
        <p>
          When clients book through your links, we store their name, email, and
          the answers they provide to your intake questions. This data belongs
          to you, and it is only used to power your booking dashboard.
        </p>

        <h2>3. How we use data</h2>
        <p>
          Your data is used to operate the service: to authenticate you, to show
          you bookings and responses, and to confirm payments on your account.
        </p>

        <h2>4. Data retention and deletion</h2>
        <p>
          You can delete your account at any time from Settings, which removes
          your event types, bookings, and responses. Payment history is
          retained for record-keeping but is no longer linked to your account.
        </p>

        <h2>5. Security</h2>
        <p>
          Passwords are hashed and never stored in plain text. Sessions use
          secure, http-only cookies. Database access is restricted to the
          services that need it.
        </p>

        <h2>6. Contact</h2>
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