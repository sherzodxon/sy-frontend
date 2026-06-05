"use client";
import { useEffect, useRef, CSSProperties } from "react";
interface Props { children: React.ReactNode; className?: string; style?: CSSProperties; delay?: number; direction?: "up"|"left"|"scale" }
export default function FadeIn({ children, className="", style, delay=0, direction="up" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const cls = direction==="left" ? "reveal-left" : direction==="scale" ? "reveal-scale" : "reveal";
    el.classList.add(cls);
    el.style.transitionDelay = delay + "s";
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("visible"); obs.disconnect(); } }, { threshold: 0.08 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay, direction]);
  return <div ref={ref} className={className} style={style}>{children}</div>;
}
