"use client";

import * as React from "react";

import type { Tables } from "@/types/supabase";
import {
  bookingMatchesPlatformFilter,
  type InferredPlatform,
} from "@/lib/calendar-platform";
import { GlassCard } from "@/components/glass-card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { BookingPill } from "./booking-pill";
import { NewBookingModal } from "./new-booking-modal";

function parseMonthKey(key: string): { y: number; m: number } {
  const [ys, ms] = key.split("-").map(Number);
  if (!ys || !ms) {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() + 1 };
  }
  return { y: ys, m: ms };
}

function monthRange(key: string) {
  const { y, m } = parseMonthKey(key);
  const start = new Date(y, m - 1, 1, 0, 0, 0, 0);
  const end = new Date(y, m, 0, 23, 59, 59, 999);
  const daysInMonth = end.getDate();
  return { start, end, daysInMonth, y, m };
}

function overlapsRange(
  bStart: Date,
  bEnd: Date,
  rangeStart: Date,
  rangeEnd: Date
): boolean {
  return bStart <= rangeEnd && bEnd >= rangeStart;
}

function bookingGridSpan(
  bStart: Date,
  bEnd: Date,
  monthStart: Date,
  monthEnd: Date
): { startCol: number; span: number } | null {
  const visStart = new Date(
    Math.max(monthStart.getTime(), bStart.getTime())
  );
  const visEnd = new Date(Math.min(monthEnd.getTime(), bEnd.getTime()));
  if (visStart > visEnd) return null;
  const startCol = visStart.getDate();
  const endDay = visEnd.getDate();
  const span = Math.max(1, endDay - startCol + 1);
  return { startCol, span };
}

export function CalendarView({
  properties,
  bookings,
  monthKey,
}: {
  properties: Tables<"properties">[];
  bookings: Tables<"bookings">[];
  monthKey: string;
}) {
  const [platform, setPlatform] = React.useState<InferredPlatform>("todas");
  const { start: monthStart, end: monthEnd, daysInMonth, y, m } =
    monthRange(monthKey);

  const filteredBookings = React.useMemo(
    () =>
      bookings.filter((b) => bookingMatchesPlatformFilter(b, platform)),
    [bookings, platform]
  );

  const weekdayRow = Array.from({ length: daysInMonth }, (_, i) => {
    const d = new Date(y, m - 1, i + 1);
    const wd = d.toLocaleDateString("pt-BR", { weekday: "short" });
    return { day: i + 1, wd };
  });

  const dayCols = `repeat(${daysInMonth}, minmax(44px, 1fr))`;

  return (
    <GlassCard padding="none" className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 p-4">
        <Tabs
          value={platform}
          onValueChange={(v) => setPlatform(v as InferredPlatform)}
        >
          <TabsList className="flex h-auto flex-wrap gap-1">
            <TabsTrigger value="todas">Todas</TabsTrigger>
            <TabsTrigger value="airbnb">Airbnb</TabsTrigger>
            <TabsTrigger value="booking">Booking</TabsTrigger>
            <TabsTrigger value="direta">Direta</TabsTrigger>
          </TabsList>
        </Tabs>
        <NewBookingModal properties={properties} />
      </div>

      <ScrollArea className="max-h-[calc(100vh-220px)] w-full">
        <div className="min-w-[720px] p-4">
          {/* Month header row */}
          <div className="flex border-b border-white/10 pb-2">
            <div className="sticky left-0 z-20 w-[220px] shrink-0 bg-background/95 py-2 text-sm font-medium text-white/80 backdrop-blur-sm">
              Propriedade
            </div>
            <div
              className="grid flex-1 gap-0 text-center text-[11px] text-white/50"
              style={{ gridTemplateColumns: dayCols }}
            >
              {weekdayRow.map(({ day, wd }) => (
                <div key={day} className="flex flex-col items-center py-1">
                  <span className="capitalize">{wd}</span>
                  <span className="text-xs font-semibold text-white/80">
                    {day}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {properties.length === 0 ? (
            <p className="py-12 text-center text-sm text-white/50">
              Cadastre um imóvel para visualizar o calendário.
            </p>
          ) : (
            properties.map((prop) => {
              const rowBookings = filteredBookings.filter(
                (b) => b.property_id === prop.id && b.status !== "cancelled"
              );

              return (
                <div
                  key={prop.id}
                  className="flex border-b border-white/5"
                >
                  <div className="sticky left-0 z-10 w-[220px] shrink-0 border-r border-white/10 bg-background/90 py-3 pl-2 pr-3 backdrop-blur-md">
                    <p className="font-semibold leading-tight">{prop.name}</p>
                    <p className="mt-1 text-[11px] text-white/45">
                      {prop.address_city || "—"}
                      {prop.commission_rate != null
                        ? ` · ${Number(prop.commission_rate)}% comissão`
                        : ""}
                    </p>
                  </div>

                  <div className="relative min-h-[92px] min-w-0 flex-1">
                    <div
                      className="absolute inset-0 grid"
                      style={{ gridTemplateColumns: dayCols }}
                    >
                      {Array.from({ length: daysInMonth }, (_, i) => (
                        <div
                          key={i}
                          className="border-l border-white/6 bg-white/2"
                        />
                      ))}
                    </div>
                    <div
                      className="pointer-events-none absolute inset-0 grid items-start gap-y-1 px-0.5 py-2"
                      style={{ gridTemplateColumns: dayCols }}
                    >
                      {rowBookings.map((b) => {
                        const bs = new Date(b.start_date);
                        const be = new Date(b.end_date);
                        if (!overlapsRange(bs, be, monthStart, monthEnd))
                          return null;
                        const span = bookingGridSpan(
                          bs,
                          be,
                          monthStart,
                          monthEnd
                        );
                        if (!span) return null;
                        return (
                          <div
                            key={b.id}
                            className="pointer-events-auto px-0.5"
                            style={{
                              gridColumn: `${span.startCol} / span ${span.span}`,
                            }}
                          >
                            <BookingPill booking={b} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </GlassCard>
  );
}
