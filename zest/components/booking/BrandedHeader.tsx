import Link from "next/link";

type BrandedHeaderProps = {
  logoUrl?: string | null;
  hideBranding?: boolean;
};

export default function BrandedHeader({ logoUrl, hideBranding }: BrandedHeaderProps) {
  return (
    <Link href="/" className="logo-wrap">
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt="" className="logo-img" />
      ) : (
        <>
          <span className="logo-icon">🍋</span>
          <span className="logo-text">zest</span>
        </>
      )}

      {!hideBranding && (
        <span className="powered">Powered by Zest</span>
      )}
    </Link>
  );
}