"use client";

import * as React from "react";
import { CalendarDays, Check, ChevronDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import type { DateRange } from "react-day-picker";

import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDateRangePtBR, monthLabelPtBR, capitalizeFirstPtBR } from "@/lib/format";
import { cn } from "@/lib/utils";

type Mode = "month" | "range";

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function parseDateParam(v: string | null): Date | null {
  if (!v) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
  const [y, m, d] = v.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

function toDateParam(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function buildRecentMonths(count: number): { key: string; label: string }[] {
  const base = new Date();
  base.setDate(1);
  const items: { key: string; label: string }[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(base.getFullYear(), base.getMonth() - i, 1);
    items.push({
      key: monthKey(d),
      label: capitalizeFirstPtBR(monthLabelPtBR(d)),
    });
  }
  return items;
}

export function PeriodPicker({
  defaultMonthKey,
}: {
  defaultMonthKey: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const start = parseDateParam(searchParams.get("start"));
  const end = parseDateParam(searchParams.get("end"));
  const urlMonth = searchParams.get("month");
  const currentMonth = urlMonth && /^\d{4}-\d{2}$/.test(urlMonth) ? urlMonth : defaultMonthKey;

  const initialMode: Mode = start && end ? "range" : "month";
  const [mode, setMode] = React.useState<Mode>(initialMode);
  const [draftRange, setDraftRange] = React.useState<DateRange | undefined>(
    start && end ? { from: start, to: end } : undefined
  );

  React.useEffect(() => {
    const newStart = parseDateParam(searchParams.get("start"));
    const newEnd = parseDateParam(searchParams.get("end"));
    const nextMode: Mode = newStart && newEnd ? "range" : "month";
    setMode(nextMode);
    setDraftRange(newStart && newEnd ? { from: newStart, to: newEnd } : undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  function pushParams(next: URLSearchParams) {
    const qs = next.toString();
    router.push(qs ? `/finance?${qs}` : "/finance");
  }

  function setMonth(k: string) {
    const next = new URLSearchParams(searchParams.toString());
    next.set("month", k);
    next.delete("start");
    next.delete("end");
    pushParams(next);
  }

  function setRange(from: Date, to: Date) {
    const next = new URLSearchParams(searchParams.toString());
    next.delete("month");
    next.set("start", toDateParam(from));
    next.set("end", toDateParam(to));
    pushParams(next);
  }

  const monthOptions = React.useMemo(() => buildRecentMonths(12), []);

  const rangeLabel =
    draftRange?.from && draftRange?.to
      ? formatDateRangePtBR(draftRange.from, draftRange.to)
      : "Selecionar intervalo";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <CalendarDays className="h-5 w-5 text-white/45" />

      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/3 p-1">
        <Button
          type="button"
          variant={mode === "month" ? "secondary" : "ghost"}
          size="sm"
          className="h-8"
          onClick={() => {
            setMode("month");
            setMonth(currentMonth);
          }}
        >
          Mês
        </Button>
        <Button
          type="button"
          variant={mode === "range" ? "secondary" : "ghost"}
          size="sm"
          className="h-8"
          onClick={() => setMode("range")}
        >
          Intervalo
        </Button>
      </div>

      {mode === "month" ? (
        <Select value={currentMonth} onValueChange={setMonth}>
          <SelectTrigger className="h-10 w-[220px] border-white/10 bg-white/3">
            <SelectValue placeholder="Selecionar mês" />
          </SelectTrigger>
          <SelectContent>
            {monthOptions.map((m) => (
              <SelectItem key={m.key} value={m.key}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className={cn(
                "h-10 gap-2 border-white/10 bg-white/3",
                !draftRange?.from && "text-white/55"
              )}
            >
              {rangeLabel}
              <ChevronDown className="h-4 w-4 opacity-70" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-auto p-3">
            <div className="flex flex-wrap gap-2 pb-3">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  const now = new Date();
                  const from = new Date(now.getFullYear(), now.getMonth(), 1);
                  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 12);
                  setRange(from, to);
                }}
              >
                Este mês
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-white/15"
                onClick={() => {
                  const now = new Date();
                  const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                  const to = new Date(now.getFullYear(), now.getMonth(), 0, 12);
                  setRange(from, to);
                }}
              >
                Mês passado
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-white/15"
                onClick={() => {
                  const now = new Date();
                  const to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
                  const from = new Date(to);
                  from.setDate(from.getDate() - 6);
                  setRange(from, to);
                }}
              >
                Últimos 7 dias
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-white/15"
                onClick={() => {
                  const now = new Date();
                  const to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
                  const from = new Date(to);
                  from.setDate(from.getDate() - 29);
                  setRange(from, to);
                }}
              >
                Últimos 30 dias
              </Button>
            </div>

            <Calendar
              mode="range"
              numberOfMonths={2}
              selected={draftRange}
              onSelect={(r) => setDraftRange(r ?? undefined)}
            />

            <div className="flex items-center justify-between gap-2 pt-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  const next = new URLSearchParams(searchParams.toString());
                  next.delete("start");
                  next.delete("end");
                  pushParams(next);
                }}
              >
                Limpar
              </Button>
              <Button
                type="button"
                size="sm"
                className="gap-2"
                disabled={!draftRange?.from || !draftRange?.to}
                onClick={() => {
                  if (!draftRange?.from || !draftRange?.to) return;
                  setRange(draftRange.from, draftRange.to);
                }}
              >
                <Check className="h-4 w-4" />
                Aplicar
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}

