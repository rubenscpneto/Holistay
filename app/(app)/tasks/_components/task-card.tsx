"use client";

import { AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

import type { Tables } from "@/types/supabase";
import { updateTaskStatus } from "@/app/(app)/tasks/actions";
import { formatDatePtBR } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export type TaskWithRelations = Tables<"tasks"> & {
  properties: { name: string } | null;
  team_members: { name: string } | null;
};

const statusLabels: Record<string, string> = {
  todo: "A fazer",
  inprogress: "Em andamento",
  done: "Concluído",
};

const typeLabels: Record<string, string> = {
  cleaning: "Limpeza",
  maintenance: "Manutenção",
};

export function TaskCard({ task }: { task: TaskWithRelations }) {
  const router = useRouter();
  const due = new Date(task.due_date);
  const now = new Date();
  const hours = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
  const urgent = hours <= 4 && task.status !== "done";

  async function onStatusChange(next: string) {
    await updateTaskStatus({
      task_id: task.id,
      status: next as "todo" | "inprogress" | "done",
    });
    router.refresh();
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-white/10 bg-black/25 p-3 shadow-sm",
        urgent && "border-destructive/50 ring-1 ring-destructive/25"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          {urgent && (
            <Badge variant="destructive" className="mb-2 gap-1 text-[10px]">
              <AlertTriangle className="h-3 w-3" />
              Urgente
            </Badge>
          )}
          <p className="font-medium leading-snug">{task.title}</p>
          <p className="mt-1 text-xs text-white/50">
            {task.properties?.name ?? "Imóvel"}
          </p>
        </div>
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="text-[10px]">
            {task.team_members?.name
              ? task.team_members.name
                  .split(/\s+/)
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()
              : "?"}
          </AvatarFallback>
        </Avatar>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="font-normal">
          {typeLabels[task.type] ?? task.type}
        </Badge>
        <span className="text-[11px] text-white/45">
          Vence {formatDatePtBR(due, { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>

      <div className="mt-3">
        <Select value={task.status ?? "todo"} onValueChange={onStatusChange}>
          <SelectTrigger className="h-9 glass-input text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(statusLabels) as Array<keyof typeof statusLabels>).map(
              (k) => (
                <SelectItem key={k} value={k}>
                  {statusLabels[k]}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
