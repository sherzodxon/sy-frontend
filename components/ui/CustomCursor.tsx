"use client";
import { useEffect, useRef } from "react";

const HOVER_SELECTORS =
  "a,button,.card,.social-icon,.skill-badge,.btn-primary,.btn-outline,.tag,.magnetic-wrap";

// Sensorli ekran, harakatni kamaytirish tanlangan yoki zaif qurilma (kam xotira/yadro) —
// ParticleCanvas'dagi bilan bir xil mezon, ikkalasi ham shu holatlarda o'chirilishi kerak.
function isWeakEnvironment() {
  if (window.matchMedia("(pointer: coarse)").matches) return true;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
  const nav = navigator as Navigator & { deviceMemory?: number };
  if (nav.deviceMemory && nav.deviceMemory <= 2) return true;
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) return true;
  return false;
}

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const ring = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (isWeakEnvironment()) return;

    // Custom cursor aktiv bo'lganda brauzerning o'z (native) kursorini yashiramiz —
    // aks holda ikkalasi bir vaqtda ko'rinib, chalkash bo'lib qolardi.
    document.body.classList.add("has-custom-cursor");

    let rafId: number;
    let stillFrames = 0;

    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      // left/top o'rniga CSS custom property + transform — bu faqat compositor
      // qatlamini yangilaydi, layout'ni qayta hisoblashga majbur qilmaydi.
      dotRef.current?.style.setProperty("--cx", `${e.clientX}px`);
      dotRef.current?.style.setProperty("--cy", `${e.clientY}px`);
      stillFrames = 0;
    };

    const animate = () => {
      const dx = pos.current.x - ring.current.x;
      const dy = pos.current.y - ring.current.y;

      // Ring maqsadga yetib olgan bo'lsa — hisoblashni to'xtatamiz (CPU tejash)
      if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) {
        stillFrames++;
        if (stillFrames > 10) {
          rafId = requestAnimationFrame(animate);
          return;
        }
      } else {
        stillFrames = 0;
      }

      ring.current.x += dx * 0.12;
      ring.current.y += dy * 0.12;

      ringRef.current?.style.setProperty("--rx", `${ring.current.x}px`);
      ringRef.current?.style.setProperty("--ry", `${ring.current.y}px`);

      rafId = requestAnimationFrame(animate);
    };

    const onEnter = () => {
      dotRef.current?.classList.add("hovered");
      ringRef.current?.classList.add("hovered");
    };
    const onLeave = () => {
      dotRef.current?.classList.remove("hovered");
      ringRef.current?.classList.remove("hovered");
    };

    // Hover elementlarini yig'amiz — cleanup uchun saqlash
    const hoverEls = Array.from(document.querySelectorAll(HOVER_SELECTORS));
    hoverEls.forEach((el) => {
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
    });

    document.addEventListener("mousemove", onMove);
    rafId = requestAnimationFrame(animate);

    return () => {
      document.body.classList.remove("has-custom-cursor");
      document.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafId);
      // Hover listenerlarini tozalaymiz — memory leak yo'q
      hoverEls.forEach((el) => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
      });
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
    </>
  );
}
