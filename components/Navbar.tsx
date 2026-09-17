"use client";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor, Menu, X, MessageCircle, Binary } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { useDigitRain } from "@/hooks/useDigitRain";
import Link from "next/link";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";

export default function Navbar() {
  const { t } = useLang();
  const { theme, setTheme } = useTheme();
  const { enabled: rainEnabled, toggle: toggleRain } = useDigitRain();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("home");

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 30);
      const sections = ["contact","experience","projects","home"];
      for (const s of sections) {
        const el = document.getElementById(s);
        if (el && window.scrollY >= el.offsetTop - 130) { setActive(s); break; }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { key:"home", label:t.nav.home, href:"#home" },
    { key:"projects", label:t.nav.projects, href:"#projects" },
    { key:"experience", label:t.nav.experience, href:"#experience" },
    { key:"contact", label:t.nav.contact, href:"#contact" },
  ];

  const cycleTheme = () => {
    const order = ["light","dark","system"];
    setTheme(order[(order.indexOf(theme||"system")+1)%order.length]);
  };

  const rainBtnStyle = (secondary = false): React.CSSProperties => ({
    background: rainEnabled ? "var(--accent)" : secondary ? "var(--bg-secondary)" : "var(--bg-card)",
    border: "1px solid var(--border)",
    color: rainEnabled ? "#fff" : "var(--text-muted)",
    borderRadius: 8,
    padding: 6,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    lineHeight: 0,
  });

  const ThemeIcon = () => {
    if (!mounted) return <span style={{ width:15,height:15,display:"inline-block" }}/>;
    if (theme==="dark") return <Moon size={15}/>;
    if (theme==="system") return <Monitor size={15}/>;
    return <Sun size={15}/>;
  };

  const hdr: React.CSSProperties = {
    position:"fixed",top:0,left:0,right:0,zIndex:100,
    transition:"all 0.3s ease",
    background: scrolled ? "var(--bg-card)" : "transparent",
    backdropFilter: scrolled ? "blur(16px)" : "none",
    WebkitBackdropFilter: scrolled ? "blur(16px)" : "none",
    borderBottom: scrolled ? "1px solid var(--border)" : "none",
    boxShadow: scrolled ? "0 4px 24px var(--shadow)" : "none",
  };

  return (
    <header style={hdr}>
      <div style={{ maxWidth:1220,margin:"0 auto",padding:"0 20px",height:64,display:"flex",alignItems:"center",justifyContent:"space-between" }}>
        <a href="#home" style={{ fontWeight:800,fontSize:"1.1rem",color:"var(--text)",textDecoration:"none",letterSpacing:"-0.03em",display:"flex" ,alignItems:"center"}}>
          <img style={{marginRight:"10px"}} src="img/apple-touch-icon.png" width={32} height={32} alt="logo" />
          <span style={{ color:"var(--accent)" }}>S</span>herzodxon
        </a>

        <nav className="nav-desktop">
          {navLinks.map(l => (
            <a key={l.key} href={l.href} className={`nav-link ${active===l.key?"active":""}`}>{l.label}</a>
          ))}
        </nav>

        <div className="nav-controls">
          <LanguageSwitcher />
          <button onClick={cycleTheme} style={{ background:"var(--bg-card)",border:"1px solid var(--border)",color:"var(--text-muted)",borderRadius:8,padding:6,cursor:"pointer",display:"flex",alignItems:"center",lineHeight:0 }}>
            <ThemeIcon/>
          </button>
          <button onClick={toggleRain} title="Raqamlar yomg'iri" aria-label="Raqamlar yomg'iri" aria-pressed={rainEnabled} style={rainBtnStyle()}>
            <Binary size={15}/>
          </button>
          <Link href="/chat" style={{ background:"var(--accent)",color:"#fff",borderRadius:8,padding:"5px 14px",fontSize:"0.78rem",fontWeight:600,display:"flex",alignItems:"center",gap:5,textDecoration:"none" }}>
            <MessageCircle size={13}/> {t.chat.chat_btn}
          </Link>
        </div>

        <button className="nav-mobile-btn" onClick={()=>setMobileOpen(!mobileOpen)} style={{ background:"none",border:"none",cursor:"pointer",color:"var(--text)",padding:4 }}>
          {mobileOpen ? <X size={22}/> : <Menu size={22}/>}
        </button>
      </div>

      {mobileOpen && (
        <div className="nav-mobile-menu" style={{ background:"var(--bg-card)",backdropFilter:"blur(16px)",borderBottom:"1px solid var(--border)",padding:"12px 20px 20px",display:"flex",flexDirection:"column",gap:14 }}>
          {navLinks.map(l=>(
            <a key={l.key} href={l.href} className={`nav-link ${active===l.key?"active":""}`} onClick={()=>setMobileOpen(false)} style={{ display:"block",padding:"4px 0" }}>{l.label}</a>
          ))}
          <div style={{ display:"flex",alignItems:"center",gap:8,paddingTop:4 }}>
            <LanguageSwitcher variant="secondary" />
            <button onClick={cycleTheme} style={{ background:"var(--bg-secondary)",border:"1px solid var(--border)",color:"var(--text-muted)",borderRadius:8,padding:6,cursor:"pointer",display:"flex",alignItems:"center",lineHeight:0 }}>
              <ThemeIcon/>
            </button>
            <button onClick={toggleRain} title="Raqamlar yomg'iri" aria-label="Raqamlar yomg'iri" aria-pressed={rainEnabled} style={rainBtnStyle(true)}>
              <Binary size={15}/>
            </button>
            <Link href="/chat" onClick={()=>setMobileOpen(false)} style={{ background:"var(--accent)",color:"#fff",borderRadius:8,padding:"5px 14px",fontSize:"0.78rem",fontWeight:600,display:"flex",alignItems:"center",gap:5,textDecoration:"none" }}>
              <MessageCircle size={13}/> {t.chat.chat_btn}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
