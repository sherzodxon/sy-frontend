"use client";
import { ArrowUpRight } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { projectsTranslations } from "@/lib/i18n";
import FadeIn from "@/components/ui/FadeIn";

export default function Projects() {
  const { t, locale } = useLang();
  const projects = projectsTranslations[locale as keyof typeof projectsTranslations] || projectsTranslations.en;
  
  return (
    <section id="projects" style={{ padding: "clamp(56px,8vw,96px) clamp(16px,4vw,40px)" }}>
      <div className="w-full lg:w-[1220px] mx-auto" style={{ margin: "0 auto", padding: "10px" }}>

        <FadeIn style={{ marginBottom: 56 }}>
          <span className="section-eyebrow">02. {t.projects.title}</span>
          <h2 className="section-title" style={{ color: "var(--text)" }}>{t.projects.subtitle}</h2>
          <p style={{ marginTop: 10, color: "var(--text-muted)", fontSize: "0.92rem", maxWidth: 420 }}>
            {locale === "uz" ? "Haqiqiy foydalanuvchilar uchun qurilgan production-level ilovalar" :
             locale === "ru" ? "Production-level приложения, созданные для реальных пользователей" :
             "Production-level apps built for real users"}
          </p>
        </FadeIn>

        <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fill, minmax(min(300px, 100%), 1fr))" }}>
          {projects.map((project, i) => (
            <FadeIn key={project.id} delay={i * 0.07} direction="scale">
              <div className="card" style={{ borderRadius: 16, padding: 24, display: "flex", flexDirection: "column", height: "100%", position: "relative", overflow: "hidden" }}>
                <span className="project-num">{String(i + 1).padStart(2, "0")}</span>

                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                  <span style={{
                    fontSize: "0.68rem", fontFamily: "JetBrains Mono,monospace",
                    padding: "3px 10px", borderRadius: 20,
                    background: project.status === (locale === "uz" ? "Faol" : locale === "ru" ? "Активный" : "Active") ? "rgba(16,185,129,0.12)" : "var(--bg-secondary)",
                    color: project.status === (locale === "uz" ? "Faol" : locale === "ru" ? "Активный" : "Active") ? "#10b981" : "var(--text-muted)",
                    border: `1px solid ${project.status === (locale === "uz" ? "Faol" : locale === "ru" ? "Активный" : "Active") ? "rgba(16,185,129,0.25)" : "var(--border)"}`,
                  }}>
                    {project.status}
                  </span>
                  {project.link && (
                    <a href={project.link} target="_blank" rel="noopener noreferrer"
                      style={{ color: "var(--accent)", opacity: 0.7, transition: "opacity 0.2s, transform 0.2s", display: "flex" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; (e.currentTarget as HTMLElement).style.transform = "scale(1.1)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "0.7"; (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}>
                      <ArrowUpRight size={18} />
                    </a>
                  )}
                </div>

                <h3 style={{ fontWeight: 700, fontSize: "1.05rem", color: "var(--text)", marginBottom: 8, lineHeight: 1.3 }}>
                  {project.title}
                </h3>
                <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", lineHeight: 1.7, flex: 1, marginBottom: 16 }}>
                  {project.description}
                </p>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {project.tech.map(tech => <span key={tech} className="tag">{tech}</span>)}
                </div>

                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0, height: 2,
                  background: `linear-gradient(90deg, var(--accent), var(--accent-light))`,
                  transform: "scaleX(0)", transformOrigin: "left",
                  transition: "transform 0.3s ease",
                }} className="card-accent-line" />
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}