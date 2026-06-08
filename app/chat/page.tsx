"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLang } from "@/hooks/useLang";
import { locales, Locale } from "@/lib/i18n";
import { chatApi, UserMessage, AdminDirectMessage } from "@/services/api";
import { useTheme } from "next-themes";
import {
  Send, Loader2, RefreshCw, LogOut, ShieldCheck,
  MessageSquare, Sparkles, Sun, Moon, Monitor,
  ArrowLeft, Menu, X, Check, CheckCheck, Pencil,
} from "lucide-react";
import Link from "next/link";
import AuthModal from "@/components/chat/AuthModal";

type ConvItem =
  | (UserMessage & { kind: "user-msg" })
  | (AdminDirectMessage & { kind: "admin-direct" });

function buildTimeline(
  msgs: UserMessage[],
  adminMsgs: AdminDirectMessage[]
): ConvItem[] {
  const all: ConvItem[] = [
    ...msgs.map(m => ({ ...m, kind: "user-msg" as const })),
    ...adminMsgs.map(m => ({ ...m, kind: "admin-direct" as const })),
  ];
  return all.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

function fmt(d: string) {
  return new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatPage() {
  const { user, logout, loading } = useAuth();
  const { t, locale, setLocale } = useLang();
  const { theme, setTheme } = useTheme();
  const [msgs, setMsgs] = useState<UserMessage[]>([]);
  const [adminMsgs, setAdminMsgs] = useState<AdminDirectMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  const loadMessages = useCallback(async () => {
    if (!user) return;
    try {
      const data = await chatApi.getMessages();
      setMsgs(data.messages);
      setAdminMsgs(data.adminMessages);
    } catch { /* silent */ }
  }, [user]);

  useEffect(() => {
    if (user) { setFetching(true); loadMessages().finally(() => setFetching(false)); }
  }, [user, loadMessages]);

  useEffect(() => {
    if (!user) return;
    const timer = setInterval(loadMessages, 10000);
    return () => clearInterval(timer);
  }, [user, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, adminMsgs]);

  const cycleTheme = () => {
    const order = ["light", "dark", "system"];
    setTheme(order[(order.indexOf(theme || "system") + 1) % order.length]);
  };

  const ThemeIcon = () => {
    if (!mounted) return <span style={{ width: 15, height: 15, display: "inline-block" }} />;
    if (theme === "dark") return <Moon size={15} />;
    if (theme === "system") return <Monitor size={15} />;
    return <Sun size={15} />;
  };

  const sendMessage = async () => {
    if (!input.trim() || !user) return;
    setSending(true);
    try {
      const msg = await chatApi.sendMessage(input.trim());
      setMsgs(prev => [...prev, msg]);
      setInput("");
    } catch { alert(t.chat.send + " error"); } finally { setSending(false); }
  };

  const startEdit = (msg: UserMessage) => {
    setEditingId(msg.id);
    setEditValue(msg.content);
  };

  const saveEdit = async () => {
    if (!editingId || !editValue.trim()) return;
    try {
      const updated = await chatApi.editMessage(editingId, editValue.trim());
      setMsgs(prev => prev.map(m => m.id === editingId ? { ...m, ...updated } : m));
    } catch { /* silent */ } finally { setEditingId(null); }
  };

  const iconBtn: React.CSSProperties = {
    background: "var(--bg-secondary)", border: "1px solid var(--border)",
    color: "var(--text-muted)", borderRadius: 8, padding: "6px 10px",
    cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
    fontSize: "0.78rem", fontWeight: 500,
  };

  const timeline = buildTimeline(msgs, adminMsgs);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
        <Loader2 size={32} className="animate-spin" style={{ color: "var(--accent)" }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>

      {/* ── Navbar ── */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: "var(--bg-card)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1024, margin: "0 auto", padding: "0 20px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, borderRadius: 8, background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-muted)", textDecoration: "none" }}>
              <ArrowLeft size={15} />
            </Link>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: "var(--accent-dim)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <MessageSquare size={15} style={{ color: "var(--accent)" }} />
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: "0.92rem", color: "var(--text)", margin: 0, letterSpacing: "-0.02em" }}>{t.chat.title}</p>
                <p style={{ fontSize: "0.68rem", color: "var(--text-muted)", margin: 0, fontFamily: "JetBrains Mono, monospace" }}>
                  {user ? user.name : "sherzodxon.uz"}
                </p>
              </div>
            </div>
          </div>

          {/* Desktop controls */}
          <div className="nav-controls">
            <select value={locale} onChange={e => setLocale(e.target.value as Locale)} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 8, padding: "4px 10px", fontSize: "0.75rem", fontFamily: "JetBrains Mono,monospace", cursor: "pointer", outline: "none" }}>
              {locales.map(l => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}
            </select>
            <button onClick={cycleTheme} style={{ ...iconBtn, padding: 7 }}><ThemeIcon /></button>
            {user ? (
              <>
                {user.role === "ADMIN" && (
                  <Link href="/admin" style={{ ...iconBtn, background: "var(--accent-dim)", color: "var(--accent)", border: "1px solid var(--accent)", textDecoration: "none", padding: "6px 12px" }}>
                    <ShieldCheck size={13} /> {t.chat.admin_link}
                  </Link>
                )}
                <button onClick={loadMessages} style={iconBtn}><RefreshCw size={14} /></button>
                <button onClick={logout} style={iconBtn}><LogOut size={13} /> {t.chat.logout}</button>
              </>
            ) : (
              <button onClick={() => setShowAuth(true)} className="btn-primary" style={{ padding: "6px 16px", fontSize: "0.82rem" }}>
                {t.chat.sign_in_btn}
              </button>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className="nav-mobile-btn" onClick={() => setMobileMenu(!mobileMenu)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text)", padding: 4 }}>
            {mobileMenu ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenu && (
          <div className="nav-mobile-menu" style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border)", padding: "12px 20px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <select value={locale} onChange={e => setLocale(e.target.value as Locale)} style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 8, padding: "4px 10px", fontSize: "0.75rem", fontFamily: "JetBrains Mono,monospace", cursor: "pointer", outline: "none" }}>
                {locales.map(l => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}
              </select>
              <button onClick={cycleTheme} style={{ ...iconBtn, padding: 7 }}><ThemeIcon /></button>
              {user ? (
                <>
                  <button onClick={loadMessages} style={iconBtn}><RefreshCw size={13} /></button>
                  <button onClick={logout} style={iconBtn}><LogOut size={13} /> {t.chat.logout}</button>
                </>
              ) : (
                <button onClick={() => { setShowAuth(true); setMobileMenu(false); }} className="btn-primary" style={{ padding: "6px 16px", fontSize: "0.82rem" }}>{t.chat.sign_in_btn}</button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ── Messages ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px" }}>

        {/* Not logged in */}
        {!user && (
          <div style={{ maxWidth: 400, margin: "60px auto 0", textAlign: "center" }}>
            <div className="card" style={{ borderRadius: 24, padding: "40px 32px" }}>
              <div className="float" style={{ width: 72, height: 72, borderRadius: 20, margin: "0 auto 20px", background: "var(--accent-dim)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)" }}>
                <MessageSquare size={28} style={{ color: "var(--accent)" }} />
              </div>
              <h2 style={{ fontWeight: 700, fontSize: "1.15rem", color: "var(--text)", marginBottom: 8 }}>{t.chat.login_prompt}</h2>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.65, marginBottom: 24 }}>{t.chat.login_desc}</p>
              {[t.chat.feature_1, t.chat.feature_2, t.chat.feature_3].map((f, i, arr) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none" }}>
                  <Sparkles size={13} style={{ color: "var(--accent)", flexShrink: 0 }} />
                  <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", textAlign: "left" }}>{f}</span>
                </div>
              ))}
              <button onClick={() => setShowAuth(true)} className="btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 24, padding: "10px 20px" }}>
                {t.chat.sign_in_btn}
              </button>
            </div>
          </div>
        )}

        {/* Loading */}
        {user && fetching && (
          <div style={{ display: "flex", justifyContent: "center", paddingTop: 80 }}>
            <Loader2 size={24} className="animate-spin" style={{ color: "var(--accent)" }} />
          </div>
        )}

        {/* Empty */}
        {user && !fetching && timeline.length === 0 && (
          <div style={{ textAlign: "center", paddingTop: 80 }}>
            <div style={{ width: 60, height: 60, borderRadius: 18, margin: "0 auto 16px", background: "var(--accent-dim)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <MessageSquare size={22} style={{ color: "var(--accent)" }} />
            </div>
            <p style={{ fontSize: "0.92rem", fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>{t.chat.no_messages}</p>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{t.chat.no_messages_hint}</p>
          </div>
        )}

        {/* Timeline */}
        {user && !fetching && timeline.length > 0 && (
          <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 4 }}>

            {/* Separator */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0 16px" }}>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
              <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontFamily: "JetBrains Mono, monospace" }}>{t.chat.history}</span>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            </div>

            {timeline.map(item => {
              if (item.kind === "admin-direct") {
                // Admin tomondan mustaqil xabar — chap taraf
                return (
                  <div key={item.id} style={{ display: "flex", justifyContent: "flex-start", alignItems: "flex-end", gap: 8, marginBottom: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.62rem", color: "#fff", flexShrink: 0 }}>SY</div>
                    <div style={{ maxWidth: "72%", display: "flex", flexDirection: "column", gap: 3 }}>
                      <span style={{ fontSize: "0.65rem", color: "var(--accent)", fontWeight: 600, marginLeft: 2 }}>Sherzodxon</span>
                      <div className="chat-bubble-admin" style={{ fontSize: "0.9rem", lineHeight: 1.6 }}>{item.content}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: 2 }}>
                        <span style={{ fontSize: "0.6rem", color: "var(--text-muted)", fontFamily: "JetBrains Mono, monospace" }}>{fmt(item.createdAt)}</span>
                        {/* User o'qidimi? */}
                        {item.readAt
                          ? <CheckCheck size={11} style={{ color: "var(--accent)" }} />
                          : <Check size={11} style={{ color: "var(--text-muted)" }} />
                        }
                      </div>
                    </div>
                  </div>
                );
              }

              // User xabari — o'ng taraf
              const msg = item as UserMessage & { kind: "user-msg" };
              return (
                <div key={msg.id} style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 10 }}>
                  {/* User bubble */}
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <div style={{ maxWidth: "72%", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
                      {editingId === msg.id ? (
                        <div style={{ display: "flex", gap: 6, width: "100%" }}>
                          <input
                            autoFocus value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditingId(null); }}
                            style={{ flex: 1, padding: "8px 12px", borderRadius: 10, background: "var(--bg-secondary)", border: "1.5px solid var(--accent)", color: "var(--text)", fontSize: "0.88rem", outline: "none", fontFamily: "Sora, sans-serif" }}
                          />
                          <button onClick={saveEdit} style={{ background: "var(--accent)", border: "none", color: "#fff", borderRadius: 8, padding: "6px 10px", cursor: "pointer", display: "flex", alignItems: "center" }}><Check size={14} /></button>
                          <button onClick={() => setEditingId(null)} style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-muted)", borderRadius: 8, padding: "6px 10px", cursor: "pointer", display: "flex", alignItems: "center" }}><X size={14} /></button>
                        </div>
                      ) : (
                        <div
                          className="chat-bubble-user"
                          style={{ fontSize: "0.9rem", lineHeight: 1.6, position: "relative", cursor: "default" }}
                          onMouseEnter={e => { const btn = (e.currentTarget as HTMLElement).querySelector(".edit-btn") as HTMLElement; if (btn) btn.style.opacity = "1"; }}
                          onMouseLeave={e => { const btn = (e.currentTarget as HTMLElement).querySelector(".edit-btn") as HTMLElement; if (btn) btn.style.opacity = "0"; }}
                        >
                          {msg.content}
                          {msg.edited && <span style={{ fontSize: "0.6rem", opacity: 0.7, marginLeft: 6 }}>({t.chat.edited})</span>}
                          <button
                            className="edit-btn"
                            onClick={() => startEdit(msg)}
                            style={{ position: "absolute", top: -8, left: -8, background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-muted)", borderRadius: 6, padding: "3px 5px", cursor: "pointer", display: "flex", alignItems: "center", opacity: 0, transition: "opacity 0.15s", lineHeight: 0 }}
                          >
                            <Pencil size={11} />
                          </button>
                        </div>
                      )}

                      {/* Timestamp + o'qilgan belgisi */}
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ fontSize: "0.6rem", color: "var(--text-muted)", fontFamily: "JetBrains Mono, monospace" }}>{fmt(msg.createdAt)}</span>
                        {msg.readByAdmin
                          ? <CheckCheck size={11} style={{ color: "var(--accent)" }}  />
                          : <Check size={11} style={{ color: "var(--text-muted)" }}  />
                        }
                      </div>
                    </div>
                  </div>

                  {/* Admin reply — chap taraf */}
                  {msg.reply && (
                    <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "flex-end", gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.62rem", color: "#fff", flexShrink: 0 }}>SY</div>
                      <div style={{ maxWidth: "72%", display: "flex", flexDirection: "column", gap: 3 }}>
                        <span style={{ fontSize: "0.65rem", color: "var(--accent)", fontWeight: 600, marginLeft: 2 }}>Sherzodxon</span>
                        <div className="chat-bubble-admin" style={{ fontSize: "0.9rem", lineHeight: 1.6 }}>
                          {msg.reply}
                          {msg.replyEdited && <span style={{ fontSize: "0.6rem", color: "var(--text-muted)", marginLeft: 6 }}>({t.chat.edited})</span>}
                        </div>
                        <span style={{ fontSize: "0.6rem", color: "var(--text-muted)", fontFamily: "JetBrains Mono, monospace", marginLeft: 2 }}>{fmt(msg.replyAt!)}</span>
                      </div>
                    </div>
                  )}

                  {/* Awaiting */}
                  {!msg.reply && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: 36 }}>
                      <div style={{ display: "flex", gap: 3 }}>
                        {[0, 1, 2].map(i => (
                          <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--text-muted)", opacity: 0.5, animation: `chatBounce 1.2s ${i * 0.2}s ease-in-out infinite` }} />
                        ))}
                      </div>
                      <span style={{ fontSize: "0.67rem", color: "var(--text-muted)" }}>{t.chat.awaiting}</span>
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* ── Input ── */}
      {user && (
        <div style={{ position: "sticky", bottom: 0, background: "var(--bg-card)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderTop: "1px solid var(--border)", padding: "14px 20px" }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: "var(--accent-dim)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.72rem", color: "var(--accent)" }}>
                {user.name?.[0]?.toUpperCase() || "U"}
              </div>
              <input
                type="text" value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                placeholder={t.chat.placeholder}
                style={{ flex: 1, padding: "10px 16px", borderRadius: 12, background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text)", fontSize: "0.9rem", outline: "none", fontFamily: "Sora, sans-serif", transition: "border-color 0.2s" }}
                onFocus={e => (e.target.style.borderColor = "var(--accent)")}
                onBlur={e => (e.target.style.borderColor = "var(--border)")}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || sending}
                className="btn-primary"
                style={{ padding: "10px 18px", borderRadius: 12, flexShrink: 0, opacity: !input.trim() || sending ? 0.5 : 1, cursor: !input.trim() || sending ? "not-allowed" : "pointer" }}
              >
                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
            <p style={{ textAlign: "center", fontSize: "0.63rem", marginTop: 8, color: "var(--text-muted)", fontFamily: "JetBrains Mono, monospace" }}>
              {t.chat.auto_refresh}
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes chatBounce { 0%,100%{transform:translateY(0);opacity:0.4} 50%{transform:translateY(-5px);opacity:1} }
      `}</style>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}