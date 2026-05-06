"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type PropertyStatusFilter = "all" | "occupied" | "vacant" | "cleaning";

export function PropertyFilters({
  cities,
}: {
  cities: string[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = (searchParams.get("status") as PropertyStatusFilter) || "all";
  const city = searchParams.get("city") || "all";

  function push(next: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v === null || v === "" || v === "all") params.delete(k);
      else params.set(k, v);
    }
    router.push(`/properties?${params.toString()}`);
  }

  const statusLabel: Record<PropertyStatusFilter, string> = {
    all: "Status",
    occupied: "Ocupado",
    vacant: "Vazio",
    cleaning: "Limpeza necessária",
  };

  const cityLabel =
    city === "all" ? "Localização" : city;

  return (
    <div className="flex flex-wrap gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="glass-panel border-white/15 gap-2">
            {statusLabel[status] ?? "Status"}
            <ChevronDown className="h-4 w-4 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="glass-panel border-white/10">
          {(
            [
              ["all", "Todos"],
              ["occupied", "Ocupado"],
              ["vacant", "Vazio"],
              ["cleaning", "Limpeza necessária"],
            ] as const
          ).map(([value, label]) => (
            <DropdownMenuItem
              key={value}
              onClick={() => push({ status: value === "all" ? null : value })}
            >
              {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="glass-panel border-white/15 gap-2">
            {cityLabel}
            <ChevronDown className="h-4 w-4 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="glass-panel border-white/10">
          <DropdownMenuItem onClick={() => push({ city: null })}>
            Todas as cidades
          </DropdownMenuItem>
          {cities.map((c) => (
            <DropdownMenuItem key={c} onClick={() => push({ city: c })}>
              {c}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
