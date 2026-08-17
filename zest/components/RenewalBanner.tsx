"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { dismissRenewalNotice } from "@/app/actions/renewals";
import { formatPaymentAmount } from "@/lib/plan";

interface RenewalPlanInfo {
  plan: string;
  trialEndsAt: Date | string | null;
  planExpiresAt: Date | string | null;
  renewalNoticeDismissedAt: Date | string | null;
  paymentAmountKobo: number | null;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const BEFORE_MS = 3 * DAY_MS;
const MODAL_MS = DAY_MS;

export default function RenewalBanner({
  planInfo,
}: {
  planInfo: RenewalPlanInfo | null | undefined;
}) {
  const queryClient = useQueryClient();
  const [bannerHidden, setBannerHidden] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const { endsAt, isTrial, amount } = useMemo(() => {
    const trialEnds = planInfo?.trialEndsAt
      ? new Date(planInfo.trialEndsAt).getTime()
      : null;
    const paidEnds = planInfo?.planExpiresAt
      ? new Date(planInfo.planExpiresAt).getTime()
      : null;
    const trial = planInfo?.plan === "free" && !!trialEnds;
    const paid = planInfo?.plan === "active" && !!paidEnds;
    return {
      endsAt: trial ? trialEnds! : paid ? paidEnds! : null,
      isTrial: trial,
      amount: planInfo?.paymentAmountKobo
        ? formatPaymentAmount(planInfo.paymentAmountKobo)
        : null,
    };
  }, [planInfo]);

  const modalKey = endsAt ? `zest-renewal-modal-${endsAt}` : null;

  const [modalHidden, setModalHidden] = useState(() => {
    if (!modalKey) return false;
    try {
      return sessionStorage.getItem(modalKey) === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60 * 1000);
    return () => clearInterval(id);
  }, []);

  if (!planInfo || !endsAt) return null;

  if (now >= endsAt) return null;

  const msLeft = endsAt - now;
  const daysLeft = Math.max(1, Math.ceil(msLeft / DAY_MS));

  const windowStart = endsAt - BEFORE_MS;
  const dismissedThisCycle =
    !!planInfo.renewalNoticeDismissedAt &&
    new Date(planInfo.renewalNoticeDismissedAt).getTime() >= windowStart;

  const showBanner = msLeft <= BEFORE_MS && !bannerHidden && !dismissedThisCycle;
  const showModal = msLeft <= MODAL_MS && !modalHidden;

  const handleDismissBanner = async () => {
    setBannerHidden(true);
    try {
      await dismissRenewalNotice();
      queryClient.invalidateQueries({ queryKey: ["currentUserPlan"] });
    } catch {
      setBannerHidden(false);
    }
  };

  const handleDismissModal = () => {
    setModalHidden(true);
    try {
      if (modalKey) sessionStorage.setItem(modalKey, "1");
    } catch {}
  };

  return (
    <>
      {showBanner && (
        <div className="renewal-banner">
          <span>
            {isTrial
              ? `Your Pro trial ends in ${daysLeft} day${daysLeft === 1 ? "" : "s"} — upgrade to keep unlimited event types and WhatsApp notify.`
              : `Your Pro subscription renews in ${daysLeft} day${daysLeft === 1 ? "" : "s"}${
                  amount ? ` — transfer ${amount}` : ""
                } to keep Pro.`}
          </span>
          <Link href="/dashboard/billing" className="renewal-banner-link">
            {isTrial ? "Upgrade" : "Renew"}
          </Link>
          <button
            onClick={handleDismissBanner}
            className="renewal-banner-close"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 className="modal-heading">
              {isTrial
                ? "Your Pro trial ends tomorrow"
                : "Your Pro subscription expires tomorrow"}
            </h2>
            <p className="modal-text">
              {isTrial
                ? "After tomorrow you'll drop to the free plan (1 event type, no WhatsApp notify)."
                : amount
                  ? `Renew now with ${amount} to keep unlimited event types and WhatsApp notify.`
                  : "Renew now to keep unlimited event types and WhatsApp notify."}
            </p>
            <div className="modal-actions">
              <button onClick={handleDismissModal} className="btn-secondary">
                Dismiss
              </button>
              <Link
                href="/dashboard/billing"
                className="btn-primary"
                onClick={handleDismissModal}
              >
                {isTrial ? "Upgrade now" : "Renew now"}
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
