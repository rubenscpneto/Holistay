import { MessagesClient } from "./_components/messages-client";

export default function MessagesPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Mensagens</h2>
        <p className="text-sm text-white/55">
          Caixa unificada — integração com dados reais em breve
        </p>
      </div>
      <MessagesClient />
    </div>
  );
}
