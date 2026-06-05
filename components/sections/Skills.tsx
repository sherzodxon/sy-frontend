"use client";
import { useState } from "react";
import { useLang } from "@/hooks/useLang";
import Reveal from "@/components/ui/Reveal";
import Counter from "@/components/ui/Counter";
// Lucide ikonkalari import qilindi
import { Zap, Wrench, Database, Rocket } from "lucide-react";

const skillGroupsTranslations = {
  en: [
    {
      title: "Frontend",
      icon: Zap,
      items: ["Next.js", "React", "TypeScript", "TailwindCSS", "React Native"],
      back: "3+ years of experience. 5+ production projects. Responsive & accessible UI.",
      quote: `"I prioritize user experience above all."`,
      exp: "3+ years",
    },
    {
      title: "Backend",
      icon: Wrench,
      items: ["Node.js", "Express", "REST API", "JWT", "WebSocket"],
      back: "Clean architecture, fast APIs, real-time systems.",
      quote: `"Modular, scalable code — always."`,
      exp: "3+ years",
    },
    {
      title: "Database",
      icon: Database,
      items: ["PostgreSQL", "Prisma", "MongoDB", "Redis"],
      back: "Complex queries, index optimization, migrations.",
      quote: `"Database is the heart of the application."`,
      exp: "2+ years",
    },
    {
      title: "DevOps",
      icon: Rocket,
      items: ["Git", "Vercel", "Render", "Docker", "CI/CD"],
      back: "Automated deployment, monitoring, infrastructure.",
      quote: `"Ship fast, break nothing."`,
      exp: "2+ years",
    },
  ],
  uz: [
    {
      title: "Frontend",
      icon: Zap,
      items: ["Next.js", "React", "TypeScript", "TailwindCSS", "React Native"],
      back: "3+ yillik tajriba. 5+ production loyiha. Responsive & accessible UI.",
      quote: `"Foydalanuvchi tajribasini birinchi o'ringa qo'yaman."`,
      exp: "3+ yil",
    },
    {
      title: "Backend",
      icon: Wrench,
      items: ["Node.js", "Express", "REST API", "JWT", "WebSocket"],
      back: "Toza arxitektura, tezkor API'lar, real-time tizimlar.",
      quote: `"Modulli, kengaytiriladigan kod — doim."`,
      exp: "3+ yil",
    },
    {
      title: "Ma'lumotlar bazasi",
      icon: Database,
      items: ["PostgreSQL", "Prisma", "MongoDB", "Redis"],
      back: "Murakkab so'rovlar, index optimallashtirish, migratsiyalar.",
      quote: `"Ma'lumotlar bazasi — ilovaning yuragi."`,
      exp: "2+ yil",
    },
    {
      title: "DevOps",
      icon: Rocket,
      items: ["Git", "Vercel", "Render", "Docker", "CI/CD"],
      back: "Avtomatlashtirilgan deploy, monitoring, infrastruktura.",
      quote: `"Ship fast, break nothing."`,
      exp: "2+ yil",
    },
  ],
  ru: [
    {
      title: "Фронтенд",
      icon: Zap,
      items: ["Next.js", "React", "TypeScript", "TailwindCSS", "React Native"],
      back: "3+ года опыта. 5+ production проектов. Адаптивный и доступный UI.",
      quote: `"Ставлю пользовательский опыт на первое место."`,
      exp: "3+ года",
    },
    {
      title: "Бэкенд",
      icon: Wrench,
      items: ["Node.js", "Express", "REST API", "JWT", "WebSocket"],
      back: "Чистая архитектура, быстрые API, системы реального времени.",
      quote: `"Модульный, масштабируемый код — всегда."`,
      exp: "3+ года",
    },
    {
      title: "База данных",
      icon: Database,
      items: ["PostgreSQL", "Prisma", "MongoDB", "Redis"],
      back: "Сложные запросы, оптимизация индексов, миграции.",
      quote: `"База данных — сердце приложения."`,
      exp: "2+ года",
    },
    {
      title: "DevOps",
      icon: Rocket,
      items: ["Git", "Vercel", "Render", "Docker", "CI/CD"],
      back: "Автоматизированный деплой, мониторинг, инфраструктура.",
      quote: `"Доставляйте быстро, ничего не ломайте."`,
      exp: "2+ года",
    },
  ],
};

