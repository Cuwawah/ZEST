"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword } from "@/app/actions/auth";

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords don't match");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await resetPassword({ token, password });
      if (res.error) {
        setError(res.error);
      } else {
        router.push("/login?reset=1");
        router.refresh();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <>
        <h1 className="heading">Invalid link</h1>
        <p className="subheading">
          This reset link is missing. Request a new one below.
        </p>
        <Link href="/forgot-password" className="btn">
          Request a reset link
        </Link>
      </>
    );
  }

  return (
    <>
      <h1 className="heading">Choose a new password</h1>
      <p className="subheading">Make it at least 8 characters.</p>

      <form onSubmit={handleSubmit} className="form">
        <div className="field">
          <label className="label">New password</label>
          <input
            type="password"
            className="input"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label className="label">Confirm password</label>
          <input
            type="password"
            className="input"
            placeholder="••••••••"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </div>

        {error && <p className="error">{error}</p>}

        <button type="submit" className="btn" disabled={loading}>
          {loading ? <span className="spinner" /> : "Reset password"}
        </button>
      </form>

      <p className="footer-text">
        <Link href="/login" className="link">
          Back to sign in
        </Link>
      </p>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="page">
      <div className="blob blob-1" />
      <div className="blob blob-2" />

      <div className="card">
        <div className="logo-wrap">
          <span className="logo-icon">🍋</span>
          <span className="logo-text">zest</span>
        </div>

        <Suspense fallback={null}>
          <ResetForm />
        </Suspense>
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
          font-family: var(--font-dm-sans), sans-serif;
          position: relative;
          overflow: hidden;
        }

        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.35;
          pointer-events: none;
        }

        .blob-1 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, #ffe566 0%, #ffb347 100%);
          top: -160px;
          right: -120px;
          animation: drift 8s ease-in-out infinite alternate;
        }

        .blob-2 {
          width: 380px;
          height: 380px;
          background: radial-gradient(circle, #d4f57a 0%, #a8e063 100%);
          bottom: -100px;
          left: -80px;
          animation: drift 10s ease-in-out infinite alternate-reverse;
        }

        @keyframes drift {
          from {
            transform: translate(0, 0) scale(1);
          }
          to {
            transform: translate(20px, 15px) scale(1.04);
          }
        }

        .card {
          background: rgba(255, 255, 255, 0.82);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border: 1.5px solid rgba(255, 220, 80, 0.35);
          border-radius: 28px;
          padding: 48px 44px 40px;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 8px 48px rgba(180, 140, 0, 0.1),
            0 2px 8px rgba(0, 0, 0, 0.04);
          position: relative;
          z-index: 1;
          animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
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
          font-family: var(--font-fraunces), serif;
          font-size: 26px;
          font-weight: 600;
          color: #1a1a0f;
          letter-spacing: -0.5px;
        }

        .heading {
          font-family: var(--font-fraunces), serif;
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
          line-height: 1.5;
        }

        .form {
          display: flex;
          flex-direction: column;
          gap: 20px;
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
          font-family: var(--font-dm-sans), sans-serif;
          color: #1a1a0f;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
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
          font-family: var(--font-dm-sans), sans-serif;
          cursor: pointer;
          transition: background 0.15s, transform 0.12s, box-shadow 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 48px;
          margin-top: 4px;
          text-decoration: none;
          text-align: center;
        }

        .btn:hover:not(:disabled) {
          background: #e6b800;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(245, 197, 24, 0.38);
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
          to {
            transform: rotate(360deg);
          }
        }

        .footer-text {
          text-align: center;
          font-size: 14px;
          color: #7a7a60;
          margin: 24px 0 0;
        }

        .link {
          color: #c08b00;
          font-weight: 500;
          text-decoration: none;
        }

        .link:hover {
          text-decoration: underline;
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