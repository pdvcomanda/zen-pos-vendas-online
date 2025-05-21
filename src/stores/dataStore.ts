
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  image?: string;
  stock: number;
}

export interface Category {
  id: string;
  name: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
}

export type PaymentMethod = 'cash' | 'card' | 'pix';

export interface Sale {
  id: string;
  items: CartItem[];
  total: number;
  payment: {
    method: PaymentMethod;
    amount: number;
    change?: number;
  };
  createdAt: string;
  customerName?: string;
}

interface DataState {
  products: Product[];
  categories: Category[];
  sales: Sale[];
  cart: CartItem[];
  
  // Product & Category Actions
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Omit<Product, 'id'>>) => void;
  deleteProduct: (id: string) => void;
  
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, name: string) => void;
  deleteCategory: (id: string) => void;
  
  // Cart Actions
  addToCart: (product: Product, quantity?: number, notes?: string) => void;
  updateCartItem: (index: number, quantity: number, notes?: string) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  
  // Sales Actions
  completeSale: (payment: { method: PaymentMethod; amount: number }, customerName?: string) => Sale;
  getSaleById: (id: string) => Sale | undefined;
}

// Initial sample data
const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat1', name: 'Açaí' },
  { id: 'cat2', name: 'Bebidas' },
  { id: 'cat3', name: 'Complementos' },
  { id: 'cat4', name: 'Combos' }
];

const INITIAL_PRODUCTS: Product[] = [
  { 
    id: 'p1', 
    name: 'Açaí Tradicional 300ml', 
    price: 14.90, 
    category: 'cat1',
    description: 'Açaí puro na tigela 300ml',
    stock: 100 
  },
  { 
    id: 'p2', 
    name: 'Açaí com Banana 300ml', 
    price: 16.90, 
    category: 'cat1',
    description: 'Açaí com banana na tigela 300ml',
    stock: 100 
  },
  { 
    id: 'p3', 
    name: 'Açaí Especial 500ml', 
    price: 22.90, 
    category: 'cat1',
    description: 'Açaí especial na tigela 500ml com frutas',
    stock: 100 
  },
  { 
    id: 'p4', 
    name: 'Refrigerante Lata', 
    price: 5.00, 
    category: 'cat2',
    description: 'Refrigerante em lata 350ml',
    stock: 50 
  },
  { 
    id: 'p5', 
    name: 'Água Mineral', 
    price: 3.00, 
    category: 'cat2',
    description: 'Água mineral sem gás 500ml',
    stock: 50 
  },
  { 
    id: 'p6', 
    name: 'Granola (Adicional)', 
    price: 2.00, 
    category: 'cat3',
    description: 'Porção adicional de granola',
    stock: 100 
  },
  { 
    id: 'p7', 
    name: 'Leite Condensado (Adicional)', 
    price: 3.00, 
    category: 'cat3',
    description: 'Porção adicional de leite condensado',
    stock: 100 
  },
  { 
    id: 'p8', 
    name: 'Combo Casal', 
    price: 39.90, 
    category: 'cat4',
    description: '2 Açaís 300ml + 2 Águas',
    stock: 50 
  }
];

export const useDataStore = create<DataState>()(
  devtools(
    persist(
      (set, get) => ({
        products: INITIAL_PRODUCTS,
        categories: INITIAL_CATEGORIES,
        sales: [],
        cart: [],
        
        // Product & Category Actions
        addProduct: (product) => 
          set((state) => ({
            products: [...state.products, { ...product, id: `p${Date.now()}` }]
          })),
          
        updateProduct: (id, product) => 
          set((state) => ({
            products: state.products.map(p => 
              p.id === id ? { ...p, ...product } : p
            )
          })),
          
        deleteProduct: (id) => 
          set((state) => ({
            products: state.products.filter(p => p.id !== id)
          })),
        
        addCategory: (category) => 
          set((state) => ({
            categories: [...state.categories, { ...category, id: `cat${Date.now()}` }]
          })),
          
        updateCategory: (id, name) => 
          set((state) => ({
            categories: state.categories.map(c => 
              c.id === id ? { ...c, name } : c
            )
          })),
          
        deleteCategory: (id) => 
          set((state) => ({
            categories: state.categories.filter(c => c.id !== id)
          })),
        
        // Cart Actions
        addToCart: (product, quantity = 1, notes) => 
          set((state) => {
            // Check if product is already in cart
            const existingIndex = state.cart.findIndex(item => item.product.id === product.id && item.notes === notes);
            
            if (existingIndex !== -1) {
              // Update quantity of existing item
              const updatedCart = [...state.cart];
              updatedCart[existingIndex].quantity += quantity;
              return { cart: updatedCart };
            } else {
              // Add new item to cart
              return { cart: [...state.cart, { product, quantity, notes }] };
            }
          }),
          
        updateCartItem: (index, quantity, notes) => 
          set((state) => {
            const updatedCart = [...state.cart];
            if (updatedCart[index]) {
              updatedCart[index].quantity = quantity;
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
        completeSale: (payment, customerName) => {
          const { cart } = get();
          
          // Calculate total
          const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
          
          // Calculate change if paying with cash
          const change = payment.method === 'cash' && payment.amount > total 
            ? payment.amount - total 
            : undefined;
          
          // Create sale object
          const sale: Sale = {
            id: `sale-${Date.now()}`,
            items: [...cart],
            total,
            payment: {
              method: payment.method,
              amount: payment.amount,
              change
            },
            createdAt: new Date().toISOString(),
            customerName
          };
          
          // Update stock levels
          cart.forEach(item => {
            const product = get().products.find(p => p.id === item.product.id);
            if (product) {
              get().updateProduct(product.id, { 
                stock: Math.max(0, product.stock - item.quantity) 
              });
            }
          });
          
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
