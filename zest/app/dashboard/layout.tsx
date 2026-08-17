"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUserPlan, isAdmin } from "@/app/actions/admin";
import { getMyEventTypes } from "@/app/actions/eventTypes";
import { signOut } from "@/app/actions/auth";
import RenewalBanner from "@/components/RenewalBanner";
import {
  accountStatus,
  daysLeft,
  isPaid,
  formatPaymentAmount,
  PRICE_LABEL,
} from "@/lib/plan";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
    router.refresh();
  };

  const { data: planInfo } = useQuery({
    queryKey: ["currentUserPlan"],
    queryFn: () => getCurrentUserPlan(),
  });

  const { data: eventTypes } = useQuery({
    queryKey: ["myEventTypes"],
    queryFn: () => getMyEventTypes(),
  });

  const status = planInfo
    ? accountStatus(planInfo.plan, planInfo.trialEndsAt)
    : null;
  const trialDays = planInfo ? daysLeft(planInfo.trialEndsAt) : 0;
  const paid = planInfo ? isPaid(planInfo.plan, planInfo.trialEndsAt) : false;

  const shareLink =
    eventTypes && eventTypes.length > 0
      ? `${window.location.origin}/book/${eventTypes[0].slug}`
      : null;

  const handleShare = async () => {
    if (!shareLink) {
      router.push("/dashboard/event-types");
      return;
    }
    try {
      await navigator.clipboard.writeText(shareLink);
    } catch {
      window.open(shareLink, "_blank");
    }
  };

  useEffect(() => {
    if (status === "inactive" && pathname !== "/dashboard/billing") {
      router.replace("/dashboard/billing");
    }
  }, [status, pathname, router]);

  const { data: admin } = useQuery({
    queryKey: ["isAdmin"],
    queryFn: () => isAdmin(),
  });

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: "📋" },
    { href: "/dashboard/event-types", label: "Event Types", icon: "📅" },
    { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <div className="shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo-wrap">
          <span className="logo-icon">🍋</span>
          <span className="logo-text">zest</span>
          {status && (
            <span
              className={`sidebar-badge ${
                status === "active"
                  ? paid
                    ? "sidebar-badge-active"
                    : "sidebar-badge-free"
                  : status === "trial"
                    ? "sidebar-badge-trial"
                    : "sidebar-badge-inactive"
              }`}
            >
              {status === "active"
                ? paid
                  ? "Pro"
                  : "Free"
                : status === "trial"
                  ? `Pro · ${trialDays}d`
                  : "Inactive"}
            </span>
          )}
        </div>

        <nav className="nav">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${pathname === item.href ? "active" : ""}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
          {admin && (
            <Link
              href="/dashboard/admin"
              className={`nav-item ${
                pathname === "/dashboard/admin" ? "active" : ""
              }`}
            >
              <span className="nav-icon">🛡️</span>
              <span>Admin</span>
            </Link>
          )}
          {admin && (
            <Link
              href="/dashboard/payments"
              className={`nav-item ${
                pathname === "/dashboard/payments" ? "active" : ""
              }`}
            >
              <span className="nav-icon">💸</span>
              <span>Payments</span>
            </Link>
          )}
        </nav>

        {!paid && (
          <div className="upgrade-banner">
            <span>
              {status === "trial"
                ? `Pro trial ends in ${trialDays} day${trialDays === 1 ? "" : "s"} — upgrade to keep unlimited event types.`
                : status === "inactive"
                  ? "Your account is inactive — renew to keep accepting bookings."
                  : "You're on the free plan (1 event type). Upgrade for unlimited event types, custom branding and WhatsApp notify."}
            </span>
            {planInfo?.paymentAmountKobo ? (
              <span className="upgrade-ref">
                Transfer{" "}
                <strong>
                  {formatPaymentAmount(planInfo.paymentAmountKobo)}
                </strong>{" "}
                to activate
              </span>
            ) : (
              <span className="upgrade-ref">
                {PRICE_LABEL} — narration:{" "}
                <strong>{planInfo?.paymentRef || "ZEST-XXXX"}</strong>
              </span>
            )}
            <Link href="/dashboard/billing" className="upgrade-link">
              {status === "inactive" ? "Renew" : "Upgrade"}
            </Link>
          </div>
        )}

        <div className="sidebar-footer">
          <button onClick={handleShare} className="tutorial-link share-btn">
            {shareLink ? "📤 Copy booking link" : "📤 Share my booking page"}
          </button>
          <Link href="/tutorial" className="tutorial-link">
            📖 How to use Zest
          </Link>
          <button onClick={handleSignOut} className="tutorial-link signout">
            🚪 Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="main">
        <RenewalBanner planInfo={planInfo} />
        {children}
      </main>

      <style jsx>{`

        :global(body) {
          margin: 0;
          padding: 0;
          font-family: var(--font-dm-sans, 'DM Sans'), sans-serif;
          background: #fffbf0;
        }

        .shell {
          display: flex;
          min-height: 100vh;
        }

        .sidebar {
          width: 240px;
          min-height: 100vh;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border-right: 1.5px solid rgba(255, 220, 80, 0.3);
          display: flex;
          flex-direction: column;
          padding: 32px 20px;
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          z-index: 10;
        }

        .logo-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 40px;
          padding: 0 8px;
        }

        .logo-icon {
          font-size: 26px;
          line-height: 1;
        }

        .logo-text {
          font-family: var(--font-fraunces, 'Fraunces'), serif;
          font-size: 24px;
          font-weight: 600;
          color: #1a1a0f;
          letter-spacing: -0.5px;
        }

        .nav {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 14px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 500;
          color: #7a7a60;
          text-decoration: none;
          transition: background 0.15s, color 0.15s;
        }

        .nav-item:hover {
          background: rgba(245, 197, 24, 0.12);
          color: #1a1a0f;
        }

        .nav-item.active {
          background: #f5c518;
          color: #1a1a0f;
        }

        .nav-icon {
          font-size: 16px;
        }

        .sidebar-footer {
          padding-top: 24px;
          border-top: 1.5px solid #f0ead8;
        }

        .tutorial-link {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 13.5px;
          font-weight: 500;
          color: #7a7a60;
          text-decoration: none;
          transition: background 0.15s, color 0.15s;
        }

        .tutorial-link:hover {
          background: rgba(245, 197, 24, 0.12);
          color: #1a1a0f;
        }

        .signout {
          width: 100%;
          background: none;
          border: none;
          font: inherit;
          text-align: left;
          cursor: pointer;
          padding-left: 14px;
          box-sizing: border-box;
        }

        .share-btn {
          width: 100%;
          background: none;
          border: none;
          font: inherit;
          text-align: left;
          cursor: pointer;
          padding-left: 14px;
          box-sizing: border-box;
        }

        .signout:hover {
          color: var(--danger, #ef4444);
        }

        .sidebar-badge {
          font-size: 0.625rem;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 6px;
          margin-left: auto;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .sidebar-badge-active {
          background: #dcfce7;
          color: #166534;
        }

        .sidebar-badge-free {
          background: #f1efe2;
          color: #88846c;
        }

        .sidebar-badge-trial {
          background: #fef9c3;
          color: #854d0e;
        }

        .sidebar-badge-inactive {
          background: #f1efe2;
          color: #88846c;
        }

        .upgrade-banner {
          margin: 12px 8px;
          padding: 12px;
          background: #fef9c3;
          border: 1px solid #fde047;
          border-radius: 10px;
          font-size: 0.75rem;
          text-align: center;
          color: #854d0e;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .upgrade-ref {
          font-size: 0.6875rem;
          line-height: 1.5;
        }

        .upgrade-link {
          display: inline-block;
          background: #f5c518;
          color: #1a1a0f;
          text-decoration: none;
          padding: 6px 12px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.75rem;
          transition: background 0.15s;
        }

        .upgrade-link:hover {
          background: #e6b800;
        }

        .main {
          margin-left: 240px;
          flex: 1;
          padding: 40px;
          min-height: 100vh;
        }

        @media (max-width: 768px) {
          .sidebar {
            width: 100%;
            min-height: auto;
            position: relative;
            flex-direction: row;
            align-items: center;
            flex-wrap: wrap;
            gap: 10px 16px;
            padding: 14px 16px;
            border-right: none;
            border-bottom: 1.5px solid rgba(255, 220, 80, 0.3);
          }

          .logo-wrap {
            margin-bottom: 0;
            margin-right: 4px;
          }

          .nav {
            flex-direction: row;
            flex: 1;
            flex-wrap: wrap;
            gap: 6px;
          }

          .nav-item {
            padding: 9px 12px;
            font-size: 13.5px;
            line-height: 1.4;
          }

          .sidebar-footer {
            border-top: none;
            padding-top: 0;
            width: 100%;
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
          }

          .tutorial-link {
            padding: 8px 12px;
          }

          .upgrade-banner {
            width: 100%;
            font-size: 0.78125rem;
            line-height: 1.55;
          }

          .main {
            margin-left: 0;
            padding: 24px 16px;
          }

          .shell {
            flex-direction: column;
          }
        }

        @media (max-width: 480px) {
          .sidebar {
            padding: 12px;
            gap: 8px 12px;
          }

          .nav-item {
            font-size: 13px;
            padding: 8px 10px;
          }

          .main {
            padding: 16px 12px;
          }
        }
      `}</style>
    </div>
  );
}
