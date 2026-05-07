import { AlertTriangle, Clock } from "lucide-react";

import { GlassCard } from "@/components/glass-card";

type AlertItem = {
  id: string;
  title: string;
  detail?: string | null;
  icon: "alert" | "clock";
};

export function UrgentAlerts({
  overdueCleanings,
  overdueCleaningPropertyName,
}: {
  overdueCleanings: number;
  overdueCleaningPropertyName: string | null;
}) {
  const items: AlertItem[] = [];

  if (overdueCleanings > 0) {
    const name = overdueCleaningPropertyName
      ? `no ${overdueCleaningPropertyName}`
      : "em um dos imóveis";
    items.push({
      id: "cleaning_overdue",
      title: `Limpeza atrasada ${name}`,
      detail: "Risco de impacto no check-in de hoje",
      icon: "alert",
    });
  }

  items.push({
    id: "unanswered_1h",
    title: "Hóspede aguardando resposta > 1h",
    detail: "Priorize a mensagem para manter o SLA",
    icon: "clock",
  });

  const visible = items.slice(0, 3);

  return (
    <GlassCard
      className="md:col-span-1 lg:col-span-1"
      padding="md"
      tone="accent"
    >
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="text-lg font-semibold text-[#e5b80b]">
            Alertas urgentes
          </h3>
          <p className="text-sm text-white/55">
            Itens críticos que exigem ação imediata
          </p>
        </div>

        <ul className="space-y-3">
          {visible.length === 0 ? (
            <li className="rounded-xl border border-white/10 bg-white/3 p-3 text-sm text-white/55">
              Nenhum alerta no momento.
            </li>
          ) : (
            visible.map((it) => (
              <li
                key={it.id}
                className="flex items-start gap-3 rounded-xl border border-[#e5b80b]/25 bg-[#e5b80b]/10 p-3"
              >
                <div className="mt-0.5 rounded-lg bg-black/20 p-2 text-[#e5b80b]">
                  {it.icon === "alert" ? (
                    <AlertTriangle className="h-4 w-4" />
                  ) : (
                    <Clock className="h-4 w-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-[#e5b80b]">{it.title}</p>
                  {it.detail ? (
                    <p className="mt-1 text-sm text-white/60">{it.detail}</p>
                  ) : null}
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </GlassCard>
  );
}

