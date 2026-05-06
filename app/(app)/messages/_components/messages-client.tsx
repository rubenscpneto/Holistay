"use client";

import * as React from "react";

import { listConversations } from "@/lib/mock/messages";
import type { ConversationSummary } from "@/lib/mock/messages";
import { GlassCard } from "@/components/glass-card";

import { ConversationList } from "./conversation-list";
import { ConversationView } from "./conversation-view";

export function MessagesClient() {
  const [items, setItems] = React.useState<ConversationSummary[]>([]);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  React.useEffect(() => {
    listConversations().then((data) => {
      setItems(data);
      setSelectedId((prev) => prev ?? data[0]?.id ?? null);
    });
  }, []);

  const selectedSummary =
    items.find((c) => c.id === selectedId) ?? null;

  return (
    <GlassCard padding="none" className="flex min-h-[560px] overflow-hidden">
      <div className="w-full max-w-[380px] shrink-0">
        <ConversationList
          conversations={items}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </div>
      <div className="min-w-0 flex-1">
        <ConversationView
          conversationId={selectedId}
          fallbackSummary={selectedSummary}
        />
      </div>
    </GlassCard>
  );
}
