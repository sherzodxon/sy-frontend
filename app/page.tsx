import Navbar from "@/components/Navbar";
import Hero from "@/components/sections/Hero";
import Projects from "@/components/sections/Projects";
import Experience from "@/components/sections/Experience";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/Footer";
import ScrollProgress from "@/components/ui/ScrollProgress";
import CustomCursor from "@/components/ui/CustomCursor";
import ParticleCanvas from "@/components/ui/ParticleCanvas";
import Skills from "@/components/sections/Skills";

export default function Home() {
  return (
    <>
      <ScrollProgress />
      <CustomCursor />
      <ParticleCanvas />
      <Navbar />
      <main style={{ position: "relative", zIndex: 2 }}>
        <Hero />
        <Projects />
         <Skills/>
        <Experience />
        <Contact />
       
      </main>
      <Footer />
    </>
  );
}
