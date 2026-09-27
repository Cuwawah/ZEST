import Link from "next/link";

export default function NotFound() {
  return (
    <div className="nf-page">
      <div className="nf-card">
        <span className="nf-code">404</span>
        <h1 className="nf-title">Page not found</h1>
        <p className="nf-text">
          This page doesn&apos;t exist, or the business page behind it is no
          longer active.
        </p>
        <div className="nf-actions">
          <Link href="/" className="nf-btn nf-btn-primary">
            Go to homepage
          </Link>
          <Link href="/login" className="nf-btn">
            Sign in
          </Link>
        </div>
      </div>
      <style>{`
        .nf-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fffbf0;
          padding: 24px;
          font-family: var(--font-dm-sans, system-ui, sans-serif);
        }
        .nf-card {
          max-width: 460px;
          width: 100%;
          text-align: center;
          background: #fff;
          border: 1px solid #e8e4d4;
          border-radius: 16px;
          padding: 40px 32px;
        }
        .nf-code {
          display: block;
          font-family: var(--font-fraunces, "Fraunces", serif);
          font-size: 56px;
          font-weight: 600;
          line-height: 1;
          color: #f5c518;
          margin-bottom: 12px;
        }
        .nf-title {
          font-family: var(--font-fraunces, "Fraunces", serif);
          font-size: 28px;
          font-weight: 600;
          color: #1a1a0f;
          margin: 0 0 12px;
        }
        .nf-text {
          color: #7a7a60;
          font-size: 15px;
          line-height: 1.6;
          margin: 0 0 24px;
        }
        .nf-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .nf-btn {
          display: inline-block;
          background: #fff;
          color: #1a1a0f;
          text-decoration: none;
          padding: 12px 24px;
          border: 1px solid #e8e4d4;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 500;
          transition: all 0.15s;
        }
        .nf-btn:hover {
          border-color: #d8d2b8;
          transform: translateY(-1px);
        }
        .nf-btn-primary {
          background: #f5c518;
          border-color: #f5c518;
        }
        .nf-btn-primary:hover {
          background: #e6b800;
          border-color: #e6b800;
        }
      `}</style>
    </div>
  );
}
