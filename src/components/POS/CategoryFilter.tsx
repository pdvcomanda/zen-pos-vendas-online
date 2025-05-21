
import React from 'react';
import { CategoryType } from '@/types/app';
import { Button } from '@/components/ui/button';

interface CategoryFilterProps {
  categories: CategoryType[];
  activeCategory: string | null;
  onCategorySelect: (categoryId: string | null) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({ 
  categories, 
  activeCategory, 
  onCategorySelect 
}) => {
  return (
    <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
      <Button
        variant={activeCategory === null ? "default" : "outline"}
        className="rounded-full"
        onClick={() => onCategorySelect(null)}
      >
        Todos
      </Button>
      
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={activeCategory === category.id ? "default" : "outline"}
          className="rounded-full whitespace-nowrap"
          onClick={() => onCategorySelect(category.id)}
        >
          {category.name}
        </Button>
      ))}
    </div>
  );
};
