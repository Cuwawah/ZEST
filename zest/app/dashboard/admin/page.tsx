"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllUsers,
  activateUser,
  deactivateUser,
  searchUsers,
  isAdmin,
} from "@/app/actions/admin";
import { useRouter } from "next/navigation";
import { accountStatus, daysLeft } from "@/lib/plan";

export default function AdminPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: admin, isLoading: adminCheckLoading } = useQuery({
    queryKey: ["isAdmin"],
    queryFn: () => isAdmin(),
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["admin", "users", searchQuery],
    queryFn: () => (searchQuery ? searchUsers(searchQuery) : getAllUsers()),
  });

  const activateMutation = useMutation({
    mutationFn: (email: string) => activateUser(email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (email: string) => deactivateUser(email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });

  useEffect(() => {
    if (!adminCheckLoading && !admin) {
      router.push("/dashboard");
    }
  }, [admin, adminCheckLoading, router]);

  if (adminCheckLoading) {
    return <div className="page">Loading...</div>;
  }

  if (!admin) return null;

  return (
    <div className="page">
      <div className="header">
        <div className="header-left">
          <h1 className="heading">Admin</h1>
          <p className="subheading">Manage users and activate accounts</p>
        </div>
        <div className="stats">
          <div className="stat">
            <span className="stat-number">
              {users?.filter((u) => accountStatus(u.plan, u.trialEndsAt) === "active").length || 0}
            </span>
            <span className="stat-label">Active</span>
          </div>
          <div className="stat">
            <span className="stat-number">
              {users?.filter((u) => accountStatus(u.plan, u.trialEndsAt) === "trial").length || 0}
            </span>
            <span className="stat-label">Trial</span>
          </div>
          <div className="stat">
            <span className="stat-number">
              {users?.filter((u) => accountStatus(u.plan, u.trialEndsAt) === "inactive").length || 0}
            </span>
            <span className="stat-label">Inactive</span>
          </div>
        </div>
      </div>

      <div className="search-bar">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          className="search-input"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {usersLoading ? (
        <div className="loading">Loading users...</div>
      ) : !users || users.length === 0 ? (
        <div className="empty">
          <span className="empty-icon">👥</span>
          <h2 className="empty-heading">No users found</h2>
          <p className="empty-text">
            {searchQuery
              ? "No users match your search."
              : "No users have signed up yet."}
          </p>
        </div>
      ) : (
        <div className="admin-table">
          <div className="table-header">
            <span className="col-user">User</span>
            <span className="col-email">Email</span>
            <span className="col-plan">Status</span>
            <span className="col-date">Signed up</span>
            <span className="col-action">Action</span>
          </div>

          {users.map((user) => {
            const userStatus = accountStatus(user.plan, user.trialEndsAt);
            return (
              <div key={user.id} className="table-row">
                <span className="col-user">{user.name || "—"}</span>
                <span className="col-email">{user.email}</span>
                <span className="col-plan">
                  <span
                    className={`status-badge ${
                      userStatus === "active"
                        ? "status-active"
                        : userStatus === "trial"
                          ? "status-trial"
                          : "status-inactive"
                    }`}
                  >
                    <span className="status-dot" />
                    {userStatus === "active"
                      ? "Active"
                      : userStatus === "trial"
                        ? `Trial · ${daysLeft(user.trialEndsAt)}d`
                        : "Inactive"}
                  </span>
                </span>
                <span className="col-date">
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <span className="col-action">
                  {userStatus === "active" ? (
                    <button
                      className="btn-deactivate"
                      onClick={() => deactivateMutation.mutate(user.email)}
                      disabled={deactivateMutation.isPending}
                    >
                      Deactivate
                    </button>
                  ) : (
                    <button
                      className="btn-activate"
                      onClick={() => activateMutation.mutate(user.email)}
                      disabled={activateMutation.isPending}
                    >
                      Activate
                    </button>
                  )}
                </span>
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

        .search-bar {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: 0.5rem;
          padding: 0.5rem 0.75rem;
          margin-bottom: 1.5rem;
          color: var(--muted);
        }

        .search-input {
          border: none;
          outline: none;
          font-size: 0.875rem;
          background: none;
          color: var(--foreground);
          flex: 1;
          font-family: inherit;
        }

        .admin-table {
          border: 1px solid var(--border);
          border-radius: 0.75rem;
          overflow: hidden;
        }

        .table-header {
          display: grid;
          grid-template-columns: 1.5fr 2fr 100px 120px 100px;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          background: #fdfcf5;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid var(--border);
        }

        .table-row {
          display: grid;
          grid-template-columns: 1.5fr 2fr 100px 120px 100px;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          align-items: center;
          font-size: 0.875rem;
          border-bottom: 1px solid var(--border);
          transition: background 0.1s;
        }

        .table-row:last-child {
          border-bottom: none;
        }

        .table-row:hover {
          background: #fdfcf5;
        }

        .col-user {
          font-weight: 600;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .col-email {
          color: var(--muted);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .col-date {
          font-size: 0.8125rem;
          color: var(--muted);
        }

        .btn-activate {
          padding: 0.375rem 0.75rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: white;
          background: #16a34a;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          transition: background 0.15s;
        }

        .btn-activate:hover {
          background: #15803d;
        }

        .btn-activate:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-deactivate {
          padding: 0.375rem 0.75rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--danger);
          background: none;
          border: 1px solid var(--border);
          border-radius: 0.375rem;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
        }

        .btn-deactivate:hover {
          background: #fef2f2;
          border-color: #fecaca;
        }

        .btn-deactivate:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .loading {
          text-align: center;
          padding: 3rem;
          color: var(--muted);
          font-size: 0.875rem;
        }

        @media (max-width: 700px) {
          .table-header,
          .table-row {
            grid-template-columns: 1fr 1fr;
          }

          .col-date,
          .col-plan {
            display: none;
          }

          .header {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
