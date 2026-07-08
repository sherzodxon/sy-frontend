"use client";
import { ArrowDown, Download, GitFork, Send, Link2, Mail } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { skillsTranslations } from "@/lib/i18n";
import TypeWriter from "@/components/ui/TypeWriter";
import Counter from "@/components/ui/Counter";
import TelegramIcon from "../ui/TelegramIcon";
import LinkedInIcon from "../ui/LinkedinIcon";
import GmailIcon from "../ui/GmailIcon";
import GitHubIcon from "../ui/GithubIcon";

const socialsTranslations = {
  en: [
    { icon: <GitHubIcon size={18}/>, href: "https://github.com/sherzodxon", label: "GitHub" },
    { icon: <TelegramIcon size={18} />, href: "https://t.me/sh_yarmatxonov", label: "Telegram" },
    { icon: <LinkedInIcon size={18}/>, href: "https://linkedin.com/in/sherzodxon", label: "LinkedIn" },
    { icon: <GmailIcon size={18}/>, href: "mailto:yarmatxonovsherzodxon@gmail.com", label: "Email" },
  ],
  uz: [
    { icon: <GitHubIcon size={18}/>, href: "https://github.com/sherzodxon", label: "GitHub" },
    { icon: <TelegramIcon size={18} />, href: "https://t.me/sh_yarmatxonov", label: "Telegram" },
    { icon: <LinkedInIcon size={18}/>, href: "https://linkedin.com/in/sherzodxon", label: "LinkedIn" },
    { icon: <GmailIcon size={18}/>, href: "mailto:yarmatxonovsherzodxon@gmail.com", label: "Email" },
  ],
  ru: [
    { icon: <GitHubIcon size={18}/>, href: "https://github.com/sherzodxon", label: "GitHub" },
    { icon: <TelegramIcon size={18} />, href: "https://t.me/sh_yarmatxonov", label: "Telegram" },
    { icon: <LinkedInIcon size={18}/>, href: "https://linkedin.com/in/sherzodxon", label: "LinkedIn" },
    { icon: <GmailIcon size={18}/>, href: "mailto:yarmatxonovsherzodxon@gmail.com", label: "Email" },
  ],
};

export default function Hero() {
  const { t, locale } = useLang();
  const words = locale === "uz" 
    ? ["Full-Stack Dasturchi", "Next.js Mutaxassisi", "React Native Dasturchi", "Expo", "PostgreSQL Arxitektori", "Kiberxavfsizlik mutaxassisi"]
    : locale === "ru"
    ? ["Full-Stack Разработчик", "Эксперт Next.js", "React Native Разработчик", "Expo", "Архитектор PostgreSQL","Специалист по кибербезопасности"]
    : ["Full-Stack Developer", "Next.js Expert", "React Native Dev", "PostgreSQL Architect","Expo","Cybersecurity Specialist"];
  
  const skills = skillsTranslations[locale as keyof typeof skillsTranslations] || skillsTranslations.en;
  const socials = socialsTranslations[locale as keyof typeof socialsTranslations] || socialsTranslations.en;

  return (
    <section id="home" className="min-h-screen flex flex-col justify-center relative px-5 overflow-hidden">
      <div className="grid-bg absolute inset-0 opacity-30 pointer-events-none" />

      <div className="absolute pointer-events-none" style={{
        width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, var(--accent-dim) 0%, transparent 70%)",
        top: "-100px", right: "-100px", filter: "blur(60px)",
      }} />
      <div className="absolute pointer-events-none" style={{
        width: 350, height: 350, borderRadius: "50%",
        background: "radial-gradient(circle, var(--accent-dim) 0%, transparent 70%)",
        bottom: "-50px", left: "-80px", filter: "blur(50px)",
      }} />

      <div className="w-full lg:w-[1220px] mx-auto" style={{position: "relative", zIndex: 2, padding: "10px", paddingTop: "clamp(72px,10vw,96px)", paddingBottom: "clamp(40px,6vw,60px)", margin: "0 auto" }}>

        <div className="fade-up fade-up-1" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ width: 32, height: 1.5, background: "var(--accent)" }} />
          <span style={{ fontFamily: "JetBrains Mono,monospace", fontSize: "0.72rem", color: "var(--accent)", letterSpacing: "0.15em", textTransform: "uppercase" }}>
            {t.hero.greeting}
          </span>
        </div>

        <h1 className="fade-up fade-up-2 gradient-name" style={{
          fontSize: "clamp(3rem, 8vw, 6.5rem)", fontWeight: 800,
          letterSpacing: "-0.05em", lineHeight: 0.95, marginBottom: 20,
        }}>
          Sherzodxon<br />Yarmatxonov
        </h1>

        <div className="fade-up fade-up-3" style={{
          fontSize: "clamp(1.1rem, 2.5vw, 1.5rem)", color: "var(--text-muted)",
          fontWeight: 400, marginBottom: 16, minHeight: 40,
        }}>
          <TypeWriter words={words} speed={75} pause={2000} />
        </div>

        <p className="fade-up fade-up-3" style={{
          fontSize: "0.95rem", color: "var(--text-muted)", lineHeight: 1.75,
          maxWidth: 520, marginBottom: 28,
        }}>
          {t.hero.description}
        </p>

        <div className="fade-up fade-up-4" style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 32 }}>
          {skills.map((s, i) => (
            <span key={s} className="skill-badge" style={{ transitionDelay: `${i * 0.04}s` }}>{s}</span>
          ))}
        </div>

        <div className="fade-up fade-up-5" style={{gap: 12, marginBottom: 56 }}>
          <div style={{display:"flex",marginBottom:"20px"}}>
            <a href="#projects" className="btn-primary flex items-center" style={{marginRight:"10px",}}>
            {t.hero.cta_projects} <ArrowDown size={15} />
          </a>
          <a  href="/files/resume.pdf"   target="_blank" rel="noopener noreferrer" download="Sherzodxon(2024)" className="btn-outline flex items-center">
            {t.hero.cta_resume} <Download size={15} />
          </a>
          </div>
         
         <div style={{display:"flex"}}>
           {socials.map(s => (
            <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
              title={s.label} className="social-icon" style={{ width: 40, height: 40, borderRadius: 10,marginRight:"10px" }}>
              {s.icon}
            </a>
          ))}
         </div>
        </div>

        <div className="fade-up fade-up-5" style={{
          display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "clamp(12px,3vw,24px)",
          maxWidth: "min(380px, 100%)", paddingTop: 28,
          borderTop: "1px solid var(--border)",
        }}>
          <Counter to={5} suffix="+" label={t.experience.title} duration={1500} />
          <Counter to={20} suffix="+" label={t.projects.title} duration={1800} />
          <Counter to={3} label={t.language.title} duration={1200} />
        </div>
      </div>

      <div style={{ position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <span style={{ fontFamily: "JetBrains Mono,monospace", fontSize: "0.62rem", color: "var(--text-muted)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          {locale === "uz" ? "aylanish" : locale === "ru" ? "прокрутка" : "scroll"}
        </span>
        <div className="float" style={{ width: 1, height: 40, background: "linear-gradient(to bottom, var(--accent), transparent)" }} />
      </div>
    </section>
  );
}