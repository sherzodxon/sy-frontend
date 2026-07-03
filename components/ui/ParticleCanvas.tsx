"use client";
import { useEffect, useRef } from "react";

export default function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Sensorli (planshet/telefon) va zaif qurilmalarda butunlay ishga tushirmaymiz —
    // CustomCursor'da qanday qilingan bo'lsa xuddi shunday
    const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const isLowEndDevice =
      (navigator as any).deviceMemory && (navigator as any).deviceMemory <= 2;
    const hasFewCores =
      navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2;
    if (isCoarsePointer || isLowEndDevice || hasFewCores) return;

    const ctx = canvas.getContext("2d")!;

    // Accent rangini BIR MARTA o'qiymiz — resize va theme o'zgarganda yangilaymiz
    let accent = "#0a4d4a";
    const readAccent = () => {
      const v = getComputedStyle(document.documentElement)
        .getPropertyValue("--accent")
        .trim();
      accent = v || "#0a4d4a";
    };
    readAccent();

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // Resize bo'lganda accent ham yangilansin (theme o'zgarishi bilan bir vaqtda bo'lishi mumkin)
      readAccent();
    };
    resize();
    window.addEventListener("resize", resize);

    // Theme o'zgarganda accent rangini qayta o'qiymiz
    const observer = new MutationObserver(readAccent);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    // Zarrachalar soni 55 → 40 (vizual farq yo'q, lekin n² loop ancha yengillaydi)
    const PARTICLE_COUNT = 40;
    const CONNECT_DIST = 110;
    const CONNECT_DIST_SQ = CONNECT_DIST * CONNECT_DIST;
    const MOUSE_DIST = 120;
    const MOUSE_DIST_SQ = MOUSE_DIST * MOUSE_DIST;

    const particles: { x: number; y: number; vx: number; vy: number; r: number; a: number }[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 2 + 1,
        a: Math.random(),
      });
    }

    let mouseX = -999, mouseY = -999;
    const onMouse = (e: MouseEvent) => { mouseX = e.clientX; mouseY = e.clientY; };
    document.addEventListener("mousemove", onMouse);

    // Har bir zarracha uchun alpha hex-ini oldindan hisoblangan holda cache qilamiz
    const alphaCache = particles.map(p =>
      Math.floor(60 + p.a * 140).toString(16).padStart(2, "0")
    );

    let rafId: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Zarrachalarni yangilash va chizish
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Mouse itarishi — sqrt YO'Q, squared distance ishlatamiz
        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const distSq = dx * dx + dy * dy;
        if (distSq < MOUSE_DIST_SQ && distSq > 0) {
          const dist = Math.sqrt(distSq); // faqat kerak bo'lganda bir marta
          p.vx += (dx / dist) * 0.04;
          p.vy += (dy / dist) * 0.04;
        }

        // Tezlik chegarasi — sqrt YO'Q
        const speedSq = p.vx * p.vx + p.vy * p.vy;
        if (speedSq > 1.5 * 1.5) { p.vx *= 0.95; p.vy *= 0.95; }

        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = accent + alphaCache[i];
        ctx.fill();
      }

      // Yaqin zarrachalarni ulash — sqrt FAQAT kerak bo'lganda bir marta
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distSq = dx * dx + dy * dy;
          if (distSq < CONNECT_DIST_SQ) {
            const d = Math.sqrt(distSq); // bir marta
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            const alpha = Math.floor((1 - d / CONNECT_DIST) * 90)
              .toString(16)
              .padStart(2, "0");
            ctx.strokeStyle = accent + alpha;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      rafId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      document.removeEventListener("mousemove", onMouse);
      observer.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} id="particle-canvas" />;
}