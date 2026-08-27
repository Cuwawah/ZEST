"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  getEventTypeBySlug,
  recordEventTypeView,
} from "@/app/actions/eventTypes";
import TimeSlotPicker from "@/components/booking/TimeSlotPicker";
import BrandedHeader from "@/components/booking/BrandedHeader";

export default function BookPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  const { data: eventType, isLoading } = useQuery({
    queryKey: ["eventType", "slug", slug],
    queryFn: () => getEventTypeBySlug(slug),
  });

  useEffect(() => {
    void recordEventTypeView(slug);
  }, [slug]);

  const handleContinue = () => {
    if (selectedSlot) {
      router.push(`/book/${slug}/confirm?time=${selectedSlot}`);
    }
  };

  if (isLoading) {
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
            {eventType.description && (
              <p className="event-description">{eventType.description}</p>
            )}
            <div className="event-meta">
              <span className="meta-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {eventType.duration} minutes
              </span>
              {eventType.businessName && (
                <span className="meta-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  {eventType.businessName}
                </span>
              )}
            </div>
          </div>

          <div className="booking-section">
            <h2 className="section-title">Select a time</h2>
            <TimeSlotPicker
              eventTypeId={eventType.id}
              timezone={eventType.timezone}
              onSelectSlot={setSelectedSlot}
              selectedSlot={selectedSlot || undefined}
            />
          </div>

          <div className="footer">
            <button
              className="continue-btn"
              disabled={!selectedSlot}
              onClick={handleContinue}
            >
              Continue
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
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
          max-width: 800px;
          margin: 0 auto;
          padding: 40px 24px;
          position: relative;
          z-index: 1;
        }

        .header {
          margin-bottom: 32px;
        }

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

        .logo-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
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
          margin: 0 0 8px;
        }

        .event-description {
          font-size: 15px;
          color: #7a7a60;
          margin: 0 0 16px;
          max-width: 500px;
          margin-left: auto;
          margin-right: auto;
        }

        .event-meta {
          display: flex;
          justify-content: center;
          gap: 24px;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          color: #3a3a28;
        }

        .meta-item svg {
          color: #c08b00;
        }

        .booking-section {
          margin-bottom: 32px;
        }

        .section-title {
          font-size: 18px;
          font-weight: 500;
          color: #1a1a0f;
          margin: 0 0 20px;
        }

        .footer {
          display: flex;
          justify-content: flex-end;
          border-top: 1.5px solid #f0ead8;
          padding-top: 24px;
        }

        .continue-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--brand-accent, #f5c518);
          color: #1a1a0f;
          border: none;
          border-radius: 12px;
          padding: 14px 28px;
          font-size: 15px;
          font-weight: 500;
          font-family: var(--font-dm-sans, 'DM Sans'), sans-serif;
          cursor: pointer;
          transition: all 0.15s;
        }

        .continue-btn:hover:not(:disabled) {
          filter: brightness(0.94);
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(245, 197, 24, 0.38);
        }

        .continue-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

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
          .event-meta { flex-direction: column; gap: 8px; align-items: center; }
          .event-name { font-size: 28px; }
        }

        @media (max-width: 380px) {
          .container { padding: 16px 12px; }
          .card { padding: 20px 16px; }
          .event-name { font-size: 26px; }
        }
      `}</style>
    </div>
  );
}
