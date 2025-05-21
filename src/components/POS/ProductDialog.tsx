
import React from 'react';
import { ProductType } from '@/types/app';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ProductDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductType | null;
  productNotes: string;
  setProductNotes: (notes: string) => void;
  onAddToCart: () => void;
}

export const ProductDialog: React.FC<ProductDialogProps> = ({
  isOpen,
  onOpenChange,
  product,
  productNotes,
  setProductNotes,
  onAddToCart
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{product?.name}</DialogTitle>
          <DialogDescription>
            {product?.description}
            <div className="mt-2 font-medium">
              Preço: R$ {product?.price.toFixed(2)}
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Observações (opcional)</label>
            <Input
              placeholder="Ex: Sem leite condensado"
              value={productNotes}
              onChange={(e) => setProductNotes(e.target.value)}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button className="bg-acai-purple hover:bg-acai-dark" onClick={onAddToCart}>
            Adicionar ao Carrinho
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
