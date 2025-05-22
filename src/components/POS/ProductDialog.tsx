import React, { useState } from 'react';
import { ProductType, AddonType, CartAddon } from '@/types/app';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useDataStore } from '@/stores/dataStore';
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
  const { addons } = useDataStore();
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedAddons, setSelectedAddons] = useState<CartAddon[]>([]);

  // Filter addons based on product category (for example, only show certain addons for açaí products)
  const availableAddons = addons.filter(addon => {
    // If product has a category and addon has a category, check if they match
    if (product?.category && addon.category) {
      return addon.category === product.category;
    }
    // Otherwise show all addons
    return true;
  });

  const handleAddonToggle = (addon: AddonType) => {
    setSelectedAddons(currentAddons => {
      const exists = currentAddons.some(item => item.addon.id === addon.id);
      
      if (exists) {
        // Remove the addon if it exists
        return currentAddons.filter(item => item.addon.id !== addon.id);
      } else {
        // Add the addon if it doesn't exist
        return [...currentAddons, { addon, quantity: 1 }];
      }
    });
  };

  const handleAddonQuantityChange = (addonId: string, newQuantity: number) => {
    setSelectedAddons(currentAddons => 
      currentAddons.map(item => 
        item.addon.id === addonId 
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(Math.max(1, newQuantity));
  };

  const handleAddToCartWithAddons = () => {
    if (product) {
      // Use the addToCart function with the selected addons
      onAddToCart();
    }
  };

  // Reset state when dialog opens
  React.useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setSelectedAddons([]);
    }
  }, [isOpen]);

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
          <div className="flex items-center space-x-4">
            <Label className="text-sm font-medium">Quantidade</Label>
            <div className="flex items-center border rounded-md">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
              >
                -
              </Button>
              <span className="w-8 text-center">{quantity}</span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleQuantityChange(quantity + 1)}
              >
                +
              </Button>
            </div>
          </div>
          
          {availableAddons.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Adicionais</Label>
              <div className="grid grid-cols-1 gap-2 border p-3 rounded-md max-h-40 overflow-y-auto">
                {availableAddons.map((addon) => (
                  <div key={addon.id} className="flex items-center justify-between py-1">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id={`addon-${addon.id}`}
                        checked={selectedAddons.some(item => item.addon.id === addon.id)}
                        onCheckedChange={() => handleAddonToggle(addon)}
                      />
                      <label 
                        htmlFor={`addon-${addon.id}`}
                        className="text-sm cursor-pointer"
                      >
                        {addon.name} (+R$ {addon.price.toFixed(2)})
                      </label>
                    </div>
                    
                    {selectedAddons.some(item => item.addon.id === addon.id) && (
                      <div className="flex items-center space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => {
                            const current = selectedAddons.find(item => item.addon.id === addon.id)?.quantity || 1;
                            handleAddonQuantityChange(addon.id, Math.max(1, current - 1));
                          }}
                        >
                          -
                        </Button>
                        <span className="w-6 text-center text-sm">
                          {selectedAddons.find(item => item.addon.id === addon.id)?.quantity || 1}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => {
                            const current = selectedAddons.find(item => item.addon.id === addon.id)?.quantity || 1;
                            handleAddonQuantityChange(addon.id, current + 1);
                          }}
                        >
                          +
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
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
          <Button className="bg-acai-purple hover:bg-acai-dark" onClick={handleAddToCartWithAddons}>
            Adicionar ao Carrinho
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
