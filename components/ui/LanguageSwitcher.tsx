"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { locales, Locale } from "@/lib/i18n";
import FlagIcon from "./FlagIcons";
import styles from "./LanguageSwitcher.module.scss";

type Props = {
  variant?: "default" | "secondary";
};

export default function LanguageSwitcher({ variant = "default" }: Props) {
  const { locale, setLocale } = useLang();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const current = locales.find(item => item.code === locale) ?? locales[0];

  useEffect(() => {
    if (!open) return;

    const onOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  const select = (code: Locale) => {
    setLocale(code);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={styles.root}>
      <button
        type="button"
        className={`${styles.trigger} ${variant === "secondary" ? styles.secondary : ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(value => !value)}
      >
        <FlagIcon code={current.code} />
        <span>{current.label}</span>
        <ChevronDown size={12} className={styles.chevron} style={{ transform: open ? "rotate(180deg)" : "none" }} />
      </button>

      {open && (
        <ul className={`${styles.menu} ${variant === "secondary" ? styles.menuLeft : ""}`} role="listbox">
          {locales.map(item => (
            <li key={item.code}>
              <button
                type="button"
                role="option"
                aria-selected={item.code === locale}
                className={`${styles.option} ${item.code === locale ? styles.optionActive : ""}`}
                onClick={() => select(item.code)}
              >
                <FlagIcon code={item.code} />
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
