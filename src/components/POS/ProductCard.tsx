
import React from 'react';
import { ProductType } from '@/types/app';
import { Card, CardContent } from '@/components/ui/card';

interface ProductCardProps {
  product: ProductType;
  onClick: (product: ProductType) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  return (
    <Card 
      className="card-hover cursor-pointer"
      onClick={() => onClick(product)}
    >
      <CardContent className="p-4 flex flex-col">
        <div className="h-24 bg-gray-100 rounded-md mb-2 flex items-center justify-center">
          {product.image ? (
            <img 
              src={product.image} 
              alt={product.name}
              className="h-full w-full object-cover rounded-md" 
            />
          ) : (
            <span className="text-gray-400">{product.name[0]}</span>
          )}
        </div>
        <h3 className="font-medium line-clamp-1">{product.name}</h3>
        <p className="text-sm text-gray-500 line-clamp-2 mb-2">{product.description}</p>
        <div className="flex justify-between items-center mt-auto">
          <span className="font-bold">R$ {product.price.toFixed(2)}</span>
          <span className="text-xs text-gray-500">Estoque: {product.stock}</span>
        </div>
      </CardContent>
    </Card>
  );
};
