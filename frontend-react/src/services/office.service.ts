import { apiFetch } from '@/lib/api';
import type { Office } from '@/types/office';

const BASE_URL = '/offices';

export const officeService = {
  getAll: async () => {
    return await apiFetch<Office[]>(BASE_URL);
  },

  getById: async (id: number) => {
    return await apiFetch<Office>(`${BASE_URL}/${id}`);
  },

  create: async (data: Omit<Office, 'id' | 'created_at' | 'updated_at'>) => {
    return await apiFetch<Office>(BASE_URL, {
      method: 'POST',
      body: data
    });
  },

  update: async (id: number, data: Partial<Office>) => {
    return await apiFetch<Office>(`${BASE_URL}/${id}`, {
      method: 'PUT',
      body: data
    });
  },

  delete: async (id: number) => {
    return await apiFetch(`${BASE_URL}/${id}`, {
      method: 'DELETE'
    });
  }
};
