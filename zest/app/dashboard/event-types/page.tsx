"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useEventTypes } from "@/hooks/useEventTypes";
import { getCurrentUserPlan } from "@/app/actions/admin";
import { effectiveTier, FREE_EVENT_TYPES_LIMIT } from "@/lib/plan";

export default function EventTypesPage() {
  const { eventTypes, isLoading, updateEventType } = useEventTypes();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: planInfo } = useQuery({
    queryKey: ["currentUserPlan"],
    queryFn: () => getCurrentUserPlan(),
  });

  const tier = planInfo
    ? effectiveTier(planInfo.plan, planInfo.trialEndsAt)
    : "free";
  const atLimit =
    tier === "free" &&
    (eventTypes?.length ?? 0) >= FREE_EVENT_TYPES_LIMIT;

  const handleCopyLink = (slug: string, id: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/book/${slug}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleWhatsappShare = (slug: string) => {
    const link = `${window.location.origin}/book/${slug}`;
    const text = `Book a slot with me: ${link}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener"
    );
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    await updateEventType({ id, isActive: !currentActive });
  };

  if (isLoading) {
    return <div className="page">Loading...</div>;
  }

  const newButton = atLimit ? (
    <Link href="/dashboard/billing" className="btn-new">
      🔒 Upgrade for more
    </Link>
  ) : (
    <Link href="/dashboard/event-types/new" className="btn-new">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
      </svg>
      New event type
    </Link>
  );

  return (
    <div className="page">
      <div className="header">
        <div>
          <h1 className="heading">Event Types</h1>
          <p className="subheading">Manage your bookable services</p>
        </div>
        {newButton}
      </div>

      {!eventTypes || eventTypes.length === 0 ? (
        <div className="empty">
          <span className="empty-icon">📅</span>
          <h2 className="empty-heading">No event types yet</h2>
          <p className="empty-text">Create your first event type to start accepting bookings.</p>
          <Link href="/dashboard/event-types/new" className="btn-new">
            Create event type
          </Link>
        </div>
      ) : (
        <>
          {atLimit && (
            <p className="free-limit-hint">
              Free plan includes {FREE_EVENT_TYPES_LIMIT} event type.{" "}
              <Link href="/dashboard/billing">Upgrade to Pro</Link> for
              unlimited event types.
            </p>
          )}
          <p className="hint">
            Views count once per visitor, per day.
          </p>
          <div className="list">
            {eventTypes.map((et) => (
              <div key={et.id} className={`card ${!et.isActive ? "inactive" : ""}`}>
                <div className="card-main">
                  <div className="card-left">
                    <div className="color-dot" />
                    <div>
                      <p className="event-name">{et.name}</p>
                      <div className="meta">
                        <span className="meta-item">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                          </svg>
                          {et.duration} min
                        </span>
                        <span
                          className="meta-item"
                          title="Counted once per visitor, per day"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                          {et.views ?? 0} views
                        </span>
                        <span className="meta-item">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                          {et._count?.bookings ?? 0} bookings
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="card-actions">
                    <button
                      className={`toggle ${et.isActive ? "toggle-on" : "toggle-off"}`}
                      onClick={() => handleToggleActive(et.id, et.isActive)}
                      title={et.isActive ? "Deactivate" : "Activate"}
                    >
                      <span className="toggle-knob" />
                    </button>

                    <button
                      className="action-btn"
                      onClick={() => handleCopyLink(et.slug, et.id)}
                      title="Copy booking link"
                    >
                      {copiedId === et.id ? (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2d9a4e" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                        </svg>
                      )}
                    </button>

                    <button
                      className="action-btn"
                      onClick={() => handleWhatsappShare(et.slug)}
                      title="Share on WhatsApp"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                      </svg>
                    </button>

                    <Link href={`/dashboard/event-types/${et.id}`} className="action-btn" title="Edit">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </Link>
                  </div>
                </div>

                {et.isActive && (
                  <div className="link-preview">
                    <span className="link-text">
                      {window.location.origin}/book/{et.slug}
                    </span>
                    <button
                      className={`link-copy ${copiedId === et.id ? "copied" : ""}`}
                      onClick={() => handleCopyLink(et.slug, et.id)}
                    >
                      {copiedId === et.id ? "Copied" : "Copy"}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}