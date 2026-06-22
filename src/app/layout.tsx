import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/Providers";
import { DesktopStage } from "@/components/layout/DesktopStage";
import { APP_NAME, APP_TAGLINE } from "@/lib/app-config";
import "./globals.css";

export const metadata: Metadata = {
  title: `${APP_NAME} — здоровье и привычки`,
  description: APP_TAGLINE,
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/icons/icon-180.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
  },
};

export const viewport: Viewport = {
  themeColor: "#3d9b6e",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        <Providers>
          <DesktopStage>{children}</DesktopStage>
        </Providers>
      </body>
    </html>
  );
}
