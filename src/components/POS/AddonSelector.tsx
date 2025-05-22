
import React from 'react';
import { AddonType } from '@/types/app';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus } from 'lucide-react';

interface AddonSelectorProps {
  addons: AddonType[];
  selectedAddons: AddonType[];
  onToggleAddon: (addon: AddonType) => void;
}

export const AddonSelector: React.FC<AddonSelectorProps> = ({
  addons,
  selectedAddons,
  onToggleAddon
}) => {
  if (addons.length === 0) return null;
  
  return (
    <div className="mt-4 border-t pt-4">
      <h3 className="font-medium text-sm mb-2 flex items-center">
        <Plus size={16} className="mr-1" />
        Adicione complementos
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {addons.map((addon) => {
          const isChecked = selectedAddons.some(a => a.id === addon.id);
          
          return (
            <div key={addon.id} className="flex items-center space-x-2 bg-gray-50 p-2 rounded-md">
              <Checkbox 
                id={`addon-${addon.id}`}
                checked={isChecked}
                onCheckedChange={() => onToggleAddon(addon)}
              />
              <div className="flex-1 flex justify-between">
                <Label 
                  htmlFor={`addon-${addon.id}`}
                  className="cursor-pointer text-sm flex-1"
                >
                  {addon.name}
                </Label>
                <span className="text-sm text-gray-600">
                  R$ {addon.price.toFixed(2)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
