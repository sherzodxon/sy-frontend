"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { X, Loader2, Mail, Lock, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLang } from "@/hooks/useLang";
import { authApi } from "@/services/api";
import styles from "./AuthModal.module.scss";

interface Props {
  onClose: () => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (cfg: object) => void;
          renderButton: (el: HTMLElement, opts: object) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export default function AuthModal({ onClose }: Props) {
  const { login, register } = useAuth();
  
  // TO'G'RILANDI: useLang dan 't' (tarjimalar) va 'locale' (joriy til kodi: "uz", "ru", "en") ajratib olindi
  const { t, locale } = useLang(); 
  
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [googleReady, setGoogleReady] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const handleGoogleResponse = useCallback(async (response: { credential: string }) => {
    setLoading(true);
    setError("");
    try {
      const { token } = await authApi.googleAuth(response.credential);
      localStorage.setItem("token", token);
      window.location.reload();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t.chat.modal_error);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 1-effekt: Google GSI script'ni yuklash
  useEffect(() => {
    if (!clientId) return;

    if (window.google) {
      queueMicrotask(() => setGoogleReady(true));
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(
      'script[src*="accounts.google.com/gsi/client"]'
    );
    if (existing) {
      existing.addEventListener("load", () => setGoogleReady(true));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setGoogleReady(true);
    document.body.appendChild(script);
  }, [clientId]);

  // 2-effekt: script tayyor + ref ulanganda button render qilish
useEffect(() => {
  if (!googleReady || !clientId || !googleBtnRef.current || !window.google?.accounts?.id) return;

  googleBtnRef.current.innerHTML = "";

  // locale o'zgaruvchisi aniq string ekanligini tekshiramiz
  // Agar obyekt bo'lsa string'ga o'giramiz yoki default 'uz' beramiz
  const currentLang = typeof locale === "string" ? locale : "uz";

  try {
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleGoogleResponse,
      auto_select: false,
    });

    window.google.accounts.id.renderButton(googleBtnRef.current, {
      theme: "outline",
      size: "large",
      width: 312,
      text: "signin_with",
      shape: "rectangular",
      locale: currentLang, // <-- TO'G'RILANDI: Sof string qiymat ketadi
    });
  } catch (err) {
    console.error("Google button render xatosi:", err);
  }
}, [googleReady, clientId, handleGoogleResponse, locale]);

  const submit = async () => {
    setError("");
    if (!email || !password) return setError(t.chat.modal_fill);
    if (mode === "register" && !name) return setError(t.chat.modal_name_req);
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t.chat.modal_error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={styles.overlay}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>
            {mode === "login" ? t.chat.modal_signin : t.chat.modal_create}
          </h2>
          <button onClick={onClose} className={styles.close}>
            <X size={18} />
          </button>
        </div>

        {/* Google Button Konteyneri */}
        {clientId && (
          <>
            <div
              ref={googleBtnRef}
              className={`${styles.googleButton} ${googleReady ? "" : styles.googleHidden}`}
            />
            
            {!googleReady && (
              <div className={styles.googleLoading}>
                <Loader2 size={14} className="animate-spin" />
                Google yuklanmoqda…
              </div>
            )}

            <div className={styles.divider}>
              <div className={styles.line} />
              <span className={styles.dividerText}>
                {t.chat.modal_or}
              </span>
              <div className={styles.line} />
            </div>
          </>
        )}

        {/* Tabs */}
        <div className={styles.tabs}>
          {(["login", "register"] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(""); }}
              className={`${styles.tab} ${mode === m ? styles.tabActive : ""}`}
            >
              {m === "login" ? t.chat.modal_signin : t.chat.modal_register}
            </button>
          ))}
        </div>

        {/* Fields */}
        <div className={styles.fields}>
          {mode === "register" && (
            <div className={styles.field}>
              <User size={14} className={styles.fieldIcon} />
              <input
                type="text"
                placeholder={t.chat.name}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={styles.input}
              />
            </div>
          )}
          <div className={styles.field}>
            <Mail size={14} className={styles.fieldIcon} />
            <input
              type="email"
              placeholder={t.chat.email}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
            />
          </div>
          <div className={styles.field}>
            <Lock size={14} className={styles.fieldIcon} />
            <input
              type="password"
              placeholder={t.chat.password}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              className={styles.input}
            />
          </div>
        </div>

        {error && (
          <p className={styles.error}>{error}</p>
        )}

        <button
          onClick={submit}
          disabled={loading}
          className={`btn-primary ${styles.submit}`}
        >
          {loading && <Loader2 size={15} className="animate-spin" />}
          {mode === "login" ? t.chat.modal_signin : t.chat.modal_create}
        </button>
      </div>
    </div>
  );
}
