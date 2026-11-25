import type { ReactNode } from "react";

/**
 * The real root layout (with <html lang>) lives in app/[locale]/layout.tsx so every
 * language version is server-rendered with the correct lang attribute.
 * This pass-through layout only exists for the global not-found page.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
