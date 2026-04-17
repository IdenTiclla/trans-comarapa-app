export interface Office {
  id: number;
  name: string;
  location_id: number | null;
  phone: string | null;
  email: string | null;
  manager_name: string | null;
  created_at?: string;
  updated_at?: string;
}
