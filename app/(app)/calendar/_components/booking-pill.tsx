"use client";

import type { Tables } from "@/types/supabase";
import { inferBookingPlatform } from "@/lib/calendar-platform";
import { cn } from "@/lib/utils";

export function BookingPill({
  booking,
  className,
}: {
  booking: Tables<"bookings">;
  className?: string;
}) {
  const platform = inferBookingPlatform(booking);
  const guest = booking.guest_name?.trim() || "Hóspede";

  const platformLabel =
    platform === "airbnb"
      ? "Airbnb"
      : platform === "booking"
        ? "Booking"
        : "Dir.";

  const color =
    platform === "airbnb"
      ? "bg-rose-500/25 text-rose-100 border-rose-400/30"
      : platform === "booking"
        ? "bg-blue-500/25 text-blue-100 border-blue-400/30"
        : "bg-emerald-500/20 text-emerald-100 border-emerald-400/25";

  return (
    <div
      className={cn(
        "truncate rounded-md border px-2 py-1 text-[11px] font-medium shadow-sm backdrop-blur-sm",
        color,
        className
      )}
      title={`${guest} (${platformLabel})`}
    >
      <span className="truncate">{guest}</span>
      <span className="ml-1 opacity-70">({platformLabel})</span>
    </div>
  );
}
