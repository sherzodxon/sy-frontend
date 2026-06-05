"use client";
import { useLang } from "@/hooks/useLang";
import { experiencesTranslations } from "@/lib/i18n";
import FadeIn from "@/components/ui/FadeIn";

export default function Experience() {
  const { t, locale } = useLang();
  const experiences = experiencesTranslations[locale as keyof typeof experiencesTranslations] || experiencesTranslations.en;
  
  return (
    <section id="experience" style={{ padding: "clamp(56px,8vw,96px) clamp(16px,4vw,40px)", background: "var(--bg-secondary)" }}>
      <div style={{ maxWidth: 1220, margin: "0 auto" }}>

        <FadeIn style={{ marginBottom: 56 }}>
          <span className="section-eyebrow">03. {t.experience.title}</span>
          <h2 className="section-title" style={{ color: "var(--text)" }}>{t.experience.subtitle}</h2>
        </FadeIn>

        <div style={{ position: "relative", paddingLeft: 28 }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 1, background: "var(--border)" }} />

          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {experiences.map((exp, i) => (
              <FadeIn key={exp.id} delay={i * 0.1} direction="left">
                <div style={{ position: "relative" }}>
                  <div className={`tl-dot ${exp.current ? "current" : ""}`} />

                  <div className="card" style={{ borderRadius: 16, padding: "22px 24px" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 12 }}>
                      <div>
                        <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text)" }}>{exp.title}</h3>
                        {exp.link ? (
                          <a href={exp.link} target="_blank" rel="noopener noreferrer"
                            style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--accent)", textDecoration: "none" }}>
                            {exp.company} ↗
                          </a>
                        ) : (
                          <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--accent)" }}>{exp.company}</span>
                        )}
                      </div>
                      <span style={{
                        fontFamily: "JetBrains Mono,monospace", fontSize: "0.72rem",
                        padding: "4px 12px", borderRadius: 6,
                        background: exp.current ? "var(--accent-dim)" : "var(--bg)",
                        color: exp.current ? "var(--accent)" : "var(--text-muted)",
                        border: "1px solid var(--border)",
                      }}>
                        {exp.current
                          ? `${exp.duration.split("—")[0].trim()} — ${t.experience.present}`
                          : exp.duration}
                        {exp.current && (
                          <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#10b981", marginLeft: 6, animation: "pulse-dot 2s infinite" }} />
                        )}
                      </span>
                    </div>

                    <p style={{ fontSize: "0.87rem", color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 14 }}>
                      {exp.description}
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {exp.tech.map(tech => <span key={tech} className="tag">{tech}</span>)}
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}