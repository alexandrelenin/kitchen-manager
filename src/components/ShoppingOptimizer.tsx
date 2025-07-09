import { useState } from 'react';
import {
  ShoppingBagIcon,
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon,
  LightBulbIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  TagIcon,
  TruckIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import { useShoppingOptimizer } from '../hooks/useShoppingOptimizer';
import type { ShoppingOptimization, ShoppingSuggestion, OptimizedStore } from '../lib/shoppingOptimizer';

interface ShoppingOptimizerProps {
  onOptimizationComplete?: (optimization: ShoppingOptimization) => void;
}

export default function ShoppingOptimizer({ onOptimizationComplete }: ShoppingOptimizerProps) {
  const { optimization, loading, error, optimizeShoppingList, clearOptimization } = useShoppingOptimizer();
  const [activeTab, setActiveTab] = useState<'route' | 'costs' | 'suggestions' | 'timing'>('route');

  const handleOptimize = async () => {
    try {
      const result = await optimizeShoppingList();
      onOptimizationComplete?.(result);
    } catch (err) {
      console.error('Erro ao otimizar:', err);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Otimizando suas compras...</h3>
            <p className="text-gray-600">Analisando rotas, preços e sugestões inteligentes</p>
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">Erro na otimização</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={clearOptimization}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!optimization) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center max-w-md mx-auto">
          <ShoppingBagIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Otimizador de Compras</h3>
          <p className="text-gray-600 mb-6">
            Otimize sua lista de compras com rotas inteligentes, análise de custos e sugestões personalizadas.
          </p>
          
          <button
            onClick={handleOptimize}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ShoppingBagIcon className="h-5 w-5" />
            Otimizar Lista de Compras
          </button>
          
          <div className="grid grid-cols-2 gap-3 mt-6 text-xs text-gray-500">
            <div className="text-center">
              <MapPinIcon className="h-4 w-4 mx-auto mb-1" />
              <span>Rota Otimizada</span>
            </div>
            <div className="text-center">
              <CurrencyDollarIcon className="h-4 w-4 mx-auto mb-1" />
              <span>Análise de Custos</span>
            </div>
            <div className="text-center">
              <LightBulbIcon className="h-4 w-4 mx-auto mb-1" />
              <span>Sugestões Smart</span>
            </div>
            <div className="text-center">
              <ClockIcon className="h-4 w-4 mx-auto mb-1" />
              <span>Melhor Timing</span>
            </div>
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
          <h3 className="text-lg font-semibold text-gray-900">Compras Otimizadas</h3>
          <div className="flex space-x-2">
            <button
              onClick={handleOptimize}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <ShoppingBagIcon className="h-4 w-4" />
              Reotimizar
            </button>
            <button
              onClick={clearOptimization}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Nova Lista
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPinIcon className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Distância Total</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">{optimization.route.totalDistance.toFixed(1)} km</p>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <ClockIcon className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-900">Tempo Estimado</span>
            </div>
            <p className="text-2xl font-bold text-green-900">{Math.round(optimization.route.estimatedTime)}min</p>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CurrencyDollarIcon className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">Custo Estimado</span>
            </div>
            <p className="text-2xl font-bold text-purple-900">R$ {optimization.costAnalysis.estimatedCost.toFixed(2)}</p>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TagIcon className="h-5 w-5 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-900">Economia Potencial</span>
            </div>
            <p className="text-2xl font-bold text-yellow-900">R$ {optimization.costAnalysis.savings.toFixed(2)}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'route', label: 'Rota', icon: MapPinIcon },
              { id: 'costs', label: 'Custos', icon: CurrencyDollarIcon },
              { id: 'suggestions', label: 'Sugestões', icon: LightBulbIcon },
              { id: 'timing', label: 'Timing', icon: CalendarDaysIcon }
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
      {activeTab === 'route' && <RouteTab route={optimization.route} />}
      {activeTab === 'costs' && <CostsTab costAnalysis={optimization.costAnalysis} />}
      {activeTab === 'suggestions' && <SuggestionsTab suggestions={optimization.suggestions} />}
      {activeTab === 'timing' && <TimingTab timing={optimization.timing} />}
    </div>
  );
}

function RouteTab({ route }: { route: any }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h4 className="text-lg font-semibold text-gray-900 mb-4">Rota Otimizada</h4>
      
      <div className="space-y-4">
        {route.stores.map((store: OptimizedStore, index: number) => (
          <div key={store.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <div>
                  <h5 className="font-medium text-gray-900">{store.name}</h5>
                  <p className="text-sm text-gray-600">{store.address}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                  <MapPinIcon className="h-3 w-3" />
                  {store.distance.toFixed(1)} km
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <span className="text-yellow-500">⭐</span>
                  {store.rating}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{store.items.length} itens</span>
              <span className="font-medium text-gray-900">R$ {store.estimatedCost.toFixed(2)}</span>
            </div>
            
            <div className="mt-2 flex flex-wrap gap-1">
              {store.items.slice(0, 5).map((item: any, itemIndex: number) => (
                <span key={itemIndex} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                  {item.name}
                </span>
              ))}
              {store.items.length > 5 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                  +{store.items.length - 5} mais
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CostsTab({ costAnalysis }: { costAnalysis: any }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Análise de Custos</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Orçamento</p>
            <p className="text-xl font-bold text-gray-900">R$ {costAnalysis.totalBudget.toFixed(2)}</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Custo Estimado</p>
            <p className="text-xl font-bold text-gray-900">R$ {costAnalysis.estimatedCost.toFixed(2)}</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Economia Potencial</p>
            <p className="text-xl font-bold text-green-600">R$ {costAnalysis.savings.toFixed(2)}</p>
          </div>
        </div>

        {costAnalysis.alternatives.length > 0 && (
          <div>
            <h5 className="font-medium text-gray-900 mb-3">Alternativas Econômicas</h5>
            <div className="space-y-3">
              {costAnalysis.alternatives.slice(0, 3).map((alt: any, index: number) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{alt.item.name}</span>
                    <span className="text-sm text-green-600">
                      Economize até R$ {alt.alternatives[0]?.savings.toFixed(2)}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {alt.alternatives.map((alternative: any, altIndex: number) => (
                      <div key={altIndex} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{alternative.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-900">R$ {alternative.price.toFixed(2)}</span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            alternative.quality === 'higher' ? 'bg-green-100 text-green-800' :
                            alternative.quality === 'similar' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {alternative.quality === 'higher' ? 'Premium' :
                             alternative.quality === 'similar' ? 'Similar' : 'Básico'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SuggestionsTab({ suggestions }: { suggestions: ShoppingSuggestion[] }) {
  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'bulk_buy': return TruckIcon;
      case 'seasonal': return CalendarDaysIcon;
      case 'promotion': return TagIcon;
      case 'substitute': return ChartBarIcon;
      case 'timing': return ClockIcon;
      default: return LightBulbIcon;
    }
  };

  const getSuggestionColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h4 className="text-lg font-semibold text-gray-900 mb-4">Sugestões Inteligentes</h4>
      
      {suggestions.length === 0 ? (
        <div className="text-center py-8">
          <LightBulbIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Nenhuma sugestão disponível no momento.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {suggestions.map((suggestion) => {
            const Icon = getSuggestionIcon(suggestion.type);
            return (
              <div key={suggestion.id} className={`border rounded-lg p-4 ${getSuggestionColor(suggestion.priority)}`}>
                <div className="flex items-start gap-3">
                  <Icon className="h-5 w-5 text-gray-600 mt-0.5" />
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900 mb-1">{suggestion.title}</h5>
                    <p className="text-sm text-gray-600 mb-2">{suggestion.description}</p>
                    {suggestion.savings > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-green-600">
                          Economia: R$ {suggestion.savings.toFixed(2)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          suggestion.priority === 'high' ? 'bg-red-100 text-red-800' :
                          suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {suggestion.priority === 'high' ? 'Urgente' :
                           suggestion.priority === 'medium' ? 'Importante' : 'Sugestão'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TimingTab({ timing }: { timing: any }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h4 className="text-lg font-semibold text-gray-900 mb-4">Melhor Timing para Compras</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CalendarDaysIcon className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">Melhor Dia</span>
            </div>
            <p className="text-xl font-bold text-blue-900">{timing.bestDay}</p>
          </div>
          
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <ClockIcon className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-900">Melhor Horário</span>
            </div>
            <p className="text-xl font-bold text-green-900">{timing.bestTime}</p>
          </div>
          
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TruckIcon className="h-5 w-5 text-yellow-600" />
              <span className="font-medium text-yellow-900">Movimento</span>
            </div>
            <p className="text-xl font-bold text-yellow-900 capitalize">{timing.crowdLevel}</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <h5 className="font-medium text-gray-900 mb-2">Dias de Promoção</h5>
            <div className="flex flex-wrap gap-2">
              {timing.promotionDays.map((day: string) => (
                <span key={day} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                  {day}
                </span>
              ))}
            </div>
          </div>
          
          <div>
            <h5 className="font-medium text-gray-900 mb-2">Recomendação</h5>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              {timing.reasoning}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}