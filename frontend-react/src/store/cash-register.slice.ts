import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { cashRegisterService } from "@/services/cash-register.service";
import type { 
  CashRegister, 
  CashTransaction, 
  DailySummary,
  OpenRegisterPayload,
  CloseRegisterPayload,
  RecordTransactionPayload
} from "@/types/cash-register";

interface CashRegisterState {
  currentRegister: CashRegister | null;
  transactions: CashTransaction[];
  dailySummary: DailySummary | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
}

const initialState: CashRegisterState = {
  currentRegister: null,
  transactions: [],
  dailySummary: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
};

export const fetchCurrentRegister = createAsyncThunk(
  "cashRegister/fetchCurrent",
  async (officeId: number, { rejectWithValue }) => {
    try {
      // Returns null (HTTP 200) when no register is open — that is a normal state
      const register = await cashRegisterService.getCurrentRegister(officeId);
      return register;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch current register");
    }
  }
);

export const fetchTransactions = createAsyncThunk(
  "cashRegister/fetchTransactions",
  async (registerId: number, { rejectWithValue }) => {
    try {
      return await cashRegisterService.getTransactions(registerId);
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch transactions");
    }
  }
);

export const fetchDailySummary = createAsyncThunk(
  "cashRegister/fetchDailySummary",
  async (registerId: number, { rejectWithValue }) => {
    try {
      return await cashRegisterService.getDailySummary(registerId);
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch daily summary");
    }
  }
);

export const openRegister = createAsyncThunk(
  "cashRegister/open",
  async (data: OpenRegisterPayload, { rejectWithValue }) => {
    try {
      return await cashRegisterService.openRegister(data);
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to open register");
    }
  }
);

export const closeRegister = createAsyncThunk(
  "cashRegister/close",
  async ({ registerId, data }: { registerId: number; data: CloseRegisterPayload }, { rejectWithValue }) => {
    try {
      return await cashRegisterService.closeRegister(registerId, data);
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to close register");
    }
  }
);

export const recordTransaction = createAsyncThunk(
  "cashRegister/recordTransaction",
  async ({ registerId, data }: { registerId: number; data: RecordTransactionPayload }, { rejectWithValue }) => {
    try {
      return await cashRegisterService.recordTransaction(registerId, data);
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to record transaction");
    }
  }
);

const cashRegisterSlice = createSlice({
  name: "cashRegister",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    clearCurrentRegister(state) {
      state.currentRegister = null;
      state.transactions = [];
      state.dailySummary = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchCurrentRegister
      .addCase(fetchCurrentRegister.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCurrentRegister.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentRegister = action.payload;
      })
      .addCase(fetchCurrentRegister.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // fetchTransactions
      .addCase(fetchTransactions.fulfilled, (state, action: PayloadAction<CashTransaction[]>) => {
        state.transactions = action.payload;
      })
      
      // fetchDailySummary
      .addCase(fetchDailySummary.fulfilled, (state, action: PayloadAction<DailySummary>) => {
        state.dailySummary = action.payload;
      })
      
      // openRegister
      .addCase(openRegister.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(openRegister.fulfilled, (state, action: PayloadAction<CashRegister>) => {
        state.isSubmitting = false;
        state.currentRegister = action.payload;
      })
      .addCase(openRegister.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      })
      
      // closeRegister
      .addCase(closeRegister.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(closeRegister.fulfilled, (state, action: PayloadAction<CashRegister>) => {
        state.isSubmitting = false;
        state.currentRegister = action.payload;
      })
      .addCase(closeRegister.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      })
      
      // recordTransaction
      .addCase(recordTransaction.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(recordTransaction.fulfilled, (state, action: PayloadAction<CashTransaction>) => {
        state.isSubmitting = false;
        state.transactions.unshift(action.payload); // Add to top of list
      })
      .addCase(recordTransaction.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentRegister } = cashRegisterSlice.actions;
export default cashRegisterSlice.reducer;
