"use client";
import { useEffect, useRef, useState } from "react";
interface Props { to: number; duration?: number; suffix?: string; label: string }
export default function Counter({ to, duration = 1800, suffix = "", label }: Props) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - start) / duration, 1);
          setVal(Math.floor(p * to));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [to, duration]);
  return (
    <div ref={ref} style={{ textAlign: "center" }}>
      <div className="counter-number">{val}{suffix}</div>
      <div style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginTop: 4 }}>{label}</div>
    </div>
  );
}
