"use client";
import { useEffect, useRef } from "react";

interface Props {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  stagger?: boolean;
  style?: React.CSSProperties;
}

export default function Reveal({ children, className = "", delay = 0, stagger = false, style }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const classes = stagger ? ["stagger"] : ["reveal"];
    el.classList.add(...classes);
    if (delay) el.style.transitionDelay = delay + "s";
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add("visible"); obs.disconnect(); } },
      { threshold: 0.07 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay, stagger]);
  return <div ref={ref} className={className} style={style}>{children}</div>;
}
