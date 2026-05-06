import { formatBRL, formatDatePtBR } from "@/lib/format";
import type { BookingFinanceRow } from "@/lib/finance-metrics";
import { GlassCard } from "@/components/glass-card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export function TransactionsTable({ rows }: { rows: BookingFinanceRow[] }) {
  return (
    <GlassCard padding="md">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <h3 className="text-lg font-semibold">Transações e repasses</h3>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" disabled>
            Gerar relatório DRE
          </Button>
          <Button type="button" variant="outline" size="sm" className="border-white/15" disabled>
            Aprovar repasses em lote
          </Button>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead>Data</TableHead>
              <TableHead>Hóspede / Reserva</TableHead>
              <TableHead>Propriedade</TableHead>
              <TableHead className="text-right">Valor bruto</TableHead>
              <TableHead className="text-right">Taxa limpeza</TableHead>
              <TableHead className="text-right">Taxa plataforma</TableHead>
              <TableHead className="text-right">Valor líquido</TableHead>
              <TableHead>Status do repasse</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-white/50">
                  Nenhuma reserva no período selecionado.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => (
                <TableRow key={r.booking.id} className="border-white/10">
                  <TableCell className="whitespace-nowrap text-white/80">
                    {formatDatePtBR(r.booking.start_date)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {r.booking.guest_name?.trim() || "Hóspede"}
                  </TableCell>
                  <TableCell className="text-white/70">
                    {r.property.name}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatBRL(r.grossInMonth)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-white/55">
                    {formatBRL(r.cleaningFee)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-white/55">
                    {formatBRL(r.platformFeeInMonth)}
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">
                    {formatBRL(r.netInMonth)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        r.payoutStatus === "Pago" ? "success" : "warning"
                      }
                    >
                      {r.payoutStatus}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </GlassCard>
  );
}
