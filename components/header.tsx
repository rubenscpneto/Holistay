"use client";

import { Bell, LogOut, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/dashboard": "Painel",
  "/calendar": "Calendário",
  "/messages": "Mensagens",
  "/properties": "Imóveis",
  "/tasks": "Tarefas",
  "/finance": "Financeiro",
};

function titleForPath(pathname: string): string {
  if (pageTitles[pathname]) return pageTitles[pathname];
  const segment = pathname.split("/").filter(Boolean)[0];
  if (segment && pageTitles[`/${segment}`]) {
    return pageTitles[`/${segment}`];
  }
  return "Holistay";
}

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const title = titleForPath(pathname);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-white/10 bg-black/10 px-6 backdrop-blur-lg">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden w-[420px] max-w-[42vw] sm:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
          <Input
            placeholder="Buscar..."
            className="glass-input h-10 pl-9"
          />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="glass-panel h-10 w-10 border-white/10 bg-white/5 hover:bg-white/10"
          aria-label="Notificações"
        >
          <Bell className="h-5 w-5" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="glass-panel h-10 w-10 border-white/10 bg-white/5 hover:bg-white/10"
              aria-label="Menu do usuário"
            >
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glass-panel border-white/10 bg-black/30">
            <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
