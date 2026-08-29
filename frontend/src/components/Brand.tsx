import { Link } from "react-router-dom";

interface BrandProps {
  inverse?: boolean;
  compact?: boolean;
}

export default function Brand({ inverse = false, compact = false }: BrandProps) {
  return (
    <Link to="/" className="inline-flex items-center gap-2.5" data-testid="brand-home-link" aria-label="NoSpamHQ home">
      <span className="relative grid size-9 place-items-center overflow-hidden rounded-[9px] border border-[#0fb7b5]/50 bg-[#08243a]" data-testid="brand-mark">
        <svg viewBox="0 0 36 36" className="size-7" aria-hidden="true" fill="none">
          <path d="M8 12.5 18 20l10-7.5" stroke="#7ce7e0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="7" y="10" width="22" height="16" rx="3" stroke="#fff" strokeOpacity=".9" strokeWidth="1.6" />
          <path d="M6 29h24M11 30.5h14" stroke="#0fb7b5" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="27" cy="9" r="3" fill="#0fb7b5" stroke="#08243a" strokeWidth="1.5" />
        </svg>
      </span>
      {!compact && (
        <span className={`text-[17px] font-extrabold tracking-[-0.04em] ${inverse ? "text-white" : "text-[#061827]"}`} data-testid="brand-wordmark">
          No<span className="text-[#087f82]">Spam</span>HQ
        </span>
      )}
    </Link>
  );
}