"use client";

import type { TaskWithRelations } from "./task-card";
import { TaskCard } from "./task-card";

const columns: { id: "todo" | "inprogress" | "done"; title: string }[] = [
  { id: "todo", title: "A fazer" },
  { id: "inprogress", title: "Em andamento" },
  { id: "done", title: "Concluído" },
];

export function KanbanBoard({ tasks }: { tasks: TaskWithRelations[] }) {
  const grouped: Record<string, TaskWithRelations[]> = {
    todo: [],
    inprogress: [],
    done: [],
  };

  for (const t of tasks) {
    const s = t.status ?? "todo";
    if (s === "todo" || s === "inprogress" || s === "done") {
      grouped[s].push(t);
    } else {
      grouped.todo.push(t);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {columns.map((col) => {
        const items = grouped[col.id];
        return (
          <div key={col.id} className="flex flex-col rounded-2xl border border-white/10 bg-black/15 p-4 backdrop-blur-md">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-white/70">
                {col.title}
              </h3>
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-medium tabular-nums">
                {items.length}
              </span>
            </div>
            <div className="flex flex-1 flex-col gap-3">
              {items.length === 0 ? (
                <p className="py-8 text-center text-sm text-white/40">
                  Nenhuma tarefa
                </p>
              ) : (
                items.map((t) => <TaskCard key={t.id} task={t} />)
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
