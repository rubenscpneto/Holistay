"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";

const taskSchema = z.object({
  property_id: z.string().uuid(),
  title: z.string().min(1, "Título é obrigatório"),
  due_date: z.string().min(1, "Data é obrigatória"),
  type: z.enum(["cleaning", "maintenance"]),
  assignee_id: z.string().uuid().optional().nullable(),
});

export async function createTask(input: z.infer<typeof taskSchema>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Não autorizado." as const };
  }

  const parsed = taskSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten() };
  }

  const due = new Date(parsed.data.due_date).toISOString();

  const { error } = await supabase.from("tasks").insert({
    property_id: parsed.data.property_id,
    title: parsed.data.title,
    due_date: due,
    type: parsed.data.type,
    assignee_id: parsed.data.assignee_id || null,
    status: "todo",
  });

  if (error) {
    console.error("createTask:", error);
    return { error: error.message };
  }

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  return { ok: true as const };
}

const statusSchema = z.object({
  task_id: z.string().uuid(),
  status: z.enum(["todo", "inprogress", "done"]),
});

export async function updateTaskStatus(input: z.infer<typeof statusSchema>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Não autorizado." as const };
  }

  const parsed = statusSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten() };
  }

  const { error } = await supabase
    .from("tasks")
    .update({
      status: parsed.data.status as Database["public"]["Enums"]["task_status"],
    })
    .eq("id", parsed.data.task_id);

  if (error) {
    console.error("updateTaskStatus:", error);
    return { error: error.message };
  }

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  return { ok: true as const };
}
