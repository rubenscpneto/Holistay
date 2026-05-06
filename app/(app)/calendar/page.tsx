import { Suspense } from "react";

import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/supabase";

import { CalendarView } from "./_components/calendar-view";
import { MonthNavigator } from "./_components/month-navigator";

function monthKeyFromSearch(month?: string): string {
  if (month && /^\d{4}-\d{2}$/.test(month)) return month;
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const sp = await searchParams;
  const monthKey = monthKeyFromSearch(sp.month);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let properties: Tables<"properties">[] = [];
  let bookings: Tables<"bookings">[] = [];

  if (user) {
    const { data: props } = await supabase
      .from("properties")
      .select("*")
      .eq("manager_id", user.id)
      .order("name");

    properties = props ?? [];

    const ids = properties.map((p) => p.id);
    if (ids.length > 0) {
      const [ys, ms] = monthKey.split("-").map(Number);
      const rangeStart = new Date(ys, ms - 1, 1, 0, 0, 0, 0);
      const rangeEnd = new Date(ys, ms, 0, 23, 59, 59, 999);

      const { data: books } = await supabase
        .from("bookings")
        .select("*")
        .in("property_id", ids)
        .lte("start_date", rangeEnd.toISOString())
        .gte("end_date", rangeStart.toISOString());

      bookings = books ?? [];
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Calendário</h2>
          <p className="text-sm text-white/55">
            Matriz de reservas por imóvel e período
          </p>
        </div>
        <Suspense
          fallback={
            <div className="h-10 w-72 animate-pulse rounded-xl bg-white/5" />
          }
        >
          <MonthNavigator initialMonth={monthKey} />
        </Suspense>
      </div>

      <CalendarView
        properties={properties}
        bookings={bookings}
        monthKey={monthKey}
      />
    </div>
  );
}
