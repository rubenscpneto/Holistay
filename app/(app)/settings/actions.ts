"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório"),
  cep: z.string().min(8, "O CEP deve ter 8 dígitos").max(9, "O CEP deve ter 8 dígitos"),
  street: z.string().min(1, "O logradouro é obrigatório"),
  number: z.string().min(1, "O número é obrigatório"),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, "O bairro é obrigatório"),
  city: z.string().min(1, "A cidade é obrigatória"),
  state: z.string().min(1, "O estado é obrigatório"),
});

export async function addProperty(formData: z.infer<typeof formSchema>) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const result = formSchema.safeParse(formData);

  if (!result.success) {
    return { error: result.error.flatten() };
  }

  const { data, error } = await supabase
    .from("properties")
    .insert([{ ...result.data, profile_id: user.id }]);

  if (error) {
    console.error("Error inserting property:", error);
    return { error: "Failed to add property." };
  }

  revalidatePath("/(app)/settings");

  return { data };
}
