"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Loader2, Lock, ShieldCheck, RefreshCw, LogOut, ArrowRight,
  Send, Check, CheckCheck, Search, MessageSquare, Users, ArrowLeft,
} from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { chatApi, AdminUser, UserMessage, AdminDirectMessage } from "@/services/api";

type ConvItem =
  | (UserMessage & { kind: "user-msg" })
  | (AdminDirectMessage & { kind: "admin-direct" });

const STORAGE_KEY = "admin_token";

function fmt(d: string) {
  const date = new Date(d);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  return isToday
    ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : date.toLocaleDateString([], { day: "2-digit", month: "short" });
}

function fmtFull(d: string) {
  return new Date(d).toLocaleString([], {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

function buildTimeline(msgs: UserMessage[], adminMsgs: AdminDirectMessage[]): ConvItem[] {
  const all: ConvItem[] = [
    ...msgs.map(m => ({ ...m, kind: "user-msg" as const })),
    ...adminMsgs.map(m => ({ ...m, kind: "admin-direct" as const })),
  ];
  return all.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export default function AdminPage() {
  const { t } = useLang();
  const at = t.admin;

  const [token, setToken] = useState<string | null>(null);
  const [pwd, setPwd] = useState("");
  const [pwdErr, setPwdErr] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [userMsgs, setUserMsgs] = useState<UserMessage[]>([]);
  const [adminMsgs, setAdminMsgs] = useState<AdminDirectMessage[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const [mobileView, setMobileView] = useState<"list" | "chat">("list");

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(0);

  // ── Auth ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) setToken(saved);
  }, []);

  useEffect(() => { if (token) loadUsers(); }, [token]);

  // Yangi xabar kelganda pastga scroll — silent refresh paytida scroll pozitsiyasini buzmaslik uchun
  useEffect(() => {
    const total = userMsgs.length + adminMsgs.length;
    if (total > prevCountRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevCountRef.current = total;
  }, [userMsgs, adminMsgs]);

  useEffect(() => {
    const handleResize = () => {
      if (mobileView === "chat") {
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      }
    };
    if (typeof window !== "undefined" && "visualViewport" in window) {
      window.visualViewport?.addEventListener("resize", handleResize);
      return () => window.visualViewport?.removeEventListener("resize", handleResize);
    }
  }, [mobileView]);

  const handleLogin = async () => {
    if (!pwd.trim()) return;
    setPwdLoading(true); setPwdErr("");
    try {
      const BASE = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${BASE}/auth/admin-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pwd }),
      });
      const data = await res.json();
      if (!res.ok) { setPwdErr(data.message || "Noto'g'ri parol"); return; }
      sessionStorage.setItem(STORAGE_KEY, data.token);
      setToken(data.token);
    } catch { setPwdErr("Server bilan bog'lanishda xato"); }
    finally { setPwdLoading(false); }
  };

  // ── Data ──────────────────────────────────────────────────────────────────

  const loadUsers = useCallback(async () => {
    if (!token) return;
    setLoadingUsers(true);
    try {
      const data = await chatApi.adminGetUsers(token);
      setUsers(data);
    } catch { /* silent */ } finally { setLoadingUsers(false); }
  }, [token]);

  const loadConversation = useCallback(async (user: AdminUser) => {
    if (!token) return;
    setSelectedUser(user);
    setLoadingMsgs(true);
    setUserMsgs([]);
    setAdminMsgs([]);
    setMobileView("chat");
    prevCountRef.current = 0;
    try {
      const data = await chatApi.adminGetConversation(user.id, token);
      setUserMsgs(data.messages);
      setAdminMsgs(data.adminMessages);
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, unreadCount: 0 } : u));
    } catch { /* silent */ } finally { setLoadingMsgs(false); }
  }, [token]);

  // Fon rejimida (loading ko'rsatmasdan) joriy suhbatni yangilash
  const loadConversationSilent = useCallback(async (userId: string) => {
    if (!token) return;
    try {
      const data = await chatApi.adminGetConversation(userId, token);
      setUserMsgs(data.messages);
      setAdminMsgs(data.adminMessages);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, unreadCount: 0 } : u));
    } catch { /* silent */ }
  }, [token]);

  // Sidebar — har 10 sekundda foydalanuvchilar ro'yxati va unread hisoblarini yangilash
  useEffect(() => {
    if (!token) return;
    const timer = setInterval(loadUsers, 10000);
    return () => clearInterval(timer);
  }, [token, loadUsers]);

  // Suhbat oynasi — har 10 sekundda yangi xabarlarni jim (silent) yuklash
  useEffect(() => {
    if (!token || !selectedUser) return;
    const timer = setInterval(() => loadConversationSilent(selectedUser.id), 10000);
    return () => clearInterval(timer);
  }, [token, selectedUser, loadConversationSilent]);

  const handleBack = () => {
    setMobileView("list");
    setSelectedUser(null);
    setUserMsgs([]);
    setAdminMsgs([]);
    prevCountRef.current = 0;
  };

  // ── Send — faqat adminMessage ─────────────────────────────────────────────

  const sendMessage = async () => {
    if (!input.trim() || !selectedUser || !token || sending) return;
    setSending(true);
    try {
      const msg = await chatApi.adminSendMessage(selectedUser.id, input.trim(), token);
      setAdminMsgs(prev => [...prev, msg]);
      setInput("");
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch { /* silent */ } finally { setSending(false); }
  };

  // ── Derived ───────────────────────────────────────────────────────────────

  const timeline = buildTimeline(userMsgs, adminMsgs);
  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );
  const totalUnread = users.reduce((s, u) => s + u.unreadCount, 0);

  // ── Login screen ──────────────────────────────────────────────────────────

  if (!token) {
    return (
      <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", padding: "20px 16px" }}>
        <div style={{ width: "100%", maxWidth: 400 }}>
          <div className="card" style={{ borderRadius: 24, overflow: "hidden" }}>
            <div style={{ padding: "28px 28px 24px", background: "linear-gradient(135deg, var(--accent-dim), transparent 80%)", borderBottom: "1px solid var(--border)", textAlign: "center" }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, margin: "0 auto 16px", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ShieldCheck size={24} style={{ color: "#fff" }} />
              </div>
              <h1 style={{ fontWeight: 700, fontSize: "1.2rem", color: "var(--text)", margin: "0 0 4px", letterSpacing: "-0.03em" }}>{at.login_title}</h1>
              <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", margin: 0, fontFamily: "JetBrains Mono, monospace" }}>sherzodxon.uz / admin</p>
            </div>
            <div style={{ padding: "28px 28px 32px" }}>
              <p style={{ fontSize: "0.72rem", fontWeight: 600, marginBottom: 8, color: "var(--text-muted)", fontFamily: "JetBrains Mono, monospace", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                {at.password_label}
              </p>
              <div style={{ position: "relative" }}>
                <Lock size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
                <input
                  type="password" placeholder="••••••••" value={pwd} autoFocus
                  onChange={e => setPwd(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleLogin()}
                  style={{ width: "100%", padding: "13px 14px 13px 44px", borderRadius: 12, fontSize: "0.9rem", fontFamily: "Sora, sans-serif", background: "var(--bg-secondary)", color: "var(--text)", outline: "none", boxSizing: "border-box", border: pwdErr ? "1.5px solid #ef4444" : "1.5px solid var(--border)", transition: "border-color 0.2s" }}
                />
              </div>
              {pwdErr && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 10, marginTop: 12, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.22)" }}>
                  <span>⚠️</span>
                  <p style={{ fontSize: "0.8rem", color: "#ef4444", margin: 0 }}>{pwdErr}</p>
                </div>
              )}
              <button
                onClick={handleLogin}
                disabled={pwdLoading || !pwd.trim()}
                style={{ width: "100%", marginTop: 16, padding: "13px 20px", borderRadius: 13, border: "none", background: "var(--accent)", color: "#fff", fontWeight: 700, fontSize: "0.92rem", fontFamily: "Sora, sans-serif", cursor: pwdLoading || !pwd.trim() ? "not-allowed" : "pointer", opacity: pwdLoading || !pwd.trim() ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
                {pwdLoading ? <Loader2 size={17} style={{ animation: "spin 1s linear infinite" }} /> : <ArrowRight size={17} />}
                {at.login_btn}
              </button>
            </div>
          </div>
        </div>
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  // ── Main ──────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

        .admin-wrapper {
          display: flex;
          height: 100dvh;
          overflow: hidden;
          background: var(--bg);
        }
        .admin-sidebar {
          width: 320px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          border-right: 1px solid var(--border);
          height: 100dvh;
          overflow: hidden;
        }
        .admin-chat-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          height: 100dvh;
          overflow: hidden;
        }
        .messages-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 16px 16px 8px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          -webkit-overflow-scrolling: touch;
        }
        .reply-bar {
          padding: 10px 12px;
          padding-bottom: max(10px, env(safe-area-inset-bottom));
          border-top: 1px solid var(--border);
          background: var(--bg-card);
          display: flex;
          gap: 8px;
          align-items: center;
        }

        @media (max-width: 768px) {
          .admin-wrapper { position: relative; overflow: hidden; }
          .admin-sidebar {
            position: absolute; inset: 0; width: 100%; z-index: 10;
            transition: transform 0.28s cubic-bezier(0.4,0,0.2,1);
          }
          .admin-sidebar.hidden-mobile { transform: translateX(-100%); pointer-events: none; }
          .admin-chat-panel {
            position: absolute; inset: 0; width: 100%; z-index: 20;
            transform: translateX(100%);
            transition: transform 0.28s cubic-bezier(0.4,0,0.2,1);
          }
          .admin-chat-panel.visible-mobile { transform: translateX(0); }
        }
        @media (min-width: 769px) {
          .back-btn-mobile { display: none !important; }
        }
        @media (max-width: 480px) {
          .hide-on-mobile { display: none; }
        }
      `}</style>

      <div className="admin-wrapper">

        {/* ── Sidebar ── */}
        <div className={`admin-sidebar${mobileView === "chat" ? " hidden-mobile" : ""}`}>
          <div style={{ padding: "0 16px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", background: "var(--bg-card)", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "var(--accent-dim)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ShieldCheck size={15} style={{ color: "var(--accent)" }} />
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--text)", margin: 0, letterSpacing: "-0.02em" }}>{at.title}</p>
                <p style={{ fontSize: "0.62rem", color: "var(--text-muted)", margin: 0, fontFamily: "JetBrains Mono, monospace" }}>
                  {users.length} {at.users?.toLowerCase()}
                  {totalUnread > 0 && <span style={{ color: "#ef4444", marginLeft: 5 }}>· {totalUnread} {at.unread}</span>}
                </p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={loadUsers} style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-muted)", borderRadius: 8, padding: "6px 9px", cursor: "pointer", display: "flex", alignItems: "center" }}>
                <RefreshCw size={13} />
              </button>
              <button
                onClick={() => { sessionStorage.removeItem(STORAGE_KEY); setToken(null); }}
                style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-muted)", borderRadius: 8, padding: "6px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontSize: "0.75rem", fontWeight: 500, fontFamily: "Sora, sans-serif" }}
              >
                <LogOut size={12} />
                <span className="hide-on-mobile">{at.logout}</span>
              </button>
            </div>
          </div>

          <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
            <div style={{ position: "relative" }}>
              <Search size={14} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
              <input
                type="text" placeholder={at.search} value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: "100%", padding: "8px 12px 8px 32px", borderRadius: 10, background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text)", fontSize: "0.85rem", outline: "none", fontFamily: "Sora, sans-serif", boxSizing: "border-box" }}
              />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch" } as React.CSSProperties}>
            {loadingUsers ? (
              <div style={{ display: "flex", justifyContent: "center", paddingTop: 48 }}>
                <Loader2 size={22} style={{ color: "var(--accent)", animation: "spin 1s linear infinite" }} />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 20px" }}>
                <Users size={32} style={{ color: "var(--text-muted)", margin: "0 auto 10px", display: "block", opacity: 0.3 }} />
                <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>{at.no_users}</p>
              </div>
            ) : (
              filteredUsers.map(u => {
                const isActive = selectedUser?.id === u.id;
                return (
                  <div
                    key={u.id}
                    onClick={() => loadConversation(u)}
                    style={{
                      padding: "11px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12,
                      background: isActive ? "var(--accent-dim)" : "transparent",
                      borderLeft: isActive ? "3px solid var(--accent)" : "3px solid transparent",
                      transition: "all 0.15s",
                    }}
                  >
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      <div style={{ width: 46, height: 46, borderRadius: 14, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "1rem", color: "#fff", fontFamily: "Sora, sans-serif" }}>
                        {u.name[0]?.toUpperCase()}
                      </div>
                      {u.unreadCount > 0 && (
                        <span style={{ position: "absolute", top: -3, right: -3, background: "#ef4444", color: "#fff", borderRadius: "50%", minWidth: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", fontWeight: 700, border: "2px solid var(--bg)", padding: "0 3px" }}>
                          {u.unreadCount > 9 ? "9+" : u.unreadCount}
                        </span>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <p style={{ fontWeight: 600, fontSize: "0.88rem", color: "var(--text)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.name}</p>
                        {u.lastMessage && (
                          <span style={{ fontSize: "0.62rem", color: "var(--text-muted)", fontFamily: "JetBrains Mono, monospace", flexShrink: 0, marginLeft: 6 }}>
                            {fmt(u.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {u.lastMessage ? u.lastMessage.content : u.email}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Chat panel ── */}
        <div className={`admin-chat-panel${mobileView === "chat" ? " visible-mobile" : ""}`} style={{ background: "var(--bg)" }}>
          {!selectedUser ? (
            <div style={{ flex: 1, height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
              <MessageSquare size={52} style={{ color: "var(--text-muted)", opacity: 0.15 }} />
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{at.no_conv}</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div style={{ height: 60, padding: "0 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10, background: "var(--bg-card)", flexShrink: 0 }}>
                <button
                  onClick={handleBack}
                  className="back-btn-mobile"
                  style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", display: "flex", alignItems: "center", padding: "6px 4px 6px 0", marginRight: 2 }}
                >
                  <ArrowLeft size={22} />
                </button>
                <div style={{ width: 36, height: 36, borderRadius: 11, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.88rem", color: "#fff", flexShrink: 0 }}>
                  {selectedUser.name[0]?.toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selectedUser.name}</p>
                  <p style={{ fontSize: "0.65rem", color: "var(--text-muted)", margin: 0, fontFamily: "JetBrains Mono, monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {selectedUser.email}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="messages-scroll" ref={chatScrollRef}>
                {loadingMsgs ? (
                  <div style={{ display: "flex", justifyContent: "center", paddingTop: 60 }}>
                    <Loader2 size={24} style={{ color: "var(--accent)", animation: "spin 1s linear infinite" }} />
                  </div>
                ) : timeline.length === 0 ? (
                  <div style={{ textAlign: "center", paddingTop: 60 }}>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{at.no_messages}</p>
                  </div>
                ) : (
                  timeline.map((item, idx) => {
                    const prev = timeline[idx - 1];
                    const showDate = !prev || new Date(item.createdAt).toDateString() !== new Date(prev.createdAt).toDateString();

                    return (
                      <div key={item.id}>
                        {/* Date separator */}
                        {showDate && (
                          <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "10px 0 14px" }}>
                            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                            <span style={{ fontSize: "0.63rem", color: "var(--text-muted)", fontFamily: "JetBrains Mono, monospace", padding: "2px 10px", background: "var(--bg-secondary)", borderRadius: 20, border: "1px solid var(--border)" }}>
                              {new Date(item.createdAt).toLocaleDateString([], { day: "2-digit", month: "long", year: "numeric" })}
                            </span>
                            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                          </div>
                        )}

                        {/* Admin message — right */}
                        {item.kind === "admin-direct" && (
                          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 4 }}>
                            <div style={{ maxWidth: "78%" }}>
                              <div style={{ padding: "9px 13px", borderRadius: "16px 16px 4px 16px", background: "var(--accent)", fontSize: "0.88rem", color: "#fff", lineHeight: 1.55 }}>
                                {item.content}
                              </div>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4, marginTop: 3, paddingRight: 4 }}>
                                <span style={{ fontSize: "0.58rem", color: "var(--text-muted)", fontFamily: "JetBrains Mono, monospace" }}>{fmtFull(item.createdAt)}</span>
                                {item.readAt
                                  ? <CheckCheck size={11} style={{ color: "var(--accent)" }} />
                                  : <Check size={11} style={{ color: "var(--text-muted)" }} />
                                }
                              </div>
                            </div>
                          </div>
                        )}

                        {/* User message — left */}
                        {item.kind === "user-msg" && (
                          <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 4 }}>
                            <div style={{ maxWidth: "78%" }}>
                              <div style={{ padding: "9px 13px", borderRadius: "16px 16px 16px 4px", background: "var(--bg-card)", border: "1px solid var(--border)", fontSize: "0.88rem", color: "var(--text)", lineHeight: 1.55 }}>
                                {item.content}
                                {item.edited && <span style={{ fontSize: "0.58rem", color: "var(--text-muted)", marginLeft: 6 }}>(tahrirlangan)</span>}
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 3, paddingLeft: 4 }}>
                                <span style={{ fontSize: "0.58rem", color: "var(--text-muted)", fontFamily: "JetBrains Mono, monospace" }}>{fmtFull(item.createdAt)}</span>
                                {item.readByAdmin
                                  ? <CheckCheck size={11} style={{ color: "var(--accent)" }} />
                                  : <Check size={11} style={{ color: "var(--text-muted)" }} />
                                }
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} style={{ height: 4 }} />
              </div>

              {/* Input */}
              <div className="reply-bar">
                <div style={{ width: 32, height: 32, borderRadius: 9, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.7rem", color: "#fff", flexShrink: 0 }}>
                  SY
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  onFocus={() => setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 300)}
                  placeholder={at.reply_placeholder}
                  style={{ flex: 1, padding: "10px 13px", borderRadius: 12, background: "var(--bg-secondary)", border: "1.5px solid var(--border)", color: "var(--text)", fontSize: "0.88rem", outline: "none", fontFamily: "Sora, sans-serif", transition: "border-color 0.2s" }}
                  onFocusCapture={e => (e.target.style.borderColor = "var(--accent)")}
                  onBlurCapture={e => (e.target.style.borderColor = "var(--border)")}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || sending}
                  style={{ background: "var(--accent)", border: "none", color: "#fff", borderRadius: 10, padding: "10px 13px", cursor: !input.trim() || sending ? "not-allowed" : "pointer", opacity: !input.trim() || sending ? 0.5 : 1, display: "flex", alignItems: "center", flexShrink: 0, transition: "all 0.2s" }}
                >
                  {sending ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Send size={16} />}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
