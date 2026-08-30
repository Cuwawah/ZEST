"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signup } from "@/app/actions/auth";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signup({ name, email, password });
      if (res.error) {
        setError(res.error);
        setLoading(false);
        return;
      }

      router.push("/onboarding");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      <div className="card">
        <div className="logo-wrap">
          <span className="logo-icon">🍋</span>
          <span className="logo-text">zest</span>
        </div>

        <>
          <h1 className="heading">Create your account</h1>

          <form onSubmit={handleSignUp} className="form">
            <div className="field">
              <label className="label">Full name</label>
              <input
                type="text"
                className="input"
                placeholder="Jane Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>

            {error && <p className="error">{error}</p>}

            <button type="submit" className="btn" disabled={loading}>
              {loading ? <span className="spinner" /> : "Create my free account"}
            </button>

            <p className="trial-note">
              Free plan forever · includes a 7-day Pro trial · NGN 4,000/month after · no card needed
            </p>
          </form>

          <p className="terms">
            By signing up, you agree to our{" "}
            <Link href="/terms" className="link">Terms</Link>{" "}
            and{" "}
            <Link href="/privacy" className="link">Privacy Policy</Link>.
          </p>

          <p className="footer-text">
            Already have an account?{" "}
            <Link href="/login" className="link">Sign in</Link>
          </p>
        </>
      </div>

      <style jsx>{`

        :global(body) {
          margin: 0;
          padding: 0;
        }

        .page {
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

        .card {
          background: rgba(255, 255, 255, 0.84);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1.5px solid rgba(255, 220, 80, 0.35);
          border-radius: 28px;
          padding: 48px 44px 40px;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 8px 48px rgba(180, 140, 0, 0.1), 0 2px 8px rgba(0,0,0,0.04);
          position: relative;
          z-index: 1;
          animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .logo-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 32px;
        }

        .logo-icon {
          font-size: 28px;
          line-height: 1;
        }

        .logo-text {
          font-family: var(--font-fraunces, 'Fraunces'), serif;
          font-size: 26px;
          font-weight: 600;
          color: #1a1a0f;
          letter-spacing: -0.5px;
        }

        .verify-icon {
          font-size: 40px;
          margin-bottom: 12px;
        }

        .heading {
          font-family: var(--font-fraunces, 'Fraunces'), serif;
          font-size: 30px;
          font-weight: 600;
          color: #1a1a0f;
          margin: 0 0 6px;
          letter-spacing: -0.5px;
          line-height: 1.2;
        }

        .subheading {
          font-size: 15px;
          color: #7a7a60;
          margin: 0 0 32px;
        }

        .subheading strong {
          color: #3a3a28;
        }

        .form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .label {
          font-size: 13px;
          font-weight: 500;
          color: #3a3a28;
          letter-spacing: 0.02em;
        }

        .input {
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

        .input-code {
          letter-spacing: 0.25em;
          font-size: 20px;
          text-align: center;
        }

        .input::placeholder {
          color: #c0bb9a;
        }

        .input:focus {
          border-color: #f5c518;
          box-shadow: 0 0 0 3px rgba(245, 197, 24, 0.18);
        }

        .error {
          background: #fff3f0;
          border: 1px solid #ffc5bb;
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 13.5px;
          color: #c0391b;
          margin: 0;
        }

        .btn {
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

        .btn:hover:not(:disabled) {
          background: #e6b800;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(245, 197, 24, 0.38);
        }

        .btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinner {
          width: 18px;
          height: 18px;
          border: 2.5px solid rgba(26, 26, 15, 0.2);
          border-top-color: #1a1a0f;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .terms {
          text-align: center;
          font-size: 12.5px;
          color: #a0a080;
          margin: 16px 0 0;
          line-height: 1.5;
        }

        .trial-note {
          text-align: center;
          font-size: 12.5px;
          color: #a0a080;
          margin: 8px 0 0;
        }

        .footer-text {
          text-align: center;
          font-size: 14px;
          color: #7a7a60;
          margin: 20px 0 0;
        }

        .link {
          color: #c08b00;
          font-weight: 500;
          text-decoration: none;
        }

        .link:hover {
          text-decoration: underline;
        }

        .btn-reset {
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          font-size: 14px;
          font-family: var(--font-dm-sans, 'DM Sans'), sans-serif;
        }

        @media (max-width: 480px) {
          .card {
            padding: 36px 28px 32px;
          }
        }
      `}</style>
    </div>
  );
}
