import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { LangProvider } from "@/hooks/useLang";
import { AuthProvider } from "@/hooks/useAuth";

export const metadata: Metadata = {
  title: "Sherzodxon Yarmatxonov — Full-Stack Developer",
  description:
    "Full-Stack Developer crafting modern web & mobile applications with Next.js, React Native, Node.js, and PostgreSQL.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#c8d2d1" },
    { media: "(prefers-color-scheme: dark)",  color: "#032221" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange={false}>
          <LangProvider>
            <AuthProvider>{children}</AuthProvider>
          </LangProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
