"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useCurrentUser, useUpdateUser } from "@/hooks/useUser";
import { deleteAccount as deleteAccountAction } from "@/app/actions/users";
import { getCurrentUserPlan } from "@/app/actions/admin";
import { signOut, changePassword } from "@/app/actions/auth";
import { effectiveTier } from "@/lib/plan";

const TIMEZONES = [
  // West Africa
  "Africa/Abidjan", "Africa/Accra", "Africa/Bamako", "Africa/Banjul", 
  "Africa/Bissau", "Africa/Conakry", "Africa/Dakar", "Africa/Freetown", 
  "Africa/Lome", "Africa/Monrovia", "Africa/Nouakchott", "Africa/Ouagadougou",
  "Africa/Sao_Tome",

  // Central Africa (WAT)
  "Africa/Lagos", "Africa/Porto-Novo", "Africa/Douala", "Africa/Bangui",
  "Africa/Ndjamena", "Africa/Brazzaville", "Africa/Kinshasa", "Africa/Malabo",
  "Africa/Libreville", "Africa/Niamey",

  // Southern Africa (CAT)
  "Africa/Maputo", "Africa/Gaborone", "Africa/Blantyre", "Africa/Lusaka",
  "Africa/Harare", "Africa/Johannesburg", "Africa/Maseru", "Africa/Mbabane",
  "Africa/Windhoek",

  // East Africa (EAT)
  "Africa/Nairobi", "Africa/Addis_Ababa", "Africa/Dar_es_Salaam", "Africa/Kampala",
  "Africa/Juba", "Africa/Khartoum", "Africa/Asmara", "Africa/Djibouti", "Africa/Mogadishu",

  // North Africa
  "Africa/Cairo", "Africa/Tripoli", "Africa/Tunis", "Africa/Algiers",
  "Africa/Casablanca", "Africa/El_Aaiun",

  // Indian Ocean
  "Indian/Antananarivo", "Indian/Comoro", "Indian/Mayotte", "Indian/Mauritius", "Indian/Reunion",

  // Cape Verde
  "Atlantic/Cape_Verde",

  // Americas
  "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "America/Anchorage", "Pacific/Honolulu", "America/Toronto", "America/Vancouver",

  // Europe
  "Europe/London", "Europe/Paris", "Europe/Berlin",

  // Asia/Pacific
  "Asia/Dubai", "Asia/Kolkata", "Asia/Singapore", "Asia/Tokyo",
  "Australia/Sydney", "Pacific/Auckland",
];

type Tab = "profile" | "booking" | "branding" | "account";

const ACCENT_PRESETS = [
  "#f5c518",
  "#e67e22",
  "#16a34a",
  "#2563eb",
  "#7c3aed",
  "#db2777",
  "#0f766e",
  "#b91c1c",
];

