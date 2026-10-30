import type { Metadata } from "next";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { AppShell } from "@/components/layout/AppShell";
import { getSession } from "@/lib/auth/session";
import { getAllPublications } from "@/lib/data/repository";
import "./globals.css";

const sourceSans = Source_Sans_3({
  variable: "--font-ui",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Ágora · Or Hajayim — Un espacio para descubrir, comprender y compartir",
    template: "%s · Ágora · Or Hajayim",
  },
  description:
    "Biblioteca digital educativa, cultural y colaborativa del Colegio Or Hajayim.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://agora-theta-seven.vercel.app",
  ),
  icons: {
    icon: "/favicon.ico",
    apple: "/brand/or-hajayim-icon.png",
  },
  openGraph: {
    title: "Ágora · Or Hajayim",
    description: "Un espacio para descubrir, comprender y compartir.",
    locale: "es_MX",
    type: "website",
    images: ["/brand/or-hajayim-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSession();
  const publications = await getAllPublications(user?.role ?? "visitor");

  return (
    <html lang="es" suppressHydrationWarning className="h-full">
      <body
        className={`${sourceSans.variable} ${fraunces.variable} flex min-h-full flex-col antialiased`}
      >
        <ThemeProvider>
          <AppShell user={user} searchPublications={publications}>
            {children}
          </AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
