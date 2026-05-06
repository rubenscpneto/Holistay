"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const bookingSchema = z.object({
  property_id: z.string().uuid(),
  start_date: z.string().min(1),
  end_date: z.string().min(1),
  guest_name: z.string().optional(),
  total_revenue: z.coerce.number().min(0),
  platform_fee: z.coerce.number().min(0).optional(),
});

export async function createBooking(input: z.infer<typeof bookingSchema>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Não autorizado." as const };
  }

  const parsed = bookingSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten() };
  }

  const ical_uid = `manual:${randomUUID()}`;

  const { error } = await supabase.from("bookings").insert({
    property_id: parsed.data.property_id,
    start_date: parsed.data.start_date,
    end_date: parsed.data.end_date,
    guest_name: parsed.data.guest_name ?? null,
    total_revenue: parsed.data.total_revenue,
    platform_fee: parsed.data.platform_fee ?? 0,
    ical_uid,
    status: "confirmed",
  });

  if (error) {
    console.error("createBooking:", error);
    return { error: error.message };
  }

  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  return { ok: true as const };
}
