"use client";

import * as React from "react";
import { ExternalLink, Reply } from "lucide-react";
import Link from "next/link";

import { GlassCard } from "@/components/glass-card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getRecentConversationSummaries } from "@/lib/mock/messages";
import type { ConversationSummary } from "@/lib/mock/messages";

function initials(seed: string, name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || seed.slice(0, 2).toUpperCase();
}

export function RecentMessagesWidget() {
  const [items, setItems] = React.useState<ConversationSummary[]>([]);

  React.useEffect(() => {
    let cancelled = false;
    getRecentConversationSummaries(3).then((data) => {
      if (!cancelled) setItems(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const unreadItems = items.filter((c) => (c.unread ?? 0) > 0);

  return (
    <GlassCard className="md:col-span-2 lg:col-span-2" padding="md">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold">Mensagens não lidas</h3>
          <p className="text-sm text-white/55">Priorize respostas pendentes</p>
        </div>
        <Link href="/messages">
          <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" aria-label="Abrir mensagens">
            <ExternalLink className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <ul className="mt-4 space-y-3">
        {items.length === 0 ? (
          <li className="text-sm text-white/55">Carregando…</li>
        ) : unreadItems.length === 0 ? (
          <li className="rounded-xl border border-white/10 bg-white/3 p-3 text-sm text-white/55">
            Nenhuma mensagem não lida no momento.
          </li>
        ) : (
          unreadItems.map((c) => (
            <li
              key={c.id}
              className="flex items-start gap-3 rounded-xl border border-white/10 bg-black/20 p-3"
            >
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/25 text-xs font-semibold text-primary-foreground">
                  {initials(c.avatarSeed, c.guestName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full bg-amberGold ring-2 ring-amberGold/20"
                      aria-hidden="true"
                    />
                    <p className="truncate font-medium">{c.guestName}</p>
                  </div>
                  <span className="shrink-0 text-xs text-white/45">{c.lastTime}</span>
                </div>
                <p className="truncate text-sm text-white/55">{c.lastMessage}</p>
              </div>
            </li>
          ))
        )}
      </ul>

      <Button variant="secondary" className="mt-4 w-full gap-2" asChild>
        <Link href="/messages">
          <Reply className="h-4 w-4" />
          Resposta rápida
        </Link>
      </Button>
    </GlassCard>
  );
}
