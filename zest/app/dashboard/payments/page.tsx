"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPaymentTransactions,
  approvePayment,
  rejectPayment,
} from "@/app/actions/payments";
import { isAdmin, getPendingUsers } from "@/app/actions/admin";

const STATUS_LABELS: Record<string, string> = {
  parsed: "Parsed",
  matched: "Matched",
  activated: "Activated",
  manual_review: "Manual review",
  unmatched: "Unmatched",
  no_credit: "No credit",
  newsletter: "Newsletter",
  not_from_kuda: "Not Kuda",
  parse_error: "Parse error",
  rejected: "Rejected",
};

export default function PaymentsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [approveTargets, setApproveTargets] = useState<Record<string, string>>(
    {}
  );

  const { data: admin, isLoading: adminCheckLoading } = useQuery({
    queryKey: ["isAdmin"],
    queryFn: () => isAdmin(),
  });

  const { data: pendingUsers } = useQuery({
    queryKey: ["pendingUsers"],
    queryFn: () => getPendingUsers(),
    enabled: !!admin,
  });

  const { data: transactions, isLoading } = useQuery({
    queryKey: ["payments", "transactions"],
    queryFn: () => getPaymentTransactions(),
    enabled: !!admin,
  });

  const approve = useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      approvePayment(id, userId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["payments"] }),
  });

  const reject = useMutation({
    mutationFn: rejectPayment,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["payments"] }),
  });

  useEffect(() => {
    if (!adminCheckLoading && !admin) router.push("/dashboard");
  }, [admin, adminCheckLoading, router]);

  if (adminCheckLoading) {
    return <div className="page">Loading...</div>;
  }

  if (!admin) return null;

  const reviewCount =
    transactions?.filter(
      (t) => t.status === "manual_review" || t.status === "parse_error"
    ).length || 0;

  return (
    <div className="page">
      <div className="header">
        <div className="header-left">
          <h1 className="heading">Payments</h1>
          <p className="subheading">Kuda credit alerts and order matching</p>
        </div>
        <div className="stats">
          <div className="stat">
            <span className="stat-number">
              {transactions?.filter((t) => t.status === "activated").length || 0}
            </span>
            <span className="stat-label">Activated</span>
          </div>
          <div className="stat">
            <span className="stat-number">{reviewCount}</span>
            <span className="stat-label">Needs review</span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="loading">Loading emails...</div>
      ) : !transactions || transactions.length === 0 ? (
        <div className="empty">
          <span className="empty-icon">💸</span>
          <h2 className="empty-heading">No transactions yet</h2>
          <p className="empty-text">
            Incoming Kuda credit alerts will appear here once the poller runs.
          </p>
        </div>
      ) : (
        <div className="tx-table-wrap">
          <div className="table-header">
            <span>Amount</span>
            <span>Sender</span>
            <span>Narration</span>
            <span>Status</span>
            <span>Time</span>
            <span>Action</span>
          </div>

          {transactions.map((tx) => {
            const isExpanded = expandedId === tx.id;
            return (
              <div className="tx-row" key={tx.id}>
                <div
                  className="tx-main"
                  onClick={() => setExpandedId(isExpanded ? null : tx.id)}
                >
                  <span className="amount">
                    ₦
                    {tx.amountKobo != null
                      ? (tx.amountKobo / 100).toLocaleString("en-NG", {
                          minimumFractionDigits: 2,
                        })
                      : "—"}
                  </span>
                  <span className="sender">{tx.senderName || "—"}</span>
                  <span className="narration">
                    {tx.narration || "—"}
                  </span>
                  <span className="status-cell">
                    <span className={`badge badge-${tx.status}`}>
                      {STATUS_LABELS[tx.status] || tx.status}
                    </span>
                    {tx.matchedUser ? (
                      <span className="matched-user">
                        → {tx.matchedUser.email}
                      </span>
                    ) : null}
                  </span>
                  <span className="time">
                    {tx.receivedAt
                      ? new Date(tx.receivedAt).toLocaleString("en-NG")
                      : "—"}
                  </span>
                  <span className="actions">
                    {(tx.status === "manual_review" ||
                      tx.status === "parse_error" ||
                      tx.status === "unmatched") && (
                      <>
                        {!tx.matchedUserId && (
                          <select
                            className="approve-select"
                            value={
                              approveTargets[tx.id] ||
                              (pendingUsers && pendingUsers.length > 0
                                ? pendingUsers[0].id
                                : "")
                            }
                            onChange={(e) =>
                              setApproveTargets((prev) => ({
                                ...prev,
                                [tx.id]: e.target.value,
                              }))
                            }
                            onClick={(e) => e.stopPropagation()}
                          >
                            {(!pendingUsers || pendingUsers.length === 0) && (
                              <option value="">No pending users</option>
                            )}
                            {pendingUsers?.map((u) => (
                              <option key={u.id} value={u.id}>
                                {(u.name || u.email)} — {u.email}
                              </option>
                            ))}
                          </select>
                        )}
                        <button
                          className="btn-approve"
                          onClick={(e) => {
                            e.stopPropagation();
                            const targetUserId =
                              tx.matchedUserId || approveTargets[tx.id];
                            if (!targetUserId) {
                              alert(
                                "Select a user to activate for this payment first."
                              );
                              return;
                            }
                            approve.mutate({
                              id: tx.id,
                              userId: targetUserId,
                            });
                          }}
                          disabled={approve.isPending}
                        >
                          Approve
                        </button>
                        <button
                          className="btn-reject"
                          onClick={(e) => {
                            e.stopPropagation();
                            reject.mutate(tx.id);
                          }}
                          disabled={reject.isPending}
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </span>
                </div>

                {isExpanded && (
                  <div className="raw-body">
                    {tx.rawBody ? (
                      <pre>{tx.rawBody}</pre>
                    ) : (
                      <em>No raw body captured.</em>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <style jsx>{`
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
          gap: 1rem;
        }

        .header-left {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .stats {
          display: flex;
          gap: 1.5rem;
        }

        .stat {
          text-align: center;
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

        .tx-table-wrap {
          border: 1px solid var(--border);
          border-radius: 0.75rem;
          overflow: hidden;
        }

        .tx-main {
          display: grid;
          grid-template-columns: 110px 1.4fr 1.6fr 1.2fr 150px 220px;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          align-items: center;
          width: 100%;
          text-align: left;
          background: none;
          border: none;
          border-bottom: 1px solid var(--border);
          font-family: inherit;
          font-size: 0.875rem;
          color: inherit;
          cursor: pointer;
          transition: background 0.1s;
        }

        .tx-main:hover {
          background: #fdfcf5;
        }

        .amount {
          font-weight: 700;
          color: var(--foreground);
        }

        .sender,
        .narration {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: var(--foreground);
        }

        .narration {
          color: var(--muted);
        }

        .time {
          font-size: 0.75rem;
          color: var(--muted);
        }

        .status-cell {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .badge {
          display: inline-block;
          width: fit-content;
          padding: 2px 8px;
          border-radius: 999px;
          font-size: 0.6875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .badge-activated,
        .badge-matched {
          background: #dcfce7;
          color: #166534;
        }

        .badge-manual_review {
          background: #fef9c3;
          color: #854d0e;
        }

        .badge-unmatched {
          background: #f1efe2;
          color: #6b6850;
        }

        .badge-parse_error {
          background: #fee2e2;
          color: #991b1b;
        }

        .badge-no_credit,
        .badge-not_from_kuda,
        .badge-newsletter,
        .badge-rejected {
          background: #f1efe2;
          color: #8a8670;
        }

        .matched-user {
          font-size: 0.6875rem;
          color: #166534;
        }

        .actions {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .approve-select {
          max-width: 180px;
          font-size: 0.75rem;
          padding: 0.25rem 0.4rem;
          border: 1px solid var(--border);
          border-radius: 0.375rem;
          background: var(--background);
          color: var(--foreground);
          font-family: inherit;
        }

        .btn-approve {
          padding: 0.3rem 0.6rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: white;
          background: #16a34a;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          transition: background 0.15s;
        }

        .btn-approve:hover {
          background: #15803d;
        }

        .btn-reject {
          padding: 0.3rem 0.6rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--danger);
          background: none;
          border: 1px solid var(--border);
          border-radius: 0.375rem;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
        }

        .btn-reject:hover {
          background: #fef2f2;
          border-color: #fecaca;
        }

        .raw-body {
          padding: 0.75rem 1rem;
          background: #fdfcf5;
          border-bottom: 1px solid var(--border);
        }

        .raw-body pre {
          margin: 0;
          white-space: pre-wrap;
          word-break: break-word;
          font-size: 0.75rem;
          color: #44402c;
          max-height: 300px;
          overflow-y: auto;
        }

        .loading,
        .empty {
          text-align: center;
          padding: 3rem;
          color: var(--muted);
          font-size: 0.875rem;
        }

        .empty-icon {
          font-size: 2rem;
          display: block;
          margin-bottom: 0.5rem;
        }

        .empty-heading {
          font-size: 1.125rem;
          color: var(--foreground);
          margin: 0 0 0.25rem;
        }

        .empty-text {
          margin: 0;
        }

        @media (max-width: 900px) {
          .tx-main {
            grid-template-columns: 90px 1fr 100px;
            grid-template-rows: auto auto;
            gap: 0.25rem 0.75rem;
          }

          .time,
          .actions {
            grid-column: span 2;
          }
        }
      `}</style>
    </div>
  );
}