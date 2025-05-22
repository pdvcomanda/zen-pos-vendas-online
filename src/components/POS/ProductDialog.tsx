
import React, { ReactNode } from 'react';
import { ProductType } from '@/types/app';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ShoppingCart, Plus, Minus } from 'lucide-react';

interface ProductDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductType | null;
  productNotes: string;
  setProductNotes: (notes: string) => void;
  quantity: number;
  setQuantity: (quantity: number) => void;
  onAddToCart: () => void;
  children?: ReactNode; // For addon selector
}

export const ProductDialog: React.FC<ProductDialogProps> = ({
  isOpen,
  onOpenChange,
  product,
  productNotes,
  setProductNotes,
  quantity,
  setQuantity,
  onAddToCart,
  children
}) => {
  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          {product.description && (
            <p className="text-sm text-gray-500">{product.description}</p>
          )}
          
          <div className="flex justify-between items-center">
            <span className="font-medium">Preço:</span>
            <span>R$ {product.price.toFixed(2)}</span>
          </div>
          
          <div>
            <label className="text-sm font-medium">Quantidade:</label>
            <div className="flex items-center space-x-3 mt-1">
              <Button 
                variant="outline" 
                size="icon"
                className="h-8 w-8"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus size={16} />
              </Button>
              
              <span className="w-8 text-center">{quantity}</span>
              
              <Button 
                variant="outline" 
                size="icon"
                className="h-8 w-8"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus size={16} />
              </Button>
            </div>
          </div>
          
          {/* Children slot for addon selector */}
          {children}
          
          <div>
            <label className="text-sm font-medium">Observações:</label>
            <Textarea
              placeholder="Ex: Sem açúcar, sem granola..."
              value={productNotes}
              onChange={(e) => setProductNotes(e.target.value)}
              className="mt-1 resize-none"
              rows={2}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button 
            className="bg-acai-purple hover:bg-acai-dark flex items-center"
            onClick={onAddToCart}
          >
            <ShoppingCart size={16} className="mr-2" />
            Adicionar ao carrinho
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
