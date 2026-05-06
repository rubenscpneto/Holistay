import { Suspense } from "react";

import { buildFinanceSummary, buildFinanceSummaryForRange } from "@/lib/finance-metrics";
import { getPortfolioData } from "@/lib/data/portfolio";

import { FinanceKpis } from "./_components/finance-kpis";
import { PeriodPicker } from "./_components/period-picker";
import { TransactionsTable } from "./_components/transactions-table";

function monthKeyFromSearch(month?: string): string {
  if (month && /^\d{4}-\d{2}$/.test(month)) return month;
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function shiftMonthKey(key: string, delta: number): string {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function parseDateParam(v?: string): Date | null {
  if (!v) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
  const [y, m, d] = v.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

function dayDiffInclusive(start: Date, end: Date): number {
  const s = new Date(start);
  const e = new Date(end);
  s.setHours(0, 0, 0, 0);
  e.setHours(0, 0, 0, 0);
  const ms = Math.max(0, e.getTime() - s.getTime());
  return Math.max(1, Math.round(ms / (24 * 60 * 60 * 1000)) + 1);
}

export default async function FinancePage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; start?: string; end?: string }>;
}) {
  const sp = await searchParams;
  const monthKey = monthKeyFromSearch(sp.month);
  const rangeStart = parseDateParam(sp.start);
  const rangeEnd = parseDateParam(sp.end);
  const hasRange = Boolean(rangeStart && rangeEnd);

  const monthRef = new Date(
    Number(monthKey.slice(0, 4)),
    Number(monthKey.slice(5, 7)) - 1,
    1
  );

  const prevKey = shiftMonthKey(monthKey, -1);
  const prevRef = new Date(
    Number(prevKey.slice(0, 4)),
    Number(prevKey.slice(5, 7)) - 1,
    1
  );

  const portfolio = await getPortfolioData();

  const summaryCurrent = hasRange
    ? buildFinanceSummaryForRange(
        portfolio.bookings,
        portfolio.properties,
        portfolio.expenses,
        portfolio.fixedCosts,
        rangeStart!,
        rangeEnd!
      )
    : buildFinanceSummary(
        portfolio.bookings,
        portfolio.properties,
        portfolio.expenses,
        portfolio.fixedCosts,
        monthRef
      );

  const summaryPrev = hasRange
    ? (() => {
        const days = dayDiffInclusive(rangeStart!, rangeEnd!);
        const pEnd = new Date(rangeStart!);
        pEnd.setDate(pEnd.getDate() - 1);
        const pStart = new Date(pEnd);
        pStart.setDate(pStart.getDate() - (days - 1));
        return buildFinanceSummaryForRange(
          portfolio.bookings,
          portfolio.properties,
          portfolio.expenses,
          portfolio.fixedCosts,
          pStart,
          pEnd
        );
      })()
    : buildFinanceSummary(
        portfolio.bookings,
        portfolio.properties,
        portfolio.expenses,
        portfolio.fixedCosts,
        prevRef
      );

  const pct = (cur: number, prev: number) =>
    prev === 0 ? (cur > 0 ? 100 : 0) : Math.round(((cur - prev) / prev) * 1000) / 10;

  const trends = {
    gross: pct(summaryCurrent.gross, summaryPrev.gross),
    expenses: pct(
      summaryCurrent.expensesOperational,
      summaryPrev.expensesOperational
    ),
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Visão geral financeira
          </h2>
          <p className="mt-1 text-white/55">
            Receitas, comissões e fluxo operacional consolidados.
          </p>
          {summaryCurrent.fixedCostsMonthly > 0 && (
            <p className="mt-2 text-xs text-white/45">
              Custos fixos mensais (portfólio):{" "}
              <span className="font-medium text-white/70">
                {summaryCurrent.fixedCostsMonthly.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </span>
            </p>
          )}
        </div>
        <Suspense
          fallback={<div className="h-10 w-64 animate-pulse rounded-lg bg-white/5" />}
        >
          <PeriodPicker defaultMonthKey={monthKey} />
        </Suspense>
      </div>

      <FinanceKpis
        gross={summaryCurrent.gross}
        commissions={summaryCurrent.commissions}
        expensesOps={summaryCurrent.expensesOperational}
        netProjected={summaryCurrent.netProjected}
        trends={trends}
      />

      <TransactionsTable rows={summaryCurrent.rows} />
    </div>
  );
}
