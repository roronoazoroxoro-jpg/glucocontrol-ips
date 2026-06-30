import type { Metadata } from "next";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "GlucoControl IPS — Posadas, Misiones",
  description:
    "Asistente inteligente de diabetes del Instituto de Previsión Social de Misiones. Seguimiento de glucosa, alimentación y voz con IA.",
  keywords: ["diabetes", "glucosa", "IPSM", "IPS Misiones", "Posadas", "obra social", "salud"],
  applicationName: "GlucoControl IPS",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "GlucoControl IPS",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover" as const,
  themeColor: "#047857",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-AR">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="antialiased safe-bottom">
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
