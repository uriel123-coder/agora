import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { AppShell } from "@/components/layout/AppShell";
import { getSession } from "@/lib/auth/session";
import { getAllPublications } from "@/lib/data/repository";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Ágora — Un espacio para descubrir, comprender y compartir",
    template: "%s · Ágora",
  },
  description:
    "Biblioteca digital educativa, cultural y colaborativa para la comunidad escolar.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "Ágora",
    description:
      "Un espacio para descubrir, comprender y compartir.",
    locale: "es_MX",
    type: "website",
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
        className={`${inter.variable} ${playfair.variable} flex min-h-full flex-col antialiased`}
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
