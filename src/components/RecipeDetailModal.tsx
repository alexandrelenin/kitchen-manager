import React from 'react';
import { 
  XMarkIcon, 
  ClockIcon, 
  UserGroupIcon, 
  StarIcon,
  PencilIcon,
  PlayCircleIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import type { Recipe } from '../types';

interface RecipeDetailModalProps {
  recipe: Recipe;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
}

export default function RecipeDetailModal({ recipe, isOpen, onClose, onEdit }: RecipeDetailModalProps) {
  if (!isOpen) return null;

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i}>
          {i <= rating ? (
            <StarIconSolid className="h-5 w-5 text-yellow-400" />
          ) : (
            <StarIcon className="h-5 w-5 text-gray-300" />
          )}
        </span>
      );
    }
    return stars;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'Fácil';
      case 'medium':
        return 'Médio';
      case 'hard':
        return 'Difícil';
      default:
        return difficulty;
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'own':
        return 'Própria';
      case 'cordon-bleu':
        return 'Le Cordon Bleu';
      case 'internet':
        return 'Internet';
      case 'community':
        return 'Comunidade';
      default:
        return source;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="relative">
          {/* Recipe Image */}
          <div className="h-64 bg-gray-200 dark:bg-gray-700 relative">
            {recipe.imageUrl ? (
              <img
                src={recipe.imageUrl}
                alt={recipe.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                <span className="text-lg">Sem imagem disponível</span>
              </div>
            )}
            {/* Overlay with controls */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent">
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={onEdit}
                  className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              
              {/* Video Button */}
              {recipe.videoUrl && (
                <div className="absolute bottom-4 right-4">
                  <a
                    href={recipe.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                  >
                    <PlayCircleIcon className="h-5 w-5" />
                    Ver Vídeo
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Title and Basic Info */}
            <div>
              <div className="flex items-start justify-between mb-3">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {recipe.name}
                </h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(recipe.difficulty)}`}>
                  {getDifficultyLabel(recipe.difficulty)}
                </span>
              </div>
              
              {recipe.description && (
                <p className="text-gray-600 dark:text-gray-300 text-lg mb-4">
                  {recipe.description}
                </p>
              )}

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {renderStars(recipe.rating)}
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ({recipe.reviews.length} {recipe.reviews.length === 1 ? 'avaliação' : 'avaliações'})
                </span>
              </div>

              {/* Quick Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-center">
                  <ClockIcon className="h-6 w-6 text-gray-500 dark:text-gray-400 mx-auto mb-1" />
                  <div className="text-sm text-gray-600 dark:text-gray-300">Preparo</div>
                  <div className="font-semibold text-gray-900 dark:text-white">{recipe.prepTime}min</div>
                </div>
                <div className="text-center">
                  <ClockIcon className="h-6 w-6 text-gray-500 dark:text-gray-400 mx-auto mb-1" />
                  <div className="text-sm text-gray-600 dark:text-gray-300">Cozimento</div>
                  <div className="font-semibold text-gray-900 dark:text-white">{recipe.cookTime}min</div>
                </div>
                <div className="text-center">
                  <UserGroupIcon className="h-6 w-6 text-gray-500 dark:text-gray-400 mx-auto mb-1" />
                  <div className="text-sm text-gray-600 dark:text-gray-300">Porções</div>
                  <div className="font-semibold text-gray-900 dark:text-white">{recipe.servings}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600 dark:text-gray-300">Categoria</div>
                  <div className="font-semibold text-gray-900 dark:text-white">{recipe.category}</div>
                </div>
              </div>
            </div>

            {/* Tags */}
            {recipe.tags.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {recipe.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Ingredients */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Ingredientes ({recipe.ingredients.length})
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <ul className="space-y-2">
                  {recipe.ingredients.map((ingredient, index) => (
                    <li key={index} className="flex items-center justify-between">
                      <span className="text-gray-900 dark:text-white">
                        {ingredient.name}
                        {ingredient.optional && (
                          <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">(opcional)</span>
                        )}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                        {ingredient.quantity} {ingredient.unit}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Instructions */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Modo de Preparo
              </h3>
              <div className="space-y-4">
                {recipe.instructions.map((instruction, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-medium text-sm">
                      {index + 1}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 pt-1 leading-relaxed">
                      {instruction}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Info */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>Fonte: {getSourceLabel(recipe.source)}</span>
                <span>Total: {recipe.prepTime + recipe.cookTime} minutos</span>
              </div>
            </div>

            {/* Reviews Section */}
            {recipe.reviews.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Avaliações
                </h3>
                <div className="space-y-3">
                  {recipe.reviews.slice(0, 3).map((review, index) => (
                    <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {renderStars(review.rating)}
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-gray-700 dark:text-gray-300 text-sm">
                          "{review.comment}"
                        </p>
                      )}
                    </div>
                  ))}
                  
                  {recipe.reviews.length > 3 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                      E mais {recipe.reviews.length - 3} avaliações...
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 dark:border-gray-600 p-4 bg-gray-50 dark:bg-gray-700">
          <div className="flex justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
            >
              Fechar
            </button>
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <PencilIcon className="h-4 w-4" />
              Editar Receita
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}