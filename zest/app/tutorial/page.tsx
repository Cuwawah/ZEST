"use client";

import Link from "next/link";

export default function TutorialPage() {
  return (
    <div className="page">
      <Link href="/dashboard" className="back-link">
        ← Back to dashboard
      </Link>
      <h1>How to use Zest</h1>

      <div className="steps">
        <div className="step">
          <h2>1. Create an event type</h2>
          <p>
            Go to <strong>Event Types</strong> and create a new bookable
            service, e.g. “Discovery Call”. Give it a name, duration, and
            description.
          </p>
        </div>

        <div className="step">
          <h2>2. Set your availability</h2>
          <p>
            Pick the days and hours you want to accept bookings. Clients will
            only see slots that fit your schedule.
          </p>
        </div>

        <div className="step">
          <h2>3. Add intake questions</h2>
          <p>
            Add text, multiple-choice, or dropdown questions. Clients answer
            these when they book, and the answers show up on your dashboard.
          </p>
        </div>

        <div className="step">
          <h2>4. Share your booking link</h2>
          <p>
            Every event type gets its own shareable link. Copy it from the{" "}
            <strong>Event Types</strong> page and share it anywhere.
          </p>
        </div>

        <div className="step">
          <h2>5. Review bookings</h2>
          <p>
            Your dashboard lists upcoming bookings. Click one to see the
            client&apos;s intake responses, or cancel it if needed.
          </p>
        </div>

        <div className="step">
          <h2>6. Manage your preferences</h2>
          <p>
            In <strong>Settings</strong> you can update your name, business
            name, timezone, buffer time, minimum booking notice, and password.
          </p>
        </div>
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
          margin: 0 0 1.5rem;
        }
        .back-link {
          color: #c08b00;
          text-decoration: none;
          font-weight: 500;
        }
        .back-link:hover {
          text-decoration: underline;
        }
        .step {
          background: #ffffff;
          border: 1.5px solid #e8e4cc;
          border-radius: 16px;
          padding: 1.25rem 1.5rem;
          margin-bottom: 1rem;
        }
        .step h2 {
          font-family: "Fraunces", serif;
          font-size: 1.125rem;
          margin: 0 0 0.5rem;
        }
        .step p {
          color: #3a3a28;
          line-height: 1.7;
          margin: 0;
        }
      `}</style>
    </div>
  );
}