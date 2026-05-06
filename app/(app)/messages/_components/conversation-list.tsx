"use client";

import * as React from "react";
import { Search } from "lucide-react";

import type { ConversationSummary } from "@/lib/mock/messages";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
}: {
  conversations: ConversationSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const [q, setQ] = React.useState("");

  const filtered = React.useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return conversations;
    return conversations.filter(
      (c) =>
        c.guestName.toLowerCase().includes(t) ||
        c.propertyName.toLowerCase().includes(t)
    );
  }, [conversations, q]);

  return (
    <div className="flex h-full min-h-[480px] flex-col border-r border-white/10 bg-black/10">
      <div className="border-b border-white/10 p-4">
        <h2 className="text-lg font-semibold">Caixa de entrada</h2>
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
          <Input
            placeholder="Buscar conversas..."
            className="glass-input pl-9"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <ul className="p-2">
          {filtered.map((c) => {
            const active = c.id === selectedId;
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => onSelect(c.id)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-xl p-3 text-left transition-colors",
                    active
                      ? "bg-primary/20 ring-1 ring-primary/40"
                      : "hover:bg-white/5"
                  )}
                >
                  <Avatar className="h-11 w-11 shrink-0">
                    <AvatarFallback className="bg-secondary/40 text-sm font-semibold">
                      {initials(c.guestName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-medium">{c.guestName}</span>
                      <span className="shrink-0 text-xs text-white/45">
                        {c.lastTime}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-white/45">
                      {c.propertyName}
                    </p>
                    <p className="mt-1 truncate text-sm text-white/65">
                      {c.lastMessage}
                    </p>
                    {c.unread > 0 && (
                      <Badge variant="default" className="mt-2 h-5 px-1.5 text-[10px]">
                        {c.unread} nova{c.unread > 1 ? "s" : ""}
                      </Badge>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </ScrollArea>
    </div>
  );
}
