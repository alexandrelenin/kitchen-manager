import { useState } from 'react';
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  FireIcon,
  HeartIcon,
  TrophyIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useAnalytics } from '../hooks/useAnalytics';
import TrendsChart from './TrendsChart';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<any>;
  color: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

function MetricCard({ title, value, subtitle, icon: Icon, color, trend, trendValue }: MetricCardProps) {
  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return '↗';
      case 'down': return '↘';
      default: return '→';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
          {trend && trendValue && (
            <div className={`flex items-center mt-2 text-xs ${getTrendColor()}`}>
              <span className="mr-1">{getTrendIcon()}</span>
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
}

interface ProgressBarProps {
  label: string;
  value: number;
  max: number;
  color: string;
  unit?: string;
}

function ProgressBar({ label, value, max, color, unit = '' }: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-600">{value}{unit} / {max}{unit}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function TopRecipesList({ recipes }: { recipes: Array<{ recipe: any; count: number }> }) {
  if (!recipes || recipes.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <FireIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <p>Nenhuma receita executada ainda</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recipes.map((item, index) => (
        <div key={item.recipe.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              index === 0 ? 'bg-yellow-100 text-yellow-800' :
              index === 1 ? 'bg-gray-100 text-gray-700' :
              index === 2 ? 'bg-orange-100 text-orange-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {index + 1}
            </div>
            <div>
              <p className="font-medium text-gray-900">{item.recipe.name}</p>
              <p className="text-sm text-gray-600">{item.recipe.category}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold text-gray-900">{item.count}x</p>
            <p className="text-xs text-gray-500">executadas</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function NutritionalBalance({ balance }: { balance: any }) {
  const categories = [
    { name: 'Proteínas', value: balance.proteins, color: 'bg-red-500', max: 10 },
    { name: 'Carboidratos', value: balance.carbs, color: 'bg-yellow-500', max: 10 },
    { name: 'Vegetais', value: balance.vegetables, color: 'bg-green-500', max: 10 },
    { name: 'Frutas', value: balance.fruits, color: 'bg-purple-500', max: 10 }
  ];

  return (
    <div className="space-y-4">
      {categories.map((category) => (
        <ProgressBar
          key={category.name}
          label={category.name}
          value={category.value}
          max={category.max}
          color={category.color}
        />
      ))}
    </div>
  );
}

function WeeklyOverview({ stats }: { stats: any }) {
  if (!stats) return null;

  const completionRate = stats.plannedMeals > 0 ? (stats.executedMeals / stats.plannedMeals) * 100 : 0;
  const shoppingCompletionRate = stats.shoppingListItems > 0 ? (stats.purchasedItems / stats.shoppingListItems) * 100 : 0;

  return (
    <div className="space-y-4">
      <ProgressBar
        label="Refeições Executadas"
        value={stats.executedMeals}
        max={stats.plannedMeals}
        color="bg-blue-500"
      />
      <ProgressBar
        label="Lista de Compras"
        value={stats.purchasedItems}
        max={stats.shoppingListItems}
        color="bg-green-500"
      />
      <div className="grid grid-cols-2 gap-4 pt-2">
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">{Math.round(completionRate)}%</p>
          <p className="text-xs text-gray-600">Taxa de Execução</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">{Math.round(shoppingCompletionRate)}%</p>
          <p className="text-xs text-gray-600">Compras Feitas</p>
        </div>
      </div>
    </div>
  );
}

export default function AdvancedDashboard() {
  const { familyMetrics, weeklyStats, foodWasteAnalysis, loading, error } = useAnalytics();
  const [activeTab, setActiveTab] = useState<'overview' | 'trends'>('overview');

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Analytics</h1>
          <p className="text-gray-600">Insights inteligentes sobre sua cozinha</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Carregando analytics...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Analytics</h1>
          <p className="text-gray-600">Insights inteligentes sobre sua cozinha</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">Erro ao carregar analytics: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Analytics</h1>
        <p className="text-gray-600">Insights inteligentes sobre sua cozinha</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Visão Geral
          </button>
          <button
            onClick={() => setActiveTab('trends')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'trends'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Tendências
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' ? (
        <>
          {/* Alertas de Desperdício */}
      {foodWasteAnalysis && (foodWasteAnalysis.expiredItems > 0 || foodWasteAnalysis.expiringSoonItems > 0) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mt-0.5 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Atenção: Ingredientes Vencendo</h3>
              <div className="mt-2 text-sm text-yellow-700">
                {foodWasteAnalysis.expiredItems > 0 && (
                  <p>• {foodWasteAnalysis.expiredItems} ingredientes vencidos</p>
                )}
                {foodWasteAnalysis.expiringSoonItems > 0 && (
                  <p>• {foodWasteAnalysis.expiringSoonItems} ingredientes vencendo em 3 dias</p>
                )}
                {foodWasteAnalysis.totalCostWasted > 0 && (
                  <p>• Custo desperdiçado: R$ {foodWasteAnalysis.totalCostWasted.toFixed(2)}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total de Receitas"
          value={familyMetrics?.totalRecipes || 0}
          subtitle="no seu repertório"
          icon={FireIcon}
          color="bg-orange-500"
          trend="up"
          trendValue="+3 esta semana"
        />
        
        <MetricCard
          title="Avaliação Média"
          value={familyMetrics?.averageRecipeRating ? `${familyMetrics.averageRecipeRating}⭐` : 'N/A'}
          subtitle="das suas receitas"
          icon={HeartIcon}
          color="bg-pink-500"
          trend="up"
          trendValue="+0.2 este mês"
        />
        
        <MetricCard
          title="Economia Mensal"
          value={familyMetrics?.estimatedMonthlySavings ? `R$ ${familyMetrics.estimatedMonthlySavings}` : 'R$ 0'}
          subtitle="vs restaurantes"
          icon={CurrencyDollarIcon}
          color="bg-green-500"
          trend="up"
          trendValue="+R$ 150 este mês"
        />
        
        <MetricCard
          title="Score Anti-Desperdício"
          value={familyMetrics?.foodWasteScore ? `${familyMetrics.foodWasteScore}%` : '0%'}
          subtitle="aproveitamento"
          icon={TrophyIcon}
          color={familyMetrics?.foodWasteScore && familyMetrics.foodWasteScore > 80 ? 'bg-green-500' : 
                 familyMetrics?.foodWasteScore && familyMetrics.foodWasteScore > 60 ? 'bg-yellow-500' : 'bg-red-500'}
          trend={familyMetrics?.foodWasteScore && familyMetrics.foodWasteScore > 70 ? 'up' : 'down'}
          trendValue="vs semana passada"
        />
      </div>

      {/* Estatísticas Semanais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Visão Semanal</h3>
            <ChartBarIcon className="h-5 w-5 text-gray-600" />
          </div>
          <WeeklyOverview stats={weeklyStats} />
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Balanço Nutricional</h3>
            <HeartIcon className="h-5 w-5 text-gray-600" />
          </div>
          {familyMetrics?.nutritionalBalance ? (
            <NutritionalBalance balance={familyMetrics.nutritionalBalance} />
          ) : (
            <div className="text-center text-gray-500 py-8">
              <p>Execute mais receitas para ver o balanço nutricional</p>
            </div>
          )}
        </div>
      </div>

      {/* Receitas Mais Populares */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Top 5 Receitas da Família</h3>
          <TrophyIcon className="h-5 w-5 text-gray-600" />
        </div>
        <TopRecipesList recipes={familyMetrics?.mostPopularRecipes || []} />
      </div>

      {/* Insights e Recomendações */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <FireIcon className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-blue-900">Insights Inteligentes</h3>
            <div className="mt-3 space-y-2">
              {familyMetrics && (
                <>
                  {familyMetrics.weeklyMealPlanningRate < 50 && (
                    <p className="text-sm text-blue-800">
                      💡 Você está planejando apenas {familyMetrics.weeklyMealPlanningRate}% das suas refeições. 
                      Tente planejar mais para economizar tempo e dinheiro!
                    </p>
                  )}
                  {familyMetrics.ingredientUtilizationRate < 70 && (
                    <p className="text-sm text-blue-800">
                      ⚠️ Taxa de utilização de ingredientes em {familyMetrics.ingredientUtilizationRate}%. 
                      Considere comprar menos ou usar receitas que aproveitem sobras.
                    </p>
                  )}
                  {weeklyStats && weeklyStats.newRecipesTried === 0 && (
                    <p className="text-sm text-blue-800">
                      🌟 Que tal experimentar uma receita nova esta semana? 
                      Temos {familyMetrics.totalRecipes} receitas esperando por você!
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
        </>
      ) : (
        <TrendsChart />
      )}
    </div>
  );
}