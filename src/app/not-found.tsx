import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page not found — DIGITAL STUDIO",
  robots: { index: false, follow: true },
};

/** Global 404 for URLs outside the language folders (/en, /de, /uk). */
export default function GlobalNotFound() {
  const link = { color: "#B89B65", marginRight: "1.5rem", textDecoration: "none", letterSpacing: "0.2em", fontSize: "0.75rem" };
  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: "100vh", display: "grid", placeItems: "center", background: "#090909", color: "#F4F1EA", fontFamily: "Georgia, serif" }}>
        <main style={{ padding: "2rem", maxWidth: "40rem" }}>
          <p style={{ color: "#B89B65", letterSpacing: "0.3em", fontSize: "0.75rem", fontFamily: "system-ui, sans-serif" }}>404 — DIGITAL STUDIO</p>
          <h1 style={{ fontWeight: 300, fontSize: "clamp(2.5rem, 8vw, 5rem)", margin: "1rem 0" }}>Page not found</h1>
          <p style={{ opacity: 0.7, fontFamily: "system-ui, sans-serif" }}>The page you are looking for does not exist or has been moved.</p>
          <nav aria-label="Languages" style={{ marginTop: "2rem", fontFamily: "system-ui, sans-serif" }}>
            <a href="/en" style={link}>ENGLISH</a>
            <a href="/de" style={link}>DEUTSCH</a>
            <a href="/uk" style={link}>УКРАЇНСЬКА</a>
          </nav>
        </main>
      </body>
    </html>
  );
}
