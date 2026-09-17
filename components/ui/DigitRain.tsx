"use client";
import { useEffect, useRef } from "react";
import { useDigitRain } from "@/hooks/useDigitRain";

const CHARS = "01{}<>/;:01010101";
const FONT_SIZE = 16;

function isWeakEnvironment() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
  const nav = navigator as Navigator & { deviceMemory?: number };
  if (nav.deviceMemory && nav.deviceMemory <= 2) return true;
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) return true;
  return false;
}

export default function DigitRain() {
  const { enabled } = useDigitRain();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!enabled || isWeakEnvironment()) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    let accent = "#4ecdc4";
    const readAccent = () => {
      accent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || accent;
    };
    readAccent();

    let columns = 0;
    let drops: number[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      columns = Math.floor(canvas.width / FONT_SIZE);
      drops = Array.from({ length: columns }, () => Math.floor((Math.random() * canvas.height) / FONT_SIZE));
      readAccent();
    };
    resize();
    window.addEventListener("resize", resize);

    const observer = new MutationObserver(readAccent);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] });

    let rafId: number;
    const draw = () => {
      ctx.fillStyle = "rgba(0,0,0,0.06)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${FONT_SIZE}px "JetBrains Mono", monospace`;
      ctx.fillStyle = accent;

      for (let i = 0; i < drops.length; i++) {
        const char = CHARS[Math.floor(Math.random() * CHARS.length)];
        ctx.fillText(char, i * FONT_SIZE, drops[i] * FONT_SIZE);

        if (drops[i] * FONT_SIZE > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      rafId = requestAnimationFrame(draw);
    };
    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      observer.disconnect();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [enabled]);

  if (!enabled) return null;
  return <canvas ref={canvasRef} id="digit-rain-canvas" aria-hidden="true" />;
}
