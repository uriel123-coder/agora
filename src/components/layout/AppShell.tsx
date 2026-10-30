"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CommandSearch } from "@/components/search/CommandSearch";
import type { Publication, SessionUser } from "@/lib/types/content";

export function AppShell({
  user,
  searchPublications,
  children,
}: {
  user: SessionUser | null;
  searchPublications: Publication[];
  children: React.ReactNode;
}) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <Header user={user} onOpenSearch={() => setSearchOpen(true)} />
      <main className="flex-1">{children}</main>
      <Footer />
      <CommandSearch
        open={searchOpen}
        onOpenChange={setSearchOpen}
        initialPublications={searchPublications}
      />
    </>
  );
}
