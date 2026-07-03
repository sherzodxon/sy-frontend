"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { X, Loader2, Mail, Lock, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLang } from "@/hooks/useLang";
import { authApi } from "@/services/api";

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
      setGoogleReady(true);
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

  const inputStyle: React.CSSProperties = {
    background: "var(--bg-secondary)",
    border: "1px solid var(--border)",
    color: "var(--text)",
    padding: "10px 12px 10px 34px",
    margin: "0",
    caretColor: "var(--accent)",
    borderRadius: 12,
    width: "100%",
    fontSize: "16px",
    outline: "none",
    boxSizing: "border-box",
  };

  const iconStyle: React.CSSProperties = {
    position: "absolute",
    left: 11,
    top: "50%",
    transform: "translateY(-50%)",
    color: "var(--text-muted)",
    pointerEvents: "none",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-sm rounded-2xl shadow-2xl"
        style={{
          background: "var(--bg)",
          border: "1px solid var(--border)",
          padding: "24px",
          width: "100%",
          maxWidth: 360,
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ fontWeight: 700, fontSize: "1.05rem", color: "var(--text)", margin: 0 }}>
            {mode === "login" ? t.chat.modal_signin : t.chat.modal_create}
          </h2>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4, display: "flex", alignItems: "center", borderRadius: 8 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Google Button Konteyneri */}
        {clientId && (
          <>
            <div
              ref={googleBtnRef}
              style={{ 
                width: "100%", 
                minHeight: "44px", 
                display: googleReady ? "block" : "none",
                marginBottom: "12px" 
              }}
            />
            
            {!googleReady && (
              <div style={{
                height: 44, borderRadius: 12, background: "var(--bg-secondary)",
                border: "1px solid var(--border)", display: "flex",
                alignItems: "center", justifyContent: "center", gap: 8,
                fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: 12
              }}>
                <Loader2 size={14} className="animate-spin" />
                Google yuklanmoqda…
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "14px 0" }}>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
              <span style={{ fontSize: "0.72rem", fontFamily: "JetBrains Mono, monospace", color: "var(--text-muted)" }}>
                {t.chat.modal_or}
              </span>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            </div>
          </>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", borderRadius: 10, padding: 4, background: "var(--bg-secondary)", marginBottom: 16 }}>
          {(["login", "register"] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(""); }}
              style={{
                flex: 1,
                padding: "6px 0",
                fontSize: "0.82rem",
                fontWeight: 500,
                borderRadius: 7,
                cursor: "pointer",
                transition: "all 0.2s",
                background: mode === m ? "var(--bg-card)" : "transparent",
                color: mode === m ? "var(--accent)" : "var(--text-muted)",
                border: mode === m ? "1px solid var(--border)" : "none",
              }}
            >
              {m === "login" ? t.chat.modal_signin : t.chat.modal_register}
            </button>
          ))}
        </div>

        {/* Fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {mode === "register" && (
            <div style={{ position: "relative" }}>
              <User size={14} style={iconStyle} />
              <input
                type="text"
                placeholder={t.chat.name}
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={inputStyle}
              />
            </div>
          )}
          <div style={{ position: "relative" }}>
            <Mail size={14} style={iconStyle} />
            <input
              type="email"
              placeholder={t.chat.email}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={{ position: "relative" }}>
            <Lock size={14} style={iconStyle} />
            <input
              type="password"
              placeholder={t.chat.password}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              style={inputStyle}
            />
          </div>
        </div>

        {error && (
          <p style={{ fontSize: "0.78rem", color: "#ef4444", marginTop: 10, marginBottom: 0 }}>{error}</p>
        )}

        <button
          onClick={submit}
          disabled={loading}
          className="btn-primary"
          style={{ width: "100%", justifyContent: "center", marginTop: 14, padding: "10px 20px", opacity: loading ? 0.6 : 1, cursor: loading ? "not-allowed" : "pointer" }}
        >
          {loading && <Loader2 size={15} className="animate-spin" />}
          {mode === "login" ? t.chat.modal_signin : t.chat.modal_create}
        </button>
      </div>
    </div>
  );
}