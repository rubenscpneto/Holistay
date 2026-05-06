import {
  Wallet,
  Receipt,
  Hammer,
  BadgeCheck,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

import { GlassCard } from "@/components/glass-card";
import { formatBRL } from "@/lib/format";

function TrendLine({ value }: { value: number }) {
  const up = value >= 0;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium ${
        up ? "text-primary" : "text-amberGold"
      }`}
    >
      {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {up ? "+" : ""}
      {value}% vs. último mês
    </span>
  );
}

export function FinanceKpis({
  gross,
  commissions,
  expensesOps,
  netProjected,
  trends,
}: {
  gross: number;
  commissions: number;
  expensesOps: number;
  netProjected: number;
  trends: { gross: number; expenses: number };
}) {
  const items = [
    {
      title: "Receita bruta total",
      icon: Wallet,
      value: formatBRL(gross),
      hint: <TrendLine value={trends.gross} />,
    },
    {
      title: "Comissões retidas",
      icon: Receipt,
      value: formatBRL(commissions),
      hint: (
        <span className="text-xs text-white/45">
          {gross > 0
            ? `${Math.round((commissions / gross) * 100)}% da receita bruta`
            : "—"}
        </span>
      ),
    },
    {
      title: "Despesas operacionais",
      icon: Hammer,
      value: formatBRL(expensesOps),
      hint: <TrendLine value={trends.expenses} />,
    },
    {
      title: "Repasse líquido projetado",
      icon: BadgeCheck,
      value: formatBRL(netProjected),
      hint: (
        <span className="text-xs text-white/45">
          Previsto após taxas e despesas
        </span>
      ),
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((it) => (
        <GlassCard key={it.title} padding="md" tone="emphasis">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-white/45">
                {it.title}
              </p>
              <p className="mt-3 text-2xl font-bold tabular-nums">{it.value}</p>
              <div className="mt-2">{it.hint}</div>
            </div>
            <div className="rounded-xl bg-primary/15 p-2 text-primary">
              <it.icon className="h-6 w-6" />
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
