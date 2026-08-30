"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { getClientById } from "@/app/actions/clients";
import { getTags, assignTag, removeTag } from "@/app/actions/tags";
import { useClientInsights } from "@/hooks/useIntelligence";

export default function ClientDetailPage() {
  const params = useParams();
  const clientId = params.id as string;
  const queryClient = useQueryClient();
  const [tagSearch, setTagSearch] = useState("");

  const { data: client, isLoading } = useQuery({
    queryKey: ["client", clientId],
    queryFn: () => getClientById(clientId),
    enabled: !!clientId,
  });

  const { data: allTags } = useQuery({
    queryKey: ["tags"],
    queryFn: () => getTags(),
  });

  const { data: insights } = useClientInsights(clientId);

  const assignTagMut = useMutation({
    mutationFn: (tagId: string) => assignTag(clientId, tagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client", clientId] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });

  const removeTagMut = useMutation({
    mutationFn: (tagId: string) => removeTag(clientId, tagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client", clientId] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });

  if (isLoading) {
    return <div className="page">Loading client...</div>;
  }

  if (!client) {
    return (
      <div className="page">
        <div className="empty">
          <h2 className="empty-heading">Client not found</h2>
          <Link href="/dashboard/clients" className="back-link">
            Back to clients
          </Link>
        </div>
      </div>
    );
  }

  const assignedTagIds = new Set(client.tags.map((t) => t.id));
  const availableTags = (allTags || []).filter((t) => !assignedTagIds.has(t.id));
  const filteredTags = tagSearch
    ? availableTags.filter((t) =>
        t.name.toLowerCase().includes(tagSearch.toLowerCase())
      )
    : availableTags;

  return (
    <div className="page">
      <div className="header">
        <Link href="/dashboard/clients" className="back-link">
          ← Clients
        </Link>
        <h1 className="heading">{client.name || "Unnamed client"}</h1>
        <p className="subheading">{client.email}</p>
      </div>

      <div className="profile-card">
        <div className="profile-row">
          <span className="profile-label">Email</span>
          <span className="profile-value">{client.email}</span>
        </div>
        {client.phone && (
          <div className="profile-row">
            <span className="profile-label">Phone</span>
            <span className="profile-value">{client.phone}</span>
          </div>
        )}
        <div className="profile-row">
          <span className="profile-label">First booking</span>
          <span className="profile-value">
            {new Date(client.createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
        <div className="profile-row">
          <span className="profile-label">Total bookings</span>
          <span className="profile-value">{client.bookings.length}</span>
        </div>
      </div>

      <div className="section">
        <h2 className="section-heading">Tags</h2>
        <div className="tags-area">
          {client.tags.length > 0 && (
            <div className="assigned-tags">
              {client.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="tag-badge"
                  style={{ background: tag.color + "22", color: tag.color, borderColor: tag.color + "44" }}
                >
                  {tag.name}
                  <button
                    className="tag-remove"
                    onClick={() => removeTagMut.mutate(tag.id)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          {filteredTags.length > 0 && (
            <div className="add-tags">
              <input
                className="input tag-search"
                placeholder="Add tag..."
                value={tagSearch}
                onChange={(e) => setTagSearch(e.target.value)}
              />
              <div className="tag-dropdown">
                {filteredTags.slice(0, 5).map((tag) => (
                  <button
                    key={tag.id}
                    className="tag-option"
                    onClick={() => {
                      assignTagMut.mutate(tag.id);
                      setTagSearch("");
                    }}
                  >
                    <span
                      className="tag-dot"
                      style={{ background: tag.color }}
                    />
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          {client.tags.length === 0 && availableTags.length === 0 && (
            <p className="no-tags">
              No tags yet. Create tags in{" "}
              <Link href="/dashboard/clients" className="hint-link">
                the clients list
              </Link>
              .
            </p>
          )}
        </div>
      </div>

      {insights && insights.length > 0 && (
        <div className="section">
          <h2 className="section-heading">Insights</h2>
          <div className="insights-list">
            {insights.map((insight, i) => (
              <div key={i} className="insight-row">
                <span className="insight-icon">{insight.icon}</span>
                <span className="insight-text">{insight.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="section">
        <h2 className="section-heading">Booking history</h2>
        {client.bookings.length === 0 ? (
          <p className="no-bookings">No bookings found.</p>
        ) : (
          <div className="booking-list">
            {client.bookings.map((booking) => (
              <div key={booking.id} className="booking-card">
                <div className="booking-main">
                  <div className="booking-info">
                    <p className="booking-event">{booking.eventType.name}</p>
                    <p className="booking-date">
                      {new Date(booking.startTime).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}{" "}
                      at{" "}
                      {new Date(booking.startTime).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="booking-right">
                    <span
                      className={`status-badge status-${booking.status}`}
                    >
                      {booking.status}
                    </span>
                    <Link
                      href={`/book/${booking.eventType.slug}?client=${client.id}`}
                      className="rebook-link"
                    >
                      Book again
                    </Link>
                  </div>
                </div>
                {booking.notes && (
                  <div className="booking-notes">
                    <span className="notes-label">Notes:</span> {booking.notes}
                  </div>
                )}
                {booking.responses.length > 0 && (
                  <div className="booking-responses">
                    {booking.responses.map((r) => (
                      <div key={r.id} className="response-row">
                        <span className="response-label">{r.question.label}</span>
                        <span className="response-value">{r.answer}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .page {
          max-width: 800px;
        }

        .header {
          margin-bottom: 1.5rem;
        }

        .back-link {
          font-size: 0.8125rem;
          color: var(--muted);
          text-decoration: none;
          display: inline-block;
          margin-bottom: 0.5rem;
        }

        .back-link:hover {
          color: var(--foreground);
        }

        .heading {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--foreground);
          margin: 0;
        }

        .subheading {
          font-size: 0.875rem;
          color: var(--muted);
          margin: 0.25rem 0 0;
        }

        .profile-card {
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: 0.75rem;
          padding: 1.25rem 1.5rem;
          margin-bottom: 1.5rem;
        }

        .profile-row {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          border-bottom: 1px solid var(--border);
        }

        .profile-row:last-child {
          border-bottom: none;
        }

        .profile-label {
          font-size: 0.8125rem;
          color: var(--muted);
        }

        .profile-value {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--foreground);
        }

        .section {
          margin-bottom: 1.5rem;
        }

        .section-heading {
          font-size: 1rem;
          font-weight: 700;
          color: var(--foreground);
          margin: 0 0 0.75rem;
        }

        .tags-area {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .assigned-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.375rem;
        }

        .tag-badge {
          font-size: 0.75rem;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 6px;
          border: 1px solid;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .tag-remove {
          background: none;
          border: none;
          color: inherit;
          cursor: pointer;
          font-size: 1rem;
          line-height: 1;
          padding: 0 2px;
          opacity: 0.6;
        }

        .tag-remove:hover {
          opacity: 1;
        }

        .add-tags {
          position: relative;
        }

        .tag-search {
          max-width: 200px;
          font-size: 0.8125rem;
        }

        .tag-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          background: white;
          border: 1px solid var(--border);
          border-radius: 0.5rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          z-index: 10;
          min-width: 180px;
          max-height: 200px;
          overflow-y: auto;
        }

        .tag-option {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.5rem 0.75rem;
          font-size: 0.8125rem;
          color: var(--foreground);
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
        }

        .tag-option:hover {
          background: #f5f3e8;
        }

        .tag-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .no-tags,
        .no-bookings {
          font-size: 0.875rem;
          color: var(--muted);
          margin: 0;
        }

        .insights-list {
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: 0.75rem;
          overflow: hidden;
        }

        .insight-row {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 0.75rem 1.25rem;
          border-bottom: 1px solid var(--border);
          font-size: 0.875rem;
          color: var(--foreground);
        }

        .insight-row:last-child {
          border-bottom: none;
        }

        .insight-icon {
          font-size: 1rem;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .insight-text {
          line-height: 1.4;
        }

        .hint-link {
          color: var(--accent, #c08b00);
        }

        .booking-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .booking-card {
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: 0.75rem;
          overflow: hidden;
        }

        .booking-main {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 1rem 1.25rem;
        }

        .booking-info {
          min-width: 0;
        }

        .booking-event {
          font-size: 0.9375rem;
          font-weight: 600;
          color: var(--foreground);
          margin: 0;
        }

        .booking-date {
          font-size: 0.75rem;
          color: var(--muted);
          margin: 2px 0 0;
        }

        .booking-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-shrink: 0;
        }

        .status-badge {
          font-size: 0.6875rem;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 6px;
          text-transform: capitalize;
        }

        .status-confirmed {
          background: #dcfce7;
          color: #166534;
        }

        .status-cancelled {
          background: #fee2e2;
          color: #991b1b;
        }

        .rebook-link {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--accent, #c08b00);
          text-decoration: none;
          padding: 4px 8px;
          border: 1px solid var(--border);
          border-radius: 0.375rem;
          transition: background 0.15s;
        }

        .rebook-link:hover {
          background: #f5f3e8;
        }

        .booking-notes {
          padding: 0 1.25rem 0.75rem;
          font-size: 0.8125rem;
          color: var(--muted);
          font-style: italic;
        }

        .notes-label {
          font-weight: 600;
          font-style: normal;
        }

        .booking-responses {
          padding: 0.75rem 1.25rem;
          border-top: 1px solid var(--border);
          background: #fdfcf5;
        }

        .response-row {
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding: 0.375rem 0;
        }

        .response-row + .response-row {
          border-top: 1px solid var(--border);
        }

        .response-label {
          font-size: 0.6875rem;
          font-weight: 600;
          color: var(--muted);
        }

        .response-value {
          font-size: 0.8125rem;
          color: var(--foreground);
        }

        .empty {
          text-align: center;
          padding: 3rem 1.5rem;
        }

        .empty-heading {
          font-size: 1.125rem;
          font-weight: 700;
          margin: 0 0 0.75rem;
        }
      `}</style>
    </div>
  );
}
