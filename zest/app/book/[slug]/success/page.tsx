"use client";

import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getEventTypeBySlug } from "@/app/actions/eventTypes";
import BrandedHeader from "@/components/booking/BrandedHeader";
import { formatDateTimeInTz } from "@/lib/dates";

export default function SuccessPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const timeParam = searchParams.get("time");
  const phoneParam = searchParams.get("phone");

  const { data: eventType } = useQuery({
    queryKey: ["eventType", "slug", slug],
    queryFn: () => getEventTypeBySlug(slug),
  });

  const selectedTime = timeParam ? parseInt(timeParam) : null;

  const formatDateTime = (timestamp: number) => {
    return formatDateTimeInTz(timestamp, eventType?.timezone);
  };

  const waTarget = (raw: string | undefined | null): string | null => {
    if (!raw) return null;
    let digits = raw.replace(/\D/g, "");
    if (digits.startsWith("0")) digits = "234" + digits.slice(1);
    if (digits.length >= 10 && digits.length <= 14) return digits;
    return null;
  };

  const creatorPhone = waTarget(eventType?.phone);

  const handleWhatsapp = () => {
    if (!creatorPhone || !selectedTime) return;
    const lines = [
      `Hello! I just booked "${eventType?.name}"`,
      `Time: ${formatDateTime(selectedTime)}`,
      phoneParam ? `Phone: ${phoneParam}` : null,
    ].filter(Boolean);
    const text = lines.join("\n");
    window.open(
      `https://wa.me/${creatorPhone}?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener"
    );
  };

  return (
    <div
      className="page"
      style={
        eventType?.accentColor
          ? ({ ["--brand-accent"]: eventType.accentColor } as React.CSSProperties)
          : undefined
      }
    >
      <div className="blob blob-1" />
      <div className="blob blob-2" />

      <div className="container">
        <div className="header">
          <BrandedHeader
            logoUrl={eventType?.logoUrl}
            hideBranding={eventType?.hideBranding}
            referralCode={eventType?.referralCode}
          />
        </div>

        <div className="card">
          <div className="success-icon">✓</div>
          <h1 className="success-title">You&apos;re booked!</h1>
          <p className="success-subtitle">
            {eventType?.name ? `Your ${eventType.name} has been scheduled.` : "Your booking has been scheduled."}
          </p>

          {selectedTime && (
            <div className="time-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>{formatDateTime(selectedTime)}</span>
            </div>
          )}

          <div className="info-text">
            <p>Your booking is confirmed. You can send the details to the host on WhatsApp to confirm.</p>
          </div>

          {creatorPhone && (
            <button className="whatsapp-btn" onClick={handleWhatsapp}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
              </svg>
              Send details on WhatsApp
            </button>
          )}

          <div className="actions">
            <Link href="/" className="btn-primary">
              Back to home
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .page {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          background: #fffbf0;
          font-family: var(--font-dm-sans, 'DM Sans'), sans-serif;
        }

        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.35;
          pointer-events: none;
          z-index: 0;
        }

        .blob-1 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, #d4f57a 0%, #a8e063 100%);
          top: -160px;
          left: -120px;
          animation: drift 8s ease-in-out infinite alternate;
        }

        .blob-2 {
          width: 380px;
          height: 380px;
          background: radial-gradient(circle, #ffe566 0%, #ffb347 100%);
          bottom: -100px;
          right: -80px;
          animation: drift 10s ease-in-out infinite alternate-reverse;
        }

        @keyframes drift {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(20px, 15px) scale(1.04); }
        }

        .container {
          max-width: 560px;
          margin: 0 auto;
          padding: 60px 24px;
          position: relative;
          z-index: 1;
        }

        .header { margin-bottom: 32px; }

        .logo-wrap {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
        }

        .logo-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
        }

        .logo-icon { font-size: 28px; }
        .logo-text {
          font-family: var(--font-fraunces, 'Fraunces'), serif;
          font-size: 26px;
          font-weight: 600;
          color: #1a1a0f;
        }

        .logo-img {
          max-height: 44px;
          max-width: 160px;
          object-fit: contain;
        }

        .powered {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.625rem;
          color: #a0a080;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          border-left: 1px solid #e8e4cc;
          padding-left: 8px;
          text-decoration: none;
          transition: color 0.15s;
        }

        .powered:hover {
          color: #7a7a60;
        }

        .card {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(18px);
          border: 1.5px solid rgba(255, 220, 80, 0.35);
          border-radius: 28px;
          padding: 48px 40px;
          box-shadow: 0 8px 48px rgba(180, 140, 0, 0.1);
          text-align: center;
        }

        .success-icon {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: #d4f57a;
          color: #2d6e0a;
          font-size: 32px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          line-height: 1;
        }

        .success-title {
          font-family: var(--font-fraunces, 'Fraunces'), serif;
          font-size: 36px;
          font-weight: 600;
          color: #1a1a0f;
          margin: 0 0 12px;
        }

        .success-subtitle {
          font-size: 16px;
          color: #7a7a60;
          margin: 0 0 32px;
          line-height: 1.5;
        }

        .time-box {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-size: 16px;
          color: #1a1a0f;
          background: #fdfcf5;
          padding: 14px 24px;
          border-radius: 12px;
          border: 1.5px solid #e8e4cc;
          margin-bottom: 24px;
        }

        .time-box svg { color: #c08b00; flex-shrink: 0; }

        .info-text {
          font-size: 14px;
          color: #a0a080;
          line-height: 1.6;
          margin-bottom: 20px;
        }

        .info-text p { margin: 0; }

        .whatsapp-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: #25d366;
          color: #ffffff;
          border: none;
          border-radius: 14px;
          padding: 14px 28px;
          font-size: 15px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          margin: 0 0 16px;
          transition: all 0.15s;
        }

        .whatsapp-btn:hover {
          filter: brightness(0.95);
          transform: translateY(-1px);
        }

        .actions {
          display: flex;
          justify-content: center;
          gap: 12px;
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--brand-accent, #f5c518);
          color: #1a1a0f;
          text-decoration: none;
          padding: 14px 32px;
          border-radius: 14px;
          font-size: 16px;
          font-weight: 500;
          transition: all 0.15s;
        }

        .btn-primary:hover {
          filter: brightness(0.94);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(245, 197, 24, 0.4);
        }

        @media (max-width: 480px) {
          .container { padding: 40px 16px; }
          .card { padding: 32px 24px; }
          .success-title { font-size: 28px; }
        }

        @media (max-width: 380px) {
          .container { padding: 28px 12px; }
          .card { padding: 24px 16px; }
        }
      `}</style>
    </div>
  );
}
