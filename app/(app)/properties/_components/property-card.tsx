import Link from "next/link";
import {
  Calendar,
  Edit,
  ImageIcon,
  MapPin,
  Router,
  Battery,
  ThermometerSun,
  Pause,
  Lock,
  Sparkles,
} from "lucide-react";

import type { Tables } from "@/types/supabase";
import { formatBRL } from "@/lib/format";
import { GlassCard } from "@/components/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
export type PropertyCardStatus = "occupied" | "vacant" | "cleaning";

export function PropertyCard({
  property,
  cardStatus,
  nightlyRate,
}: {
  property: Tables<"properties">;
  cardStatus: PropertyCardStatus;
  nightlyRate: number | null;
}) {
  const location = [property.address_neighborhood, property.address_city]
    .filter(Boolean)
    .join(", ");

  const statusBadge =
    cardStatus === "occupied"
      ? { label: "Ocupado", variant: "success" as const }
      : cardStatus === "cleaning"
        ? { label: "Limpeza necessária", variant: "warning" as const }
        : { label: "Vazio", variant: "secondary" as const };

  const chips =
    cardStatus === "occupied"
      ? [
          { icon: Lock, text: "Fechadura online", sub: "battery_5_bar 85%" },
          { icon: Battery, text: "Bateria", sub: "85%" },
        ]
      : cardStatus === "vacant"
        ? [{ icon: Router, text: "Wi‑Fi ativo", sub: "" }]
        : [
            { icon: ThermometerSun, text: "AC offline", sub: "" },
            { icon: Pause, text: "Aguardando equipe", sub: "" },
          ];

  return (
    <GlassCard padding="none" className="overflow-hidden">
      <div className="relative aspect-16/10 w-full bg-black/40">
        {property.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element -- URLs dinâmicos de imóveis
          <img
            src={property.image_url}
            alt={property.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-white/35">
            <ImageIcon className="h-12 w-12" />
          </div>
        )}
        <div className="absolute left-3 top-3">
          <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
        </div>
      </div>

      <div className="space-y-3 p-5">
        <div>
          <h3 className="text-lg font-semibold leading-tight">{property.name}</h3>
          <p className="mt-1 text-lg font-bold text-primary">
            {nightlyRate != null && nightlyRate > 0
              ? `${formatBRL(nightlyRate)}/noite`
              : "— /noite"}
          </p>
        </div>

        <p className="flex items-start gap-2 text-sm text-white/55">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span>{location || "Endereço não informado"}</span>
        </p>

        <div className="flex flex-wrap gap-2">
          {chips.map((c, i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/70"
            >
              <c.icon className="h-4 w-4 text-primary" />
              <span>{c.text}</span>
              {c.sub ? (
                <span className="text-white/45">{c.sub}</span>
              ) : null}
            </div>
          ))}
          {cardStatus === "cleaning" && (
            <div className="flex items-center gap-2 rounded-lg border border-amberGold/25 bg-amberGold/10 px-3 py-2 text-xs text-amberGold">
              <Sparkles className="h-4 w-4" />
              Prioridade operacional
            </div>
          )}
        </div>

        <div className="flex gap-2 border-t border-white/10 pt-4">
          <Button variant="secondary" size="sm" className="gap-2" asChild>
            <Link href={`/calendar`}>
              <Calendar className="h-4 w-4" />
              Calendário
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="gap-2 border-white/15" disabled>
            <Edit className="h-4 w-4" />
            Editar
          </Button>
        </div>
      </div>
    </GlassCard>
  );
}
