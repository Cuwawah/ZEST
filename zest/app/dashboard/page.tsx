"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useUpcomingBookings, useBooking, useCancelBooking } from "@/hooks/useBookings";
import { useEventTypes } from "@/hooks/useEventTypes";
import { getCurrentUserPlan } from "@/app/actions/admin";
import { effectiveTier } from "@/lib/plan";

export default function DashboardPage() {
  const { bookings, isLoading: bookingsLoading } = useUpcomingBookings();
  const { eventTypes } = useEventTypes();
  const cancelBooking = useCancelBooking();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data: planInfo } = useQuery({
    queryKey: ["currentUserPlan"],
    queryFn: () => getCurrentUserPlan(),
  });

  const tier = planInfo
    ? effectiveTier(planInfo.plan, planInfo.trialEndsAt)
    : "free";
  const isPro = tier === "pro";
  const creatorPhone = planInfo?.phone || null;

  const { booking: expandedBooking } = useBooking(expandedId ?? undefined);

  const waTarget = (raw: string | undefined | null): string | null => {
    if (!raw) return null;
    let digits = raw.replace(/\D/g, "");
    if (digits.startsWith("0")) digits = "234" + digits.slice(1);
    if (digits.length >= 10 && digits.length <= 14) return digits;
    return null;
  };

  const notifyWhatsapp = (bookingId: string) => {
    const booking = bookings?.find((b) => b.id === bookingId);
    if (!booking || !creatorPhone) return;
    const clientPhone = waTarget(booking.phone);
    const target = clientPhone ?? waTarget(creatorPhone);
    if (!target) return;
    const eventName =
      eventTypes?.find((et) => et.id === booking.eventTypeId)?.name || "booking";
    const when = `${new Date(booking.startTime).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })} at ${new Date(booking.startTime).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
    const text = clientPhone
      ? `Hello ${booking.clientName}! This is a reminder for your ${eventName} on ${when}.`
      : `Reminder: ${booking.clientName} has a ${eventName} booked on ${when}.`;
    window.open(
      `https://wa.me/${target}?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener"
    );
  };

  const handleCopyLink = () => {
    if (!eventTypes || eventTypes.length === 0) return;
    const link = `${window.location.origin}/book/${eventTypes[0].slug}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsappShare = () => {
    if (!eventTypes || eventTypes.length === 0) return;
    const link = `${window.location.origin}/book/${eventTypes[0].slug}`;
    const text = `Book a slot with me: ${link}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener"
    );
  };

  const handleCancel = async () => {
    if (!cancelId) return;
    setCancelling(true);
    try {
      await cancelBooking(cancelId);
      setCancelId(null);
      if (expandedId === cancelId) setExpandedId(null);
    } catch {
      // silent
    } finally {
      setCancelling(false);
    }
  };

  if (bookingsLoading) {
    return <div className="page">Loading...</div>;
  }

  const groupKey = (ts: number) => {
    const d = new Date(ts);
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  };
  const now = new Date();
  const todayKey = groupKey(now.getTime());
  const tomorrowKey = groupKey(now.getTime() + 86400000);

  type BookingItem = NonNullable<typeof bookings>[number];
  const grouped: { label: string; items: BookingItem[] }[] = [
    { label: "Today", items: [] },
    { label: "Tomorrow", items: [] },
    { label: "Later", items: [] },
  ];
  (bookings || []).forEach((b) => {
    const key = groupKey(b.startTime.getTime());
    if (key === todayKey) grouped[0].items.push(b);
    else if (key === tomorrowKey) grouped[1].items.push(b);
    else grouped[2].items.push(b);
  });
  const visibleGroups = grouped.filter((g) => g.items.length > 0);

  const weekCount = (bookings || []).filter(
    (b) => b.startTime.getTime() <= now.getTime() + 7 * 86400000
  ).length;
  const totalViews = (eventTypes || []).reduce(
    (sum, et) => sum + (et.views || 0),
    0
  );

  return (
    <div className="page">
      <div className="header">
        <div>
          <h1 className="heading">Dashboard</h1>
          <p className="subheading">Your bookings at a glance</p>
        </div>
        <div className="stats">
          <div className="stat">
            <span className="stat-number">{bookings?.length || 0}</span>
            <span className="stat-label">Upcoming</span>
          </div>
          <div className="stat">
            <span className="stat-number">{weekCount}</span>
            <span className="stat-label">Next 7 days</span>
          </div>
          <div className="stat" title="Counted once per visitor, per day">
            <span className="stat-number">{totalViews}</span>
            <span className="stat-label">Link views</span>
            <span className="stat-hint">per visitor, per day</span>
          </div>
          <div className="stat">
            <span className="stat-number">{eventTypes?.length || 0}</span>
            <span className="stat-label">Event types</span>
          </div>
        </div>
      </div>

      {!bookings || bookings.length === 0 ? (
        <div className="empty">
          <span className="empty-icon">📭</span>
          <h2 className="empty-heading">No bookings yet</h2>
          <p className="empty-text">
            Share your booking link with clients to get started.
          </p>
          {eventTypes && eventTypes.length > 0 ? (
            <div className="empty-actions">
              <button className="btn-secondary" onClick={handleCopyLink}>
                {copied ? "Copied!" : "Copy booking link"}
              </button>
              <button className="btn-whatsapp" onClick={handleWhatsappShare}>
                Share on WhatsApp
              </button>
            </div>
          ) : (
            <div className="empty-guide">
              <div className="guide-steps">
                <div className="guide-step">
                  <span className="guide-num">1</span>
                  <span className="guide-text">
                    Create an event type (a couple of minutes)
                  </span>
                </div>
                <div className="guide-step">
                  <span className="guide-num">2</span>
                  <span className="guide-text">
                    Share your booking link on WhatsApp
                  </span>
                </div>
                <div className="guide-step">
                  <span className="guide-num">3</span>
                  <span className="guide-text">
                    Clients pick a time and answer your questions
                  </span>
                </div>
              </div>
              <Link
                href="/dashboard/event-types/new"
                className="btn-primary empty-create"
              >
                Create your first event type
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="bookings">
          {visibleGroups.map((group) => (
            <div key={group.label} className="booking-group">
              <p className="group-label">{group.label}</p>
              {group.items.map((booking) => {
                const eventType = eventTypes?.find(et => et.id === booking.eventTypeId);
                const isExpanded = expandedId === booking.id;

                return (
                  <div key={booking.id} className="booking-card">
                    <div
                      className="booking-main"
                      onClick={() => setExpandedId(isExpanded ? null : booking.id)}
                    >
                      <div className="card-left">
                        <div className="avatar">
                          {booking.clientName.charAt(0)}
                        </div>
                        <div className="card-info">
                          <p className="client-name">{booking.clientName}</p>
                          <p className="client-email">{booking.clientEmail}</p>
                          <p className="event-type">
                            {eventType?.name || "Booking"}
                          </p>
                        </div>
                      </div>
                      <div className="card-right">
                        <p className="date">
                          {new Date(booking.startTime).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                        <p className="time">
                          {new Date(booking.startTime).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        <button
                          className="expand-icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedId(isExpanded ? null : booking.id);
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="booking-detail">
                        {expandedBooking?.responses && expandedBooking.responses.length > 0 ? (
                          <div className="responses">
                            <p className="responses-heading">Intake responses</p>
                            {expandedBooking.responses.map((r) => (
                              <div key={r.id} className="response-row">
                                <span className="response-label">{r.question.label}</span>
                                <span className="response-answer">{r.answer}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="no-responses">No intake responses for this booking.</p>
                        )}

                        <div className="detail-actions">
                          <div className="detail-actions-row">
                            {booking.phone && isPro && creatorPhone ? (
                              <button
                                className="btn-whatsapp-small"
                                onClick={() => notifyWhatsapp(booking.id)}
                              >
                                Notify on WhatsApp
                              </button>
                            ) : booking.phone && !isPro ? (
                              <a
                                href="/dashboard/billing"
                                className="btn-lock"
                              >
                                🔒 Notify on WhatsApp
                              </a>
                            ) : null}
                            <button
                              className="btn-cancel"
                              onClick={() => setCancelId(booking.id)}
                            >
                              Cancel booking
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {cancelId && (
        <div className="modal-overlay" onClick={() => setCancelId(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-heading">Cancel this booking?</h2>
            <p className="modal-text">
              This will cancel the booking for <strong>{bookings?.find(b => b.id === cancelId)?.clientName}</strong>. You&apos;ll get a confirmation email — the client won&apos;t be notified automatically.
            </p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setCancelId(null)}>Keep booking</button>
              <button className="btn-danger" onClick={handleCancel} disabled={cancelling}>
                {cancelling ? <span className="spinner spinner-white" /> : "Yes, cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .booking-card {
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: 0.75rem;
          overflow: hidden;
          margin-bottom: 0.75rem;
        }

        .booking-main {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 1rem 1.25rem;
          cursor: pointer;
          transition: background 0.15s;
        }

        .booking-main:hover {
          background: #fdfcf5;
        }

        .card-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          min-width: 0;
          flex: 1;
        }

        .avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #f5c518;
          color: #1a1a0f;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
          flex-shrink: 0;
        }

        .card-info {
          min-width: 0;
        }

        .client-name {
          font-size: 0.9375rem;
          font-weight: 600;
          margin: 0;
          color: var(--foreground);
        }

        .client-email {
          font-size: 0.75rem;
          color: var(--muted);
          margin: 2px 0 0;
        }

        .event-type {
          font-size: 0.75rem;
          color: var(--muted);
          margin: 2px 0 0;
        }

        .card-right {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-shrink: 0;
        }

        .date {
          font-size: 0.8125rem;
          font-weight: 500;
          color: var(--foreground);
          margin: 0;
          text-align: right;
        }

        .time {
          font-size: 0.8125rem;
          color: var(--muted);
          margin: 0;
          text-align: right;
        }

        .expand-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 0.375rem;
          border: none;
          background: none;
          color: var(--muted);
          cursor: pointer;
          transition: background 0.15s;
        }

        .expand-icon:hover {
          background: #f1efe2;
          color: var(--foreground);
        }

        .booking-detail {
          border-top: 1px solid var(--border);
          padding: 1.25rem;
          background: #fdfcf5;
        }

        .responses-heading {
          font-size: 0.8125rem;
          font-weight: 700;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin: 0 0 1rem;
        }

        .response-row {
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding: 0.625rem 0;
          border-bottom: 1px solid var(--border);
        }

        .response-row:last-child {
          border-bottom: none;
        }

        .response-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--muted);
        }

        .response-answer {
          font-size: 0.875rem;
          color: var(--foreground);
        }

        .no-responses {
          font-size: 0.8125rem;
          color: var(--muted);
          margin: 0 0 1rem;
        }

        .detail-actions {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border);
        }

        .detail-actions-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-whatsapp-small {
          padding: 0.375rem 0.75rem;
          font-size: 0.8125rem;
          font-weight: 600;
          color: #fff;
          background: #25d366;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: filter 0.15s;
        }

        .btn-whatsapp-small:hover {
          filter: brightness(0.94);
        }

        .btn-lock {
          padding: 0.375rem 0.75rem;
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--accent);
          background: #fdfcf5;
          border: 1px solid var(--border);
          border-radius: 0.5rem;
          text-decoration: none;
        }

        .btn-lock:hover {
          border-color: var(--primary);
        }

        .empty-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.625rem;
          margin-top: 0.25rem;
        }

        .empty {
          text-align: center;
          padding: 3rem 1.5rem;
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: 0.75rem;
        }

        .empty-icon {
          font-size: 2.5rem;
          display: block;
          margin-bottom: 0.75rem;
        }

        .empty-heading {
          font-size: 1.25rem;
          font-weight: 700;
          margin: 0 0 0.375rem;
          color: var(--foreground);
        }

        .empty-text {
          font-size: 0.875rem;
          color: var(--muted);
          margin: 0 0 1.25rem;
        }

        .btn-whatsapp {
          padding: 0.5rem 1rem;
          font-size: 0.8125rem;
          font-weight: 600;
          color: #fff;
          background: #25d366;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: filter 0.15s;
        }

        .btn-whatsapp:hover {
          filter: brightness(0.94);
        }

        .empty-create {
          text-decoration: none;
          margin-top: 0.25rem;
        }

        .btn-cancel {
          padding: 0.375rem 0.75rem;
          font-size: 0.8125rem;
          font-weight: 500;
          color: var(--danger);
          background: none;
          border: 1px solid transparent;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
        }

        .btn-cancel:hover {
          background: #fef2f2;
          border-color: #fecaca;
        }

        .stat-number {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--foreground);
          display: block;
        }

        .stat-label {
          font-size: 0.75rem;
          color: var(--muted);
          display: block;
          margin-top: 2px;
        }

        .stat-hint {
          font-size: 0.6875rem;
          color: var(--muted);
          display: block;
          margin-top: 1px;
          opacity: 0.75;
        }

        .stats {
          display: flex;
          gap: 2.5rem;
        }

        @media (max-width: 600px) {
          .stats {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1.25rem;
            width: 100%;
          }

          .stat + .stat::before {
            display: none;
          }

          .booking-main {
            padding: 0.875rem 1rem;
            flex-wrap: wrap;
          }

          .card-info {
            display: flex;
            flex-direction: column;
            gap: 3px;
          }

          .client-email,
          .event-type {
            margin-top: 0;
          }

          .card-right {
            width: 100%;
            justify-content: flex-start;
            gap: 0.5rem;
            padding-left: calc(36px + 0.75rem);
            border-top: 1px solid var(--border);
            padding-top: 0.625rem;
            margin-top: 0.625rem;
          }

          .date {
            display: inline-block;
            text-align: left;
            margin: 0;
          }

          .date::after {
            content: "·";
            margin: 0 6px;
            color: var(--muted);
          }

          .time {
            display: inline-block;
            margin: 0;
          }

          .expand-icon {
            margin-left: auto;
          }

          .booking-detail {
            padding: 1rem;
          }

          .response-row {
            padding: 0.75rem 0;
          }
        }

        .stat + .stat {
          position: relative;
        }

        .stat + .stat::before {
          content: "";
          position: absolute;
          left: -1.25rem;
          top: 10%;
          height: 80%;
          width: 1px;
          background: var(--border);
        }

        .booking-group {
          margin-bottom: 1rem;
        }

        .group-label {
          font-size: 0.8125rem;
          font-weight: 700;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin: 0 0 0.5rem;
        }

        .empty-guide {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.25rem;
          margin-top: 0.25rem;
        }

        .guide-steps {
          display: flex;
          flex-direction: column;
          gap: 0.625rem;
          max-width: 380px;
        }

        .guide-step {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-align: left;
        }

        .guide-num {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: rgba(245, 197, 24, 0.2);
          border: 1.5px solid #f5c518;
          color: #1a1a0f;
          font-size: 0.8125rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .guide-text {
          font-size: 0.875rem;
          color: var(--muted);
        }
      `}</style>
    </div>
  );
}
