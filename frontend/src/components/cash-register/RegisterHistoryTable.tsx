import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronDown, ChevronUp, History } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cashRegisterService } from "@/services/cash-register.service";
import type { CashRegisterHistoryItem, CashTransaction } from "@/types/cash-register";
import { TransactionList } from "./TransactionList";

interface RegisterHistoryTableProps {
  registers: CashRegisterHistoryItem[];
  isLoading?: boolean;
}

export function RegisterHistoryTable({ registers, isLoading }: RegisterHistoryTableProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [expandedTransactions, setExpandedTransactions] = useState<CashTransaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  const handleToggle = async (registerId: number) => {
    if (expandedId === registerId) {
      setExpandedId(null);
      setExpandedTransactions([]);
      return;
    }

    setExpandedId(registerId);
    setLoadingTransactions(true);
    try {
      const transactions = await cashRegisterService.getTransactions(registerId);
      setExpandedTransactions(transactions);
    } catch {
      setExpandedTransactions([]);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} Bs`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        Cargando historial...
      </div>
    );
  }

  if (registers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <History className="h-12 w-12 mb-2 opacity-50" />
        <p>No hay cajas cerradas en el período seleccionado</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {registers.map((reg) => (
        <div key={reg.id} className="border rounded-lg overflow-hidden">
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
          <div
            className="flex items-center w-full p-4 hover:bg-muted/50 cursor-pointer transition-colors"
            onClick={() => handleToggle(reg.id)}
          >
            <div className="flex-1 grid grid-cols-2 md:grid-cols-7 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Fecha: </span>
                <span className="font-medium">{format(new Date(reg.date), "dd/MM/yyyy", { locale: es })}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Apertura: </span>
                <span>{format(new Date(reg.opened_at), "HH:mm", { locale: es })}</span>
                <span className="text-muted-foreground text-xs ml-1">({reg.opened_by_name})</span>
              </div>
              <div>
                <span className="text-muted-foreground">Cierre: </span>
                {reg.closed_at ? (
                  <>
                    <span>{format(new Date(reg.closed_at), "HH:mm", { locale: es })}</span>
                    <span className="text-muted-foreground text-xs ml-1">({reg.closed_by_name})</span>
                  </>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </div>
              <div>
                <span className="text-muted-foreground">Bal. Inicial: </span>
                <span>{formatCurrency(reg.initial_balance)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Bal. Final: </span>
                <span className="font-medium">
                  {reg.final_balance !== null ? formatCurrency(reg.final_balance) : "—"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Diferencia: </span>
                {reg.difference !== null ? (
                  <Badge variant={Math.abs(reg.difference) < 0.01 ? "default" : "destructive"}>
                    {reg.difference >= 0 ? "+" : ""}{formatCurrency(reg.difference)}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{reg.transaction_count} txns</Badge>
                {expandedId === reg.id ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>
          </div>
          {expandedId === reg.id && (
            <div className="border-t p-4 bg-muted/30">
              <h4 className="text-sm font-medium mb-3">Transacciones de esta caja</h4>
              {loadingTransactions ? (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  Cargando transacciones...
                </div>
              ) : (
                <TransactionList transactions={expandedTransactions} />
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
