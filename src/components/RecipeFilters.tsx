import { useState } from 'react';
import {
  FunnelIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { 
  CUISINE_CATEGORIES, 
  DIETARY_RESTRICTIONS, 
  MEAL_TYPES, 
  COOKING_METHODS, 
  DIFFICULTY_LEVELS, 
  INTOLERANCES,
  type RecipeFilter 
} from '../lib/recipeCategories';

interface RecipeFiltersProps {
  onFiltersChange: (filters: Partial<RecipeFilter>) => void;
  initialFilters?: Partial<RecipeFilter>;
  isOpen: boolean;
  onToggle: () => void;
}

export default function RecipeFilters({ 
  onFiltersChange, 
  initialFilters = {}, 
  isOpen, 
  onToggle 
}: RecipeFiltersProps) {
  const [filters, setFilters] = useState<Partial<RecipeFilter>>(initialFilters);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['cuisines']));

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const updateFilters = (newFilters: Partial<RecipeFilter>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const toggleArrayFilter = (key: keyof RecipeFilter, value: string) => {
    const currentArray = (filters[key] as string[]) || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    updateFilters({ [key]: newArray });
  };

  const clearFilters = () => {
    setFilters({});
    onFiltersChange({});
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.cuisines?.length) count += filters.cuisines.length;
    if (filters.diets?.length) count += filters.diets.length;
    if (filters.intolerances?.length) count += filters.intolerances.length;
    if (filters.mealTypes?.length) count += filters.mealTypes.length;
    if (filters.cookingMethods?.length) count += filters.cookingMethods.length;
    if (filters.difficulty?.length) count += filters.difficulty.length;
    if (filters.maxPrepTime) count++;
    if (filters.maxCookTime) count++;
    if (filters.ingredients?.include?.length) count += filters.ingredients.include.length;
    if (filters.ingredients?.exclude?.length) count += filters.ingredients.exclude.length;
    if (filters.nutrition?.maxCalories) count++;
    return count;
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
      >
        <FunnelIcon className="h-5 w-5" />
        <span>Filtros</span>
        {getActiveFiltersCount() > 0 && (
          <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1">
            {getActiveFiltersCount()}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <FunnelIcon className="h-5 w-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filtros Avançados</h3>
          {getActiveFiltersCount() > 0 && (
            <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1">
              {getActiveFiltersCount()}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={clearFilters}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Limpar
          </button>
          <button
            onClick={onToggle}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="p-4 max-h-96 overflow-y-auto">
        {/* Culinária */}
        <FilterSection
          title="Culinária"
          isExpanded={expandedSections.has('cuisines')}
          onToggle={() => toggleSection('cuisines')}
        >
          <div className="grid grid-cols-2 gap-2">
            {CUISINE_CATEGORIES.map(cuisine => (
              <FilterChip
                key={cuisine.id}
                label={cuisine.name}
                icon={cuisine.icon}
                color={cuisine.color}
                isSelected={filters.cuisines?.includes(cuisine.id) || false}
                onClick={() => toggleArrayFilter('cuisines', cuisine.id)}
              />
            ))}
          </div>
        </FilterSection>

        {/* Dietas */}
        <FilterSection
          title="Dietas"
          isExpanded={expandedSections.has('diets')}
          onToggle={() => toggleSection('diets')}
        >
          <div className="grid grid-cols-2 gap-2">
            {DIETARY_RESTRICTIONS.map(diet => (
              <FilterChip
                key={diet.id}
                label={diet.name}
                icon={diet.icon}
                color={diet.color}
                isSelected={filters.diets?.includes(diet.id) || false}
                onClick={() => toggleArrayFilter('diets', diet.id)}
              />
            ))}
          </div>
        </FilterSection>

        {/* Intolerâncias */}
        <FilterSection
          title="Intolerâncias"
          isExpanded={expandedSections.has('intolerances')}
          onToggle={() => toggleSection('intolerances')}
        >
          <div className="grid grid-cols-2 gap-2">
            {INTOLERANCES.map(intolerance => (
              <FilterChip
                key={intolerance.id}
                label={intolerance.name}
                icon={intolerance.icon}
                isSelected={filters.intolerances?.includes(intolerance.id) || false}
                onClick={() => toggleArrayFilter('intolerances', intolerance.id)}
              />
            ))}
          </div>
        </FilterSection>

        {/* Tipo de Refeição */}
        <FilterSection
          title="Tipo de Refeição"
          isExpanded={expandedSections.has('mealTypes')}
          onToggle={() => toggleSection('mealTypes')}
        >
          <div className="grid grid-cols-2 gap-2">
            {MEAL_TYPES.map(mealType => (
              <FilterChip
                key={mealType.id}
                label={mealType.name}
                icon={mealType.icon}
                isSelected={filters.mealTypes?.includes(mealType.id) || false}
                onClick={() => toggleArrayFilter('mealTypes', mealType.id)}
              />
            ))}
          </div>
        </FilterSection>

        {/* Métodos de Cozimento */}
        <FilterSection
          title="Método de Cozimento"
          isExpanded={expandedSections.has('cookingMethods')}
          onToggle={() => toggleSection('cookingMethods')}
        >
          <div className="grid grid-cols-2 gap-2">
            {COOKING_METHODS.map(method => (
              <FilterChip
                key={method.id}
                label={method.name}
                icon={method.icon}
                isSelected={filters.cookingMethods?.includes(method.id) || false}
                onClick={() => toggleArrayFilter('cookingMethods', method.id)}
              />
            ))}
          </div>
        </FilterSection>

        {/* Dificuldade */}
        <FilterSection
          title="Dificuldade"
          isExpanded={expandedSections.has('difficulty')}
          onToggle={() => toggleSection('difficulty')}
        >
          <div className="flex gap-2">
            {DIFFICULTY_LEVELS.map(level => (
              <FilterChip
                key={level.id}
                label={level.name}
                icon={level.icon}
                color={level.color}
                isSelected={filters.difficulty?.includes(level.id) || false}
                onClick={() => toggleArrayFilter('difficulty', level.id)}
              />
            ))}
          </div>
        </FilterSection>

        {/* Tempo */}
        <FilterSection
          title="Tempo"
          isExpanded={expandedSections.has('time')}
          onToggle={() => toggleSection('time')}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tempo máximo de preparo: {filters.maxPrepTime || 60} min
              </label>
              <input
                type="range"
                min="5"
                max="180"
                step="5"
                value={filters.maxPrepTime || 60}
                onChange={(e) => updateFilters({ maxPrepTime: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tempo máximo de cozimento: {filters.maxCookTime || 120} min
              </label>
              <input
                type="range"
                min="5"
                max="300"
                step="5"
                value={filters.maxCookTime || 120}
                onChange={(e) => updateFilters({ maxCookTime: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>
        </FilterSection>

        {/* Porções */}
        <FilterSection
          title="Porções"
          isExpanded={expandedSections.has('servings')}
          onToggle={() => toggleSection('servings')}
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mínimo
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={filters.minServings || 1}
                onChange={(e) => updateFilters({ minServings: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Máximo
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={filters.maxServings || 8}
                onChange={(e) => updateFilters({ maxServings: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </FilterSection>

        {/* Ingredientes */}
        <FilterSection
          title="Ingredientes"
          isExpanded={expandedSections.has('ingredients')}
          onToggle={() => toggleSection('ingredients')}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deve incluir
              </label>
              <IngredientInput
                placeholder="Ex: frango, tomate, queijo"
                value={filters.ingredients?.include || []}
                onChange={(ingredients) => updateFilters({ 
                  ingredients: { include: ingredients, exclude: filters.ingredients?.exclude || [] } 
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deve excluir
              </label>
              <IngredientInput
                placeholder="Ex: camarão, amendoim, leite"
                value={filters.ingredients?.exclude || []}
                onChange={(ingredients) => updateFilters({ 
                  ingredients: { include: filters.ingredients?.include || [], exclude: ingredients } 
                })}
              />
            </div>
          </div>
        </FilterSection>

        {/* Nutrição */}
        <FilterSection
          title="Nutrição"
          isExpanded={expandedSections.has('nutrition')}
          onToggle={() => toggleSection('nutrition')}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Calorias máximas: {filters.nutrition?.maxCalories || 800} kcal
              </label>
              <input
                type="range"
                min="100"
                max="2000"
                step="50"
                value={filters.nutrition?.maxCalories || 800}
                onChange={(e) => updateFilters({ 
                  nutrition: { ...filters.nutrition, maxCalories: parseInt(e.target.value) } 
                })}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Proteína mínima: {filters.nutrition?.minProtein || 0}g
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={filters.nutrition?.minProtein || 0}
                onChange={(e) => updateFilters({ 
                  nutrition: { ...filters.nutrition, minProtein: parseInt(e.target.value) } 
                })}
                className="w-full"
              />
            </div>
          </div>
        </FilterSection>
      </div>
    </div>
  );
}

function FilterSection({ 
  title, 
  children, 
  isExpanded, 
  onToggle 
}: { 
  title: string; 
  children: React.ReactNode; 
  isExpanded: boolean; 
  onToggle: () => void; 
}) {
  return (
    <div className="mb-4 border-b border-gray-200 pb-4">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-2 text-left hover:bg-gray-50 rounded"
      >
        <span className="font-medium text-gray-900">{title}</span>
        {isExpanded ? (
          <ChevronUpIcon className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronDownIcon className="h-5 w-5 text-gray-500" />
        )}
      </button>
      {isExpanded && <div className="mt-2">{children}</div>}
    </div>
  );
}

function FilterChip({ 
  label, 
  icon, 
  isSelected, 
  onClick 
}: { 
  label: string; 
  icon: string; 
  color?: string; 
  isSelected: boolean; 
  onClick: () => void; 
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-all ${
        isSelected
          ? 'bg-blue-50 border-blue-300 text-blue-700'
          : 'bg-white border-gray-200 hover:bg-gray-50'
      }`}
    >
      <span>{icon}</span>
      <span className="truncate">{label}</span>
    </button>
  );
}

function IngredientInput({ 
  placeholder, 
  value, 
  onChange 
}: { 
  placeholder: string; 
  value: string[]; 
  onChange: (ingredients: string[]) => void; 
}) {
  const [input, setInput] = useState('');

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const ingredient = input.trim();
      if (ingredient && !value.includes(ingredient)) {
        onChange([...value, ingredient]);
        setInput('');
      }
    }
  };

  const removeIngredient = (ingredient: string) => {
    onChange(value.filter(i => i !== ingredient));
  };

  return (
    <div className="space-y-2">
      <div className="flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => {
            const ingredient = input.trim();
            if (ingredient && !value.includes(ingredient)) {
              onChange([...value, ingredient]);
              setInput('');
            }
          }}
          className="px-3 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
        >
          <MagnifyingGlassIcon className="h-4 w-4" />
        </button>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {value.map((ingredient, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded"
            >
              {ingredient}
              <button
                onClick={() => removeIngredient(ingredient)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}