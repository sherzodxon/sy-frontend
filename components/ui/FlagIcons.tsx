import { Locale } from "@/lib/i18n";

// Emoji bayroqlar o'rniga inline SVG — OS/brauzer shriftiga bog'liq emas,
// har doim bir xil ko'rinadi (Windows va h.k.da emoji bayroq ko'rinmasligi mumkin edi).
const FLAGS: Record<Locale, React.ReactNode> = {
  en: (
    <svg viewBox="0 0 20 14" width="20" height="14" aria-hidden="true">
      <rect width="20" height="14" fill="#fff" />
      <g fill="#B22234">
        <rect y="0" width="20" height="1.08" />
        <rect y="2.15" width="20" height="1.08" />
        <rect y="4.3" width="20" height="1.08" />
        <rect y="6.46" width="20" height="1.08" />
        <rect y="8.61" width="20" height="1.08" />
        <rect y="10.77" width="20" height="1.08" />
        <rect y="12.92" width="20" height="1.08" />
      </g>
      <rect width="8.6" height="7.54" fill="#3C3B6E" />
    </svg>
  ),
  uz: (
    <svg viewBox="0 0 20 14" width="20" height="14" aria-hidden="true">
      <rect width="20" height="14" fill="#fff" />
      <rect y="0" width="20" height="4" fill="#0099B5" />
      <rect y="4" width="20" height="0.6" fill="#CE1126" />
      <rect y="9.4" width="20" height="0.6" fill="#CE1126" />
      <rect y="10" width="20" height="4" fill="#1EB53A" />
      <circle cx="3.3" cy="2" r="1.3" fill="#fff" />
      <circle cx="3.85" cy="1.65" r="1.1" fill="#0099B5" />
      <circle cx="5.1" cy="0.9" r="0.28" fill="#fff" />
      <circle cx="6" cy="1.35" r="0.28" fill="#fff" />
      <circle cx="6.6" cy="2" r="0.28" fill="#fff" />
    </svg>
  ),
  ru: (
    <svg viewBox="0 0 20 14" width="20" height="14" aria-hidden="true">
      <rect width="20" height="4.67" y="0" fill="#fff" />
      <rect width="20" height="4.67" y="4.67" fill="#0039A6" />
      <rect width="20" height="4.67" y="9.33" fill="#D52B1E" />
    </svg>
  ),
};

export default function FlagIcon({ code }: { code: Locale }) {
  return <span style={{ display: "inline-flex", borderRadius: 2, overflow: "hidden", flexShrink: 0 }}>{FLAGS[code]}</span>;
}
