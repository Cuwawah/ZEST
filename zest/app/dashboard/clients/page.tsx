"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getClients, runBackfill } from "@/app/actions/clients";
import { getTags } from "@/app/actions/tags";
import TagManager from "@/components/dashboard/TagManager";

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [showTagManager, setShowTagManager] = useState(false);
  const [backfilling, setBackfilling] = useState(false);
  const [backfillResult, setBackfillResult] = useState<string | null>(null);

  const { data: clients, isLoading } = useQuery({
    queryKey: ["clients", search],
    queryFn: () => getClients(search || undefined),
  });

  const { data: tags } = useQuery({
    queryKey: ["tags"],
    queryFn: () => getTags(),
  });

  const handleBackfill = async () => {
    setBackfilling(true);
    setBackfillResult(null);
    try {
      const result = await runBackfill();
      setBackfillResult(`Linked ${result.linked} booking(s) to existing clients.`);
    } catch {
      setBackfillResult("Backfill failed. Try again.");
    } finally {
      setBackfilling(false);
    }
  };

  return (
    <div className="page">
      <div className="header">
        <div>
          <h1 className="heading">Clients</h1>
          <p className="subheading">People who have booked with you</p>
        </div>
      </div>

      <div className="toolbar">
        <input
          className="input search-input"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="input filter-select"
          value={filterTag || ""}
          onChange={(e) => setFilterTag(e.target.value || null)}
        >
          <option value="">All clients</option>
          {(tags || []).map((tag) => (
            <option key={tag.id} value={tag.id}>{tag.name}</option>
          ))}
        </select>
        <button
          className="btn-secondary"
          onClick={() => setShowTagManager(!showTagManager)}
        >
          Manage tags
        </button>
        <button
          className="btn-secondary"
          onClick={handleBackfill}
          disabled={backfilling}
        >
          {backfilling ? "Syncing..." : "Sync old bookings"}
        </button>
      </div>

      {showTagManager && (
        <div className="tag-manager-box">
          <TagManager />
        </div>
      )}

      {backfillResult && <p className="backfill-msg">{backfillResult}</p>}

      {isLoading ? (
        <div className="loading">Loading clients...</div>
      ) : !clients || clients.length === 0 ? (
        <div className="empty">
          <span className="empty-icon">👥</span>
          <h2 className="empty-heading">No clients yet</h2>
          <p className="empty-text">
            Clients are created automatically when someone books with you.
          </p>
          {search && (
            <p className="empty-text">No clients match &quot;{search}&quot;</p>
          )}
        </div>
      ) : (
        <div className="client-list">
          {(clients || [])
            .filter((c) => !filterTag || c.tags.some((t) => t.id === filterTag))
            .map((client) => (
            <Link
              key={client.id}
              href={`/dashboard/clients/${client.id}`}
              className="client-card"
            >
              <div className="client-left">
                <div className="avatar">
                  {(client.name || client.email).charAt(0).toUpperCase()}
                </div>
                <div className="client-info">
                  <p className="client-name">
                    {client.name || "Unnamed client"}
                  </p>
                  <p className="client-email">{client.email}</p>
                  {client.phone && (
                    <p className="client-phone">{client.phone}</p>
                  )}
                </div>
              </div>
              <div className="client-right">
                <div className="client-meta">
                  <span className="client-count">
                    {client.bookingCount} booking{client.bookingCount !== 1 ? "s" : ""}
                  </span>
                  {client.lastBookingAt && (
                    <span className="client-last">
                      Last: {new Date(client.lastBookingAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  )}
                </div>
                {client.tags.length > 0 && (
                  <div className="client-tags">
                    {client.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="tag-badge"
                        style={{ background: tag.color + "22", color: tag.color, borderColor: tag.color + "44" }}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}
                <span className="arrow">→</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <style jsx>{`
        .page {
          max-width: 800px;
        }

        .header {
          margin-bottom: 1.5rem;
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

        .toolbar {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .search-input {
          flex: 1;
        }

        .filter-select {
          width: 160px;
          flex-shrink: 0;
        }

        .tag-manager-box {
          margin-bottom: 1.5rem;
          padding: 1rem;
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: 0.75rem;
        }

        .btn-secondary {
          padding: 0.5rem 1rem;
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--foreground);
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: 0.5rem;
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.15s;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #f1efe2;
        }

        .btn-secondary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .backfill-msg {
          font-size: 0.8125rem;
          color: var(--muted);
          margin: -0.75rem 0 1.5rem;
        }

        .loading {
          text-align: center;
          padding: 3rem;
          color: var(--muted);
          font-size: 0.875rem;
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
          font-size: 1.125rem;
          font-weight: 700;
          margin: 0 0 0.375rem;
          color: var(--foreground);
        }

        .empty-text {
          font-size: 0.875rem;
          color: var(--muted);
          margin: 0.25rem 0;
        }

        .client-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .client-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 1rem 1.25rem;
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: 0.75rem;
          text-decoration: none;
          color: inherit;
          transition: background 0.15s, border-color 0.15s;
        }

        .client-card:hover {
          background: #fdfcf5;
          border-color: #d4d0b8;
        }

        .client-left {
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

        .client-info {
          min-width: 0;
        }

        .client-name {
          font-size: 0.9375rem;
          font-weight: 600;
          color: var(--foreground);
          margin: 0;
        }

        .client-email {
          font-size: 0.75rem;
          color: var(--muted);
          margin: 2px 0 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .client-phone {
          font-size: 0.75rem;
          color: var(--muted);
          margin: 2px 0 0;
        }

        .client-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-shrink: 0;
        }

        .client-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 2px;
        }

        .client-count {
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--foreground);
        }

        .client-last {
          font-size: 0.6875rem;
          color: var(--muted);
        }

        .client-tags {
          display: flex;
          gap: 0.25rem;
          flex-wrap: wrap;
        }

        .tag-badge {
          font-size: 0.6875rem;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 6px;
          border: 1px solid;
          white-space: nowrap;
        }

        .arrow {
          color: var(--muted);
          font-size: 0.875rem;
        }

        @media (max-width: 600px) {
          .toolbar {
            flex-direction: column;
          }

          .client-card {
            flex-wrap: wrap;
          }

          .client-right {
            width: 100%;
            justify-content: flex-start;
            padding-left: calc(36px + 0.75rem);
            border-top: 1px solid var(--border);
            padding-top: 0.625rem;
            margin-top: 0.5rem;
          }

          .client-meta {
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
