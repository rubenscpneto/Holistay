import { Suspense } from "react";

import type { Tables } from "@/types/supabase";
import { getPortfolioData } from "@/lib/data/portfolio";

import { AddPropertyModal } from "./_components/add-property-modal";
import {
  PropertyCard,
  type PropertyCardStatus,
} from "./_components/property-card";
import { PropertyFilters } from "./_components/property-filters";
import type { PropertyStatusFilter } from "./_components/property-filters";

function bookingNightsMs(start: Date, end: Date): number {
  const ms = Math.max(0, end.getTime() - start.getTime());
  return Math.max(1, Math.ceil(ms / (24 * 60 * 60 * 1000)));
}

function overlapsToday(start: Date, end: Date): boolean {
  const t0 = new Date();
  t0.setHours(0, 0, 0, 0);
  const t1 = new Date();
  t1.setHours(23, 59, 59, 999);
  return start <= t1 && end >= t0;
}

function estimateNightlyFromBookings(
  bookings: Tables<"bookings">[]
): number | null {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const recent = bookings.filter(
    (b) =>
      b.status === "confirmed" && new Date(b.end_date) >= cutoff
  );
  if (!recent.length) return null;
  let sum = 0;
  let c = 0;
  for (const b of recent) {
    const s = new Date(b.start_date);
    const e = new Date(b.end_date);
    const n = bookingNightsMs(s, e);
    sum += Number(b.total_revenue ?? 0) / n;
    c += 1;
  }
  return Math.round(sum / c);
}

function resolveCardStatus(input: {
  occupied: boolean;
  cleaning: boolean;
}): PropertyCardStatus {
  if (input.cleaning) return "cleaning";
  if (input.occupied) return "occupied";
  return "vacant";
}

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; city?: string }>;
}) {
  const sp = await searchParams;
  const statusFilter = (sp.status as PropertyStatusFilter) || "all";
  const cityFilter = sp.city?.trim() || null;

  const portfolio = await getPortfolioData();
  const properties = portfolio.properties;
  const ids = properties.map((p) => p.id);

  const bookingsByProperty: Record<string, Tables<"bookings">[]> = {};
  const cleaningPropertyIds = new Set<string>();
  const occupiedPropertyIds = new Set<string>();

  for (const b of portfolio.bookings) {
    const pid = b.property_id;
    if (!bookingsByProperty[pid]) bookingsByProperty[pid] = [];
    bookingsByProperty[pid].push(b);
    const s = new Date(b.start_date);
    const e = new Date(b.end_date);
    if (overlapsToday(s, e)) {
      occupiedPropertyIds.add(pid);
    }
  }

  const soon = new Date();
  soon.setHours(soon.getHours() + 48);

  for (const t of portfolio.tasks) {
    if (t.type !== "cleaning") continue;
    if (t.status !== "todo" && t.status !== "inprogress") continue;
    if (ids.length > 0 && !ids.includes(t.property_id)) continue;
    if (new Date(t.due_date) <= soon) {
      cleaningPropertyIds.add(t.property_id);
    }
  }

  const cities = Array.from(
    new Set(
      properties
        .map((p) => p.address_city)
        .filter((c): c is string => Boolean(c && c.trim()))
    )
  ).sort((a, b) => a.localeCompare(b, "pt-BR"));

  const rows = properties.map((p) => {
    const bookings = bookingsByProperty[p.id] ?? [];
    const cardStatus = resolveCardStatus({
      occupied: occupiedPropertyIds.has(p.id),
      cleaning: cleaningPropertyIds.has(p.id),
    });
    const nightlyRate = estimateNightlyFromBookings(bookings);
    return { property: p, cardStatus, nightlyRate };
  });

  const filtered = rows.filter(({ property: p, cardStatus }) => {
    if (cityFilter && (p.address_city ?? "") !== cityFilter) return false;
    if (statusFilter === "all") return true;
    return cardStatus === statusFilter;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Propriedades</h2>
          <p className="mt-1 text-white/55">
            Gerencie seu portfólio de ativos e operação.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Suspense fallback={<div className="h-10 w-48 animate-pulse rounded-lg bg-white/5" />}>
            <PropertyFilters cities={cities} />
          </Suspense>
          <AddPropertyModal />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-white/10 bg-white/3 p-8 text-center text-white/55">
          Nenhum imóvel encontrado com os filtros atuais.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map(({ property, cardStatus, nightlyRate }) => (
            <PropertyCard
              key={property.id}
              property={property}
              cardStatus={cardStatus}
              nightlyRate={nightlyRate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
