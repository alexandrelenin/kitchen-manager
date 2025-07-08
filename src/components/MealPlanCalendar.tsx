import React from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import type { Recipe, MealPlan } from '../types';

interface MealPlanCalendarProps {
  currentDate: Date;
  mealPlans: MealPlan[];
  recipes: Recipe[];
  onMealPlanAdd: (date: Date, meal: string, recipe: Recipe) => void;
  onMealPlanRemove: (mealPlanId: string) => void;
}

const mealTypes = [
  { key: 'breakfast', name: 'Café da Manhã', color: 'bg-yellow-50 border-yellow-200' },
  { key: 'lunch', name: 'Almoço', color: 'bg-blue-50 border-blue-200' },
  { key: 'dinner', name: 'Jantar', color: 'bg-purple-50 border-purple-200' },
  { key: 'snack', name: 'Lanche', color: 'bg-green-50 border-green-200' },
];

export default function MealPlanCalendar({
  currentDate,
  mealPlans,
  recipes,
  onMealPlanAdd,
  onMealPlanRemove,
}: MealPlanCalendarProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const [draggedRecipe, setDraggedRecipe] = React.useState<Recipe | null>(null);

  const getMealPlansForDay = (date: Date) => {
    return mealPlans.filter(plan => isSameDay(new Date(plan.date), date));
  };

  const getMealPlanForDayAndMeal = (date: Date, mealType: string) => {
    return getMealPlansForDay(date).find(plan => plan.meal === mealType);
  };

  const getRecipeById = (id: string) => {
    return recipes.find(recipe => recipe.id === id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, date: Date, mealType: string) => {
    e.preventDefault();
    if (draggedRecipe) {
      onMealPlanAdd(date, mealType, draggedRecipe);
      setDraggedRecipe(null);
    }
  };

  const handleDragStart = (recipe: Recipe) => {
    setDraggedRecipe(recipe);
  };

  return (
    <div className="space-y-6">
      {/* Available Recipes */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Receitas Disponíveis</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {recipes.slice(0, 8).map((recipe) => (
            <div
              key={recipe.id}
              className="p-3 border border-gray-200 rounded-lg cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
              draggable
              onDragStart={() => handleDragStart(recipe)}
            >
              <h4 className="font-medium text-gray-900 text-sm mb-1">{recipe.name}</h4>
              <p className="text-xs text-gray-600 mb-2">{recipe.prepTime + recipe.cookTime}min • {recipe.servings} porções</p>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                recipe.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                recipe.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {recipe.difficulty === 'easy' ? 'Fácil' :
                 recipe.difficulty === 'medium' ? 'Médio' : 'Difícil'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Calendar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Semana de {format(weekStart, 'dd/MM', { locale: ptBR })} a {format(weekEnd, 'dd/MM', { locale: ptBR })}
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <div className="grid grid-cols-7 min-w-full">
            {/* Day headers */}
            {weekDays.map((day) => (
              <div key={day.toString()} className="p-4 border-b border-gray-200">
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-900">
                    {format(day, 'EEE', { locale: ptBR })}
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {format(day, 'dd')}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Meal slots */}
            {mealTypes.map((mealType) => (
              <React.Fragment key={mealType.key}>
                {weekDays.map((day) => {
                  const mealPlan = getMealPlanForDayAndMeal(day, mealType.key);
                  const recipe = mealPlan ? getRecipeById(mealPlan.recipeId) : null;
                  
                  return (
                    <div
                      key={`${day.toString()}-${mealType.key}`}
                      className={`p-2 border-b border-r border-gray-200 min-h-[120px] ${mealType.color}`}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, day, mealType.key)}
                    >
                      <div className="text-xs font-medium text-gray-600 mb-2">
                        {mealType.name}
                      </div>
                      
                      {recipe && mealPlan ? (
                        <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-200">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-gray-900 mb-1">
                                {recipe.name}
                              </h4>
                              <p className="text-xs text-gray-600">
                                {recipe.prepTime + recipe.cookTime}min • {mealPlan.servings} porções
                              </p>
                            </div>
                            <button
                              onClick={() => onMealPlanRemove(mealPlan.id)}
                              className="text-gray-400 hover:text-red-500 ml-2"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                          <PlusIcon className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}