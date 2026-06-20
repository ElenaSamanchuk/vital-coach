import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/Providers";
import { APP_NAME, APP_TAGLINE } from "@/lib/app-config";
import "./globals.css";

export const metadata: Metadata = {
  title: `${APP_NAME} — здоровье и привычки`,
  description: APP_TAGLINE,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
  },
};

export const viewport: Viewport = {
  themeColor: "#f5f5f7",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
