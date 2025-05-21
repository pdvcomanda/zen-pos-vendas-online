
import React from 'react';
import { ProductType } from '@/types/app';
import { ProductCard } from './ProductCard';

interface ProductListProps {
  products: ProductType[];
  onProductSelect: (product: ProductType) => void;
}

export const ProductList: React.FC<ProductListProps> = ({ products, onProductSelect }) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Nenhum produto encontrado
      </div>
    );
  }

  return (
    <div className="grid-pos">
      {products.map((product) => (
        <ProductCard 
          key={product.id} 
          product={product} 
          onClick={onProductSelect}
        />
      ))}
    </div>
  );
};