export default function Skills() {
  const { t, locale } = useLang();
  const [flipped, setFlipped] = useState<number | null>(null);
  const skillGroups = skillGroupsTranslations[locale as keyof typeof skillGroupsTranslations] || skillGroupsTranslations.en;

  return (
    <section id="skills" style={{ padding: "clamp(56px,8vw,96px) clamp(16px,4vw,40px)", background: "var(--bg-secondary)" }}>
      <div style={{ maxWidth: 1220, margin: "0 auto" }}>

        <Reveal>
          <span className="section-num">02.5 · {locale === "uz" ? "Ko'nikmalar" : locale === "ru" ? "Навыки" : "Skills"}</span>
          <h2 className="section-title" style={{ color: "var(--text)", marginBottom: 8 }}>
            {locale === "uz" ? "Ko'nikmalar" : locale === "ru" ? "Навыки" : "Skills"}
          </h2>
          <div style={{ width: 48, height: 3, background: "var(--accent)", borderRadius: 2, marginTop: 12, marginBottom: 16 }} />
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginBottom: 48 }}>
            {locale === "uz" ? "Kartani bosing — batafsil ma'lumot ko'ring" :
             locale === "ru" ? "Нажмите на карточку — посмотрите подробности" :
             "Click the card — see details"}
          </p>
        </Reveal>

        <Reveal>
          <div style={{ display: "flex", gap: 40, marginBottom: 56, flexWrap: "wrap" }}>
            {[
              { to: 3, suffix: "+", label: locale === "uz" ? "Yil tajriba" : locale === "ru" ? "Лет опыта" : "Years exp" },
              { to: 15, suffix: "+", label: locale === "uz" ? "Texnologiyalar" : locale === "ru" ? "Технологии" : "Technologies" },
              { to: 6, suffix: "+", label: locale === "uz" ? "Loyihalar" : locale === "ru" ? "Проекты" : "Projects" },
            ].map((stat) => (
              <div key={stat.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", fontWeight: 800, color: "var(--accent)", letterSpacing: "-0.04em", lineHeight: 1 }}>
                  <Counter label="" to={stat.to} suffix={stat.suffix} />
                </div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontFamily: "JetBrains Mono, monospace", marginTop: 4 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </Reveal>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(280px, 100%), 1fr))", gap: 16 }}>
          {skillGroups.map((group, i) => {
            const IconComponent = group.icon;
            const isCurrentFlipped = flipped === i;

            return (
              <Reveal key={group.title} delay={i * 0.07}>
                <div
                  className="flip-card"
                  style={{ height: 220, cursor: "pointer" }}
                  data-hover
                  onClick={() => setFlipped(isCurrentFlipped ? null : i)}
                >
                  <div className={`flip-card-inner ${isCurrentFlipped ? "flipped" : ""}`} style={{ height: "100%" }}>
                    
                    {/* OLD TOMONI */}
                    <div className="flip-card-front card" style={{ borderRadius: 16, padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <IconComponent size={28} style={{ color: "var(--accent)" }} />
                        <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.65rem", color: "var(--text-muted)", background: "var(--accent-dim)", padding: "2px 8px", borderRadius: 4 }}>{group.exp}</span>
                      </div>
                      <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text)" }}>{group.title}</h3>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                        {group.items.map(item => <span key={item} className="tag">{item}</span>)}
                      </div>
                      
                      {/* Birinchi klikdan oldin ko'rinadigan qism */}
                      {!isCurrentFlipped && (
                        <div style={{ marginTop: "auto", fontSize: "0.68rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                          <span>{locale === "uz" ? "Bosing" : locale === "ru" ? "Нажмите" : "Click"}</span>
                          <span style={{ color: "var(--accent)" }}>→</span>
                        </div>
                      )}
                    </div>

                    {/* ORQA TOMONI */}
                    <div 
                      className="flip-card-back" 
                      style={{ 
                        borderRadius: 16, 
                        padding: 4, 
                        background: "var(--accent)", 
                        display: "flex", 
                        flexDirection: "column", 
                        justifyContent: "space-between",
                        pointerEvents: isCurrentFlipped ? "auto" : "none" // Kliklarni to'g'ri qabul qilish uchun
                      }}
                    >
                      {/* Klik bo'lib o'girilgandagina orqa matnlar to'liq ochiladi va qayta bosilganda yopiladi */}
                      {isCurrentFlipped && (
                        <div style={{padding: 16, }}>
                          <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.9)", lineHeight: 1.6 }}>{group.back}</p>
                          <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.7)", fontStyle: "italic", lineHeight: 1.5 }}>{group.quote}</p>
                          <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.6)", fontFamily: "JetBrains Mono, monospace" }}>
                            {locale === "uz" ? "Yana bosing → qaytish" : locale === "ru" ? "Нажмите еще раз → вернуться" : "Click again → back"}
                          </span>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}