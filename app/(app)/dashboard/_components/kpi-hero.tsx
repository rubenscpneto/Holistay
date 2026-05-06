import { TrendingDown, TrendingUp } from "lucide-react";

import { GlassCard } from "@/components/glass-card";
import { formatBRL } from "@/lib/format";
import type { MonthKpis } from "@/lib/dashboard-metrics";
import { capitalizeFirstPtBR, monthLabelPtBR } from "@/lib/format";

function pctDelta(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function TrendChip({ value }: { value: number }) {
  const up = value >= 0;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
        up
          ? "bg-primary/20 text-primary"
          : "bg-amberGold/15 text-amberGold"
      }`}
    >
      {up ? (
        <TrendingUp className="h-3 w-3" />
      ) : (
        <TrendingDown className="h-3 w-3" />
      )}
      {up ? "+" : ""}
      {value}% vs mês ant.
    </span>
  );
}

export function KpiHero({
  kpis,
  monthRef,
}: {
  kpis: MonthKpis;
  monthRef: Date;
}) {
  const revDelta = pctDelta(kpis.totalRevenue, kpis.prevTotalRevenue);
  const occDelta = pctDelta(kpis.occupancyPct, kpis.prevOccupancyPct);
  const adrDelta = pctDelta(kpis.adr, kpis.prevAdr);
  const revparDelta = pctDelta(kpis.revpar, kpis.prevRevpar);

  const netProjected = kpis.netProjected ?? 0;
  const checkins24h = kpis.checkins24h ?? 0;
  const overdueCleanings = kpis.overdueCleanings ?? 0;
  const netDeltaHint =
    kpis.totalRevenue > 0 ? `${Math.round((netProjected / kpis.totalRevenue) * 100)}% líquido` : "—";

  const label = capitalizeFirstPtBR(monthLabelPtBR(monthRef));

  return (
    <GlassCard className="lg:col-span-8 lg:row-span-2" padding="lg">
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Visão Geral de Desempenho
            </h2>
            <p className="mt-1 text-sm text-white/55">
              Receita, ocupação e RevPAR consolidados dos seus imóveis.
            </p>
          </div>
          <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/80">
            {label}
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white/45">
              Receita total
            </p>
            <p className="mt-2 text-2xl font-bold tabular-nums">
              {formatBRL(kpis.totalRevenue)}
            </p>
            <div className="mt-3">
              <TrendChip value={revDelta} />
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white/45">
              Taxa de ocupação
            </p>
            <p className="mt-2 text-2xl font-bold tabular-nums">
              {kpis.occupancyPct}%
            </p>
            <div className="mt-3">
              <TrendChip value={occDelta} />
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white/45">
              ADR (média / noite)
            </p>
            <p className="mt-2 text-2xl font-bold tabular-nums">
              {formatBRL(kpis.adr)}
            </p>
            <div className="mt-3">
              <TrendChip value={adrDelta} />
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white/45">
              RevPAR (por noite disponível)
            </p>
            <p className="mt-2 text-2xl font-bold tabular-nums">
              {formatBRL(kpis.revpar)}
            </p>
            <div className="mt-3">
              <TrendChip value={revparDelta} />
            </div>
          </div>
        </div>

        <div className="grid gap-3 border-t border-white/10 pt-4 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/3 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white/45">
              Líquido projetado
            </p>
            <p className="mt-1 text-lg font-semibold tabular-nums text-white/85">
              {formatBRL(netProjected)}
            </p>
            <p className="mt-1 text-xs text-white/50">{netDeltaHint}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/3 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white/45">
              Check-ins (24h)
            </p>
            <p className="mt-1 text-lg font-semibold tabular-nums text-white/85">
              {checkins24h}
            </p>
            <p className="mt-1 text-xs text-white/50">
              Chegadas previstas para as próximas 24 horas
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/3 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white/45">
              Limpezas em atraso
            </p>
            <p className="mt-1 text-lg font-semibold tabular-nums text-white/85">
              {overdueCleanings}
            </p>
            <p className="mt-1 text-xs text-white/50">
              Ações recomendadas para evitar atrasos no check-in
            </p>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
