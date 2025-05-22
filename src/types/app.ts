
// App-specific types that extend or use Supabase types
import type { Database } from '../integrations/supabase/types';
import type { Json } from '../integrations/supabase/types';

// Define types for our application using the Supabase database types
export type ProductType = Database['public']['Tables']['products']['Row'];
export type CategoryType = Database['public']['Tables']['categories']['Row'];
export type AddonType = Database['public']['Tables']['addons']['Row'];
export type SaleType = Database['public']['Tables']['sales']['Row'];
export type EmployeeType = Database['public']['Tables']['employees']['Row'];

// Define types for client-side data models
// These can extend the database types with additional fields or methods
export interface EnhancedProduct extends ProductType {
  categoryName?: string;
}

export interface EnhancedSale extends SaleType {
  formattedDate?: string;
}

export interface CartAddon {
  addon: AddonType;
  quantity: number;
}

export interface CartItem {
  product: ProductType;
  quantity: number;
  addons?: CartAddon[];
  notes?: string;
}

export type PaymentMethod = 'cash' | 'card' | 'pix';

export interface PaymentDetails {
  method: PaymentMethod;
  amount: number;
  change?: number;
}

export interface Sale {
  id: string;
  items: CartItem[];
  total: number;
  payment: PaymentDetails;
  createdAt: string;
  customerName?: string;
}

// Export types for Reports page filtering
export interface ReportFilters {
  startDate: string;
  endDate: string;
  paymentMethod: PaymentMethod | 'all';
  productId: string | null;
}
