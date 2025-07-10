import { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  CloudArrowUpIcon,
  GlobeAltIcon,
  SparklesIcon,
  BookOpenIcon,
  HeartIcon,
  ClockIcon,
  UsersIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { externalRecipeAPI, type RecipeSearchFilters } from '../lib/externalRecipeAPI';
import { recipeCategoryService, CUISINE_CATEGORIES } from '../lib/recipeCategories';
import RecipeFilters from './RecipeFilters';
import RecipeImporter from './RecipeImporter';
import RecipeDetailModal from './RecipeDetailModal';
import { dbService } from '../lib/database';
import type { Recipe } from '../types';

interface ExpandedRecipeBankProps {
  onRecipeSelect?: (recipe: Recipe) => void;
  onClose?: () => void;
}

export default function ExpandedRecipeBank({ onRecipeSelect, onClose }: ExpandedRecipeBankProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState<string>('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [localRecipes, setLocalRecipes] = useState<Recipe[]>([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState<Set<string>>(new Set());
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showImporter, setShowImporter] = useState(false);
  const [activeTab, setActiveTab] = useState<'discover' | 'local' | 'favorites'>('discover');
  const [currentFilters, setCurrentFilters] = useState<Partial<RecipeSearchFilters>>({});
  const [hasSearched, setHasSearched] = useState(false);
  const [viewingRecipe, setViewingRecipe] = useState<Recipe | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Carregar receitas locais ao montar o componente
  useEffect(() => {
    loadLocalRecipes();
  }, []);

  const loadLocalRecipes = async () => {
    try {
      const recipes = await dbService.getRecipes();
      setLocalRecipes(recipes);
    } catch (error) {
      console.error('Error loading local recipes:', error);
    }
  };

  const handleSearch = async (filters: any = {}) => {
    // Permitir busca se houver qualquer filtro válido
    if (!searchQuery.trim() && !filters.cuisine && !filters.diet && !selectedCuisine) return;

    setIsSearching(true);
    setHasSearched(true);
    
    try {
      const searchFilters: RecipeSearchFilters = {
        query: searchQuery,
        cuisine: selectedCuisine || filters.cuisine,
        diet: filters.diet,
        intolerances: filters.intolerances,
        type: filters.type,
        maxReadyTime: filters.maxReadyTime,
        minCalories: filters.minCalories,
        maxCalories: filters.maxCalories,
        number: 24,
        offset: 0
      };

      const result = await externalRecipeAPI.searchRecipes(searchFilters);
      setRecipes(result.recipes);
    } catch (error) {
      console.error('Error searching recipes:', error);
      setRecipes([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCuisineSelect = (cuisineId: string) => {
    setSelectedCuisine(cuisineId);
    if (cuisineId) {
      handleSearch({ cuisine: cuisineId });
    }
  };

  const handleFiltersChange = (filters: any) => {
    setCurrentFilters(filters);
    handleSearch(filters);
  };

  const handleRecipeImported = (recipe: Recipe) => {
    setLocalRecipes(prev => [recipe, ...prev]);
    setShowImporter(false);
  };

  const toggleFavorite = async (recipeId: string) => {
    const newFavorites = new Set(favoriteRecipes);
    if (newFavorites.has(recipeId)) {
      newFavorites.delete(recipeId);
    } else {
      newFavorites.add(recipeId);
    }
    setFavoriteRecipes(newFavorites);
  };

  const handleRecipeSelect = (recipe: Recipe) => {
    if (onRecipeSelect) {
      onRecipeSelect(recipe);
    } else {
      // Se não há callback externo, abrir modal de visualização
      setViewingRecipe(recipe);
      setIsDetailModalOpen(true);
    }
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setViewingRecipe(null);
  };

  const handleEditFromDetail = async () => {
    if (viewingRecipe) {
      closeDetailModal();
      // Aqui você pode implementar a edição da receita se necessário
      // Por enquanto, só fechamos o modal
    }
  };

  const getRandomRecipes = async () => {
    setIsSearching(true);
    try {
      const randomRecipes = await externalRecipeAPI.getRandomRecipes(12);
      setRecipes(randomRecipes);
      setHasSearched(true);
    } catch (error) {
      console.error('Error getting random recipes:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const getDisplayedRecipes = () => {
    switch (activeTab) {
      case 'local':
        return localRecipes;
      case 'favorites':
        return [...recipes, ...localRecipes].filter(recipe => 
          favoriteRecipes.has(recipe.id)
        );
      default:
        return recipes;
    }
  };

  const filteredRecipes = recipeCategoryService.applyFilters(
    getDisplayedRecipes(),
    currentFilters as any
  );

  if (showImporter) {
    return (
      <RecipeImporter
        onRecipeImported={handleRecipeImported}
        onClose={() => setShowImporter(false)}
      />
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 max-w-7xl mx-auto">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <BookOpenIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Banco de Receitas</h2>
              <p className="text-sm text-gray-600">
                Descubra, importe e organize suas receitas favoritas
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              ✕
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Buscar receitas..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => handleSearch()}
            disabled={isSearching}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isSearching ? 'Buscando...' : 'Buscar'}
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <FunnelIcon className="h-5 w-5" />
            Filtros
          </button>
          <button
            onClick={() => setShowImporter(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <CloudArrowUpIcon className="h-5 w-5" />
            Importar
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('discover')}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === 'discover'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <GlobeAltIcon className="h-4 w-4" />
            Descobrir ({recipes.length})
          </button>
          <button
            onClick={() => setActiveTab('local')}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === 'local'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BookOpenIcon className="h-4 w-4" />
            Minhas Receitas ({localRecipes.length})
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === 'favorites'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <HeartIcon className="h-4 w-4" />
            Favoritas ({favoriteRecipes.size})
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="border-b border-gray-200">
          <RecipeFilters
            onFiltersChange={handleFiltersChange}
            initialFilters={currentFilters as any}
            isOpen={showFilters}
            onToggle={() => setShowFilters(false)}
          />
        </div>
      )}

      <div className="p-6">
        {/* Cuisine Categories */}
        {activeTab === 'discover' && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Explorar por Culinária</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {CUISINE_CATEGORIES.slice(0, 12).map((cuisine) => (
                <button
                  key={cuisine.id}
                  onClick={() => handleCuisineSelect(cuisine.id)}
                  className={`p-3 rounded-lg border transition-all text-center ${
                    selectedCuisine === cuisine.id
                      ? 'border-blue-300 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-2xl mb-1">{cuisine.icon}</div>
                  <div className="text-sm font-medium">{cuisine.name}</div>
                  <div className="text-xs text-gray-500">{cuisine.region}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {activeTab === 'discover' && !hasSearched && (
          <div className="text-center py-12">
            <SparklesIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Descubra Receitas Incríveis
            </h3>
            <p className="text-gray-600 mb-6">
              Busque por ingredientes, culinária ou deixe-nos sugerir algo especial
            </p>
            <button
              onClick={getRandomRecipes}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
            >
              <SparklesIcon className="h-5 w-5" />
              Receitas Aleatórias
            </button>
          </div>
        )}

        {/* Recipes Grid */}
        {filteredRecipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                isFavorite={favoriteRecipes.has(recipe.id)}
                onToggleFavorite={() => toggleFavorite(recipe.id)}
                onSelect={() => handleRecipeSelect(recipe)}
              />
            ))}
          </div>
        ) : hasSearched && !isSearching && (
          <div className="text-center py-12">
            <BookOpenIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma receita encontrada
            </h3>
            <p className="text-gray-600 mb-6">
              Tente buscar com outros termos ou ajuste os filtros
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCuisine('');
                setCurrentFilters({});
                setHasSearched(false);
              }}
              className="text-blue-600 hover:text-blue-700"
            >
              Limpar busca
            </button>
          </div>
        )}

        {/* Loading State */}
        {isSearching && (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Buscando receitas...</p>
          </div>
        )}
      </div>

      {/* Recipe Detail Modal */}
      {viewingRecipe && (
        <RecipeDetailModal
          recipe={viewingRecipe}
          isOpen={isDetailModalOpen}
          onClose={closeDetailModal}
          onEdit={handleEditFromDetail}
        />
      )}
    </div>
  );
}

function RecipeCard({ 
  recipe, 
  isFavorite, 
  onToggleFavorite, 
  onSelect 
}: {
  recipe: Recipe;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onSelect: () => void;
}) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Fácil';
      case 'medium': return 'Médio';
      case 'hard': return 'Difícil';
      default: return 'Médio';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative">
        <img
          src={recipe.imageUrl || 'https://via.placeholder.com/400x300/64748b/ffffff?text=Receita'}
          alt={recipe.name}
          className="w-full h-48 object-cover"
        />
        <button
          onClick={onToggleFavorite}
          className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow"
        >
          {isFavorite ? (
            <HeartIconSolid className="h-5 w-5 text-red-500" />
          ) : (
            <HeartIcon className="h-5 w-5 text-gray-400" />
          )}
        </button>
        <div className="absolute bottom-2 left-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(recipe.difficulty)}`}>
            {getDifficultyLabel(recipe.difficulty)}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">{recipe.name}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{recipe.description}</p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <ClockIcon className="h-4 w-4" />
            {recipe.prepTime + recipe.cookTime}min
          </div>
          <div className="flex items-center gap-1">
            <UsersIcon className="h-4 w-4" />
            {recipe.servings}
          </div>
          {recipe.rating > 0 && (
            <div className="flex items-center gap-1">
              <StarIcon className="h-4 w-4 text-yellow-500" />
              {recipe.rating.toFixed(1)}
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">{recipe.source}</span>
          <button
            onClick={onSelect}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Ver Receita
          </button>
        </div>
      </div>
    </div>
  );
}