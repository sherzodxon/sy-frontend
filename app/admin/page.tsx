"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Lock,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import AdminSidebar from "@/components/chat/AdminSidebar";
import DateSeparator from "@/components/chat/DateSeparator";
import MessageBubble from "@/components/chat/MessageBubble";
import MessageComposer from "@/components/chat/MessageComposer";
import {
  buildTimeline,
  ConversationItem,
  formatDate,
  formatFullTime,
  isSameDay,
} from "@/components/chat/chatUtils";
import { useLang } from "@/hooks/useLang";
import { AdminDirectMessage, AdminUser, chatApi, UserMessage } from "@/services/api";
import styles from "./AdminPage.module.scss";

const STORAGE_KEY = "admin_token";

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
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");

  const bottomRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(0);
  const editingMsgIdRef = useRef<string | null>(null);
  const editValueRef = useRef("");
  const tokenRef = useRef<string | null>(null);
  const selectedUserRef = useRef<AdminUser | null>(null);
  const atRef = useRef(at);

  useEffect(() => { editingMsgIdRef.current = editingMsgId; }, [editingMsgId]);
  useEffect(() => { editValueRef.current = editValue; }, [editValue]);
  useEffect(() => { tokenRef.current = token; }, [token]);
  useEffect(() => { selectedUserRef.current = selectedUser; }, [selectedUser]);
  useEffect(() => { atRef.current = at; }, [at]);

  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) queueMicrotask(() => setToken(saved));
  }, []);

  const loadUsers = useCallback(async () => {
    if (!tokenRef.current) return;
    setLoadingUsers(true);
    try {
      setUsers(await chatApi.adminGetUsers(tokenRef.current));
    } catch {
      // Silent user list refresh failure.
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => { if (token) loadUsers(); }, [token, loadUsers]);

  useEffect(() => {
    const total = userMsgs.length + adminMsgs.length;
    if (total > prevCountRef.current) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    prevCountRef.current = total;
  }, [userMsgs, adminMsgs]);

  useEffect(() => {
    const handleResize = () => {
      if (mobileView === "chat") {
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      }
    };
    window.visualViewport?.addEventListener("resize", handleResize);
    return () => window.visualViewport?.removeEventListener("resize", handleResize);
  }, [mobileView]);

  const handleLogin = async () => {
    if (!pwd.trim()) return;
    setPwdLoading(true);
    setPwdErr("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/admin-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pwd }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPwdErr(data.message || "Noto'g'ri parol");
        return;
      }
      sessionStorage.setItem(STORAGE_KEY, data.token);
      setToken(data.token);
    } catch {
      setPwdErr("Server bilan bog'lanishda xato");
    } finally {
      setPwdLoading(false);
    }
  };

  const loadConversation = useCallback(async (user: AdminUser) => {
    const tok = tokenRef.current;
    if (!tok) return;
    setSelectedUser(user);
    setLoadingMsgs(true);
    setUserMsgs([]);
    setAdminMsgs([]);
    setHasMore(false);
    setNextCursor(null);
    setMobileView("chat");
    prevCountRef.current = 0;

    try {
      const data = await chatApi.adminGetConversation(user.id, tok);
      setUserMsgs(data.messages);
      setAdminMsgs(data.adminMessages);
      setHasMore(data.hasMore);
      setNextCursor(data.nextCursor);
      setUsers(prev => prev.map(item => item.id === user.id ? { ...item, unreadCount: 0 } : item));
    } catch {
      // Silent conversation load failure.
    } finally {
      setLoadingMsgs(false);
    }
  }, []);

  const loadOlderMessages = useCallback(async () => {
    const tok = tokenRef.current;
    const user = selectedUserRef.current;
    if (!tok || !user || !hasMore || loadingMore || !nextCursor) return;
    setLoadingMore(true);
    const el = chatScrollRef.current;
    const prevScrollHeight = el?.scrollHeight ?? 0;
    const prevScrollTop = el?.scrollTop ?? 0;

    try {
      const data = await chatApi.adminGetConversation(user.id, tok, nextCursor);
      const addedCount = data.messages.length + data.adminMessages.length;
      setUserMsgs(prev => {
        const existing = new Set(prev.map(message => message.id));
        return [...data.messages.filter(message => !existing.has(message.id)), ...prev];
      });
      setAdminMsgs(prev => {
        const existing = new Set(prev.map(message => message.id));
        return [...data.adminMessages.filter(message => !existing.has(message.id)), ...prev];
      });
      setHasMore(data.hasMore);
      setNextCursor(data.nextCursor);
      prevCountRef.current += addedCount;
      requestAnimationFrame(() => {
        if (el) el.scrollTop = el.scrollHeight - prevScrollHeight + prevScrollTop;
      });
    } catch {
      // Silent pagination failure.
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, nextCursor]);

  const loadConversationSilent = useCallback(async (userId: string) => {
    const tok = tokenRef.current;
    if (!tok) return;
    try {
      const currentTotal = userMsgs.length + adminMsgs.length;
      const data = await chatApi.adminGetConversation(userId, tok, undefined, Math.max(currentTotal, 20));
      setUserMsgs(data.messages);
      setAdminMsgs(data.adminMessages);
      setHasMore(data.hasMore);
      setNextCursor(data.nextCursor);
      setUsers(prev => prev.map(user => user.id === userId ? { ...user, unreadCount: 0 } : user));
    } catch {
      // Silent conversation refresh failure.
    }
  }, [userMsgs.length, adminMsgs.length]);

  useEffect(() => {
    if (!token) return;
    const timer = setInterval(loadUsers, 30000);
    return () => clearInterval(timer);
  }, [token, loadUsers]);

  useEffect(() => {
    if (!token || !selectedUser) return;
    const timer = setInterval(() => loadConversationSilent(selectedUser.id), 10000);
    return () => clearInterval(timer);
  }, [token, selectedUser, loadConversationSilent]);

  const sendMessage = useCallback(async () => {
    const tok = tokenRef.current;
    const user = selectedUserRef.current;
    if (!input.trim() || !user || !tok || sending) return;
    setSending(true);
    try {
      const msg = await chatApi.adminSendMessage(user.id, input.trim(), tok);
      setAdminMsgs(prev => [...prev, msg]);
      setInput("");
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch {
      // Silent send failure.
    } finally {
      setSending(false);
    }
  }, [input, sending]);

  const saveEditMsg = useCallback(async () => {
    const id = editingMsgIdRef.current;
    const value = editValueRef.current;
    const tok = tokenRef.current;
    if (!id || !value.trim() || !tok) {
      setEditingMsgId(null);
      return;
    }
    try {
      const updated = await chatApi.adminEditMessage(id, value.trim(), tok);
      setAdminMsgs(prev => prev.map(message => message.id === id ? { ...message, ...updated } : message));
    } catch {
      // Silent edit failure.
    } finally {
      setEditingMsgId(null);
    }
  }, []);

  const deleteMessage = useCallback(async (item: ConversationItem) => {
    const tok = tokenRef.current;
    if (!tok || !window.confirm(atRef.current.confirm_delete_message)) return;
    try {
      if (item.kind === "admin-direct") {
        await chatApi.adminDeleteMessage(item.id, tok);
        setAdminMsgs(prev => prev.filter(message => message.id !== item.id));
      } else {
        await chatApi.adminDeleteUserMessage(item.id, tok);
        setUserMsgs(prev => prev.filter(message => message.id !== item.id));
      }
    } catch {
      // Silent delete failure.
    }
  }, []);

  const deleteUser = useCallback(async (user: AdminUser, event: React.MouseEvent) => {
    event.stopPropagation();
    const tok = tokenRef.current;
    if (!tok || !window.confirm(atRef.current.confirm_delete_user)) return;
    try {
      await chatApi.adminDeleteUser(user.id, tok);
      setUsers(prev => prev.filter(item => item.id !== user.id));
      if (selectedUserRef.current?.id === user.id) {
        setSelectedUser(null);
        setUserMsgs([]);
        setAdminMsgs([]);
        setMobileView("list");
      }
    } catch {
      // Silent delete failure.
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setToken(null);
  };

  const handleBack = () => {
    setMobileView("list");
    setSelectedUser(null);
    setUserMsgs([]);
    setAdminMsgs([]);
    prevCountRef.current = 0;
  };

  const timeline = buildTimeline(userMsgs, adminMsgs);
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );
  const totalUnread = users.reduce((sum, user) => sum + user.unreadCount, 0);

  if (!token) {
    return (
      <div className={styles.loginShell}>
        <div className={styles.loginCardWrap}>
          <div className={`card ${styles.loginCard}`}>
            <div className={styles.loginHead}>
              <div className={styles.loginIcon}>
                <ShieldCheck size={24} />
              </div>
              <h1 className={styles.loginTitle}>{at.login_title}</h1>
              <p className={styles.mono}>yarmatxonov.uz / admin</p>
            </div>
            <div className={styles.loginBody}>
              <p className={styles.label}>{at.password_label}</p>
              <div className={styles.field}>
                <Lock className={styles.fieldIcon} size={15} />
                <input
                  className={`${styles.input} ${pwdErr ? styles.inputError : ""}`}
                  type="password"
                  placeholder="••••••••"
                  value={pwd}
                  autoFocus
                  onChange={event => setPwd(event.target.value)}
                  onKeyDown={event => event.key === "Enter" && handleLogin()}
                />
              </div>
              {pwdErr && <div className={styles.error}><span>!</span><p>{pwdErr}</p></div>}
              <button
                className={styles.loginButton}
                onClick={handleLogin}
                disabled={pwdLoading || !pwd.trim()}
              >
                {pwdLoading ? <Loader2 className={styles.spin} size={17} /> : <ArrowRight size={17} />}
                {at.login_btn}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <AdminSidebar
        users={users}
        filteredUsers={filteredUsers}
        selectedUserId={selectedUser?.id}
        search={search}
        totalUnread={totalUnread}
        loadingUsers={loadingUsers}
        labels={at}
        hidden={mobileView === "chat"}
        onSearchChange={setSearch}
        onRefresh={loadUsers}
        onLogout={handleLogout}
        onSelect={loadConversation}
        onDelete={deleteUser}
      />

      <section className={`${styles.chatPanel} ${mobileView === "chat" ? styles.chatPanelVisible : ""}`}>
        {!selectedUser ? (
          <div className={styles.emptyPanel}>
            <MessageSquare className={styles.emptyPanelIcon} size={52} />
            <p>{at.no_conv}</p>
          </div>
        ) : (
          <>
            <div className={styles.chatHeader}>
              <button className={styles.backButton} onClick={handleBack}>
                <ArrowLeft size={22} />
              </button>
              <div className={styles.chatAvatar}>{selectedUser.name[0]?.toUpperCase()}</div>
              <div className={styles.chatTitle}>
                <p className={styles.chatName}>{selectedUser.name}</p>
                <p className={styles.chatEmail}>{selectedUser.email}</p>
              </div>
            </div>

            <div
              className={styles.messages}
              ref={chatScrollRef}
              onScroll={event => {
                if (event.currentTarget.scrollTop < 80) loadOlderMessages();
              }}
            >
              {loadingMsgs ? (
                <div className={styles.center}>
                  <Loader2 className={styles.spin} size={24} />
                </div>
              ) : timeline.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>{at.no_messages}</p>
                </div>
              ) : (
                <>
                  {loadingMore && (
                    <div className={styles.loadingMore}>
                      <Loader2 className={styles.spin} size={14} />
                      {at.loading_more}
                    </div>
                  )}
                  {timeline.map((item, index) => {
                    const previous = timeline[index - 1];
                    const showDate = !previous || !isSameDay(item.createdAt, previous.createdAt);
                    const isAdmin = item.kind === "admin-direct";

                    return (
                      <div key={item.id}>
                        {showDate && <DateSeparator label={formatDate(item.createdAt)} />}
                        <MessageBubble
                          align={isAdmin ? "right" : "left"}
                          content={item.content}
                          timeLabel={formatFullTime(item.createdAt)}
                          tone={isAdmin ? "accent" : "incoming"}
                          compact
                          edited={item.edited}
                          editedLabel={isAdmin ? at.edit.toLowerCase() : "tahrirlangan"}
                          read={isAdmin ? Boolean(item.readAt) : item.readByAdmin}
                          showStatus
                          isEditing={isAdmin && editingMsgId === item.id}
                          editValue={editingMsgId === item.id ? editValue : ""}
                          editLabel={at.edit}
                          deleteLabel={at.delete}
                          onEditValueChange={setEditValue}
                          onSaveEdit={saveEditMsg}
                          onCancelEdit={() => setEditingMsgId(null)}
                          onStartEdit={isAdmin ? () => {
                            setEditingMsgId(item.id);
                            setEditValue(item.content);
                          } : undefined}
                          onDelete={() => deleteMessage(item)}
                        />
                      </div>
                    );
                  })}
                </>
              )}
              <div className={styles.bottomAnchor} ref={bottomRef} />
            </div>

            <MessageComposer
              admin
              value={input}
              placeholder={at.reply_placeholder}
              sending={sending}
              avatarLabel="SY"
              onChange={setInput}
              onSend={sendMessage}
              onFocus={() => setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 300)}
            />
          </>
        )}
      </section>
    </div>
  );
}
