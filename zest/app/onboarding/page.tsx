"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCurrentUser, useUpdateUser } from "@/hooks/useUser";
import { useEventTypes } from "@/hooks/useEventTypes";

const TIMEZONES = [
  "Africa/Lagos",
  "Africa/Abidjan",
  "Africa/Accra",
  "Africa/Nairobi",
  "Africa/Johannesburg",
  "Africa/Cairo",
  "Europe/London",
  "America/New_York",
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoading: userLoading } = useCurrentUser();
  const { eventTypes } = useEventTypes();
  const updateUser = useUpdateUser();
  const [step, setStep] = useState<1 | 2>(1);
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [timezone, setTimezone] = useState("Africa/Lagos");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const bookingLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/book/`
      : "";

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await updateUser({
        businessName: businessName.trim() || undefined,
        phone: phone.trim() || undefined,
        timezone,
      });
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (userLoading) {
    return (
      <div className="ob-page">
        <div className="ob-loading">Loading...</div>
        <style jsx>{`
          .ob-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #fffbf0; }
          .ob-loading { color: #7a7a60; font-size: 15px; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="ob-page">
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      <div className="ob-card">
        <div className="ob-logo">
          <span className="ob-logo-icon">🍋</span>
          <span className="ob-logo-text">zest</span>
        </div>

        {step === 1 ? (
          <>
            <h1 className="ob-title">Set up your account</h1>
            <p className="ob-sub">
              Takes about 30 seconds. You can always change these later.
            </p>

            <div className="ob-form">
              <div className="ob-field">
                <label className="ob-label">Business name</label>
                <input
                  type="text"
                  className="ob-input"
                  placeholder="e.g. Adaeze Photography"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />
                <span className="ob-hint">
                  Your display name. Defaults to your account name if empty.
                </span>
              </div>

              <div className="ob-field">
                <label className="ob-label">
                  WhatsApp number
                  <span className="ob-optional">optional</span>
                </label>
                <input
                  type="tel"
                  className="ob-input"
                  placeholder="08012345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <span className="ob-hint">
                  Clients can confirm bookings with one tap on WhatsApp.
                </span>
              </div>

              <div className="ob-field">
                <label className="ob-label">Timezone</label>
                <select
                  className="ob-input ob-select"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz.replace("Africa/", "").replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>

              {error && <p className="ob-error">{error}</p>}

              <button
                className="ob-btn"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? <span className="ob-spinner" /> : "Continue"}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="ob-check">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
            </div>
            <h1 className="ob-title">You&apos;re all set</h1>
            <p className="ob-sub">
              Your account is ready. Create your first service to start
              accepting bookings.
            </p>

            <div className="ob-next-steps">
              <Link href="/dashboard/event-types/new" className="ob-primary-btn">
                Create your first service
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
              </Link>

              <div className="ob-link-box">
                <span className="ob-link-label">Your booking link</span>
                <code className="ob-link-code">
                  {user?.slug ? `${bookingLink}${user.slug}` : "Create a service to get your link"}
                </code>
              </div>

              <Link href="/dashboard" className="ob-secondary-btn">
                Go to dashboard
              </Link>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .ob-page {
          min-height: 100vh;
          background: #fffbf0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          font-family: var(--font-dm-sans, 'DM Sans'), sans-serif;
          position: relative;
          overflow: hidden;
        }

        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          opacity: 0.3;
          pointer-events: none;
        }

        .blob-1 {
          width: 480px;
          height: 480px;
          background: radial-gradient(circle, #ffe566 0%, #ffb347 100%);
          top: -140px;
          left: -100px;
          animation: drift 9s ease-in-out infinite alternate;
        }

        .blob-2 {
          width: 360px;
          height: 360px;
          background: radial-gradient(circle, #c8f565 0%, #84e06e 100%);
          bottom: -80px;
          right: -60px;
          animation: drift 11s ease-in-out infinite alternate-reverse;
        }

        .blob-3 {
          width: 260px;
          height: 260px;
          background: radial-gradient(circle, #ffdf80 0%, #ffa940 100%);
          top: 50%;
          left: 55%;
          animation: drift 7s ease-in-out infinite alternate;
        }

        @keyframes drift {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(16px, 20px) scale(1.05); }
        }

        .ob-card {
          background: rgba(255, 255, 255, 0.84);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1.5px solid rgba(255, 220, 80, 0.35);
          border-radius: 28px;
          padding: 48px 44px 40px;
          width: 100%;
          max-width: 440px;
          box-shadow: 0 8px 48px rgba(180, 140, 0, 0.1), 0 2px 8px rgba(0,0,0,0.04);
          position: relative;
          z-index: 1;
          animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .ob-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 28px;
        }

        .ob-logo-icon { font-size: 28px; line-height: 1; }
        .ob-logo-text {
          font-family: var(--font-fraunces, 'Fraunces'), serif;
          font-size: 26px;
          font-weight: 600;
          color: #1a1a0f;
          letter-spacing: -0.5px;
        }

        .ob-title {
          font-family: var(--font-fraunces, 'Fraunces'), serif;
          font-size: 28px;
          font-weight: 600;
          color: #1a1a0f;
          margin: 0 0 6px;
          letter-spacing: -0.5px;
          line-height: 1.2;
        }

        .ob-sub {
          font-size: 15px;
          color: #7a7a60;
          margin: 0 0 28px;
          line-height: 1.5;
        }

        .ob-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .ob-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .ob-label {
          font-size: 13px;
          font-weight: 500;
          color: #3a3a28;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .ob-optional {
          font-size: 11px;
          font-weight: 500;
          color: #a0a080;
          background: #f5f3e8;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .ob-hint {
          font-size: 12px;
          color: #a0a080;
        }

        .ob-input {
          background: #fdfcf5;
          border: 1.5px solid #e8e4cc;
          border-radius: 12px;
          padding: 13px 16px;
          font-size: 15px;
          font-family: var(--font-dm-sans, 'DM Sans'), sans-serif;
          color: #1a1a0f;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .ob-input:focus {
          border-color: #f5c518;
          box-shadow: 0 0 0 3px rgba(245, 197, 24, 0.18);
        }

        .ob-input::placeholder { color: #c0bb9a; }

        .ob-select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%237a7a60' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          padding-right: 36px;
        }

        .ob-error {
          background: #fff3f0;
          border: 1px solid #ffc5bb;
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 13.5px;
          color: #c0391b;
          margin: 0;
        }

        .ob-btn {
          background: #f5c518;
          color: #1a1a0f;
          border: none;
          border-radius: 12px;
          padding: 14px;
          font-size: 15px;
          font-weight: 500;
          font-family: var(--font-dm-sans, 'DM Sans'), sans-serif;
          cursor: pointer;
          transition: background 0.15s, transform 0.12s, box-shadow 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 48px;
          margin-top: 4px;
        }

        .ob-btn:hover:not(:disabled) {
          background: #e6b800;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(245, 197, 24, 0.38);
        }

        .ob-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .ob-spinner {
          width: 18px;
          height: 18px;
          border: 2.5px solid rgba(26, 26, 15, 0.2);
          border-top-color: #1a1a0f;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .ob-check {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: #dcfce7;
          color: #16a34a;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }

        .ob-next-steps {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .ob-primary-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: #f5c518;
          color: #1a1a0f;
          text-decoration: none;
          border-radius: 12px;
          padding: 15px;
          font-size: 15px;
          font-weight: 500;
          font-family: var(--font-dm-sans, 'DM Sans'), sans-serif;
          transition: all 0.15s;
        }

        .ob-primary-btn:hover {
          background: #e6b800;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(245, 197, 24, 0.38);
        }

        .ob-link-box {
          background: #fdfcf5;
          border: 1.5px solid #e8e4cc;
          border-radius: 12px;
          padding: 14px 16px;
          text-align: center;
        }

        .ob-link-label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          color: #a0a080;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 6px;
        }

        .ob-link-code {
          font-size: 13px;
          color: #3a3a28;
          word-break: break-all;
          font-family: "DM Sans", sans-serif;
        }

        .ob-secondary-btn {
          display: block;
          text-align: center;
          color: #7a7a60;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          padding: 8px;
          transition: color 0.15s;
        }

        .ob-secondary-btn:hover { color: #1a1a0f; }

        @media (max-width: 480px) {
          .ob-card { padding: 36px 28px 32px; }
        }
      `}</style>
    </div>
  );
}
