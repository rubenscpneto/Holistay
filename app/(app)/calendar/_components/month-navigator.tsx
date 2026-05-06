"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { capitalizeFirstPtBR, monthLabelPtBR } from "@/lib/format";

function toMonthKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function parseMonthKey(key: string | null): Date {
  if (!key || !/^\d{4}-\d{2}$/.test(key)) return new Date();
  const [ys, ms] = key.split("-");
  const y = Number(ys);
  const mo = Number(ms);
  return new Date(y, mo - 1, 1);
}

export function MonthNavigator({ initialMonth }: { initialMonth: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const key = searchParams.get("month") ?? initialMonth;
  const current = parseMonthKey(key);

  function nav(delta: number) {
    const next = new Date(current.getFullYear(), current.getMonth() + delta, 1);
    const params = new URLSearchParams(searchParams.toString());
    params.set("month", toMonthKey(next));
    router.push(`/calendar?${params.toString()}`);
  }

  const label = capitalizeFirstPtBR(monthLabelPtBR(current));

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="glass-panel border-white/15"
        onClick={() => nav(-1)}
        aria-label="Mês anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <h2 className="min-w-[200px] text-center text-xl font-semibold capitalize">
        {label}
      </h2>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="glass-panel border-white/15"
        onClick={() => nav(1)}
        aria-label="Próximo mês"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
