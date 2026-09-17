// Fon uchun statik, dekorativ tex/kod mavzusidagi chiziqlar — juda xira,
// scroll bo'lganda ham joyidan qimirlamaydi (position:fixed), kontentga xalaqit bermaydi.
export default function BackgroundShapes() {
  return (
    <div className="bg-shapes" aria-hidden="true">
      <svg className="bg-shape bg-shape-circuit" viewBox="0 0 200 200" fill="none">
        <path
          d="M10 40 H70 L90 60 V110 L110 130 H190 M40 10 V70 L60 90 H130 M160 10 V50 L190 80"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <circle cx="10" cy="40" r="3" fill="currentColor" />
        <circle cx="90" cy="110" r="3" fill="currentColor" />
        <circle cx="190" cy="130" r="3" fill="currentColor" />
        <circle cx="40" cy="10" r="3" fill="currentColor" />
        <circle cx="130" cy="90" r="3" fill="currentColor" />
        <circle cx="190" cy="80" r="3" fill="currentColor" />
      </svg>

      <svg className="bg-shape bg-shape-brackets" viewBox="0 0 220 160" fill="none">
        <path
          d="M70 10 L20 80 L70 150"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M150 10 L200 80 L150 150"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M125 25 L95 135" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
}
