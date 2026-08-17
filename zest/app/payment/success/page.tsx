"use client";

import Link from "next/link";

export default function PaymentSuccessPage() {
  return (
    <div className="page">
      <div className="blob blob-1" />
      <div className="blob blob-2" />

      <div className="card">
        <div className="logo-wrap">
          <span className="logo-icon">🍋</span>
          <span className="logo-text">zest</span>
        </div>

        <div className="success-icon">🎉</div>
        <h1 className="heading">Payment received!</h1>
        <p className="subheading">Thanks for upgrading to Zest Pro.</p>

        <div className="info-box">
          <p>
            Your payment was matched to your account. Your Pro features are
            active now — unlimited event types, custom branding and WhatsApp
            notify.
          </p>
        </div>

        <Link href="/dashboard" className="btn">
          Go to dashboard
        </Link>

        <p className="help-text">
          Have questions? Contact{" "}
          <a href="mailto:cuwawah@gmail.com" className="link">
            cuwawah@gmail.com
          </a>
        </p>
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
          text-align: center;
        }

        .logo-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 32px;
        }

        .logo-icon {
          font-size: 28px;
        }

        .logo-text {
          font-family: var(--font-fraunces, 'Fraunces'), serif;
          font-size: 26px;
          font-weight: 600;
          color: #1a1a0f;
          letter-spacing: -0.5px;
        }

        .success-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .heading {
          font-family: var(--font-fraunces, 'Fraunces'), serif;
          font-size: 28px;
          font-weight: 600;
          color: #1a1a0f;
          margin: 0 0 8px;
        }

        .subheading {
          font-size: 15px;
          color: #7a7a60;
          margin: 0 0 24px;
        }

        .info-box {
          background: #fdfcf5;
          border: 1.5px solid #e8e4cc;
          border-radius: 12px;
          padding: 16px;
          font-size: 14px;
          color: #3a3a28;
          line-height: 1.6;
          margin-bottom: 24px;
        }

        .info-box p {
          margin: 0;
        }

        .btn {
          display: inline-block;
          background: #f5c518;
          color: #1a1a0f;
          border: none;
          border-radius: 12px;
          padding: 14px 32px;
          font-size: 15px;
          font-weight: 500;
          font-family: var(--font-dm-sans, 'DM Sans'), sans-serif;
          cursor: pointer;
          transition: background 0.15s, transform 0.12s;
          text-decoration: none;
        }

        .btn:hover {
          background: #e6b800;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(245, 197, 24, 0.38);
        }

        .help-text {
          font-size: 13px;
          color: #a0a080;
          margin-top: 20px;
        }

        .link {
          color: #c08b00;
          font-weight: 500;
          text-decoration: none;
        }

        .link:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
