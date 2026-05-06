import { GlassCard } from "@/components/glass-card";

export function CleaningProgress({
  done,
  total,
  pct,
}: {
  done: number;
  total: number;
  pct: number;
}) {
  return (
    <GlassCard className="lg:col-span-4" padding="md">
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="text-lg font-semibold">Progresso de limpeza</h3>
          <p className="text-sm text-white/55">
            Tarefas de limpeza com vencimento hoje
          </p>
        </div>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-4xl font-bold tabular-nums text-primary">
              {pct}%
            </p>
            <p className="mt-1 text-sm text-white/60">
              {done} de {total} concluídas
            </p>
          </div>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </GlassCard>
  );
}
