"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getUserProfile } from "@/app/actions/profile";
import BrandedHeader from "@/components/booking/BrandedHeader";

function parseSocialLinks(json: string | null): Record<string, string> {
  if (!json) return {};
  try {
    return JSON.parse(json);
  } catch {
    return {};
  }
}

function SocialLinks({ links }: { links: Record<string, string> }) {
  const entries = Object.entries(links).filter(([, v]) => v);
  if (entries.length === 0) return null;

  return (
    <div className="social-links">
      {entries.map(([platform, value]) => {
        let href = value;
        let label = platform;
        let icon = "\u{1F517}";

        if (platform === "twitter") {
          href = value.startsWith("http") ? value : "https://twitter.com/" + value.replace("@", "");
          label = value.startsWith("@") ? value : "@" + value;
          icon = "\u275C";
        } else if (platform === "instagram") {
          href = value.startsWith("http") ? value : "https://instagram.com/" + value.replace("@", "");
          label = value.startsWith("@") ? value : "@" + value;
          icon = "\u{1F4F8}";
        } else if (platform === "whatsapp") {
          const digits = value.replace(/[^0-9]/g, "");
          href = "https://wa.me/" + digits;
          label = value;
          icon = "\u{1F4AC}";
        }

        return (
          <a key={platform} href={href} target="_blank" rel="noopener noreferrer" className="social-link">
            <span className="social-icon">{icon}</span>
            <span>{label}</span>
          </a>
        );
      })}
    </div>
  );
}

function EventCard({ event, accentColor }: { event: { id: string; name: string; description: string | null; duration: number; slug: string }; accentColor?: string | null }) {
  return (
    <Link href={"/book/" + event.slug} className="event-card" style={accentColor ? { ["--card-accent"]: accentColor } as React.CSSProperties : undefined}>
      <div className="event-card-header">
        <div className="event-card-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>
        <div className="event-card-duration">{event.duration} min</div>
      </div>
      <h3 className="event-card-name">{event.name}</h3>
      {event.description && (
        <p className="event-card-desc">{event.description}</p>
      )}
      <div className="event-card-footer">
        <span className="event-card-book">
          Book now
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </span>
      </div>
    </Link>
  );
}

