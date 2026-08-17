"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getBookingByToken,
  cancelClientBooking,
  rescheduleBooking,
} from "@/app/actions/bookings";
import TimeSlotPicker from "@/components/booking/TimeSlotPicker";
import { formatDateTimeInTz } from "@/lib/dates";

function ManageContent() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const token = searchParams.get("t") || "";
  const [rescheduling, setRescheduling] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const { data: booking, isLoading, error } = useQuery({
    queryKey: ["manageBooking", token],
    queryFn: () => getBookingByToken(token),
    enabled: !!token,
  });

  const handleCancel = async () => {
    if (!confirm("Cancel this booking?")) return;
    setBusy(true);
    setMessage(null);
    try {
      await cancelClientBooking(token);
      setMessage("Your booking has been cancelled.");
      queryClient.invalidateQueries({ queryKey: ["manageBooking", token] });
    } catch (err) {
      setMessage((err as Error).message || "Could not cancel the booking.");
    } finally {
      setBusy(false);
    }
  };

  const handleReschedule = async () => {
    if (!selectedSlot) return;
    setBusy(true);
    setMessage(null);
    try {
      await rescheduleBooking(token, selectedSlot);
      setMessage("Your booking has been rescheduled.");
      setRescheduling(false);
      setSelectedSlot(null);
      queryClient.invalidateQueries({ queryKey: ["manageBooking", token] });
    } catch (err) {
      setMessage((err as Error).message || "Could not reschedule the booking.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page">
      <div className="blob blob-1" />
      <div className="blob blob-2" />

      <div className="container">
        <div className="header">
          <Link href="/" className="brand-link">
            <span className="logo-icon">🍋</span>
            <span className="logo-text">zest</span>
          </Link>
        </div>

        <div className="card">
          {isLoading ? (
            <div className="loading">Loading your booking...</div>
          ) : !booking ? (
            <>
              <h1 className="success-title">
                {error ? "This link is invalid" : "Booking not found"}
              </h1>
              <p className="success-subtitle">
                {error
                  ? "This manage link is invalid or has expired. Please check the link you received by email."
                  : "We couldn't find this booking."}
              </p>
              <div className="actions">
                <Link href="/" className="btn-primary">
                  Back to home
                </Link>
              </div>
            </>
          ) : booking.status !== "confirmed" ? (
            <>
              <h1 className="success-title">
                {booking.status === "cancelled"
                  ? "This booking was cancelled"
                  : "This booking is no longer active"}
              </h1>
              <p className="success-subtitle">
                {booking.status === "cancelled"
                  ? "If this was a mistake, contact the host directly."
                  : "Please contact the host directly."}
              </p>
              <div className="actions">
                <Link href="/" className="btn-primary">
                  Back to home
                </Link>
              </div>
            </>
          ) : (
            <>
              <h1 className="success-title">Manage your booking</h1>
              <p className="success-subtitle">{booking.eventType.name}</p>

              <div className="time-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>
                  {formatDateTimeInTz(
                    new Date(booking.startTime).getTime(),
                    booking.eventType.timezone
                  )}
                </span>
              </div>

              <div className="info-text">
                <p>
                  Hosted by {booking.eventType.owner} · {booking.clientEmail}
                </p>
              </div>

              {message && <p className="manage-message">{message}</p>}

              {!rescheduling ? (
                <div className="manage-actions">
                  <button
                    className="btn-secondary"
                    onClick={() => setRescheduling(true)}
                    disabled={busy}
                  >
                    Reschedule
                  </button>
                  <button
                    className="btn-danger"
                    onClick={handleCancel}
                    disabled={busy}
                  >
                    Cancel booking
                  </button>
                </div>
              ) : (
                <div className="reschedule-box">
                  <h3 className="reschedule-title">
                    Pick a new time
                  </h3>
                  <TimeSlotPicker
                    eventTypeId={booking.eventType.id}
                    timezone={booking.eventType.timezone}
                    onSelectSlot={setSelectedSlot}
                    selectedSlot={selectedSlot || undefined}
                  />
                  <div className="manage-actions">
                    <button
                      className="btn-secondary"
                      onClick={() => {
                        setRescheduling(false);
                        setSelectedSlot(null);
                      }}
                      disabled={busy}
                    >
                      Back
                    </button>
                    <button
                      className="btn-primary"
                      onClick={handleReschedule}
                      disabled={!selectedSlot || busy}
                    >
                      {busy ? "Rescheduling..." : "Confirm new time"}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .brand-link {
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
        }
        .logo-icon { font-size: 26px; line-height: 1; }
        .logo-text {
          font-family: var(--font-fraunces, 'Fraunces'), serif;
          font-size: 24px;
          font-weight: 600;
          color: #1a1a0f;
          letter-spacing: -0.5px;
        }
        .manage-actions {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin-top: 20px;
        }
        .manage-message {
          text-align: center;
          font-size: 14px;
          color: #166534;
          background: #dcfce7;
          border: 1px solid #86efac;
          border-radius: 10px;
          padding: 10px 12px;
        }
        .reschedule-box {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1.5px solid #f0ead8;
        }
        .reschedule-title {
          font-family: var(--font-fraunces, 'Fraunces'), serif;
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 16px;
          color: #1a1a0f;
        }
        .btn-danger {
          background: #fef2f2;
          color: #b91c1c;
          border: 1px solid #fecaca;
          padding: 10px 18px;
          font-size: 14px;
          font-weight: 600;
          font-family: var(--font-dm-sans, 'DM Sans'), sans-serif;
          border-radius: 10px;
          cursor: pointer;
          transition: background 0.15s;
        }
        .btn-danger:hover { background: #fee2e2; }
        .btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </div>
  );
}

export default function ManagePage() {
  return (
    <Suspense fallback={<div className="page"><div className="container"><div className="loading">Loading...</div></div></div>}>
      <ManageContent />
    </Suspense>
  );
}