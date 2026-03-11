import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { CashTransaction, CashTransactionType, PaymentMethod } from "@/types/cash-register";

interface TransactionListProps {
  transactions: CashTransaction[];
}

const getTransactionTypeLabel = (type: CashTransactionType) => {
  const types: Record<CashTransactionType, string> = {
    ticket_sale: 'Venta de Boleto',
    package_payment: 'Pago de Encomienda',
    por_cobrar_collection: 'Cobro de Encomienda',
    withdrawal: 'Retiro',
    adjustment: 'Ajuste',
  };
  return types[type] || type;
};

const getPaymentMethodLabel = (method: PaymentMethod) => {
  const methods: Record<PaymentMethod, string> = {
    cash: 'Efectivo',
    transfer: 'Transferencia',
    qr: 'QR',
  };
  return methods[method] || method;
};

export function TransactionList({ transactions }: TransactionListProps) {
  if (!transactions?.length) {
    return (
      <div className="p-8 text-center text-muted-foreground border rounded-lg bg-card">
        No hay transacciones registradas en esta caja.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border rounded-md bg-card">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
          <tr>
            <th className="px-4 py-3">Fecha/Hora</th>
            <th className="px-4 py-3">Tipo</th>
            <th className="px-4 py-3">Descripción</th>
            <th className="px-4 py-3">Método</th>
            <th className="px-4 py-3 text-right">Monto</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {transactions.map((t) => {
            const isOut = t.type === 'withdrawal' || (t.type === 'adjustment' && t.amount < 0);
            return (
              <tr key={t.id} className="hover:bg-muted/50">
                <td className="px-4 py-3 whitespace-nowrap">
                  {format(new Date(t.created_at), "dd/MM/yyyy HH:mm", { locale: es })}
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className="font-normal capitalize">
                    {getTransactionTypeLabel(t.type)}
                  </Badge>
                </td>
                <td className="px-4 py-3 max-w-xs truncate" title={t.description || ""}>
                  {t.description || "-"}
                </td>
                <td className="px-4 py-3">
                  {getPaymentMethodLabel(t.payment_method)}
                </td>
                <td className={`px-4 py-3 text-right font-medium ${isOut ? 'text-red-500' : 'text-green-600'}`}>
                  {isOut ? '-' : '+'}{Math.abs(t.amount).toFixed(2)} Bs
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
