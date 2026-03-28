import { apiFetch } from "@/lib/api";
import type { 
  CashRegister, 
  CashTransaction, 
  DailySummary, 
  OpenRegisterPayload, 
  CloseRegisterPayload, 
  RecordTransactionPayload,
  WithdrawalPayload,
  CashRegisterHistoryResponse
} from "@/types/cash-register";

const BASE_URL = "/cash-registers";

export const cashRegisterService = {
  openRegister: async (data: OpenRegisterPayload): Promise<CashRegister> => {
    return apiFetch<CashRegister>(`${BASE_URL}/open`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getCurrentRegister: async (officeId: number): Promise<CashRegister> => {
    return apiFetch<CashRegister>(`${BASE_URL}/current/${officeId}`);
  },

  closeRegister: async (registerId: number, data: CloseRegisterPayload): Promise<CashRegister> => {
    return apiFetch<CashRegister>(`${BASE_URL}/${registerId}/close`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  recordTransaction: async (registerId: number, data: RecordTransactionPayload): Promise<CashTransaction> => {
    return apiFetch<CashTransaction>(`${BASE_URL}/${registerId}/transactions`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  recordWithdrawal: async (registerId: number, data: WithdrawalPayload): Promise<CashTransaction> => {
    return apiFetch<CashTransaction>(`${BASE_URL}/${registerId}/withdraw`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getTransactions: async (registerId: number): Promise<CashTransaction[]> => {
    return apiFetch<CashTransaction[]>(`${BASE_URL}/${registerId}/transactions`);
  },

  getDailySummary: async (registerId: number): Promise<DailySummary> => {
    return apiFetch<DailySummary>(`${BASE_URL}/${registerId}/summary`);
  },

  getHistory: async (officeId?: number, dateFrom?: string, dateTo?: string): Promise<CashRegisterHistoryResponse> => {
    const params = new URLSearchParams();
    if (officeId) params.append("office_id", officeId.toString());
    if (dateFrom) params.append("date_from", dateFrom);
    if (dateTo) params.append("date_to", dateTo);
    const query = params.toString() ? `?${params.toString()}` : "";
    return apiFetch<CashRegisterHistoryResponse>(`${BASE_URL}/history${query}`);
  },
};
