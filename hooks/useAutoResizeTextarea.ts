"use client";

import { useEffect, useRef } from "react";

// Matn maydonini kiritilgan kontent balandligiga qarab avtomatik kattalashtiradi.
// max-height CSS'da belgilanadi — undan oshsa textarea o'zi scroll bo'ladi (Telegram uslubida).
export function useAutoResizeTextarea(value: string) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return ref;
}
