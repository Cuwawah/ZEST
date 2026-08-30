import Link from "next/link";

type BrandedHeaderProps = {
  logoUrl?: string | null;
  hideBranding?: boolean;
  referralCode?: string | null;
};

export default function BrandedHeader({ logoUrl, hideBranding, referralCode }: BrandedHeaderProps) {
  const homeHref = referralCode ? `/?ref=${referralCode}` : "/";

  return (
    <div className="logo-wrap">
      <Link href={homeHref} className="logo-link">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="" className="logo-img" />
        ) : (
          <>
            <span className="logo-icon">🍋</span>
            <span className="logo-text">zest</span>
          </>
        )}
      </Link>

      {!hideBranding && (
        <Link href={homeHref} className="powered">
          🍋 Powered by Zest
        </Link>
      )}
    </div>
  );
}