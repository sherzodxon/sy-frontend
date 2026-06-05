"use client";
import { useEffect, useState } from "react";
export default function ScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const fn = () => {
      const el = document.documentElement;
      setP(el.scrollHeight > el.clientHeight ? el.scrollTop / (el.scrollHeight - el.clientHeight) : 0);
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <div className="scroll-progress-bar" style={{ transform: `scaleX(${p})`, opacity: p > 0 ? 1 : 0 }} />
  );
}
