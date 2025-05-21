
import React from 'react';
import { CartItem as CartItemType } from '@/types/app';
import { Button } from '@/components/ui/button';
import { Plus, Minus, Trash2 } from 'lucide-react';

interface CartItemProps {
  item: CartItemType;
  index: number;
  updateCartItem: (index: number, quantity: number) => void;
  removeFromCart: (index: number) => void;
}

export const CartItemComponent: React.FC<CartItemProps> = ({ 
  item, 
  index, 
  updateCartItem,
  removeFromCart 
}) => {
  return (
    <div className="flex items-center justify-between py-2 border-b">
      <div className="flex flex-col">
        <span className="font-medium">{item.product.name}</span>
        <span className="text-sm text-gray-500">
          R$ {item.product.price.toFixed(2)} × {item.quantity}
        </span>
        {item.notes && (
          <span className="text-xs text-gray-500 italic">
            Obs: {item.notes}
          </span>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        <span className="font-medium">
          R$ {(item.product.price * item.quantity).toFixed(2)}
        </span>
        
        <div className="flex items-center border rounded-md">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => {
              if (item.quantity > 1) {
                updateCartItem(index, item.quantity - 1);
              } else {
                removeFromCart(index);
              }
            }}
          >
            <Minus size={16} />
          </Button>
          
          <span className="w-8 text-center">{item.quantity}</span>
          
          <Button 
            variant="ghost" 
            size="icon"
            className="h-8 w-8"
            onClick={() => updateCartItem(index, item.quantity + 1)}
          >
            <Plus size={16} />
          </Button>
        </div>
        
        <Button 
          variant="ghost" 
          size="icon"
          className="h-8 w-8 text-red-500 hover:text-red-700"
          onClick={() => removeFromCart(index)}
        >
          <Trash2 size={16} />
        </Button>
      </div>
    </div>
  );
};
