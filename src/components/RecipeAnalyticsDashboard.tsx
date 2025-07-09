import { useState } from 'react';
import {
  ChartBarIcon,
  StarIcon,
  ClockIcon,
  TrophyIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  CameraIcon,
  LightBulbIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { useRecipeEvaluation, useTopRatedRecipes, useRecipesNeedingImprovement } from '../hooks/useRecipeEvaluation';
import type { Recipe } from '../types';
import type { RecipeAnalytics, RecipeExecution } from '../lib/recipeEvaluation';

interface RecipeAnalyticsDashboardProps {
  recipe?: Recipe;
}

export default function RecipeAnalyticsDashboard({ recipe }: RecipeAnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'top-rated' | 'needs-improvement'>('overview');
  
  const { analytics, executions, loading: analyticsLoading } = useRecipeEvaluation(recipe?.id);
  const { recipes: topRatedRecipes, loading: topRatedLoading } = useTopRatedRecipes(10);
  const { recipes: recipesNeedingImprovement, loading: improvementLoading } = useRecipesNeedingImprovement();

  if (recipe && analyticsLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando analytics da receita...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {recipe ? `Analytics - ${recipe.name}` : 'Analytics de Receitas'}
            </h3>
            <p className="text-gray-600">
              {recipe ? 'Performance detalhada desta receita' : 'Visão geral das suas receitas'}
            </p>
          </div>
          <ChartBarIcon className="h-8 w-8 text-blue-600" />
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: recipe ? 'Detalhes' : 'Visão Geral', icon: ChartBarIcon },
              { id: 'top-rated', label: 'Top Receitas', icon: TrophyIcon },
              { id: 'needs-improvement', label: 'Precisam Melhorar', icon: ExclamationTriangleIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && recipe && analytics && (
        <RecipeDetailedAnalytics analytics={analytics} executions={executions} />
      )}
      
      {activeTab === 'overview' && !recipe && (
        <OverallAnalytics 
          topRatedRecipes={topRatedRecipes}
          recipesNeedingImprovement={recipesNeedingImprovement}
        />
      )}
      
      {activeTab === 'top-rated' && (
        <TopRatedRecipesTab recipes={topRatedRecipes} loading={topRatedLoading} />
      )}
      
      {activeTab === 'needs-improvement' && (
        <RecipesNeedingImprovementTab recipes={recipesNeedingImprovement} loading={improvementLoading} />
      )}
    </div>
  );
}

