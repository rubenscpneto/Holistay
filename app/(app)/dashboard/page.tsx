import { MagicLinkDialog } from "@/components/dialogs/magic-link-dialog";
import {
  computeMonthKpis,
  computeNext7DaysTariffs,
} from "@/lib/dashboard-metrics";
import { capitalizeFirstPtBR, monthLabelPtBR } from "@/lib/format";
import { getPortfolioData } from "@/lib/data/portfolio";
import { buildFinanceSummary } from "@/lib/finance-metrics";

import { CleaningProgress } from "./_components/cleaning-progress";
import { KpiHero } from "./_components/kpi-hero";
import { RecentMessagesWidget } from "./_components/recent-messages";
import { TariffFluctuation } from "./_components/tariff-fluctuation";
import { UrgentAlerts } from "./_components/urgent-alerts";

export default async function DashboardPage() {
  const monthRef = new Date();

  const portfolio = await getPortfolioData();
  const propertyIds = portfolio.properties.map((p) => p.id);
  const propertyCount = propertyIds.length;

  const kpis = computeMonthKpis(
    portfolio.bookings,
    Math.max(0, propertyCount),
    monthRef
  );
  const tariff = computeNext7DaysTariffs(portfolio.bookings);
  const finance = buildFinanceSummary(
    portfolio.bookings,
    portfolio.properties,
    portfolio.expenses,
    portfolio.fixedCosts,
    monthRef
  );

  const startToday = new Date();
  startToday.setHours(0, 0, 0, 0);
  const endToday = new Date();
  endToday.setHours(23, 59, 59, 999);

  const checkinsHoje = portfolio.bookings.filter((b) => {
    if (b.status === "cancelled") return false;
    const s = new Date(b.start_date);
    return s >= startToday && s <= endToday;
  }).length;

  const checkoutsHoje = portfolio.bookings.filter((b) => {
    if (b.status === "cancelled") return false;
    const e = new Date(b.end_date);
    return e >= startToday && e <= endToday;
  }).length;

  const tc = portfolio.tasks.filter((t) => {
    if (t.type !== "cleaning") return false;
    const due = new Date(t.due_date);
    return due >= startToday && due <= endToday;
  });
  const cleaningTotal = tc.length;
  const cleaningDone = tc.filter((t) => t.status === "done").length;
  const cleaningPct =
    cleaningTotal > 0
      ? Math.round((cleaningDone / cleaningTotal) * 1000) / 10
      : 0;

  const now = new Date();
  const next24h = new Date(now);
  next24h.setHours(next24h.getHours() + 24);

  const checkins24h = portfolio.bookings.filter((b) => {
    if (b.status === "cancelled") return false;
    const s = new Date(b.start_date);
    return s >= now && s <= next24h;
  }).length;

  const overdueCleanings = portfolio.tasks.filter((t) => {
    if (t.type !== "cleaning") return false;
    if (t.status === "done") return false;
    return new Date(t.due_date) < now;
  }).length;

  const overdueCleaningTask = portfolio.tasks.find((t) => {
    if (t.type !== "cleaning") return false;
    if (t.status === "done") return false;
    return new Date(t.due_date) < now;
  });
  const overdueCleaningPropertyName = overdueCleaningTask
    ? portfolio.properties.find((p) => p.id === overdueCleaningTask.property_id)
        ?.name ?? null
    : null;

  const kpisExtended = {
    ...kpis,
    netProjected: finance.netProjected,
    checkinsHoje,
    checkoutsHoje,
    overdueCleanings,
  };

  const monthChip = capitalizeFirstPtBR(monthLabelPtBR(monthRef));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Visão geral do painel
          </h2>
          <p className="text-sm text-white/55">
            Acompanhe desempenho, limpeza e comunicação em tempo real.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/70">
            {monthChip}
          </span>
          <MagicLinkDialog />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:auto-rows-[minmax(140px,auto)] lg:grid-cols-4">
        <KpiHero kpis={kpisExtended} monthRef={monthRef} />
        <UrgentAlerts
          overdueCleanings={overdueCleanings}
          overdueCleaningPropertyName={overdueCleaningPropertyName}
        />
        <CleaningProgress
          done={cleaningDone}
          total={cleaningTotal}
          pct={cleaningPct}
        />
        <RecentMessagesWidget />
        <TariffFluctuation days={tariff.days} overallAvg={tariff.overallAvg} />
      </div>
    </div>
  );
}
