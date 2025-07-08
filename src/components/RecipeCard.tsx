import React from 'react';
import { ClockIcon, UserGroupIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import type { Recipe } from '../types';

interface RecipeCardProps {
  recipe: Recipe;
  onClick?: (recipe: Recipe) => void;
  onDragStart?: (recipe: Recipe) => void;
  draggable?: boolean;
}

export default function RecipeCard({ recipe, onClick, onDragStart, draggable = false }: RecipeCardProps) {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (onDragStart) {
      onDragStart(recipe);
      e.dataTransfer.setData('application/json', JSON.stringify(recipe));
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i}>
          {i <= rating ? (
            <StarIconSolid className="h-4 w-4 text-yellow-400" />
          ) : (
            <StarIcon className="h-4 w-4 text-gray-300" />
          )}
        </span>
      );
    }
    return stars;
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${
        draggable ? 'cursor-grab active:cursor-grabbing' : ''
      } ${onClick ? 'cursor-pointer hover:shadow-md' : ''} transition-shadow`}
      onClick={() => onClick && onClick(recipe)}
      draggable={draggable}
      onDragStart={handleDragStart}
    >
      <div className="aspect-video bg-gray-100 relative">
        {recipe.imageUrl ? (
          <img
            src={recipe.imageUrl}
            alt={recipe.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-sm">Sem imagem</span>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            recipe.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
            recipe.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {recipe.difficulty === 'easy' ? 'Fácil' :
             recipe.difficulty === 'medium' ? 'Médio' : 'Difícil'}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{recipe.name}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{recipe.description}</p>
        
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <ClockIcon className="h-4 w-4" />
            {recipe.prepTime + recipe.cookTime}min
          </div>
          <div className="flex items-center gap-1">
            <UserGroupIcon className="h-4 w-4" />
            {recipe.servings} porções
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {renderStars(recipe.rating)}
            <span className="text-sm text-gray-500 ml-1">({recipe.reviews.length})</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {recipe.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {recipe.tags.length > 2 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{recipe.tags.length - 2}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}