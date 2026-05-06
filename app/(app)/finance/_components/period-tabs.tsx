"use client";

import { CalendarDays } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { capitalizeFirstPtBR, monthLabelPtBR } from "@/lib/format";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function parseKey(k: string): Date | null {
  if (!/^\d{4}-\d{2}$/.test(k)) return null;
  const [y, m] = k.split("-").map(Number);
  return new Date(y, m - 1, 1);
}

export function PeriodTabs({
  currentKey,
  altKeys,
}: {
  currentKey: string;
  /** outros meses rápidos (ex.: anterior e atual) */
  altKeys: string[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const keys = Array.from(new Set([currentKey, ...altKeys])).slice(0, 6);

  function setMonth(k: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("month", k);
    router.push(`/finance?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <CalendarDays className="h-5 w-5 text-white/45" />
      <Tabs value={currentKey} onValueChange={setMonth}>
        <TabsList className="flex h-auto flex-wrap gap-1">
          {keys.map((k) => {
            const d = parseKey(k) ?? new Date();
            const label = capitalizeFirstPtBR(monthLabelPtBR(d));
            return (
              <TabsTrigger key={k} value={k} className="text-xs sm:text-sm">
                {label}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>
    </div>
  );
}
