"use client";
import { useEffect, useRef } from "react";

const HOVER_SELECTORS =
  "a,button,.card,.social-icon,.skill-badge,.btn-primary,.btn-outline,.tag,.magnetic-wrap";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const ring = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Faqat desktop qurilmalarida cursor aktiv bo'lsin
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let rafId: number;
    let isMoving = false;
    let stillFrames = 0;

    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current) {
        dotRef.current.style.left = e.clientX + "px";
        dotRef.current.style.top = e.clientY + "px";
      }
      isMoving = true;
      stillFrames = 0;
    };

    const animate = () => {
      const dx = pos.current.x - ring.current.x;
      const dy = pos.current.y - ring.current.y;

      // Ring maqsadga yetib olgan bo'lsa — rAF ni to'xtatamiz (CPU tejash)
      if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) {
        stillFrames++;
        if (stillFrames > 10) {
          // Ring to'liq to'xtadi, keyingi mousemove ga qadar kutamiz
          isMoving = false;
          rafId = requestAnimationFrame(animate); // tekshirishni davom ettir (past narx)
          return;
        }
      } else {
        stillFrames = 0;
      }

      ring.current.x += dx * 0.12;
      ring.current.y += dy * 0.12;

      if (ringRef.current) {
        ringRef.current.style.left = ring.current.x + "px";
        ringRef.current.style.top = ring.current.y + "px";
      }

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