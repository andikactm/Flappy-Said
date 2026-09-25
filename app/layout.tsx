import type { Metadata, Viewport } from "next";
import "@fontsource/press-start-2p/latin-400.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flappy Sid — One photo. Zero aerodynamics.",
  description: "Sebuah foto, beberapa pipa, dan gravitasi yang tidak mau kompromi. Tekan SPACE, klik, atau tap untuk terbang.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#152824" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body>{children}</body></html>;
}
