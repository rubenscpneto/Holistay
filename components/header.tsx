"use client";

import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/tasks": "Gestão de Tarefas",
  "/settings": "Gestão de Imóveis",
};

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const title = pageTitles[pathname] || "Holistay";

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleSignOut}>
          <User className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}

