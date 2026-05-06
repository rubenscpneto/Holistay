export type ConversationSummary = {
  id: string;
  guestName: string;
  propertyName: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  avatarSeed: string;
  /** ISO dates for header chip */
  stayStart: string;
  stayEnd: string;
};

export type MessageItem = {
  id: string;
  conversationId: string;
  sender: "guest" | "manager" | "ai";
  text: string;
  time: string;
};

const MOCK_CONVERSATIONS: ConversationSummary[] = [
  {
    id: "c1",
    guestName: "João Silva",
    propertyName: "Cobertura Beira-Mar",
    lastMessage:
      "Certo, confirmarei o horário de chegada amanhã.",
    lastTime: "10:42",
    unread: 1,
    avatarSeed: "joao",
    stayStart: new Date(Date.now() + 86400000).toISOString(),
    stayEnd: new Date(Date.now() + 4 * 86400000).toISOString(),
  },
  {
    id: "c2",
    guestName: "Maria Costa",
    propertyName: "Villa dos Pinheiros",
    lastMessage: "Muito obrigada pela estadia maravilhosa!",
    lastTime: "Ontem",
    unread: 0,
    avatarSeed: "maria",
    stayStart: new Date(Date.now() - 10 * 86400000).toISOString(),
    stayEnd: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
];

const MOCK_MESSAGES: Record<string, MessageItem[]> = {
  c1: [
    {
      id: "m1",
      conversationId: "c1",
      sender: "guest",
      text: "Olá! Gostaria de saber se há possibilidade de early check-in amanhã. Nosso voo chega às 10h.",
      time: "09:15",
    },
    {
      id: "m2",
      conversationId: "c1",
      sender: "manager",
      text: "Olá João! Tudo bem? Sim, podemos liberar o apartamento a partir das 11h sem custo adicional. Vou enviar o link de acesso atualizado.",
      time: "09:45",
    },
    {
      id: "m3",
      conversationId: "c1",
      sender: "guest",
      text: "Perfeito! Muito obrigado. Fico no aguardo do link. Certo, confirmarei o horário de chegada amanhã.",
      time: "10:42",
    },
  ],
  c2: [
    {
      id: "m4",
      conversationId: "c2",
      sender: "guest",
      text: "Muito obrigada pela estadia maravilhosa!",
      time: "18:30",
    },
  ],
};

export async function listConversations(): Promise<ConversationSummary[]> {
  await new Promise((r) => setTimeout(r, 0));
  return [...MOCK_CONVERSATIONS];
}

export async function getRecentConversationSummaries(
  limit: number
): Promise<ConversationSummary[]> {
  const all = await listConversations();
  return all.slice(0, limit);
}

export async function getConversation(
  id: string
): Promise<{ summary: ConversationSummary; messages: MessageItem[] } | null> {
  await new Promise((r) => setTimeout(r, 0));
  const summary = MOCK_CONVERSATIONS.find((c) => c.id === id);
  if (!summary) return null;
  const messages = MOCK_MESSAGES[id] ?? [];
  return { summary, messages };
}
