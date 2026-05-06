"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const magicLinkSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório"),
  contact_info: z.string().optional(),
});

export type MagicLinkInput = z.infer<typeof magicLinkSchema>;

export async function createTeamMemberMagicLink(input: MagicLinkInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Não autorizado." as const };
  }

  const parsed = magicLinkSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten() };
  }

  const { data, error } = await supabase
    .from("team_members")
    .insert({
      manager_id: user.id,
      name: parsed.data.name,
      contact_info: parsed.data.contact_info ?? null,
    })
    .select("access_token")
    .single();

  if (error) {
    console.error("team_members insert:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/messages");

  return {
    ok: true as const,
    access_token: data.access_token,
  };
}