export default function ProfilePage() {
  const params = useParams();
  const profileSlug = params.profileSlug as string;

  const { data, isLoading } = useQuery({
    queryKey: ["profile", profileSlug],
    queryFn: () => getUserProfile(profileSlug),
  });

  if (isLoading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">Loading...</div>
        <style jsx>{`
          .profile-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #fffbf0; }
          .profile-loading { color: #7a7a60; font-size: 15px; }
        `}</style>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <div className="not-found">
            <span className="not-found-icon">�㓟</span>
            <h1>Business page not found</h1>
            <p>This business page doesn&apos;t exist or is no longer active.</p>
            <Link href="/" className="home-link">Go to Zest</Link>
          </div>
        </div>
        <style jsx>{`
          .profile-page { min-height: 100vh; background: #fffbf0; display: flex; align-items: center; justify-content: center; }
          .profile-container { max-width: 600px; margin: 0 auto; padding: 40px 24px; text-align: center; }
          .not-found-icon { font-size: 48px; display: block; margin-bottom: 16px; }
          .not-found h1 { font-family: var(--font-fraunces, 'Fraunces'), serif; font-size: 28px; color: #1a1a0f; margin: 0 0 12px; }
          .not-found p { color: #7a7a60; margin: 0 0 24px; font-size: 15px; }
          .home-link { display: inline-block; background: #f5c518; color: #1a1a0f; text-decoration: none; padding: 12px 24px; border-radius: 12px; font-weight: 500; transition: all 0.15s; }
          .home-link:hover { background: #e6b800; transform: translateY(-1px); }
        `}</style>
      </div>
    );
  }

  const { user, eventTypes } = data;
  const socialLinks = parseSocialLinks(user.socialLinks);
  const displayName = user.businessName || user.name || "Business";
  const accentColor = user.accentColor || "#f5c518";

  return (
    <div
      className="profile-page"
      style={{ ["--brand-accent"]: accentColor } as React.CSSProperties}
    >
      <div className="blob blob-1" />
      <div className="blob blob-2" />

      <div className="profile-container">
        <div className="profile-header">
          <BrandedHeader
            logoUrl={user.logoUrl}
            hideBranding={user.hideBranding}
          />
        </div>

        <div className="profile-hero">
          {user.coverImage ? (
            <div className="cover-image-wrap">
              <img src={user.coverImage} alt="" className="cover-image" />
              <div className="cover-overlay" />
            </div>
          ) : (
            <div className="cover-gradient" />
          )}

          <div className="profile-info">
            {user.logoUrl ? (
              <div className="profile-logo-wrap">
                <img src={user.logoUrl} alt="" className="profile-logo" />
              </div>
            ) : (
              <div className="profile-avatar">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}

            <h1 className="profile-name">{displayName}</h1>

            {user.bio && (
              <p className="profile-bio">{user.bio}</p>
            )}

            <div className="profile-meta">
              {user.website && (
                <a href={user.website.startsWith("http") ? user.website : "https://" + user.website} target="_blank" rel="noopener noreferrer" className="meta-link">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                  <span>{user.website.replace(/^https?:\/\//, "")}</span>
                </a>
              )}
              {user.phone && (
                <a href={"https://wa.me/" + user.phone.replace(/[^0-9]/g, "")} target="_blank" rel="noopener noreferrer" className="meta-link">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                  <span>WhatsApp</span>
                </a>
              )}
            </div>

            <SocialLinks links={socialLinks} />
          </div>
        </div>

        {eventTypes.length > 0 ? (
          <div className="services-section">
            <h2 className="services-title">Our Services</h2>
            <div className="services-grid">
              {eventTypes.map((event) => (
                <EventCard key={event.id} event={event} accentColor={accentColor} />
              ))}
            </div>
          </div>
        ) : (
          <div className="services-section">
            <div className="no-services">
              <p>No services available at the moment.</p>
            </div>
          </div>
        )}

        <footer className="profile-footer">
          <Link href="/" className="footer-powered">
            �㓟 Powered by Zest
          </Link>
        </footer>
      </div>

      <style jsx>{`
        .profile-page {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          background: #fffbf0;
          font-family: var(--font-dm-sans, 'DM Sans'), sans-serif;
        }

        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.3;
          pointer-events: none;
          z-index: 0;
        }

        .blob-1 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, #ffe566 0%, #ffb347 100%);
          top: -160px;
          right: -120px;
          animation: drift 8s ease-in-out infinite alternate;
        }

        .blob-2 {
          width: 380px;
          height: 380px;
          background: radial-gradient(circle, #d4f57a 0%, #a8e063 100%);
          bottom: -100px;
          left: -80px;
          animation: drift 10s ease-in-out infinite alternate-reverse;
        }

        @keyframes drift {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(20px, 15px) scale(1.04); }
        }

        .profile-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 24px;
          position: relative;
          z-index: 1;
        }

        .profile-header {
          margin-bottom: 32px;
        }

        .profile-hero {
          margin-bottom: 40px;
        }

        .cover-image-wrap {
          position: relative;
          width: 100%;
          height: 200px;
          border-radius: 24px;
          overflow: hidden;
          margin-bottom: -60px;
        }

        .cover-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .cover-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(255, 251, 240, 0.9) 0%, transparent 60%);
        }

        .cover-gradient {
          width: 100%;
          height: 200px;
          border-radius: 24px;
          background: linear-gradient(135deg, #f5c518 0%, #ffb347 50%, #d4f57a 100%);
          margin-bottom: -60px;
          opacity: 0.6;
        }

        .profile-info {
          text-align: center;
          position: relative;
          z-index: 1;
        }

        .profile-logo-wrap {
          display: inline-block;
          margin-bottom: 16px;
        }

        .profile-logo {
          width: 80px;
          height: 80px;
          border-radius: 20px;
          object-fit: contain;
          background: white;
          border: 3px solid white;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .profile-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: var(--brand-accent, #f5c518);
          color: #1a1a0f;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-fraunces, 'Fraunces'), serif;
          font-size: 32px;
          font-weight: 600;
          margin-bottom: 16px;
          border: 3px solid white;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .profile-name {
          font-family: var(--font-fraunces, 'Fraunces'), serif;
          font-size: 32px;
          font-weight: 600;
          color: #1a1a0f;
          margin: 0 0 12px;
          letter-spacing: -0.5px;
        }

        .profile-bio {
          font-size: 16px;
          color: #7a7a60;
          margin: 0 0 20px;
          max-width: 500px;
          margin-left: auto;
          margin-right: auto;
          line-height: 1.6;
        }

        .profile-meta {
          display: flex;
          justify-content: center;
          gap: 20px;
          flex-wrap: wrap;
          margin-bottom: 16px;
        }

        .meta-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          color: #7a7a60;
          text-decoration: none;
          transition: color 0.15s;
        }

        .meta-link:hover {
          color: var(--brand-accent, #c08b00);
        }

        .meta-link svg {
          color: var(--brand-accent, #c08b00);
        }

        .social-links {
          display: flex;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .social-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.7);
          border: 1.5px solid rgba(255, 220, 80, 0.25);
          border-radius: 12px;
          font-size: 13px;
          color: #3a3a28;
          text-decoration: none;
          transition: all 0.15s;
        }

        .social-link:hover {
          border-color: var(--brand-accent, #f5c518);
          background: rgba(255, 255, 255, 0.9);
          transform: translateY(-1px);
        }

        .social-icon {
          font-size: 15px;
        }

        .services-section {
          margin-bottom: 40px;
        }

        .services-title {
          font-family: var(--font-fraunces, 'Fraunces'), serif;
          font-size: 24px;
          font-weight: 600;
          color: #1a1a0f;
          margin: 0 0 24px;
          text-align: center;
        }

        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }

        .event-card {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(12px);
          border: 1.5px solid rgba(255, 220, 80, 0.25);
          border-radius: 20px;
          padding: 24px;
          text-decoration: none;
          color: inherit;
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: all 0.2s;
        }

        .event-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 36px rgba(180, 140, 0, 0.12);
          border-color: var(--card-accent, var(--brand-accent, #f5c518));
        }

        .event-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .event-card-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: rgba(245, 197, 24, 0.14);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--card-accent, var(--brand-accent, #c08b00));
        }

        .event-card-duration {
          font-size: 13px;
          font-weight: 500;
          color: #7a7a60;
          background: #f5f3e8;
          padding: 4px 10px;
          border-radius: 8px;
        }

        .event-card-name {
          font-family: var(--font-fraunces, 'Fraunces'), serif;
          font-size: 18px;
          font-weight: 600;
          color: #1a1a0f;
          margin: 0;
        }

        .event-card-desc {
          font-size: 14px;
          color: #7a7a60;
          margin: 0;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .event-card-footer {
          margin-top: auto;
          padding-top: 12px;
          border-top: 1px solid #f0ead8;
        }

        .event-card-book {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 14px;
          font-weight: 600;
          color: var(--card-accent, var(--brand-accent, #c08b00));
        }

        .no-services {
          text-align: center;
          padding: 40px;
          color: #7a7a60;
          font-size: 15px;
        }

        .no-services p {
          margin: 0;
        }

        .profile-footer {
          text-align: center;
          padding: 32px 0;
          border-top: 1px solid #f0ead8;
        }

        .footer-powered {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          color: #a0a080;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          text-decoration: none;
          transition: color 0.15s;
        }

        .footer-powered:hover {
          color: #7a7a60;
        }

        @media (max-width: 480px) {
          .profile-container { padding: 16px; }
          .profile-name { font-size: 26px; }
          .cover-image-wrap, .cover-gradient { height: 160px; border-radius: 16px; }
          .services-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
