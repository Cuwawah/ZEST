"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getEventTypeBySlug } from "@/app/actions/eventTypes";
import { createBooking } from "@/app/actions/bookings";
import IntakeForm from "@/components/booking/IntakeForm";
import BrandedHeader from "@/components/booking/BrandedHeader";
import { formatDateTimeInTz } from "@/lib/dates";

export default function ConfirmPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = params.slug as string;
  const timeParam = searchParams.get("time");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: eventType } = useQuery({
    queryKey: ["eventType", "slug", slug],
    queryFn: () => getEventTypeBySlug(slug),
  });

  const selectedTime = timeParam ? parseInt(timeParam) : null;

  useEffect(() => {
    if (!timeParam) {
      router.push(`/book/${slug}`);
    }
  }, [timeParam, slug, router]);

  const formatDateTime = (timestamp: number) => {
    return formatDateTimeInTz(timestamp, eventType?.timezone);
  };

  const handleSubmit = async (data: {
    name: string;
    email: string;
    phone?: string;
    responses: { questionId: string; answer: string }[];
  }) => {
    if (!eventType || !selectedTime) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const endTime = selectedTime + eventType.duration * 60 * 1000;

      await createBooking({
        eventTypeId: eventType.id,
        clientName: data.name,
        clientEmail: data.email,
        phone: data.phone,
        startTime: selectedTime,
        endTime: endTime,
        responses: data.responses,
      });

      router.push(
        `/book/${slug}/success?time=${selectedTime}${data.phone ? `&phone=${encodeURIComponent(data.phone)}` : ""}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!eventType || !selectedTime) {
    return (
      <div className="page">
        <div className="container">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  if (!eventType) {
    return (
      <div className="page">
        <div className="container">
          <div className="not-found">
            <h1>Booking not found</h1>
            <p>The event type you&apos;re looking for doesn&apos;t exist or is no longer active.</p>
            <Link href="/" className="home-link">Go home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="page"
      style={
        eventType.accentColor
          ? ({ ["--brand-accent"]: eventType.accentColor } as React.CSSProperties)
          : undefined
      }
    >
      <div className="blob blob-1" />
      <div className="blob blob-2" />

      <div className="container">
        <div className="header">
          <BrandedHeader
            logoUrl={eventType.logoUrl}
            hideBranding={eventType.hideBranding}
          />
        </div>

        <div className="card">
          <div className="event-info">
            <h1 className="event-name">{eventType.name}</h1>
            <div className="selected-time">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>{formatDateTime(selectedTime)}</span>
            </div>
          </div>

          {error && (
            <div className="error-banner">
              {error}
            </div>
          )}

          <IntakeForm
            eventTypeId={eventType.id}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />

          <div className="footer">
            <Link href={`/book/${slug}?time=${selectedTime}`} className="back-link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Back to time selection
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`

        :global(body) {
          margin: 0;
          padding: 0;
          background: #fffbf0;
          font-family: var(--font-dm-sans, 'DM Sans'), sans-serif;
        }

        .page {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
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
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(20px, 15px) scale(1.04); }
        }

        .container {
          max-width: 700px;
          margin: 0 auto;
          padding: 40px 24px;
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

        .logo-img {
          max-height: 44px;
          max-width: 160px;
          object-fit: contain;
        }

        .powered {
          font-size: 0.625rem;
          color: #a0a080;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          border-left: 1px solid #e8e4cc;
          padding-left: 8px;
        }

        .logo-icon { font-size: 28px; }

        .logo-text {
          font-family: var(--font-fraunces, 'Fraunces'), serif;
          font-size: 26px;
          font-weight: 600;
          color: #1a1a0f;
        }

        .card {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(18px);
          border: 1.5px solid rgba(255, 220, 80, 0.35);
          border-radius: 28px;
          padding: 32px;
          box-shadow: 0 8px 48px rgba(180, 140, 0, 0.1);
        }

        .event-info {
          text-align: center;
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 1.5px solid #f0ead8;
        }

        .event-name {
          font-family: var(--font-fraunces, 'Fraunces'), serif;
          font-size: 32px;
          font-weight: 600;
          color: #1a1a0f;
          margin: 0 0 12px;
        }

        .selected-time {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 16px;
          color: #1a1a0f;
          background: #fdfcf5;
          padding: 12px 20px;
          border-radius: 12px;
          border: 1.5px solid #e8e4cc;
          max-width: 400px;
          margin: 0 auto;
        }

        .selected-time svg { color: #c08b00; }

        .error-banner {
          background: #fff3f0;
          border: 1.5px solid #ffc5bb;
          border-radius: 12px;
          padding: 14px 18px;
          color: #c0391b;
          font-size: 14px;
          margin-bottom: 24px;
        }

        .footer {
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1.5px solid #f0ead8;
          text-align: center;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #7a7a60;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: color 0.15s;
        }

        .back-link:hover { color: #1a1a0f; }

        .loading {
          text-align: center;
          padding: 60px;
          color: #7a7a60;
          font-size: 15px;
        }

        .not-found {
          text-align: center;
          padding: 60px;
        }

        .not-found h1 {
          font-family: var(--font-fraunces, 'Fraunces'), serif;
          font-size: 28px;
          color: #1a1a0f;
          margin: 0 0 12px;
        }

        .not-found p {
          color: #7a7a60;
          margin: 0 0 24px;
        }

        .home-link {
          display: inline-block;
          background: #f5c518;
          color: #1a1a0f;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 500;
          transition: all 0.15s;
        }

        .home-link:hover {
          background: #e6b800;
          transform: translateY(-1px);
        }

        @media (max-width: 480px) {
          .container { padding: 20px 16px; }
          .card { padding: 24px; }
          .event-name { font-size: 28px; }
          .selected-time { font-size: 14px; padding: 10px 16px; }
        }

        @media (max-width: 380px) {
          .container { padding: 16px 12px; }
          .card { padding: 20px 16px; }
        }
      `}</style>
    </div>
  );
}
