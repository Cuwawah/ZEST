"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCurrentUserPlan, getBillingDetails } from "@/app/actions/admin";
import { checkKudaPayment } from "@/app/actions/payments";
import {
  accountStatus,
  daysLeft,
  isPaid,
  formatPaymentAmount,
  PRICE,
  PRICE_LABEL,
} from "@/lib/plan";

export default function BillingPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [feedback, setFeedback] = useState("");

  const { data: planInfo } = useQuery({
    queryKey: ["currentUserPlan"],
    queryFn: () => getCurrentUserPlan(),
    refetchInterval: 30000,
  });

  const { data: billing } = useQuery({
    queryKey: ["billingDetails"],
    queryFn: () => getBillingDetails(),
  });

  const status = planInfo
    ? accountStatus(planInfo.plan, planInfo.trialEndsAt)
    : null;
  const trialDays = planInfo ? daysLeft(planInfo.trialEndsAt) : 0;
  const paid = planInfo ? isPaid(planInfo.plan, planInfo.trialEndsAt) : false;
  const accountNumber = billing?.accountNumber || "";

  const copyNumber = () => {
    if (!accountNumber) return;
    navigator.clipboard.writeText(accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const paymentAmount = formatPaymentAmount(planInfo?.paymentAmountKobo);

  const copyAmount = () => {
    if (!planInfo?.paymentAmountKobo) return;
    navigator.clipboard.writeText(
      formatPaymentAmount(planInfo.paymentAmountKobo).replace("₦", "")
    );
    setCopiedAmount(true);
    setTimeout(() => setCopiedAmount(false), 2000);
  };

  const checkMutation = useMutation({
    mutationFn: () => checkKudaPayment(),
    onSuccess: async (res) => {
      if (!res.ok) {
        setFeedback(res.error || "Payment check failed. Try again.");
        return;
      }
      await queryClient.invalidateQueries({ queryKey: ["currentUserPlan"] });
      const fresh = await getCurrentUserPlan();
      if (fresh && isPaid(fresh.plan, fresh.trialEndsAt)) {
        router.push("/dashboard");
        router.refresh();
        return;
      }
      if (res.status === "manual_review") {
        setFeedback(
          "We found a transfer but couldn't match it to your account. Contact support (cuwawah@gmail.com) to complete your activation."
        );
        return;
      }
      setFeedback(
        "We couldn't find your payment yet. Payments are checked automatically every ~90 seconds — wait a moment and check again."
      );
    },
    onError: () => {
      setFeedback("Payment check failed. Try again.");
    },
  });

  return (
    <div className="page">
      <div className="billing-card">
        <div className="logo-row">
          <span className="logo-icon">🍋</span>
          <span className="logo-text">zest</span>
        </div>

        <h1 className="heading">
          {status === "active" && paid
            ? "You're all set"
            : status === "trial"
              ? "You're on the Pro trial"
              : status === "active"
                ? "Upgrade to Pro"
                : "Renew your subscription"}
        </h1>

        <p className="subheading">
          {status === "active" && paid
            ? "Your subscription is active. Have a great day booking!"
            : status === "trial"
              ? `${trialDays} day${trialDays === 1 ? "" : "s"} left on your Pro trial — upgrade to keep unlimited event types.`
              : status === "active"
                ? "The free plan includes 1 event type. Upgrade to unlock unlimited event types, custom branding and WhatsApp notify."
                : "Your account is inactive. Renew to keep accepting bookings."}
        </p>

        <div className="amount-row">
          <span className="amount">
            {planInfo?.paymentAmountKobo ? paymentAmount : billing?.priceLabel || PRICE_LABEL}
          </span>
        </div>
        <p className="amount-hint">
          Transfer exactly this amount — it&apos;s a unique verification
          amount (Pro is {PRICE_LABEL}) so we can match your payment
          automatically.
        </p>

        <div className="no-card">
          No card required · No auto-deduction · Pay by bank transfer — your
          account activates automatically.
        </div>

        <div className="account-box">
          <div className="account-line">
            <span className="account-label">Bank</span>
            <span className="account-value">{billing?.bankName || "—"}</span>
          </div>
          <div className="account-line">
            <span className="account-label">Account name</span>
            <span className="account-value">{billing?.accountName || "—"}</span>
          </div>
          <div className="account-line">
            <span className="account-label">Account number</span>
            <span className="account-number-row">
              <span className="account-value number">
                {accountNumber || "—"}
              </span>
              {accountNumber && (
                <button className="copy-btn" onClick={copyNumber}>
                  {copied ? "Copied" : "Copy"}
                </button>
              )}
            </span>
          </div>
          <div className="account-line">
            <span className="account-label">Amount to send</span>
            <span className="account-number-row">
              <span className="account-value amount-value">
                {planInfo?.paymentAmountKobo ? paymentAmount : "—"}
              </span>
              {planInfo?.paymentAmountKobo && (
                <button className="copy-btn" onClick={copyAmount}>
                  {copiedAmount ? "Copied" : "Copy"}
                </button>
              )}
            </span>
          </div>
          <div className="account-line">
            <span className="account-label">Pro plan</span>
            <span className="account-value">{billing?.price || PRICE}</span>
          </div>
        </div>

        <div className="narration-box">
          <span className="narration-label">Payment reference (optional)</span>
          <span className="narration-value">
            {planInfo?.paymentRef || "ZEST-XXXX"}
          </span>
          <span className="narration-hint">
            No need to add a narration — we match your payment by the exact
            amount above. Include this reference only if your bank requires a
            narration.
          </span>
        </div>

        {!paid && (
          <button
            className="check-btn"
            onClick={() => checkMutation.mutate()}
            disabled={checkMutation.isPending}
          >
            {checkMutation.isPending ? (
              <span className="spinner" />
            ) : (
              "I've paid — check my payment"
            )}
          </button>
        )}

        <p className="waiting">
          {!paid
            ? "We check for incoming transfers automatically every ~90 seconds — no need to keep checking."
            : "Payment confirmed. Welcome to Pro!"}
        </p>

        {feedback && <p className="feedback">{feedback}</p>}

        {paid && (
          <Link href="/dashboard" className="back-link">
            Back to dashboard
          </Link>
        )}

        <p className="help">
          Need help?{" "}
          <a href="mailto:cuwawah@gmail.com" className="help-link">
            Contact support
          </a>
        </p>
      </div>

      <style jsx>{`
        .page {
          max-width: 560px;
          margin: 0 auto;
        }

        .billing-card {
          background: #ffffff;
          border: 1.5px solid #e8e4cc;
          border-radius: 20px;
          padding: 40px 36px;
          box-shadow: 0 8px 40px rgba(180, 140, 0, 0.08);
        }

        .logo-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 28px;
        }

        .logo-icon {
          font-size: 26px;
          line-height: 1;
        }

        .logo-text {
          font-family: "Fraunces", serif;
          font-size: 24px;
          font-weight: 600;
          color: #1a1a0f;
          letter-spacing: -0.5px;
        }

        .heading {
          font-family: "Fraunces", serif;
          font-size: 26px;
          font-weight: 600;
          color: #1a1a0f;
          margin: 0 0 6px;
          letter-spacing: -0.4px;
        }

        .subheading {
          font-size: 14px;
          color: #7a7a60;
          margin: 0 0 24px;
          line-height: 1.6;
        }

        .amount-row {
          display: flex;
          justify-content: center;
          margin-bottom: 24px;
        }

        .amount-hint {
          text-align: center;
          font-size: 12.5px;
          color: #7a7a60;
          margin: -14px 0 20px;
          line-height: 1.6;
        }

        .amount-value {
          font-family: "Fraunces", serif;
          font-size: 18px;
        }

        .amount {
          font-family: "Fraunces", serif;
          font-size: 22px;
          font-weight: 600;
          color: #1a1a0f;
          background: #fef9c3;
          padding: 8px 20px;
          border-radius: 12px;
        }

        .no-card {
          text-align: center;
          font-size: 12.5px;
          color: #7a7a60;
          margin: 0 0 20px;
          line-height: 1.6;
        }

        .account-box {
          border: 1.5px solid #e8e4cc;
          border-radius: 14px;
          padding: 6px 18px;
          margin-bottom: 16px;
        }

        .account-line {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          padding: 12px 0;
          border-bottom: 1.5px dashed #f0ead8;
        }

        .account-line:last-child {
          border-bottom: none;
        }

        .account-label {
          font-size: 13px;
          color: #7a7a60;
        }

        .account-value {
          font-size: 14px;
          font-weight: 600;
          color: #1a1a0f;
          text-align: right;
        }

        .account-number-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .number {
          font-family: "Fraunces", serif;
          font-size: 18px;
          letter-spacing: 1px;
        }

        .copy-btn {
          background: none;
          border: 1px solid #e8e4cc;
          border-radius: 8px;
          padding: 4px 10px;
          font-size: 12px;
          font-weight: 600;
          font-family: "DM Sans", sans-serif;
          color: #c08b00;
          cursor: pointer;
          transition: background 0.15s;
        }

        .copy-btn:hover {
          background: #fef9c3;
        }

        .narration-box {
          background: #fdfcf5;
          border: 1px solid #e8e4cc;
          border-radius: 14px;
          padding: 16px 18px;
          margin-bottom: 24px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .narration-label {
          font-size: 12px;
          color: #7a7a60;
        }

        .narration-value {
          font-size: 16px;
          font-weight: 700;
          color: #1a1a0f;
          letter-spacing: 0.4px;
        }

        .narration-hint {
          font-size: 12px;
          color: #a0a080;
          line-height: 1.5;
        }

        .check-btn {
          width: 100%;
          background: #f5c518;
          color: #1a1a0f;
          border: none;
          border-radius: 12px;
          padding: 14px;
          font-size: 15px;
          font-weight: 600;
          font-family: "DM Sans", sans-serif;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 48px;
          transition: background 0.15s;
        }

        .check-btn:hover:not(:disabled) {
          background: #e6b800;
        }

        .check-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinner {
          width: 18px;
          height: 18px;
          border: 2.5px solid rgba(26, 26, 15, 0.2);
          border-top-color: #1a1a0f;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .feedback {
          margin: 16px 0 0;
          background: #fff3f0;
          border: 1px solid #ffc5bb;
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 13.5px;
          color: #c0391b;
        }

        .waiting {
          margin: 14px 0 0;
          text-align: center;
          font-size: 12.5px;
          color: #7a7a60;
          line-height: 1.6;
        }

        .back-link {
          display: block;
          text-align: center;
          margin: 18px 0 0;
          color: #c08b00;
          font-weight: 500;
          text-decoration: none;
        }

        .back-link:hover {
          text-decoration: underline;
        }

        .help {
          margin: 24px 0 0;
          text-align: center;
          font-size: 12.5px;
          color: #a0a080;
        }

        .help-link {
          color: #c08b00;
          font-weight: 500;
          text-decoration: none;
        }
      `}</style>
    </div>
  );
}