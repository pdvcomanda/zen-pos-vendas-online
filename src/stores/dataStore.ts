
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { supabase } from "@/integrations/supabase/client";
import { 
  ProductType, 
  CategoryType, 
  AddonType,
  CartItem, 
  PaymentMethod, 
  PaymentDetails,
  Sale,
  CartAddon
} from "@/types/app";
import { Json } from '@/integrations/supabase/types';

interface DataState {
  // Using the types from our app.ts
  products: ProductType[];
  categories: CategoryType[];
  addons: AddonType[];
  sales: Sale[];
  cart: CartItem[];
  
  // Product & Category Actions
  addProduct: (product: Omit<ProductType, 'id' | 'created_at' | 'updated_at'>) => Promise<ProductType | null>;
  updateProduct: (id: string, product: Partial<Omit<ProductType, 'id' | 'created_at' | 'updated_at'>>) => Promise<ProductType | null>;
  deleteProduct: (id: string) => Promise<boolean>;
  
  addCategory: (category: Omit<CategoryType, 'id' | 'created_at'>) => Promise<CategoryType | null>;
  updateCategory: (id: string, name: string) => Promise<CategoryType | null>;
  deleteCategory: (id: string) => Promise<boolean>;
  
  // Addon Actions
  addAddon: (addon: Omit<AddonType, 'id' | 'created_at'>) => Promise<AddonType | null>;
  updateAddon: (id: string, addon: Partial<Omit<AddonType, 'id' | 'created_at'>>) => Promise<AddonType | null>;
  deleteAddon: (id: string) => Promise<boolean>;
  
  // Cart Actions
  addToCart: (product: ProductType, quantity?: number, addons?: AddonType[], notes?: string) => void;
  updateCartItem: (index: number, quantity: number, addons?: AddonType[], notes?: string) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  
  // Sales Actions
  completeSale: (payment: PaymentDetails, customerName?: string) => Promise<Sale | null>;
  getSaleById: (id: string) => Sale | undefined;
  
  // Data loading
  loadProducts: () => Promise<void>;
  loadCategories: () => Promise<void>;
  loadAddons: () => Promise<void>;
  loadSales: () => Promise<void>;
}

// Convert Supabase data to our app format
const convertSupabaseSale = (sale: any): Sale => {
  return {
    id: sale.id,
    items: sale.items as CartItem[],
    total: sale.total,
    payment: sale.payment as PaymentDetails,
    createdAt: sale.created_at,
    customerName: sale.customername
  };
};

