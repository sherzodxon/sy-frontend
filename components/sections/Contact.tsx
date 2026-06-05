"use client";
import { GitFork, Send, Link as LinkIcon, Mail, MessageCircle } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { socials } from "@/lib/data";
import Link from "next/link";
import FadeIn from "@/components/ui/FadeIn";
import { useAuth } from "@/hooks/useAuth";
import { chatApi } from "@/services/api";
import { useEffect, useState } from "react";

const iconMap: Record<string, React.ReactNode> = {
  Github: <GitFork size={20} />,
  Send: <Send size={20} />,
  Linkedin: <LinkIcon size={20} />,
  Mail: <Mail size={20} />,
};

export default function Contact() {
  const { t } = useLang();
  const { user } = useAuth();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) return;
    chatApi.getUnreadCount().then(r => setUnread(r.count)).catch(() => {});
    const interval = setInterval(() => {
      chatApi.getUnreadCount().then(r => setUnread(r.count)).catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <section id="contact" style={{ padding: "clamp(56px,8vw,96px) clamp(16px,4vw,40px)" }}>
      <div style={{ maxWidth: 1024, margin: "0 auto" }}>
        <FadeIn style={{ marginBottom: 56 }}>
          <span className="section-eyebrow">04. {t.contact.title}</span>
          <h2 className="section-title" style={{ color: "var(--text)" }}>{t.contact.subtitle}</h2>
          <p style={{ marginTop: 10, color: "var(--text-muted)", fontSize: "0.92rem" }}>
            {t.contact.social_hint}
          </p>
        </FadeIn>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: "clamp(24px,4vw,48px)", alignItems: "start" }}
          className="contact-grid">
          <FadeIn>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(200px,100%), 1fr))", gap: 14 }}>
              {socials.map((s, i) => (
                <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer"
                  className="card"
                  style={{ borderRadius: 14, padding: "18px 20px", display: "flex", alignItems: "center", gap: 14, textDecoration: "none", color: "var(--text)", transitionDelay: `${i * 0.06}s` }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.color = "var(--accent)";
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.color = "var(--text)";
                    (e.currentTarget as HTMLElement).style.borderColor = "";
                  }}
                >
                  <div style={{ color: "var(--accent)" }}>{iconMap[s.icon]}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{s.name}</div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "JetBrains Mono,monospace" }}>
                      @sherzodxon
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </FadeIn>

          {/* Chat CTA with unread badge */}
          <FadeIn delay={0.2} direction="scale">
            <div className="card" style={{ borderRadius: 20, padding: "32px 28px", textAlign: "center", minWidth: 200 }}>
              <div style={{ position: "relative", display: "inline-block", marginBottom: 12 }}>
                <div style={{ fontSize: "2.5rem" }}>💬</div>
                {unread > 0 && (
                  <span style={{
                    position: "absolute", top: -4, right: -4,
                    background: "#ef4444", color: "#fff",
                    borderRadius: "50%", width: 20, height: 20,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.65rem", fontWeight: 700,
                    border: "2px solid var(--bg)",
                    animation: "pulse-dot 2s infinite",
                  }}>
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </div>
              <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text)", marginBottom: 6 }}>
                {t.contact.chat}
              </h3>
              {unread > 0 && (
                <p style={{ fontSize: "0.75rem", color: "#ef4444", marginBottom: 10, fontWeight: 600 }}>
                  {unread} ta yangi javob!
                </p>
              )}
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 18, lineHeight: 1.5 }}>
                {t.chat.login_desc}
              </p>
              <Link href="/chat" className="btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                <MessageCircle size={16} /> {t.contact.chat}
              </Link>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}