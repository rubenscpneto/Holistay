"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

function normalizeTime(t: string): string {
  const trimmed = t.trim();
  if (/^\d{2}:\d{2}:\d{2}$/.test(trimmed)) return trimmed;
  if (/^\d{2}:\d{2}$/.test(trimmed)) return `${trimmed}:00`;
  return trimmed;
}

const propertySchema = z.object({
  name: z.string().min(1, "O nome é obrigatório"),
  address_zip_code: z
    .string()
    .min(8, "CEP inválido")
    .transform((s) => s.replace(/\D/g, "")),
  address_street: z.string().min(1, "Logradouro é obrigatório"),
  address_number: z.string().min(1, "Número é obrigatório"),
  address_complement: z.string().optional(),
  address_neighborhood: z.string().min(1, "Bairro é obrigatório"),
  address_city: z.string().min(1, "Cidade é obrigatória"),
  address_state: z.string().min(1, "Estado é obrigatório"),
  address_country: z.string().optional().default("Brasil"),
  commission_rate: z.coerce.number().min(0).max(100),
  default_check_in_time: z.string().min(1),
  default_check_out_time: z.string().min(1),
});

export type AddPropertyInput = z.input<typeof propertySchema>;

export async function addProperty(formData: AddPropertyInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Não autorizado." as const };
  }

  const parsed = propertySchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.flatten() };
  }

  const row = parsed.data;

  const { error } = await supabase.from("properties").insert({
    manager_id: user.id,
    name: row.name,
    address_zip_code: row.address_zip_code,
    address_street: row.address_street,
    address_number: row.address_number,
    address_complement: row.address_complement ?? null,
    address_neighborhood: row.address_neighborhood,
    address_city: row.address_city,
    address_state: row.address_state,
    address_country: row.address_country ?? "Brasil",
    commission_rate: row.commission_rate,
    default_check_in_time: normalizeTime(row.default_check_in_time),
    default_check_out_time: normalizeTime(row.default_check_out_time),
    status: "draft",
  });

  if (error) {
    console.error("addProperty:", error);
    return { error: error.message };
  }

  revalidatePath("/properties");
  revalidatePath("/dashboard");
  revalidatePath("/calendar");
  return { ok: true as const };
}
