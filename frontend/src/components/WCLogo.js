// WCLogo.js — Uses the official WC 2026 logo PNG uploaded by the user
// Place wc_logo.png in frontend/public/wc_logo.png

export default function WCLogo({ size = 80, showFifa = true, className = "" }) {
  return (
    <img
      src="/wc_logo.png"
      alt="FIFA World Cup 2026"
      width={size}
      height={size}
      className={className}
      style={{
        objectFit: "contain",
        display: "block",
        filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.4))",
      }}
    />
  );
}
