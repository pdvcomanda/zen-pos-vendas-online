
import { useEffect, useState } from 'react';
import { useDataStore } from '@/stores/dataStore';
import { AddonType } from '@/types/app';

/**
 * Hook to get addons that can be used with a specific product
 * @param productId The ID of the product to get addons for
 * @returns An array of addons relevant for this product
 */
export const useAddons = (productId: string | null) => {
  const { addons, products } = useDataStore();
  const [productAddons, setProductAddons] = useState<AddonType[]>([]);
  
  useEffect(() => {
    if (!productId) {
      setProductAddons([]);
      return;
    }
    
    // Find the product
    const product = products.find(p => p.id === productId);
    if (!product) {
      setProductAddons([]);
      return;
    }
    
    // For now, we'll associate addons based on product category
    // This could be extended with more sophisticated rules in the future
    const relevantAddons = addons.filter(addon => {
      // If the addon has a specific category assigned, check if it matches
      if (addon.category && product.category) {
        return addon.category === product.category;
      }
      
      // If no specific category, include generic addons
      return !addon.category;
    });
    
    setProductAddons(relevantAddons);
  }, [productId, products, addons]);
  
  return productAddons;
};

export default useAddons;
