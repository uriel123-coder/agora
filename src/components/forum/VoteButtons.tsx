"use client";

import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export function VoteButtons({
  targetType,
  targetId,
  score,
  disabled,
}: {
  targetType: "post" | "comment";
  targetId: string;
  score: number;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [localScore, setLocalScore] = useState(score);
  const [busy, setBusy] = useState(false);

  async function vote(value: 1 | -1) {
    if (disabled || busy) return;
    setBusy(true);
    const res = await fetch("/api/forum/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetType, targetId, value }),
    });
    setBusy(false);
    if (!res.ok) return;
    setLocalScore((s) => s + value);
    router.refresh();
  }

  return (
    <div className="flex w-10 flex-col items-center gap-1">
      <button
        type="button"
        aria-label="Voto positivo"
        disabled={disabled || busy}
        onClick={() => vote(1)}
        className="rounded p-1 hover:bg-beige/60 disabled:opacity-40 dark:hover:bg-white/5"
      >
        <ChevronUp className="h-5 w-5" />
      </button>
      <span className="text-sm font-semibold">{localScore}</span>
      <button
        type="button"
        aria-label="Voto negativo"
        disabled={disabled || busy}
        onClick={() => vote(-1)}
        className="rounded p-1 hover:bg-beige/60 disabled:opacity-40 dark:hover:bg-white/5"
      >
        <ChevronDown className="h-5 w-5" />
      </button>
    </div>
  );
}
