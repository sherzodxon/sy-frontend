import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5 text-center"
      style={{ background: "var(--bg)" }}
    >
      <p
        className="font-mono text-xs mb-4"
        style={{ color: "var(--accent)", letterSpacing: "0.12em" }}
      >
        404
      </p>
      <h1
        className="mb-3"
        style={{
          fontSize: "clamp(2rem, 6vw, 4rem)",
          fontWeight: 700,
          letterSpacing: "-0.04em",
          color: "var(--text)",
        }}
      >
        Page not found
      </h1>
      <p className="mb-8 max-w-sm text-sm" style={{ color: "var(--text-muted)" }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link href="/" className="btn-primary">
        ← Back home
      </Link>
    </div>
  );
}
