"use client";

import * as React from "react";
import {
  MoreVertical,
  Send,
  Paperclip,
  Sparkles,
} from "lucide-react";

import type { ConversationSummary, MessageItem } from "@/lib/mock/messages";
import { getConversation } from "@/lib/mock/messages";
import { MagicLinkDialog } from "@/components/dialogs/magic-link-dialog";
import { GlassCard } from "@/components/glass-card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { formatDateRangePtBR } from "@/lib/format";
import { cn } from "@/lib/utils";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function ConversationView({
  conversationId,
  fallbackSummary,
}: {
  conversationId: string | null;
  fallbackSummary: ConversationSummary | null;
}) {
  const [summary, setSummary] = React.useState<ConversationSummary | null>(
    fallbackSummary
  );
  const [messages, setMessages] = React.useState<MessageItem[]>([]);
  const [composer, setComposer] = React.useState("");

  React.useEffect(() => {
    if (!conversationId) {
      setSummary(null);
      setMessages([]);
      return;
    }
    let cancelled = false;
    getConversation(conversationId).then((data) => {
      if (cancelled || !data) return;
      setSummary(data.summary);
      setMessages(data.messages);
    });
    return () => {
      cancelled = true;
    };
  }, [conversationId]);

  if (!conversationId || !summary) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-center text-white/50">
        Selecione uma conversa para visualizar as mensagens.
      </div>
    );
  }

  const stayRange = formatDateRangePtBR(summary.stayStart, summary.stayEnd);

  return (
    <div className="flex min-h-[480px] flex-1 flex-col">
      <GlassCard padding="sm" className="mx-4 mt-4 rounded-xl border-white/10">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary/25 text-base font-semibold">
                {initials(summary.guestName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold">{summary.guestName}</h3>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="font-normal">
                  {stayRange}
                </Badge>
                <Badge variant="secondary" className="gap-1 font-normal">
                  Check-in em breve
                </Badge>
                <Badge variant="outline" className="font-normal">
                  {summary.propertyName}
                </Badge>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" aria-label="Mais opções">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </GlassCard>

      <ScrollArea className="flex-1 px-4 py-4">
        <div className="space-y-4">
          {messages.map((m) => {
            const isGuest = m.sender === "guest";
            const isAi = m.sender === "ai";
            return (
              <div
                key={m.id}
                className={cn(
                  "flex",
                  isGuest ? "justify-start" : "justify-end"
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl border px-4 py-3 text-sm shadow-sm",
                    isGuest &&
                      "border-white/10 bg-black/25 text-white/90",
                    !isGuest &&
                      !isAi &&
                      "border-primary/30 bg-primary/15 text-white",
                    isAi &&
                      "border-amberGold/25 bg-amberGold/10 text-amberGold"
                  )}
                >
                  <p>{m.text}</p>
                  <p className="mt-2 text-right text-[10px] text-white/45">
                    {m.time}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <Separator />

      <div className="space-y-3 p-4">
        <Textarea
          placeholder="Digite uma mensagem..."
          className="glass-input min-h-[100px] resize-none"
          value={composer}
          onChange={(e) => setComposer(e.target.value)}
        />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="gap-2"
              onClick={() => {}}
            >
              <Sparkles className="h-4 w-4" />
              Gerar resposta com IA
            </Button>
            <MagicLinkDialog
              trigger={
                <Button type="button" variant="outline" size="sm" className="gap-2 border-white/15">
                  Enviar link mágico de acesso
                </Button>
              }
            />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" size="icon" aria-label="Anexar">
              <Paperclip className="h-5 w-5" />
            </Button>
            <Button type="button" size="icon" aria-label="Enviar">
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
