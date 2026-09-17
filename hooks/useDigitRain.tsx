"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

const STORAGE_KEY = "digitRain";

interface DigitRainContextType {
  enabled: boolean;
  toggle: () => void;
}

const DigitRainContext = createContext<DigitRainContextType | null>(null);

export function DigitRainProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(localStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  const toggle = () => {
    setEnabled(value => {
      const next = !value;
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  };

  return <DigitRainContext.Provider value={{ enabled, toggle }}>{children}</DigitRainContext.Provider>;
}

export function useDigitRain() {
  const ctx = useContext(DigitRainContext);
  if (!ctx) throw new Error("useDigitRain must be used within DigitRainProvider");
  return ctx;
}
