"use client";
import { GitFork, Send, Link2, Mail, Heart } from "lucide-react";
import { useLang } from "@/hooks/useLang";

const socials = [
  { name:"GitHub",   href:"https://github.com/sherzodxon",      icon:<GitFork size={16}/> },
  { name:"Telegram", href:"https://t.me/sherzodxon",            icon:<Send size={16}/> },
  { name:"LinkedIn", href:"https://linkedin.com/in/sherzodxon", icon:<Link2 size={16}/> },
  { name:"Email",    href:"mailto:hello@sherzodxon.uz",         icon:<Mail size={16}/> },
];

export default function Footer() {
  const { t } = useLang();
  return (
    <footer style={{ borderTop:"1px solid var(--border)", background:"var(--bg-secondary)", padding:"32px 20px" }}>
      <div style={{ maxWidth:1220,margin:"0 auto",display:"flex",flexWrap:"wrap",alignItems:"center",justifyContent:"space-between",gap:16 }}>
        <div>
          <p style={{ fontWeight:800,fontSize:"1rem",color:"var(--text)",marginBottom:4 }}>
            <span style={{ color:"var(--accent)" }}>S</span>Y
            <span style={{ fontFamily:"JetBrains Mono,monospace",fontSize:"0.6rem",color:"var(--text-muted)",marginLeft:4 }}>.uz</span>
          </p>
          <p style={{ fontSize:"0.78rem",color:"var(--text-muted)" }}>
            © {new Date().getFullYear()} Sherzodxon Yarmatxonov · {t.footer.rights}
          </p>
          <p style={{ fontSize:"0.7rem",color:"var(--text-muted)",fontFamily:"JetBrains Mono,monospace",marginTop:2,display:"flex",alignItems:"center",gap:4 }}>
            {t.footer.built}
          </p>
        </div>
        <div style={{ display:"flex",gap:10 }}>
          {socials.map(s=>(
            <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer" title={s.name} className="social-icon" style={{ width:40,height:40,borderRadius:10 }}>
              {s.icon}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
