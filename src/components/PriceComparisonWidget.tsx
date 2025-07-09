import { useState, useEffect } from 'react';
import {
  CurrencyDollarIcon,
  ChartBarIcon,
  ShoppingBagIcon,
  TruckIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { 
  supermarketService, 
  type SupermarketProduct,
  type SupermarketStore
} from '../lib/supermarketIntegration';
import { useTheme } from '../contexts/ThemeContext';

interface PriceComparisonWidgetProps {
  ingredients: string[];
  onOpenFullComparison?: (ingredient: string) => void;
  className?: string;
}

interface ComparisonSummary {
  ingredient: string;
  bestPrice: SupermarketProduct;
  worstPrice: SupermarketProduct;
  savings: number;
  storeCount: number;
  isLoading: boolean;
  error?: string;
}

export default function PriceComparisonWidget({ 
  ingredients, 
  onOpenFullComparison,
  className = ''
}: PriceComparisonWidgetProps) {
  const { effectiveTheme } = useTheme();
  const [comparisons, setComparisons] = useState<ComparisonSummary[]>([]);
  const [totalSavings, setTotalSavings] = useState(0);
  const [recommendedStore, setRecommendedStore] = useState<SupermarketStore | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (ingredients.length > 0) {
      loadComparisons();
    }
  }, [ingredients]);

  const loadComparisons = async () => {
    setIsLoading(true);
    const newComparisons: ComparisonSummary[] = [];
    let totalSavingsAmount = 0;
    const storeFrequency = new Map<string, number>();

    for (const ingredient of ingredients) {
      const summary: ComparisonSummary = {
        ingredient,
        bestPrice: {} as SupermarketProduct,
        worstPrice: {} as SupermarketProduct,
        savings: 0,
        storeCount: 0,
        isLoading: true
      };

      newComparisons.push(summary);
      setComparisons([...newComparisons]);

      try {
        const comparison = await supermarketService.searchProducts(ingredient);
        
        if (comparison.products.length > 0) {
          const sortedProducts = comparison.products.sort((a, b) => a.price - b.price);
          const bestPrice = sortedProducts[0];
          const worstPrice = sortedProducts[sortedProducts.length - 1];
          const savings = worstPrice.price - bestPrice.price;

          summary.bestPrice = bestPrice;
          summary.worstPrice = worstPrice;
          summary.savings = savings;
          summary.storeCount = comparison.products.length;
          summary.isLoading = false;

          totalSavingsAmount += savings;

          // Contar frequência de lojas para recomendação
          comparison.products.forEach(product => {
            const storeId = product.store.id;
            storeFrequency.set(storeId, (storeFrequency.get(storeId) || 0) + 1);
          });
        }
      } catch (error) {
        summary.error = 'Erro ao buscar preços';
        summary.isLoading = false;
      }

      setComparisons([...newComparisons]);
    }

    setTotalSavings(totalSavingsAmount);

    // Encontrar loja mais recomendada
    if (storeFrequency.size > 0) {
      const mostFrequentStoreId = Array.from(storeFrequency.entries())
        .sort((a, b) => b[1] - a[1])[0][0];
      
      const stores = await supermarketService.getNearbyStores({ lat: -23.5505, lng: -46.6333 });
      const recommendedStore = stores.find(store => store.id === mostFrequentStoreId);
      setRecommendedStore(recommendedStore || null);
    }

    setIsLoading(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getStoreColor = (chainId: string) => {
    const colors: Record<string, string> = {
      'pao-de-acucar': 'bg-green-500',
      'extra': 'bg-orange-500',
      'carrefour': 'bg-blue-500',
      'big': 'bg-yellow-500',
      'sendas': 'bg-red-500',
      'atacadao': 'bg-red-600'
    };
    return colors[chainId] || 'bg-gray-500';
  };

  const ComparisonItem = ({ summary }: { summary: ComparisonSummary }) => (
    <div className={`${effectiveTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 border border-gray-200 dark:border-gray-700`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className={`font-medium ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {summary.ingredient}
        </h4>
        <button
          onClick={() => onOpenFullComparison?.(summary.ingredient)}
          className="text-blue-500 hover:text-blue-600 text-sm"
        >
          <ArrowRightIcon className="h-4 w-4" />
        </button>
      </div>

      {summary.isLoading ? (
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          <span>Comparando preços...</span>
        </div>
      ) : summary.error ? (
        <div className="flex items-center space-x-2 text-sm text-red-500">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <span>{summary.error}</span>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${getStoreColor(summary.bestPrice.store.chain.id)}`}></div>
              <span className={`text-sm ${effectiveTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {summary.bestPrice.store.chain.displayName}
              </span>
            </div>
            <div className={`text-sm font-medium ${effectiveTheme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
              {formatPrice(summary.bestPrice.price)}
            </div>
          </div>

          {summary.savings > 0 && (
            <div className="flex items-center justify-between text-xs">
              <span className={effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                Economia vs mais caro
              </span>
              <span className={`font-medium ${effectiveTheme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`}>
                {formatPrice(summary.savings)}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs">
            <span className={effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
              {summary.storeCount} lojas comparadas
            </span>
            {summary.bestPrice.store.deliveryAvailable && (
              <div className="flex items-center space-x-1 text-blue-500">
                <TruckIcon className="h-3 w-3" />
                <span>{summary.bestPrice.store.estimatedDeliveryTime}min</span>
              </div>
            )}
          </div>

          {summary.bestPrice.discount && (
            <div className="flex items-center space-x-1 text-xs text-red-600 bg-red-50 dark:bg-red-900 dark:text-red-400 px-2 py-1 rounded">
              <TagIcon className="h-3 w-3" />
              <span>Promoção: -{formatPrice(summary.bestPrice.discount)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (ingredients.length === 0) {
    return null;
  }

  return (
    <div className={`${className} ${effectiveTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} rounded-lg p-6`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <CurrencyDollarIcon className="h-5 w-5 text-blue-500" />
          <h3 className={`text-lg font-semibold ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Comparação de Preços
          </h3>
        </div>
        
        {totalSavings > 0 && (
          <div className="text-right">
            <div className={`text-sm ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Economia total possível
            </div>
            <div className={`text-lg font-bold ${effectiveTheme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
              {formatPrice(totalSavings)}
            </div>
          </div>
        )}
      </div>

      {/* Loja recomendada */}
      {recommendedStore && (
        <div className={`${effectiveTheme === 'dark' ? 'bg-blue-900' : 'bg-blue-50'} rounded-lg p-4 mb-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${getStoreColor(recommendedStore.chain.id)}`}></div>
              <div>
                <div className={`font-medium ${effectiveTheme === 'dark' ? 'text-blue-300' : 'text-blue-900'}`}>
                  Loja Recomendada
                </div>
                <div className={`text-sm ${effectiveTheme === 'dark' ? 'text-blue-400' : 'text-blue-700'}`}>
                  {recommendedStore.chain.displayName} • {recommendedStore.distance?.toFixed(1)}km
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className={`text-sm ${effectiveTheme === 'dark' ? 'text-blue-400' : 'text-blue-700'}`}>
                Entrega
              </div>
              <div className={`text-sm font-medium ${effectiveTheme === 'dark' ? 'text-blue-300' : 'text-blue-900'}`}>
                {recommendedStore.estimatedDeliveryTime}min • {formatPrice(recommendedStore.deliveryFee || 0)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de comparações */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {comparisons.map((summary) => (
          <ComparisonItem key={summary.ingredient} summary={summary} />
        ))}
      </div>

      {/* Loading state */}
      {isLoading && comparisons.length === 0 && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className={`ml-3 text-sm ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Comparando preços...
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex space-x-3 mt-6">
        <button
          onClick={() => onOpenFullComparison?.('')}
          className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
        >
          <ChartBarIcon className="h-4 w-4" />
          <span>Ver Comparação Completa</span>
        </button>
        
        {recommendedStore && (
          <button className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2">
            <ShoppingBagIcon className="h-4 w-4" />
            <span>Comprar na {recommendedStore.chain.displayName}</span>
          </button>
        )}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className={`text-lg font-bold ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {ingredients.length}
          </div>
          <div className={`text-xs ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Produtos
          </div>
        </div>
        
        <div className="text-center">
          <div className={`text-lg font-bold ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {comparisons.reduce((sum, c) => sum + c.storeCount, 0)}
          </div>
          <div className={`text-xs ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Comparações
          </div>
        </div>
        
        <div className="text-center">
          <div className={`text-lg font-bold ${effectiveTheme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
            {totalSavings > 0 ? formatPrice(totalSavings) : 'R$ 0,00'}
          </div>
          <div className={`text-xs ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Economia
          </div>
        </div>
      </div>
    </div>
  );
}