function SaveBtn({
  tabName,
  saving,
  savedTab,
  onSave,
}: {
  tabName: Tab;
  saving: boolean;
  savedTab: Tab | null;
  onSave: () => void;
}) {
  return (
    <button className="btn-primary" disabled={saving} onClick={onSave}>
      {saving ? (
        <span className="spinner" />
      ) : savedTab === tabName ? (
        <>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Saved
        </>
      ) : (
        "Save changes"
      )}
    </button>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { user, isLoading } = useCurrentUser();
  const updateUser = useUpdateUser();

  const { data: planInfo } = useQuery({
    queryKey: ["currentUserPlan"],
    queryFn: () => getCurrentUserPlan(),
  });

  const isPro = planInfo
    ? effectiveTier(planInfo.plan, planInfo.trialEndsAt) === "pro"
    : false;

  const [tab, setTab] = useState<Tab>("profile");
  const [prevUserKey, setPrevUserKey] = useState<string | null>(null);

  // Profile
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [timezone, setTimezone] = useState("Africa/Lagos");
  const [phone, setPhone] = useState("");

  // Branding
  const [logoUrl, setLogoUrl] = useState("");
  const [accentColor, setAccentColor] = useState("#f5c518");
  const [hideBranding, setHideBranding] = useState(false);

  // Booking
  const [bufferTime, setBufferTime] = useState(0);
  const [minNotice, setMinNotice] = useState(24);

  const [showDeleteAccount, setShowDeleteAccount] = useState(false);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [savedTab, setSavedTab] = useState<Tab | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSaved, setPwSaved] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);

  const userKey = user ? `${user.email}:${user.createdAt}` : null;
  if (user && userKey !== prevUserKey) {
    setPrevUserKey(userKey);
    setName(user.name || "");
    setBusinessName(user.businessName || "");
    setTimezone(user.timezone || "Africa/Lagos");
    setPhone(user.phone || "");
    setLogoUrl(user.logoUrl || "");
    setAccentColor(user.accentColor || "#f5c518");
    setHideBranding(!!user.hideBranding);
    setBufferTime(user.bufferTime || 0);
    setMinNotice(user.minNotice || 24);
  }

  const handleChangePassword = async () => {
    setPwSaving(true);
    setPwError("");
    setPwSaved(false);

    try {
      const res = await changePassword({
        currentPassword,
        newPassword,
      });
      if (res.error) {
        setPwError(res.error);
      } else {
        setCurrentPassword("");
        setNewPassword("");
        setPwSaved(true);
        setTimeout(() => setPwSaved(false), 2500);
      }
    } catch (err) {
      setPwError(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setPwSaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      if (tab === "profile") {
        await updateUser({
          name: name || undefined,
          businessName: businessName || undefined,
          timezone,
          phone: phone || undefined,
        });
      }

      if (tab === "booking") {
        await updateUser({
          bufferTime,
          minNotice,
        });
      }

      if (tab === "branding") {
        await updateUser({
          logoUrl: logoUrl || undefined,
          accentColor,
          hideBranding,
        });
      }

      setSavedTab(tab);
      setTimeout(() => setSavedTab(null), 2500);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return <div className="page">Loading...</div>;
  }

  return (
    <div className="page">
      <div className="header">
        <h1 className="heading">Settings</h1>
        <p className="subheading">Manage your account and booking preferences</p>
      </div>

      <div className="tabs">
        {(["profile", "booking", "branding", "account"] as Tab[]).map((t) => (
          <button key={t} className={`tab ${tab === t ? "tab-active" : ""}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="card">

        {/* PROFILE TAB */}
        {tab === "profile" && (
          <div className="form">
            <div className="field">
              <label className="label">Full name</label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Smith" />
            </div>
            <div className="field">
              <label className="label">Business name <span className="optional">(optional)</span></label>
              <input className="input" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="e.g. Jane Smith Coaching" />
              <p className="hint">Shown to clients on your booking page.</p>
            </div>
            <div className="field">
              <label className="label">Email</label>
              <input className="input input-disabled" value={user?.email || ""} disabled />
              <p className="hint">Email cannot be changed here. Contact support if needed.</p>
            </div>
            <div className="field">
              <label className="label">Timezone</label>
              <select className="input select" value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>{tz.replace(/_/g, " ")}</option>
                ))}
              </select>
              <p className="hint">All booking times will be shown in this timezone.</p>
            </div>
            <div className="field">
              <label className="label">WhatsApp number</label>
              <input
                className="input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08012345678"
              />
              <p className="hint">
                Used to send your clients{" "}
                {isPro ? (
                  "one-tap WhatsApp confirmations and reminders (Pro)."
                ) : (
                  <>
                    one-tap WhatsApp confirmations and reminders.{" "}
                    <Link href="/dashboard/billing" className="hint-link">
                      Pro feature — upgrade to use it.
                    </Link>
                  </>
                )}
              </p>
            </div>
            <div className="actions">
              <SaveBtn tabName="profile" saving={saving} savedTab={savedTab} onSave={handleSave} />
            </div>
          </div>
        )}

        {/* BOOKING TAB */}
        {tab === "booking" && (
          <div className="form">
            <div className="field">
              <label className="label">Booking links</label>
              <div className="link-row">
                <div className="link-display">
                  <span className="link-text">
                    Every event type has its own shareable booking link.
                  </span>
                </div>
                <Link
                  href="/dashboard/event-types"
                  className="btn-copy"
                  style={{ textDecoration: "none" }}
                >
                  Manage links
                </Link>
              </div>
              <p className="hint">
                Copy a link from the Event Types page and share it with clients.
              </p>
            </div>
            <div className="field">
              <label className="label">Buffer time between bookings</label>
              <div className="option-grid">
                {[0, 5, 10, 15, 30].map((b) => (
                  <button key={b} type="button" className={`option-btn ${bufferTime === b ? "option-active" : ""}`} onClick={() => setBufferTime(b)}>
                    {b === 0 ? "None" : `${b} min`}
                  </button>
                ))}
              </div>
              <p className="hint">Extra time added after each booking so you can prepare.</p>
            </div>
            <div className="field">
              <label className="label">Minimum booking notice</label>
              <div className="option-grid">
                {[1, 2, 4, 8, 24, 48].map((h) => (
                  <button key={h} type="button" className={`option-btn ${minNotice === h ? "option-active" : ""}`} onClick={() => setMinNotice(h)}>
                    {h < 24 ? `${h}h` : `${h / 24}d`}
                  </button>
                ))}
              </div>
              <p className="hint">How far in advance clients must book.</p>
            </div>
            <div className="actions">
              <SaveBtn tabName="booking" saving={saving} savedTab={savedTab} onSave={handleSave} />
            </div>
          </div>
        )}

        {/* BRANDING TAB */}
        {tab === "branding" &&
          (isPro ? (
            <div className="form">
              <div className="field">
                <label className="label">Logo URL</label>
                <input
                  className="input"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://example.com/logo.png"
                />
                <p className="hint">
                  Shown on your public booking pages. Leave blank to use the
                  Zest mark.
                </p>
                {logoUrl && (
                  <div className="logo-preview">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logoUrl} alt="Logo preview" style={{ maxWidth: 120, maxHeight: 48, objectFit: "contain" }} />
                  </div>
                )}
              </div>
              <div className="field">
                <label className="label">Accent color</label>
                <div className="swatches">
                  {ACCENT_PRESETS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`swatch ${accentColor.toLowerCase() === c ? "swatch-active" : ""}`}
                      style={{ background: c }}
                      onClick={() => setAccentColor(c)}
                      aria-label={c}
                    />
                  ))}
                </div>
                <input
                  className="input"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  placeholder="#f5c518"
                  style={{ maxWidth: 160 }}
                />
                <p className="hint">
                  Used for buttons and highlights on your public pages.
                </p>
              </div>
              <div className="field">
                <label className="toggle-row">
                  <input
                    type="checkbox"
                    className="toggle-checkbox"
                    checked={hideBranding}
                    onChange={(e) => setHideBranding(e.target.checked)}
                  />
                  <span className="toggle-track" />
                  <span className="toggle-label">
                    Hide &quot;Powered by Zest&quot; on my booking pages
                  </span>
                </label>
              </div>
              <div className="actions">
                <SaveBtn tabName="branding" saving={saving} savedTab={savedTab} onSave={handleSave} />
              </div>
            </div>
          ) : (
            <div className="form">
              <div className="empty">
                <span className="empty-icon">🎨</span>
                <h2 className="empty-heading">Custom branding is Pro</h2>
                <p className="empty-text">
                  Upload your logo, pick your accent color, and remove the
                  &quot;Powered by Zest&quot; badge on your booking pages.
                </p>
                <Link href="/dashboard/billing" className="btn-primary">
                  Upgrade to Pro
                </Link>
              </div>
            </div>
          ))}

        {/* ACCOUNT TAB */}
        {tab === "account" && (
          <div className="form">
            <div className="field">
              <label className="label">Email</label>
              <input className="input input-disabled" value={user?.email || ""} disabled />
            </div>
            <div className="field">
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                placeholder="Current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="field">
              <label className="label">New password</label>
              <input
                type="password"
                className="input"
                placeholder="At least 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={8}
              />
            </div>
            {pwError && <p className="error">{pwError}</p>}
            <div className="actions">
              <button
                className="btn-primary"
                disabled={pwSaving || !currentPassword || !newPassword}
                onClick={handleChangePassword}
              >
                {pwSaving ? (
                  <span className="spinner" />
                ) : pwSaved ? (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Saved
                  </>
                ) : (
                  "Change password"
                )}
              </button>
            </div>
            <div className="danger-zone" style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border)" }}>
              <div className="danger-zone-header">
                <p className="danger-zone-title">Danger zone</p>
                <p className="danger-zone-text">Deleting your account is permanent and cannot be undone. All your event types, bookings, and data will be removed.</p>
              </div>
              <button className="btn-danger-ghost" onClick={() => setShowDeleteAccount(true)}>Delete my account</button>
            </div>
          </div>
        )}
      </div>

      {showDeleteAccount && (
        <div className="modal-overlay" onClick={() => setShowDeleteAccount(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-heading">Delete your account?</h2>
            <p className="modal-text">This will permanently delete your account, all event types, and all bookings. This cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowDeleteAccount(false)}>Cancel</button>
              <button className="btn-danger" disabled={deleting} onClick={async () => {
                setDeleting(true);
                try {
                  await deleteAccountAction();
                  await signOut();
                  router.push("/");
                } catch {
                  alert("Failed to delete account");
                  setDeleting(false);
                  setShowDeleteAccount(false);
                }
              }}>
                {deleting ? <span className="spinner spinner-white" /> : "Yes, delete account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}