"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Loader2, Lock, ShieldCheck, RefreshCw, LogOut, ArrowRight,
  Send, Check, CheckCheck, Pencil, X, Search, MessageSquare, Users, ArrowLeft
} from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { chatApi, AdminUser, UserMessage, AdminDirectMessage } from "@/services/api";

type Message = UserMessage | AdminDirectMessage;

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);

  const [replyInput, setReplyInput] = useState("");
  const [sending, setSending] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  // Mobile: "list" | "chat"
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");

  const bottomRef = useRef<HTMLDivElement>(null);
  const replyRef = useRef<HTMLInputElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) setToken(saved);
  }, []);

  useEffect(() => {
    if (token) loadUsers();
  }, [token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Keyboard chiqqanda input yuqoriga ko'tarilishi uchun
  useEffect(() => {
    const handleResize = () => {
      if (mobileView === "chat") {
        setTimeout(() => {
          bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    };

    if (typeof window !== "undefined" && "visualViewport" in window) {
      window.visualViewport?.addEventListener("resize", handleResize);
      return () => window.visualViewport?.removeEventListener("resize", handleResize);
    }
  }, [mobileView]);

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
    setMessages([]);
    setMobileView("chat"); // Mobile: chatga o'tish
    try {
      const data = await chatApi.adminGetConversation(user.id, token);
      const combined: Message[] = [
        ...data.messages,
        ...data.adminMessages
      ].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      setMessages(combined);
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, unreadCount: 0 } : u));
    } catch { /* silent */ } finally { setLoadingMsgs(false); }
  }, [token]);

  const handleBack = () => {
    setMobileView("list");
    setSelectedUser(null);
    setMessages([]);
  };

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

  const sendReply = async () => {
    if (!replyInput.trim() || !selectedUser || !token) return;
    const lastUserMsg = [...messages]
      .reverse()
      .find((m): m is UserMessage => m.type === "user" && !m.reply);

    if (!lastUserMsg) {
      setSending(true);
      try {
        const newAdminMsg = await chatApi.adminSendMessage(selectedUser.id, replyInput.trim(), token);
        setMessages(prev => [...prev, newAdminMsg]);
        setReplyInput("");
      } catch { /* silent */ } finally { setSending(false); }
      return;
    }

    setSending(true);
    try {
      const updated = await chatApi.adminReply(lastUserMsg.id, replyInput.trim(), token);
      setMessages(prev => prev.map(m => m.id === lastUserMsg.id ? { ...m, ...updated } : m));
      setReplyInput("");
    } catch { /* silent */ } finally { setSending(false); }
  };

  const startEdit = (msg: UserMessage) => {
    setEditingId(msg.id);
    setEditValue(msg.reply || "");
  };

  const saveEdit = async (msgId: string) => {
    if (!token || !editValue.trim()) return;
    try {
      const updated = await chatApi.adminEditReply(msgId, editValue.trim(), token);
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, ...updated } : m));
    } catch { /* silent */ } finally { setEditingId(null); }
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalUnread = users.reduce((s, u) => s + u.unreadCount, 0);

  /* ── LOGIN ── */
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
              <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", margin: 0, fontFamily: "JetBrains Mono, monospace" }}>yarmatxonov.uz / admin</p>
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
                style={{ width: "100%", marginTop: 16, padding: "13px 20px", borderRadius: 13, border: "none", background: "var(--accent)", color: "#fff", fontWeight: 700, fontSize: "0.92rem", fontFamily: "Sora, sans-serif", cursor: pwdLoading || !pwd.trim() ? "not-allowed" : "pointer", opacity: pwdLoading || !pwd.trim() ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 16px var(--shadow)" }}
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

  /* ── MAIN ── */
  return (
    <>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes slideOutRight {
          from { transform: translateX(0); }
          to { transform: translateX(100%); }
        }

        /* Desktop: ikki ustun */
        .admin-wrapper {
          display: flex;
          height: 100dvh;
          overflow: hidden;
          background: var(--bg);
        }

        /* SIDEBAR */
        .admin-sidebar {
          width: 320px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          border-right: 1px solid var(--border);
          height: 100dvh;
          overflow: hidden;
        }

        /* CHAT PANEL */
        .admin-chat-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          height: 100dvh;
          overflow: hidden;
        }

        /* Mobile override */
        @media (max-width: 768px) {
          .admin-wrapper {
            position: relative;
            overflow: hidden;
          }

          .admin-sidebar {
            position: absolute;
            inset: 0;
            width: 100%;
            z-index: 10;
            transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .admin-sidebar.hidden-mobile {
            transform: translateX(-100%);
            pointer-events: none;
          }

          .admin-chat-panel {
            position: absolute;
            inset: 0;
            width: 100%;
            z-index: 20;
            transform: translateX(100%);
            transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .admin-chat-panel.visible-mobile {
            transform: translateX(0);
          }
        }

        /* Chat messages scroll */
        .messages-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 16px 16px 8px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          -webkit-overflow-scrolling: touch;
        }

        /* Input area — keyboard safe */
        .reply-bar {
          padding: 10px 12px;
          padding-bottom: max(10px, env(safe-area-inset-bottom));
          border-top: 1px solid var(--border);
          background: var(--bg-card);
          display: flex;
          gap: 8px;
          align-items: center;
        }
      `}</style>

      <div className="admin-wrapper">

        {/* ── SIDEBAR (Users List) ── */}
        <div className={`admin-sidebar${mobileView === "chat" ? " hidden-mobile" : ""}`}>
          {/* Sidebar Header */}
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

          {/* Search */}
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

          {/* User list */}
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

        {/* ── CHAT PANEL ── */}
        <div className={`admin-chat-panel${mobileView === "chat" ? " visible-mobile" : ""}`} style={{ background: "var(--bg)" }}>

          {!selectedUser ? (
            /* Desktop empty state */
            <div style={{ flex: 1, height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
              <MessageSquare size={52} style={{ color: "var(--text-muted)", opacity: 0.15 }} />
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{at.no_conv}</p>
            </div>
          ) : (
            <>
              {/* Chat Header — back button mobile da */}
              <div style={{ height: 60, padding: "0 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10, background: "var(--bg-card)", flexShrink: 0 }}>
                {/* Back button — mobile only */}
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
                ) : messages.length === 0 ? (
                  <div style={{ textAlign: "center", paddingTop: 60 }}>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{at.no_messages}</p>
                  </div>
                ) : (
                  messages.map((msg, i) => {
                    const prevMsg = messages[i - 1];
                    const showDate = !prevMsg || new Date(msg.createdAt).toDateString() !== new Date(prevMsg.createdAt).toDateString();
                    return (
                      <div key={msg.id} style={{ display: "flex", flexDirection: "column" }}>
                        {showDate && (
                          <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "10px 0 14px" }}>
                            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                            <span style={{ fontSize: "0.63rem", color: "var(--text-muted)", fontFamily: "JetBrains Mono, monospace", padding: "2px 10px", background: "var(--bg-secondary)", borderRadius: 20, border: "1px solid var(--border)" }}>
                              {new Date(msg.createdAt).toLocaleDateString([], { day: "2-digit", month: "long", year: "numeric" })}
                            </span>
                            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                          </div>
                        )}

                        {msg.type === "admin" ? (
                          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 2 }}>
                            <div style={{ maxWidth: "78%" }}>
                              <div style={{ padding: "9px 13px", borderRadius: "16px 16px 4px 16px", background: "var(--accent)", fontSize: "0.88rem", color: "#fff", lineHeight: 1.55 }}>
                                {msg.content}
                              </div>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4, marginTop: 3, paddingRight: 4 }}>
                                <span style={{ fontSize: "0.58rem", color: "var(--text-muted)", fontFamily: "JetBrains Mono, monospace" }}>{fmtFull(msg.createdAt)}</span>
                                <CheckCheck size={11} style={{ color: "var(--accent)" }} />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 2 }}>
                              <div style={{ maxWidth: "78%" }}>
                                <div style={{ padding: "9px 13px", borderRadius: "16px 16px 16px 4px", background: "var(--bg-card)", border: "1px solid var(--border)", fontSize: "0.88rem", color: "var(--text)", lineHeight: 1.55 }}>
                                  {msg.content}
                                  {msg.edited && <span style={{ fontSize: "0.58rem", color: "var(--text-muted)", marginLeft: 6 }}>(tahrirlangan)</span>}
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 3, paddingLeft: 4 }}>
                                  <span style={{ fontSize: "0.58rem", color: "var(--text-muted)", fontFamily: "JetBrains Mono, monospace" }}>{fmtFull(msg.createdAt)}</span>
                                  {msg.readByAdmin ? <CheckCheck size={11} style={{ color: "var(--accent)" }} /> : <Check size={11} style={{ color: "var(--text-muted)" }} />}
                                </div>
                              </div>
                            </div>

                            {msg.reply && (
                              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 2 }}>
                                <div style={{ maxWidth: "78%" }}>
                                  {editingId === msg.id ? (
                                    <div style={{ display: "flex", gap: 6 }}>
                                      <input
                                        autoFocus value={editValue}
                                        onChange={e => setEditValue(e.target.value)}
                                        onKeyDown={e => { if (e.key === "Enter") saveEdit(msg.id); if (e.key === "Escape") setEditingId(null); }}
                                        style={{ flex: 1, padding: "8px 12px", borderRadius: 10, background: "var(--bg-secondary)", border: "1.5px solid var(--accent)", color: "var(--text)", fontSize: "0.85rem", outline: "none", fontFamily: "Sora, sans-serif" }}
                                      />
                                      <button onClick={() => saveEdit(msg.id)} style={{ background: "var(--accent)", border: "none", color: "#fff", borderRadius: 8, padding: "6px 10px", cursor: "pointer", display: "flex", alignItems: "center" }}>
                                        <Check size={14} />
                                      </button>
                                      <button onClick={() => setEditingId(null)} style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-muted)", borderRadius: 8, padding: "6px 10px", cursor: "pointer", display: "flex", alignItems: "center" }}>
                                        <X size={14} />
                                      </button>
                                    </div>
                                  ) : (
                                    <>
                                      <div
                                        style={{ padding: "9px 13px", borderRadius: "16px 16px 4px 16px", background: "var(--accent)", fontSize: "0.88rem", color: "#fff", lineHeight: 1.55, position: "relative" }}
                                        onMouseEnter={e => { const b = (e.currentTarget as HTMLElement).querySelector(".edit-btn") as HTMLElement; if (b) b.style.opacity = "1"; }}
                                        onMouseLeave={e => { const b = (e.currentTarget as HTMLElement).querySelector(".edit-btn") as HTMLElement; if (b) b.style.opacity = "0"; }}
                                      >
                                        {msg.reply}
                                        <button
                                          className="edit-btn"
                                          onClick={() => startEdit(msg)}
                                          style={{ position: "absolute", top: -8, right: -8, background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-muted)", borderRadius: 6, padding: "3px 5px", cursor: "pointer", display: "flex", alignItems: "center", opacity: 0, transition: "opacity 0.15s", lineHeight: 0 }}
                                        >
                                          <Pencil size={11} />
                                        </button>
                                      </div>
                                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4, marginTop: 3, paddingRight: 4 }}>
                                        <span style={{ fontSize: "0.58rem", color: "var(--text-muted)", fontFamily: "JetBrains Mono, monospace" }}>{fmtFull(msg.replyAt!)}</span>
                                        <CheckCheck size={11} style={{ color: "var(--accent)" }} />
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} style={{ height: 4 }} />
              </div>

              {/* Reply input bar */}
              <div className="reply-bar">
                <div style={{ width: 32, height: 32, borderRadius: 9, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.7rem", color: "#fff", flexShrink: 0 }}>
                  SY
                </div>
                <input
                  ref={replyRef}
                  type="text"
                  value={replyInput}
                  onChange={e => setReplyInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendReply()}
                  onFocus={() => {
                    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 300);
                  }}
                  placeholder={at.reply_placeholder}
                  style={{ flex: 1, padding: "10px 13px", borderRadius: 12, background: "var(--bg-secondary)", border: "1.5px solid var(--border)", color: "var(--text)", fontSize: "0.88rem", outline: "none", fontFamily: "Sora, sans-serif", transition: "border-color 0.2s" }}
                  onFocusCapture={e => (e.target.style.borderColor = "var(--accent)")}
                  onBlurCapture={e => (e.target.style.borderColor = "var(--border)")}
                />
                <button
                  onClick={sendReply}
                  disabled={!replyInput.trim() || sending}
                  style={{ background: "var(--accent)", border: "none", color: "#fff", borderRadius: 10, padding: "10px 13px", cursor: !replyInput.trim() || sending ? "not-allowed" : "pointer", opacity: !replyInput.trim() || sending ? 0.5 : 1, display: "flex", alignItems: "center", flexShrink: 0, transition: "all 0.2s" }}
                >
                  {sending ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Send size={16} />}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        /* Desktop: back button yashirin */
        @media (min-width: 769px) {
          .back-btn-mobile { display: none !important; }
        }

        /* Logout text mobile da yashirin */
        @media (max-width: 480px) {
          .hide-on-mobile { display: none; }
        }
      `}</style>
    </>
  );
}