export const useDataStore = create<DataState>()(
  devtools(
    persist(
      (set, get) => ({
        products: [],
        categories: [],
        addons: [],
        sales: [],
        cart: [],
        
        // Load data from Supabase
        loadProducts: async () => {
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('name');
          
          if (error) {
            console.error('Error loading products:', error);
            return;
          }
          
          set({ products: data });
        },
        
        loadCategories: async () => {
          const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('name');
          
          if (error) {
            console.error('Error loading categories:', error);
            return;
          }
          
          set({ categories: data });
        },
        
        loadAddons: async () => {
          const { data, error } = await supabase
            .from('addons')
            .select('*')
            .order('name');
          
          if (error) {
            console.error('Error loading addons:', error);
            return;
          }
          
          set({ addons: data });
        },
        
        loadSales: async () => {
          const { data, error } = await supabase
            .from('sales')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (error) {
            console.error('Error loading sales:', error);
            return;
          }
          
          const formattedSales = data.map(convertSupabaseSale);
          set({ sales: formattedSales });
        },
        
        // Product & Category Actions
        addProduct: async (product) => {
          const { data, error } = await supabase
            .from('products')
            .insert([product])
            .select()
            .single();
          
          if (error) {
            console.error('Error adding product:', error);
            return null;
          }
          
          // Update local state
          set((state) => ({
            products: [...state.products, data]
          }));
          
          return data;
        },
        
        updateProduct: async (id, product) => {
          const { data, error } = await supabase
            .from('products')
            .update(product)
            .eq('id', id)
            .select()
            .single();
          
          if (error) {
            console.error('Error updating product:', error);
            return null;
          }
          
          // Update local state
          set((state) => ({
            products: state.products.map(p => p.id === id ? data : p)
          }));
          
          return data;
        },
        
        deleteProduct: async (id) => {
          const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);
          
          if (error) {
            console.error('Error deleting product:', error);
            return false;
          }
          
          // Update local state
          set((state) => ({
            products: state.products.filter(p => p.id !== id)
          }));
          
          return true;
        },
        
        addCategory: async (category) => {
          const { data, error } = await supabase
            .from('categories')
            .insert([category])
            .select()
            .single();
          
          if (error) {
            console.error('Error adding category:', error);
            return null;
          }
          
          // Update local state
          set((state) => ({
            categories: [...state.categories, data]
          }));
          
          return data;
        },
        
        updateCategory: async (id, name) => {
          const { data, error } = await supabase
            .from('categories')
            .update({ name })
            .eq('id', id)
            .select()
            .single();
          
          if (error) {
            console.error('Error updating category:', error);
            return null;
          }
          
          // Update local state
          set((state) => ({
            categories: state.categories.map(c => c.id === id ? data : c)
          }));
          
          return data;
        },
        
        deleteCategory: async (id) => {
          const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id);
          
          if (error) {
            console.error('Error deleting category:', error);
            return false;
          }
          
          // Update local state
          set((state) => ({
            categories: state.categories.filter(c => c.id !== id)
          }));
          
          return true;
        },
        
        // Addon Actions
        addAddon: async (addon) => {
          const { data, error } = await supabase
            .from('addons')
            .insert([addon])
            .select()
            .single();
          
          if (error) {
            console.error('Error adding addon:', error);
            return null;
          }
          
          // Update local state
          set((state) => ({
            addons: [...state.addons, data]
          }));
          
          return data;
        },
        
        updateAddon: async (id, addon) => {
          const { data, error } = await supabase
            .from('addons')
            .update(addon)
            .eq('id', id)
            .select()
            .single();
          
          if (error) {
            console.error('Error updating addon:', error);
            return null;
          }
          
          // Update local state
          set((state) => ({
            addons: state.addons.map(a => a.id === id ? data : a)
          }));
          
          return data;
        },
        
        deleteAddon: async (id) => {
          const { error } = await supabase
            .from('addons')
            .delete()
            .eq('id', id);
          
          if (error) {
            console.error('Error deleting addon:', error);
            return false;
          }
          
          // Update local state
          set((state) => ({
            addons: state.addons.filter(a => a.id !== id)
          }));
          
          return true;
        },
        
        // Cart Actions
        addToCart: (product, quantity = 1, addons = [], notes) => 
          set((state) => {
            // Check if product is already in cart
            const existingIndex = state.cart.findIndex(item => 
              item.product.id === product.id && 
              JSON.stringify(item.addons) === JSON.stringify(addons) && 
              item.notes === notes
            );
            
            if (existingIndex !== -1) {
              // Update quantity of existing item
              const updatedCart = [...state.cart];
              updatedCart[existingIndex].quantity += quantity;
              return { cart: updatedCart };
            } else {
              // Add new item to cart
              return { 
                cart: [...state.cart, { 
                  product, 
                  quantity, 
                  addons: addons.map(addon => ({ addon, quantity: 1 })),
                  notes 
                }] 
              };
            }
          }),
          
        updateCartItem: (index, quantity, addons = [], notes) => 
          set((state) => {
            const updatedCart = [...state.cart];
            if (updatedCart[index]) {
              updatedCart[index].quantity = quantity;
              if (addons.length > 0) {
                updatedCart[index].addons = addons.map(addon => ({ addon, quantity: 1 }));
              }
              if (notes !== undefined) {
                updatedCart[index].notes = notes;
              }
            }
            return { cart: updatedCart };
          }),
          
        removeFromCart: (index) => 
          set((state) => ({
            cart: state.cart.filter((_, i) => i !== index)
          })),
          
        clearCart: () => set({ cart: [] }),
        
        // Sales Actions
        completeSale: async (payment, customerName) => {
          const { cart } = get();
          
          if (cart.length === 0) {
            return null;
          }
          
          // Calculate total
          const total = cart.reduce((sum, item) => {
            // Add product price
            let itemTotal = item.product.price * item.quantity;
            
            // Add addons price if any
            if (item.addons && item.addons.length > 0) {
              itemTotal += item.addons.reduce((addonSum, addonItem) => 
                addonSum + (addonItem.addon.price * addonItem.quantity), 0);
            }
            
            return sum + itemTotal;
          }, 0);
          
          // Calculate change if paying with cash
          const change = payment.method === 'cash' && payment.amount > total 
            ? payment.amount - total 
            : undefined;
          
          // Update payment with change
          const finalPayment = {
            ...payment,
            change
          };
          
          // Create sale object for Supabase - matching database schema
          const saleData = {
            items: cart as unknown as Json,
            total,
            payment: finalPayment as unknown as Json,
            customername: customerName
          };
          
          // Save to Supabase
          const { data: savedSale, error } = await supabase
            .from('sales')
            .insert(saleData)
            .select()
            .single();
            
          if (error) {
            console.error('Error saving sale:', error);
            return null;
          }
          
          // Convert to our app format
          const sale = convertSupabaseSale(savedSale);
          
          // Add to sales and clear cart
          set((state) => ({
            sales: [sale, ...state.sales],
            cart: []
          }));
          
          return sale;
        },
        
        getSaleById: (id) => {
          return get().sales.find(sale => sale.id === id);
        }
      }),
      {
        name: 'acaizen-data'
      }
    )
  )
);

// Initialize data loading on store creation
if (typeof window !== 'undefined') {
  const { loadProducts, loadCategories, loadAddons, loadSales } = useDataStore.getState();
  
  // Load data from Supabase when the store is created
  loadProducts();
  loadCategories();
  loadAddons();
  loadSales();
}
