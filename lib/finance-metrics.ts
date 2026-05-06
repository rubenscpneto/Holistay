import type { Tables } from "@/types/supabase";

type Booking = Tables<"bookings">;
type Property = Tables<"properties">;

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}

function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

function bookingNights(start: Date, end: Date): number {
  const ms = Math.max(0, end.getTime() - start.getTime());
  return Math.max(1, Math.ceil(ms / (24 * 60 * 60 * 1000)));
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

export type BookingFinanceRow = {
  booking: Booking;
  property: Property;
  grossInMonth: number;
  commissionInMonth: number;
  platformFeeInMonth: number;
  cleaningFee: number;
  netInMonth: number;
  payoutStatus: "Pendente" | "Pago";
};

export type FinanceSummary = {
  gross: number;
  commissions: number;
  platformFees: number;
  expensesOperational: number;
  fixedCostsMonthly: number;
  netProjected: number;
  rows: BookingFinanceRow[];
};

function propertyMap(properties: Property[]): Record<string, Property> {
  const m: Record<string, Property> = {};
  for (const p of properties) m[p.id] = p;
  return m;
}

export function buildFinanceSummary(
  bookings: Booking[],
  properties: Property[],
  expenses: Tables<"expenses">[],
  fixedCosts: Tables<"fixed_costs">[],
  monthRef: Date
): FinanceSummary {
  const ms = startOfMonth(monthRef);
  const me = endOfMonth(monthRef);
  return buildFinanceSummaryForRange(bookings, properties, expenses, fixedCosts, ms, me);
}

export function buildFinanceSummaryForRange(
  bookings: Booking[],
  properties: Property[],
  expenses: Tables<"expenses">[],
  fixedCosts: Tables<"fixed_costs">[],
  rangeStart: Date,
  rangeEnd: Date
): FinanceSummary {
  const pmap = propertyMap(properties);

  let gross = 0;
  let commissions = 0;
  let platformFees = 0;
  const rows: BookingFinanceRow[] = [];
  let rowIndex = 0;

  for (const b of bookings) {
    if (b.status === "cancelled") continue;
    const p = pmap[b.property_id];
    if (!p) continue;

    const bStart = new Date(b.start_date);
    const bEnd = new Date(b.end_date);
    const cr = clampRange(bStart, bEnd, rangeStart, rangeEnd);
    if (!cr) continue;

    const totalN = bookingNights(bStart, bEnd);
    const inMonth = bookingNights(cr.start, cr.end);
    const share = inMonth / totalN;

    const grossBooking = Number(b.total_revenue ?? 0) * share;
    const feeBooking = Number(b.platform_fee ?? 0) * share;
    const rate = Number(p.commission_rate ?? 0);
    const commissionBooking = grossBooking * (rate / 100);

    /** Sem vínculo despesa↔reserva no schema; placeholder para evolução futura */
    const cleaningFee = 0;

    const netInMonth =
      grossBooking - commissionBooking - feeBooking - cleaningFee;

    gross += grossBooking;
    commissions += commissionBooking;
    platformFees += feeBooking;

    rows.push({
      booking: b,
      property: p,
      grossInMonth: grossBooking,
      commissionInMonth: commissionBooking,
      platformFeeInMonth: feeBooking,
      cleaningFee,
      netInMonth,
      payoutStatus: rowIndex % 3 === 0 ? "Pendente" : "Pago",
    });
    rowIndex += 1;
  }

  rows.sort(
    (a, b) =>
      new Date(b.booking.start_date).getTime() -
      new Date(a.booking.start_date).getTime()
  );

  let expensesOperational = 0;
  for (const e of expenses) {
    const d = new Date(e.expense_date + "T12:00:00");
    if (d >= rangeStart && d <= rangeEnd) {
      expensesOperational += Number(e.amount ?? 0);
    }
  }

  let fixedCostsMonthly = 0;
  for (const f of fixedCosts) {
    fixedCostsMonthly += Number(f.amount ?? 0);
  }

  const netProjected = gross - commissions - platformFees - expensesOperational;

  return {
    gross,
    commissions,
    platformFees,
    expensesOperational,
    fixedCostsMonthly,
    netProjected,
    rows,
  };
}
