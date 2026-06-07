"use client";
import { useEffect } from "react";

export default function Cursor() {
  useEffect(() => {
    const dot = document.getElementById("cursor-dot");
    const ring = document.getElementById("cursor-ring");
    if (!dot || !ring) return;

    // Faqat desktop qurilmalarida aktiv bo'lsin
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let mx = 0, my = 0, rx = 0, ry = 0;
    let raf: number;
    let stillFrames = 0;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const animate = () => {
      const dx = mx - rx;
      const dy = my - ry;

      // Ring to'xtagan bo'lsa CPU tejash uchun loop saqlash lekin hisob yo'q
      if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) {
        stillFrames++;
        if (stillFrames > 10) {
          raf = requestAnimationFrame(animate);
          return;
        }
      } else {
        stillFrames = 0;
      }

      rx = lerp(rx, mx, 0.12);
      ry = lerp(ry, my, 0.12);
      ring.style.left = rx + "px";
      ring.style.top = ry + "px";
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    const onMove = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + "px";
      dot.style.top = my + "px";
    };

    const onEnter = () => document.body.classList.add("cursor-hover");
    const onLeave = () => document.body.classList.remove("cursor-hover");

    // Hover elementlarini saqlaymiz — cleanup uchun
    const hoverEls = Array.from(document.querySelectorAll("a,button,[data-hover]"));
    hoverEls.forEach((el) => {
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
    });

    window.addEventListener("mousemove", onMove);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      // Hover listenerlarini tozalaymiz
      hoverEls.forEach((el) => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
      });
    };
  }, []);

  return (
    <>
      <div id="cursor-dot" />
      <div id="cursor-ring" />
    </>
  );
}