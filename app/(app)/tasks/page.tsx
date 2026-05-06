import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/supabase";

import { KanbanBoard } from "./_components/kanban-board";
import type { TaskWithRelations } from "./_components/task-card";
import { NewTaskModal } from "./_components/new-task-modal";

export default async function TasksPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let tasks: TaskWithRelations[] = [];
  let propsList: Tables<"properties">[] = [];
  let teamMembers: Tables<"team_members">[] = [];

  if (user) {
    const [{ data: taskRows }, { data: props }, { data: team }] =
      await Promise.all([
        supabase
          .from("tasks")
          .select(
            `
            *,
            properties ( name ),
            team_members ( name )
          `
          )
          .order("due_date", { ascending: true }),
        supabase
          .from("properties")
          .select("*")
          .eq("manager_id", user.id),
        supabase
          .from("team_members")
          .select("*")
          .eq("manager_id", user.id),
      ]);

    tasks = (taskRows ?? []) as TaskWithRelations[];
    propsList = props ?? [];
    teamMembers = team ?? [];
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Gestão de tarefas
          </h2>
          <p className="text-sm text-white/55">
            Kanban operacional — limpeza e manutenção
          </p>
        </div>
        <NewTaskModal properties={propsList} teamMembers={teamMembers} />
      </div>

      <KanbanBoard tasks={tasks} />
    </div>
  );
}
