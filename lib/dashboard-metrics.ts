import type { Tables } from "@/types/supabase";

type Booking = Tables<"bookings">;

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}

function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

/** Approximate guest-nights for revenue allocation */
function bookingNights(start: Date, end: Date): number {
  const ms = Math.max(0, end.getTime() - start.getTime());
  const n = Math.ceil(ms / (24 * 60 * 60 * 1000));
  return Math.max(1, n);
}

function bookingOverlapsMonth(b: Booking, monthRef: Date): boolean {
  const ms = startOfMonth(monthRef).getTime();
  const me = endOfMonth(monthRef).getTime();
  const s = new Date(b.start_date).getTime();
  const e = new Date(b.end_date).getTime();
  return s <= me && e >= ms;
}

function clampRange(
  start: Date,
  end: Date,
  rangeStart: Date,
  rangeEnd: Date
): { start: Date; end: Date } | null {
  const s = new Date(Math.max(start.getTime(), rangeStart.getTime()));
  const e = new Date(Math.min(end.getTime(), rangeEnd.getTime()));
  if (s >= e) return null;
  return { start: s, end: e };
}

function nightsInOverlap(
  bookingStart: Date,
  bookingEnd: Date,
  rangeStart: Date,
  rangeEnd: Date
): number {
  const cr = clampRange(bookingStart, bookingEnd, rangeStart, rangeEnd);
  if (!cr) return 0;
  return bookingNights(cr.start, cr.end);
}

export type MonthKpis = {
  totalRevenue: number;
  occupancyPct: number;
  /**
   * Average Daily Rate (ADR): gross revenue divided by occupied nights in the period.
   */
  adr: number;
  /**
   * RevPAR: gross revenue divided by available nights (properties * days).
   */
  revpar: number;
  /**
   * Optional dashboard-only extensions (computed outside the KPI function).
   */
  netProjected?: number;
  checkinsHoje?: number;
  checkoutsHoje?: number;
  overdueCleanings?: number;
  prevTotalRevenue: number;
  prevOccupancyPct: number;
  prevAdr: number;
  prevRevpar: number;
};

export function computeMonthKpis(
  bookings: Booking[],
  propertyCount: number,
  monthRef: Date = new Date()
): MonthKpis {
  const ms = startOfMonth(monthRef);
  const me = endOfMonth(monthRef);
  const daysInMonth = me.getDate();

  const prevRef = new Date(monthRef.getFullYear(), monthRef.getMonth() - 1, 15);
  const pStart = startOfMonth(prevRef);
  const pEnd = endOfMonth(prevRef);
  const prevDaysInMonth = pEnd.getDate();

  const monthBookings = bookings.filter(
    (b) => b.status !== "cancelled" && bookingOverlapsMonth(b, monthRef)
  );
  const prevBookings = bookings.filter(
    (b) => b.status !== "cancelled" && bookingOverlapsMonth(b, prevRef)
  );

  let totalRevenue = 0;
  let occupiedNights = 0;
  for (const b of monthBookings) {
    const bStart = new Date(b.start_date);
    const bEnd = new Date(b.end_date);
    const totalN = bookingNights(bStart, bEnd);
    const inMonth = nightsInOverlap(bStart, bEnd, ms, me);
    if (inMonth <= 0) continue;
    const revenue = Number(b.total_revenue ?? 0);
    totalRevenue += revenue * (inMonth / totalN);
    occupiedNights += inMonth;
  }

  let prevTotalRevenue = 0;
  let prevOccupiedNights = 0;
  for (const b of prevBookings) {
    const bStart = new Date(b.start_date);
    const bEnd = new Date(b.end_date);
    const totalN = bookingNights(bStart, bEnd);
    const inPrev = nightsInOverlap(bStart, bEnd, pStart, pEnd);
    if (inPrev <= 0) continue;
    const revenue = Number(b.total_revenue ?? 0);
    prevTotalRevenue += revenue * (inPrev / totalN);
    prevOccupiedNights += inPrev;
  }

  const denom = propertyCount * daysInMonth;
  const occupancyPct =
    denom <= 0
      ? 0
      : Math.min(
          100,
          Math.round((occupiedNights / denom) * 1000) / 10
        );
  const prevDenom = propertyCount * prevDaysInMonth;
  const prevOccupancyPct =
    prevDenom <= 0
      ? 0
      : Math.min(
          100,
          Math.round((prevOccupiedNights / prevDenom) * 1000) / 10
        );

  const adr = occupiedNights > 0 ? Math.round(totalRevenue / occupiedNights) : 0;
  const prevAdr =
    prevOccupiedNights > 0 ? Math.round(prevTotalRevenue / prevOccupiedNights) : 0;

  const revpar = denom > 0 ? Math.round(totalRevenue / denom) : 0;
  const prevRevpar = prevDenom > 0 ? Math.round(prevTotalRevenue / prevDenom) : 0;

  return {
    totalRevenue,
    occupancyPct,
    adr,
    revpar,
    prevTotalRevenue,
    prevOccupancyPct,
    prevAdr,
    prevRevpar,
  };
}

export type DayTariff = { label: string; avgPerNight: number; max: number };

export function computeNext7DaysTariffs(bookings: Booking[]): {
  days: DayTariff[];
  overallAvg: number;
} {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days: DayTariff[] = [];
  let sumAvg = 0;

  for (let i = 0; i < 7; i++) {
    const dayStart = new Date(today);
    dayStart.setDate(today.getDate() + i);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    let rateSum = 0;
    let count = 0;
    for (const b of bookings) {
      if (b.status === "cancelled") continue;
      const bStart = new Date(b.start_date);
      const bEnd = new Date(b.end_date);
      const overlap = clampRange(bStart, bEnd, dayStart, dayEnd);
      if (!overlap) continue;
      const totalN = bookingNights(bStart, bEnd);
      const nightly = Number(b.total_revenue ?? 0) / totalN;
      rateSum += nightly;
      count += 1;
    }
    const avgPerNight = count > 0 ? Math.round(rateSum / count) : 0;
    sumAvg += avgPerNight;
    days.push({
      label: dayStart.toLocaleDateString("pt-BR", { weekday: "short" }),
      avgPerNight,
      max: 0,
    });
  }

  const maxVal = Math.max(1, ...days.map((d) => d.avgPerNight));
  for (const d of days) d.max = maxVal;

  const overallAvg =
    days.length > 0 ? Math.round(sumAvg / days.length) : 0;

  return { days, overallAvg };
}
