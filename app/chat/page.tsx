"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  ArrowLeft,
  Loader2,
  LogOut,
  Menu,
  MessageSquare,
  Monitor,
  Moon,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Sun,
  X,
} from "lucide-react";
import AuthModal from "@/components/chat/AuthModal";
import DateSeparator from "@/components/chat/DateSeparator";
import MessageBubble from "@/components/chat/MessageBubble";
import MessageComposer from "@/components/chat/MessageComposer";
import {
  buildTimeline,
  formatDate,
  formatTime,
  isSameDay,
} from "@/components/chat/chatUtils";
import { useAuth } from "@/hooks/useAuth";
import { useLang } from "@/hooks/useLang";
import { Locale, locales } from "@/lib/i18n";
import { AdminDirectMessage, chatApi, UserMessage } from "@/services/api";
import styles from "./ChatPage.module.scss";

export default function ChatPage() {
  const { user, logout, loading } = useAuth();
  const { t, locale, setLocale } = useLang();
  const { theme, setTheme } = useTheme();

  const [userMsgs, setUserMsgs] = useState<UserMessage[]>([]);
  const [adminMsgs, setAdminMsgs] = useState<AdminDirectMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const skipAutoScrollRef = useRef(false);

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  const loadMessages = useCallback(async () => {
    if (!user) return;
    try {
      const currentTotal = userMsgs.length + adminMsgs.length;
      const data = await chatApi.getMessages(undefined, Math.max(currentTotal, 20));
      setUserMsgs(data.messages);
      setAdminMsgs(data.adminMessages);
      setHasMore(data.hasMore);
      setNextCursor(data.nextCursor);
    } catch {
      // Silent refresh.
    }
  }, [user, userMsgs.length, adminMsgs.length]);

  const loadOlderMessages = useCallback(async () => {
    if (!user || !hasMore || loadingMore || !nextCursor) return;
    setLoadingMore(true);
    const prevScrollHeight = document.documentElement.scrollHeight;
    const prevScrollY = window.scrollY;

    try {
      const data = await chatApi.getMessages(nextCursor);
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
      skipAutoScrollRef.current = true;
      requestAnimationFrame(() => {
        const newScrollHeight = document.documentElement.scrollHeight;
        window.scrollTo(0, newScrollHeight - prevScrollHeight + prevScrollY);
      });
    } catch {
      // Silent pagination failure.
    } finally {
      setLoadingMore(false);
    }
  }, [user, hasMore, loadingMore, nextCursor]);

  useEffect(() => {
    const onWindowScroll = () => {
      if (window.scrollY < 80) loadOlderMessages();
    };
    window.addEventListener("scroll", onWindowScroll, { passive: true });
    return () => window.removeEventListener("scroll", onWindowScroll);
  }, [loadOlderMessages]);

  useEffect(() => {
    if (!user) return;
    const loadInitialMessages = async () => {
      setFetching(true);
      try {
        const data = await chatApi.getMessages();
        setUserMsgs(data.messages);
        setAdminMsgs(data.adminMessages);
        setHasMore(data.hasMore);
        setNextCursor(data.nextCursor);
      } catch {
        // Silent initial load failure.
      } finally {
        setFetching(false);
      }
    };
    loadInitialMessages();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const timer = setInterval(loadMessages, 10000);
    return () => clearInterval(timer);
  }, [user, loadMessages]);

  useEffect(() => {
    if (skipAutoScrollRef.current) {
      skipAutoScrollRef.current = false;
      return;
    }
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [userMsgs, adminMsgs]);

  const cycleTheme = () => {
    const order = ["light", "dark", "system"];
    setTheme(order[(order.indexOf(theme || "system") + 1) % order.length]);
  };

  const sendMessage = async () => {
    if (!input.trim() || !user) return;
    setSending(true);
    try {
      const msg = await chatApi.sendMessage(input.trim());
      setUserMsgs(prev => [...prev, msg]);
      setInput("");
    } catch {
      alert(`${t.chat.send} error`);
    } finally {
      setSending(false);
    }
  };

  const startEdit = (msg: UserMessage) => {
    setEditingId(msg.id);
    setEditValue(msg.content);
  };

  const saveEdit = async () => {
    if (!editingId || !editValue.trim()) return;
    try {
      const updated = await chatApi.editMessage(editingId, editValue.trim());
      setUserMsgs(prev =>
        prev.map(message => (message.id === editingId ? { ...message, ...updated } : message))
      );
    } catch {
      // Silent edit failure.
    } finally {
      setEditingId(null);
    }
  };

  const renderThemeIcon = () => {
    if (!mounted) return <span aria-hidden className={styles.themePlaceholder} />;
    if (theme === "dark") return <Moon size={15} />;
    if (theme === "system") return <Monitor size={15} />;
    return <Sun size={15} />;
  };

  const renderControls = (mobile = false) => (
    <>
      <select
        className={styles.select}
        value={locale}
        onChange={event => setLocale(event.target.value as Locale)}
      >
        {locales.map(item => (
          <option key={item.code} value={item.code}>
            {item.flag} {item.label}
          </option>
        ))}
      </select>
      <button className={styles.iconButton} onClick={cycleTheme}>
        {renderThemeIcon()}
      </button>
      {user ? (
        <>
          {user.role === "ADMIN" && !mobile && (
            <Link className={`${styles.iconButton} ${styles.adminLink}`} href="/admin">
              <ShieldCheck size={13} /> {t.chat.admin_link}
            </Link>
          )}
          <button className={styles.iconButton} onClick={loadMessages}>
            <RefreshCw size={14} />
          </button>
          <button className={styles.iconButton} onClick={logout}>
            <LogOut size={13} /> {t.chat.logout}
          </button>
        </>
      ) : (
        <button
          className="btn-primary"
          onClick={() => {
            setShowAuth(true);
            setMobileMenu(false);
          }}
        >
          {t.chat.sign_in_btn}
        </button>
      )}
    </>
  );

  const timeline = buildTimeline(userMsgs, adminMsgs);

  if (loading) {
    return (
      <div className={styles.center}>
        <Loader2 size={32} className="animate-spin" />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.brandGroup}>
            <Link href="/" className={styles.backLink}>
              <ArrowLeft size={15} />
            </Link>
            <div className={styles.brand}>
              <div className={styles.iconTile}>
                <MessageSquare size={15} />
              </div>
              <div>
                <p className={styles.title}>{t.chat.title}</p>
                <p className={styles.subtitle}>{user ? user.name : "yarmatxonov.uz"}</p>
              </div>
            </div>
          </div>

          <div className={styles.desktopControls}>{renderControls()}</div>
          <button className={styles.mobileButton} onClick={() => setMobileMenu(value => !value)}>
            {mobileMenu ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {mobileMenu && <div className={styles.mobileMenu}><div className={styles.mobileControls}>{renderControls(true)}</div></div>}
      </header>

      <main className={styles.main}>
        {!user && (
          <div className={styles.loginPrompt}>
            <div className={`card ${styles.loginCard}`}>
              <div className={`float ${styles.promptIcon}`}>
                <MessageSquare size={28} />
              </div>
              <h2 className={styles.loginTitle}>{t.chat.login_prompt}</h2>
              <p className={styles.loginText}>{t.chat.login_desc}</p>
              {[t.chat.feature_1, t.chat.feature_2, t.chat.feature_3].map(feature => (
                <div className={styles.feature} key={feature}>
                  <Sparkles size={13} />
                  <span>{feature}</span>
                </div>
              ))}
              <button
                className={`btn-primary ${styles.promptButton}`}
                onClick={() => setShowAuth(true)}
              >
                {t.chat.sign_in_btn}
              </button>
            </div>
          </div>
        )}

        {user && fetching && (
          <div className={styles.loading}>
            <Loader2 size={24} className="animate-spin" />
          </div>
        )}

        {user && !fetching && timeline.length === 0 && (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              <MessageSquare size={22} />
            </div>
            <p className={styles.emptyTitle}>{t.chat.no_messages}</p>
            <p className={styles.emptyText}>{t.chat.no_messages_hint}</p>
          </div>
        )}

        {user && !fetching && timeline.length > 0 && (
          <div className={styles.timeline}>
            {loadingMore && (
              <div className={styles.loadingMore}>
                <Loader2 size={13} className="animate-spin" />
                {t.chat.loading_more}
              </div>
            )}

            <DateSeparator label={t.chat.history} plain />

            {timeline.map((item, idx) => {
              const previous = timeline[idx - 1];
              const showDate = !previous || !isSameDay(item.createdAt, previous.createdAt);

              return (
                <div key={item.id}>
                  {showDate && <DateSeparator label={formatDate(item.createdAt)} />}
                  {item.kind === "admin-direct" ? (
                    <MessageBubble
                      align="left"
                      avatarLabel="SY"
                      content={item.content}
                      timeLabel={formatTime(item.createdAt)}
                      tone="incoming"
                      variant="incomingSoft"
                    />
                  ) : (
                    <MessageBubble
                      align="right"
                      content={item.content}
                      timeLabel={formatTime(item.createdAt)}
                      tone="accent"
                      variant="outgoingLarge"
                      edited={item.edited}
                      editedLabel={t.chat.edited}
                      read={item.readByAdmin}
                      showStatus
                      isEditing={editingId === item.id}
                      editValue={editValue}
                      onEditValueChange={setEditValue}
                      onSaveEdit={saveEdit}
                      onCancelEdit={() => setEditingId(null)}
                      onStartEdit={() => startEdit(item)}
                    />
                  )}
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </main>

      {user && (
        <MessageComposer
          value={input}
          placeholder={t.chat.placeholder}
          sending={sending}
          avatarLabel={user.name?.[0]?.toUpperCase() || "U"}
          onChange={setInput}
          onSend={sendMessage}
        />
      )}

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}
