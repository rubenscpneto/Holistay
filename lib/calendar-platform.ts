import type { Tables } from "@/types/supabase";

export type InferredPlatform = "todas" | "airbnb" | "booking" | "direta";

/**
 * TODO: substituir por coluna `platform` na tabela `bookings` quando existir.
 * Heurística atual baseada em `ical_uid` e reservas manuais (`manual:`).
 */
export function inferBookingPlatform(
  booking: Pick<Tables<"bookings">, "ical_uid">
): Exclude<InferredPlatform, "todas"> {
  const uid = (booking.ical_uid ?? "").toLowerCase();
  if (uid.startsWith("manual:")) return "direta";
  if (uid.includes("airbnb")) return "airbnb";
  if (uid.includes("booking")) return "booking";
  return "direta";
}

export function bookingMatchesPlatformFilter(
  booking: Pick<Tables<"bookings">, "ical_uid">,
  filter: InferredPlatform
): boolean {
  if (filter === "todas") return true;
  return inferBookingPlatform(booking) === filter;
}
