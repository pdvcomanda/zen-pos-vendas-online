
import React from 'react';
import { CartItem } from '@/types/app';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { CartItemComponent } from './CartItem';

interface CartPanelProps {
  cart: CartItem[];
  cartTotal: number;
  updateCartItem: (index: number, quantity: number) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  handleCheckoutClick: () => void;
}

export const CartPanel: React.FC<CartPanelProps> = ({ 
  cart,
  cartTotal,
  updateCartItem,
  removeFromCart,
  clearCart,
  handleCheckoutClick
}) => {
  return (
    <div className="w-96 bg-white border-l border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold flex items-center">
          <ShoppingCart className="mr-2" size={20} />
          Carrinho de Compras
        </h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <ShoppingCart size={48} strokeWidth={1} />
            <p className="mt-2">Carrinho vazio</p>
            <p className="text-sm">Adicione produtos para continuar</p>
          </div>
        ) : (
          <div className="space-y-1">
            {cart.map((item, index) => (
              <CartItemComponent 
                key={`${item.product.id}-${index}`} 
                item={item} 
                index={index}
                updateCartItem={updateCartItem}
                removeFromCart={removeFromCart}
              />
            ))}
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex justify-between mb-2">
          <span className="font-medium">Subtotal</span>
          <span>R$ {cartTotal.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between mb-4 text-lg font-bold">
          <span>Total</span>
          <span>R$ {cartTotal.toFixed(2)}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mb-4">
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center"
            onClick={clearCart}
            disabled={cart.length === 0}
          >
            Limpar
          </Button>
          
          <Button 
            className="w-full bg-acai-purple hover:bg-acai-dark flex items-center justify-center"
            onClick={handleCheckoutClick}
            disabled={cart.length === 0}
          >
            Finalizar
          </Button>
        </div>
      </div>
    </div>
  );
};
