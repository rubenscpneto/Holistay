import { GlassCard } from "@/components/glass-card";
import { formatBRL } from "@/lib/format";
import type { DayTariff } from "@/lib/dashboard-metrics";

export function TariffFluctuation({
  days,
  overallAvg,
}: {
  days: DayTariff[];
  overallAvg: number;
}) {
  return (
    <GlassCard className="lg:col-span-8" padding="md">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">Flutuação de tarifas diárias</h3>
            <p className="text-sm text-white/55">
              Média de {formatBRL(overallAvg)}/noite nos próximos 7 dias
            </p>
          </div>
        </div>
        <div className="flex h-40 items-end justify-between gap-2 border-t border-white/10 pt-4">
          {days.map((d) => (
            <div
              key={d.label}
              className="flex flex-1 flex-col items-center gap-2"
            >
              <div className="flex h-28 w-full flex-col justify-end rounded-lg bg-black/25 px-1 pt-2">
                <div
                  className="mx-auto w-[70%] min-h-[4px] rounded-t-md bg-linear-to-t from-primary to-primary/60 transition-all"
                  style={{
                    height: `${Math.max(8, (d.avgPerNight / d.max) * 100)}%`,
                  }}
                  title={formatBRL(d.avgPerNight)}
                />
              </div>
              <span className="text-[10px] uppercase text-white/45">{d.label}</span>
              <span className="text-xs font-medium tabular-nums text-white/75">
                {d.avgPerNight > 0 ? formatBRL(d.avgPerNight) : "—"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