function RecipeDetailedAnalytics({ 
  analytics, 
  executions 
}: { 
  analytics: RecipeAnalytics; 
  executions: RecipeExecution[];
}) {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <EyeIcon className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Execuções</span>
          </div>
          <p className="text-2xl font-bold text-blue-900">{analytics.executionCount}</p>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <StarIcon className="h-5 w-5 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-900">Rating Médio</span>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-yellow-900">{analytics.averageRating.overall.toFixed(1)}</p>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIconSolid
                  key={star}
                  className={`h-4 w-4 ${
                    star <= analytics.averageRating.overall ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrophyIcon className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-900">Taxa de Sucesso</span>
          </div>
          <p className="text-2xl font-bold text-green-900">{Math.round(analytics.successRate * 100)}%</p>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <ClockIcon className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Tempo Médio Real</span>
          </div>
          <p className="text-2xl font-bold text-purple-900">{Math.round(analytics.averageActualTime)}min</p>
        </div>
      </div>

      {/* Detailed Ratings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Avaliações Detalhadas</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { key: 'taste', label: 'Sabor', icon: '👅' },
            { key: 'difficulty', label: 'Dificuldade', icon: '⚡' },
            { key: 'preparation', label: 'Clareza do Preparo', icon: '📝' },
            { key: 'presentation', label: 'Apresentação', icon: '🎨' },
            { key: 'value', label: 'Custo-Benefício', icon: '💰' }
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium text-gray-900">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIconSolid
                      key={star}
                      className={`h-4 w-4 ${
                        star <= (analytics.averageRating[item.key as keyof typeof analytics.averageRating] as number)
                          ? 'text-yellow-400' 
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {(analytics.averageRating[item.key as keyof typeof analytics.averageRating] as number).toFixed(1)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {analytics.averageRating.wouldMakeAgain && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <HeartIcon className="h-5 w-5 text-red-500" />
            <span className="text-red-800 font-medium">A família faria novamente esta receita!</span>
          </div>
        )}
      </div>

      {/* Popular Variations */}
      {analytics.popularVariations.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Variações Populares</h4>
          
          <div className="space-y-3">
            {analytics.popularVariations.map((variation, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-gray-900">{variation.description}</h5>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    variation.impact === 'improved' ? 'bg-green-100 text-green-800' :
                    variation.impact === 'neutral' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {variation.impact === 'improved' ? 'Melhorou' :
                     variation.impact === 'neutral' ? 'Neutro' : 'Piorou'}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Original:</span> {variation.originalValue} →{' '}
                  <span className="font-medium">Novo:</span> {variation.newValue}
                </p>
                {variation.notes && (
                  <p className="text-sm text-gray-500 mt-1">{variation.notes}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Improvement Suggestions */}
      {analytics.improvementSuggestions.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <LightBulbIcon className="h-5 w-5 text-yellow-500" />
            Sugestões de Melhoria
          </h4>
          
          <div className="space-y-2">
            {analytics.improvementSuggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <span className="text-yellow-600">💡</span>
                <p className="text-yellow-800">{suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Executions */}
      {executions.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Execuções Recentes</h4>
          
          <div className="space-y-4">
            {executions.slice(0, 3).map((execution) => (
              <div key={execution.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {execution.executedAt.toLocaleDateString('pt-BR')}
                    </span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIconSolid
                          key={star}
                          className={`h-3 w-3 ${
                            star <= execution.rating.overall ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {execution.photos.length > 0 && (
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <CameraIcon className="h-4 w-4" />
                      {execution.photos.length}
                    </div>
                  )}
                </div>
                
                {execution.notes && (
                  <p className="text-sm text-gray-600 mb-2">{execution.notes}</p>
                )}
                
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>⏱️ {execution.actualPrepTime + execution.actualCookTime}min</span>
                  <span>👥 {execution.actualServings} porções</span>
                  <span className={`px-2 py-1 rounded ${
                    execution.difficulty === 'easier' ? 'bg-green-100 text-green-700' :
                    execution.difficulty === 'as_expected' ? 'bg-blue-100 text-blue-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {execution.difficulty === 'easier' ? 'Mais fácil' :
                     execution.difficulty === 'as_expected' ? 'Como esperado' :
                     'Mais difícil'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function OverallAnalytics({ 
  topRatedRecipes, 
  recipesNeedingImprovement 
}: { 
  topRatedRecipes: Recipe[];
  recipesNeedingImprovement: Array<{ recipe: Recipe; issues: string[] }>;
}) {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrophyIcon className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-900">Top Receitas</span>
          </div>
          <p className="text-2xl font-bold text-green-900">{topRatedRecipes.length}</p>
          <p className="text-sm text-green-700">receitas bem avaliadas</p>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
            <span className="text-sm font-medium text-red-900">Precisam Melhorar</span>
          </div>
          <p className="text-2xl font-bold text-red-900">{recipesNeedingImprovement.length}</p>
          <p className="text-sm text-red-700">receitas com problemas</p>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <ChartBarIcon className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Taxa de Sucesso</span>
          </div>
          <p className="text-2xl font-bold text-blue-900">
            {topRatedRecipes.length > 0 
              ? Math.round((topRatedRecipes.length / (topRatedRecipes.length + recipesNeedingImprovement.length)) * 100)
              : 0}%
          </p>
          <p className="text-sm text-blue-700">receitas bem-sucedidas</p>
        </div>
      </div>

      {/* Quick Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Recipe Preview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrophyIcon className="h-5 w-5 text-yellow-500" />
            Melhor Receita
          </h4>
          
          {topRatedRecipes.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h5 className="font-medium text-gray-900">{topRatedRecipes[0].name}</h5>
                <div className="flex items-center gap-1">
                  <StarIconSolid className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm font-medium">{topRatedRecipes[0].rating}</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">{topRatedRecipes[0].description}</p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>⏱️ {topRatedRecipes[0].prepTime + topRatedRecipes[0].cookTime}min</span>
                <span>👥 {topRatedRecipes[0].servings} porções</span>
                <span className="capitalize">{topRatedRecipes[0].difficulty}</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Nenhuma receita avaliada ainda</p>
          )}
        </div>

        {/* Problem Recipe Preview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
            Precisa de Atenção
          </h4>
          
          {recipesNeedingImprovement.length > 0 ? (
            <div className="space-y-3">
              <h5 className="font-medium text-gray-900">{recipesNeedingImprovement[0].recipe.name}</h5>
              <div className="space-y-1">
                {recipesNeedingImprovement[0].issues.map((issue, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-red-600">
                    <span className="w-1 h-1 bg-red-500 rounded-full" />
                    {issue}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Todas as receitas estão funcionando bem!</p>
          )}
        </div>
      </div>
    </div>
  );
}

function TopRatedRecipesTab({ recipes, loading }: { recipes: Recipe[]; loading: boolean }) {
  if (loading) {
    return <div className="text-center py-8">Carregando receitas top...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h4 className="text-lg font-semibold text-gray-900 mb-4">Receitas Mais Bem Avaliadas</h4>
      
      {recipes.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Nenhuma receita avaliada ainda</p>
      ) : (
        <div className="space-y-4">
          {recipes.map((recipe, index) => (
            <div key={recipe.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                  index === 0 ? 'bg-yellow-500' :
                  index === 1 ? 'bg-gray-400' :
                  index === 2 ? 'bg-orange-500' :
                  'bg-blue-500'
                }`}>
                  {index + 1}
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-gray-900">{recipe.name}</h5>
                  <div className="flex items-center gap-1">
                    <StarIconSolid className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm font-medium">{recipe.rating}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 line-clamp-1">{recipe.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                  <span>⏱️ {recipe.prepTime + recipe.cookTime}min</span>
                  <span>👥 {recipe.servings} porções</span>
                  <span className="capitalize">{recipe.difficulty}</span>
                  <span>📂 {recipe.category}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RecipesNeedingImprovementTab({ 
  recipes, 
  loading 
}: { 
  recipes: Array<{ recipe: Recipe; issues: string[] }>; 
  loading: boolean;
}) {
  if (loading) {
    return <div className="text-center py-8">Analisando receitas...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h4 className="text-lg font-semibold text-gray-900 mb-4">Receitas que Precisam de Melhoria</h4>
      
      {recipes.length === 0 ? (
        <div className="text-center py-8">
          <TrophyIcon className="h-12 w-12 text-green-500 mx-auto mb-3" />
          <p className="text-gray-500">Parabéns! Todas as suas receitas estão funcionando bem.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {recipes.map(({ recipe, issues }) => (
            <div key={recipe.id} className="border border-red-200 rounded-lg p-4 bg-red-50">
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-medium text-gray-900">{recipe.name}</h5>
                <div className="flex items-center gap-1">
                  <StarIconSolid className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm font-medium">{recipe.rating}</span>
                </div>
              </div>
              
              <div className="space-y-1 mb-3">
                {issues.map((issue, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-red-700">
                    <ExclamationTriangleIcon className="h-4 w-4" />
                    {issue}
                  </div>
                ))}
              </div>
              
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>⏱️ {recipe.prepTime + recipe.cookTime}min</span>
                <span>👥 {recipe.servings} porções</span>
                <span className="capitalize">{recipe.difficulty}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}