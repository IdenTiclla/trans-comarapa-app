export type CashRegisterStatus = 'open' | 'closed';
export type CashTransactionType = 'ticket_sale' | 'package_payment' | 'por_cobrar_collection' | 'withdrawal' | 'adjustment';
export type PaymentMethod = 'cash' | 'transfer' | 'qr';

export interface CashTransaction {
  id: number;
  cash_register_id: number;
  type: CashTransactionType;
  amount: number;
  payment_method: PaymentMethod;
  reference_id?: number | null;
  reference_type?: string | null;
  description?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CashRegister {
  id: number;
  office_id: number;
  date: string;
  opened_by_id: number;
  closed_by_id?: number | null;
  initial_balance: number;
  final_balance?: number | null;
  status: CashRegisterStatus;
  opened_at: string;
  closed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CashRegisterWithTransactions extends CashRegister {
  transactions: CashTransaction[];
}

export interface DailySummary {
  office_id: number;
  date: string;
  initial_balance: number;
  final_balance?: number | null;
  total_in: number;
  total_out: number;
  expected_balance: number;
  is_closed: boolean;
  transactions_by_type: Record<string, number>;
  transactions_by_method: Record<string, number>;
}

export interface OpenRegisterPayload {
  office_id: number;
  opened_by_id: number;
  initial_balance: number;
  date: string;
}

export interface CloseRegisterPayload {
  closed_by_id: number;
  final_balance: number;
  status?: CashRegisterStatus;
  closed_at: string;
}

export interface RecordTransactionPayload {
  cash_register_id: number;
  type: CashTransactionType;
  amount: number;
  payment_method: PaymentMethod;
  reference_id?: number;
  reference_type?: string;
  description?: string;
}
