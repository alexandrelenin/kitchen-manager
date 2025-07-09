import { useState } from 'react';
import { 
  CalendarDaysIcon, 
  SparklesIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ClockIcon,
  UserGroupIcon,
  ChartBarIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { useMealPlanGenerator } from '../hooks/useMealPlanGenerator';
import type { GeneratedMealPlan } from '../lib/mealPlanGenerator';

interface MealPlanGeneratorProps {
  onPlanGenerated?: (plan: GeneratedMealPlan) => void;
}

export default function MealPlanGenerator({ onPlanGenerated }: MealPlanGeneratorProps) {
  const { loading, error, generatedPlan, generateWeeklyPlan, saveMealPlan, clearPlan } = useMealPlanGenerator();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleQuickGenerate = async () => {
    setIsGenerating(true);
    try {
      const plan = await generateWeeklyPlan();
      onPlanGenerated?.(plan);
    } catch (err) {
      console.error('Erro ao gerar plano rápido:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSavePlan = async () => {
    if (!generatedPlan) return;
    
    try {
      await saveMealPlan(generatedPlan);
      clearPlan();
      // Mostrar sucesso
    } catch (err) {
      console.error('Erro ao salvar plano:', err);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
  };

  const getMealTypeLabel = (mealType: string) => {
    const labels = {
      breakfast: 'Café da Manhã',
      lunch: 'Almoço',
      dinner: 'Jantar',
      snack: 'Lanche'
    };
    return labels[mealType as keyof typeof labels] || mealType;
  };

  if (loading || isGenerating) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Gerando seu plano de refeições...</h3>
            <p className="text-gray-600">Analisando ingredientes, preferências e criando sugestões personalizadas</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao gerar plano</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={clearPlan}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (generatedPlan) {
    return (
      <div className="space-y-6">
        {/* Plan Analysis */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Plano Gerado</h3>
            <div className="flex space-x-2">
              <button
                onClick={handleSavePlan}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <CheckCircleIcon className="h-4 w-4" />
                Salvar Plano
              </button>
              <button
                onClick={clearPlan}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Gerar Novo
              </button>
            </div>
          </div>

          {/* Analysis Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CalendarDaysIcon className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Total de Refeições</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">{generatedPlan.analysis.totalRecipes}</p>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <ChartBarIcon className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-900">Score Nutricional</span>
              </div>
              <p className="text-2xl font-bold text-green-900">{generatedPlan.analysis.nutritionalScore}%</p>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <SparklesIcon className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Variedade</span>
              </div>
              <p className="text-2xl font-bold text-purple-900">{generatedPlan.analysis.varietyScore}%</p>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CurrencyDollarIcon className="h-5 w-5 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-900">Custo Estimado</span>
              </div>
              <p className="text-2xl font-bold text-yellow-900">R$ {generatedPlan.analysis.estimatedCost}</p>
            </div>
          </div>

          {/* Warnings */}
          {generatedPlan.analysis.warnings.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-medium text-amber-900 mb-2">⚠️ Recomendações:</h4>
              <ul className="text-sm text-amber-800 space-y-1">
                {generatedPlan.analysis.warnings.map((warning, index) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Meal Plan List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cronograma de Refeições</h3>
          
          <div className="space-y-4">
            {generatedPlan.mealPlans.map((mealPlan, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        {formatDate(mealPlan.date)}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {getMealTypeLabel(mealPlan.meal)}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{mealPlan.notes}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <UserGroupIcon className="h-3 w-3" />
                        {mealPlan.servings} porções
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">Receita ID: {mealPlan.recipeId}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="text-center max-w-md mx-auto">
        <SparklesIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Gerador Automático de Cardápio</h3>
        <p className="text-gray-600 mb-6">
          Crie um plano de refeições personalizado baseado nos seus ingredientes, preferências e necessidades nutricionais.
        </p>
        
        <div className="space-y-4">
          <button
            onClick={handleQuickGenerate}
            disabled={isGenerating}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <CalendarDaysIcon className="h-5 w-5" />
            Gerar Plano Semanal
          </button>
          
          <div className="grid grid-cols-3 gap-3 text-xs text-gray-500">
            <div className="text-center">
              <SparklesIcon className="h-4 w-4 mx-auto mb-1" />
              <span>Inteligente</span>
            </div>
            <div className="text-center">
              <ClockIcon className="h-4 w-4 mx-auto mb-1" />
              <span>Automático</span>
            </div>
            <div className="text-center">
              <UserGroupIcon className="h-4 w-4 mx-auto mb-1" />
              <span>Personalizado</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}