import { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  TruckIcon,
  ShoppingCartIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  TagIcon,
  ChartBarIcon,
  StarIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { 
  supermarketService, 
  type PriceComparison as PriceComparisonType,
  type SupermarketProduct,
  type CartItem
} from '../lib/supermarketIntegration';
import { useTheme } from '../contexts/ThemeContext';

interface PriceComparisonProps {
  ingredient?: string;
  onClose?: () => void;
}

export default function PriceComparison({ ingredient: initialIngredient, onClose }: PriceComparisonProps) {
  const { effectiveTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState(initialIngredient || '');
  const [comparison, setComparison] = useState<PriceComparisonType | null>(null);
  const [favoriteProducts, setFavoriteProducts] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'stores' | 'history'>('products');

  useEffect(() => {
    if (initialIngredient) {
      handleSearch(initialIngredient);
    }
  }, [initialIngredient]);

  const handleSearch = async (ingredient: string) => {
    if (!ingredient.trim()) return;

    setIsLoading(true);
    try {
      const result = await supermarketService.searchProducts(ingredient);
      setComparison(result);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async (product: SupermarketProduct, quantity: number = 1) => {
    try {
      const cartItem: Omit<CartItem, 'substitutions'> = {
        product,
        quantity,
        notes: ''
      };

      await supermarketService.createShoppingCart(product.store.id, [cartItem]);
      // Could show success message here
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
    }
  };

  const toggleFavorite = (productId: string) => {
    const newFavorites = new Set(favoriteProducts);
    if (newFavorites.has(productId)) {
      newFavorites.delete(productId);
    } else {
      newFavorites.add(productId);
    }
    setFavoriteProducts(newFavorites);
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

  const ProductCard = ({ product, isRecommended = false }: { product: SupermarketProduct; isRecommended?: boolean }) => (
    <div 
      className={`${effectiveTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-2 ${
        isRecommended ? 'border-blue-500 bg-blue-50 dark:bg-blue-900' : 'border-gray-200 dark:border-gray-700'
      }`}
    >
      {isRecommended && (
        <div className="flex items-center mb-2 text-blue-600 dark:text-blue-400">
          <StarIcon className="h-4 w-4 mr-1" />
          <span className="text-xs font-medium">Recomendado</span>
        </div>
      )}
      
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <img
            src={product.imageUrl || 'https://via.placeholder.com/60x60/64748b/ffffff?text=Produto'}
            alt={product.name}
            className="w-12 h-12 object-cover rounded"
          />
          <div>
            <h3 className={`font-semibold ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {product.name}
            </h3>
            <p className={`text-sm ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {product.brand} • {product.unit}
            </p>
          </div>
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(product.id);
          }}
          className="text-gray-400 hover:text-red-500 transition-colors"
        >
          {favoriteProducts.has(product.id) ? (
            <HeartIconSolid className="h-5 w-5 text-red-500" />
          ) : (
            <HeartIcon className="h-5 w-5" />
          )}
        </button>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${getStoreColor(product.store.chain.id)}`}></div>
          <span className={`text-sm font-medium ${effectiveTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {product.store.chain.displayName}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <MapPinIcon className="h-4 w-4 text-gray-400" />
          <span className={`text-sm ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {product.store.distance?.toFixed(1)}km
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className={`text-2xl font-bold ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {formatPrice(product.price)}
          </div>
          {product.originalPrice && (
            <div className="text-sm text-gray-500 line-through">
              {formatPrice(product.originalPrice)}
            </div>
          )}
        </div>
        
        {product.discount && (
          <div className="flex items-center space-x-1 bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
            <TagIcon className="h-3 w-3" />
            <span>-{formatPrice(product.discount)}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${product.availability ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className={`text-sm ${product.availability ? 'text-green-600' : 'text-red-600'}`}>
            {product.availability ? 'Disponível' : 'Indisponível'}
          </span>
        </div>
        
        {product.store.deliveryAvailable && (
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <TruckIcon className="h-4 w-4" />
            <span>{product.store.estimatedDeliveryTime}min</span>
          </div>
        )}
      </div>

      <div className="flex space-x-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleAddToCart(product);
          }}
          disabled={!product.availability}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
            product.availability
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <ShoppingCartIcon className="h-4 w-4 inline mr-1" />
          Adicionar
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            // Could show price history here
          }}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            effectiveTheme === 'dark' 
              ? 'bg-gray-700 text-white hover:bg-gray-600' 
              : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
          }`}
        >
          <ChartBarIcon className="h-4 w-4" />
        </button>
      </div>

      {product.promotionEndDate && (
        <div className="mt-3 text-xs text-orange-600 bg-orange-50 dark:bg-orange-900 dark:text-orange-400 p-2 rounded">
          <ExclamationTriangleIcon className="h-3 w-3 inline mr-1" />
          Promoção válida até {product.promotionEndDate.toLocaleDateString()}
        </div>
      )}
    </div>
  );

  const RecommendationBadge = ({ recommendation }: { recommendation: any }) => {
    const getBadgeColor = (type: string) => {
      switch (type) {
        case 'best_price': return 'bg-green-100 text-green-800';
        case 'best_value': return 'bg-blue-100 text-blue-800';
        case 'fastest_delivery': return 'bg-purple-100 text-purple-800';
        case 'bulk_discount': return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    const getIcon = (type: string) => {
      switch (type) {
        case 'best_price': return <TagIcon className="h-4 w-4" />;
        case 'best_value': return <StarIcon className="h-4 w-4" />;
        case 'fastest_delivery': return <TruckIcon className="h-4 w-4" />;
        case 'bulk_discount': return <ShoppingCartIcon className="h-4 w-4" />;
        default: return <CheckCircleIcon className="h-4 w-4" />;
      }
    };

    return (
      <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${getBadgeColor(recommendation.type)}`}>
        {getIcon(recommendation.type)}
        <span>{recommendation.reason}</span>
        {recommendation.savings && (
          <span className="font-medium">• Economia: {formatPrice(recommendation.savings)}</span>
        )}
      </div>
    );
  };

  const ComparisonSummary = ({ comparison }: { comparison: PriceComparisonType }) => (
    <div className={`${effectiveTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 mb-6`}>
      <h3 className={`text-lg font-semibold ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>
        Resumo da Comparação
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className={`text-2xl font-bold ${effectiveTheme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
            {formatPrice(comparison.bestPrice.price)}
          </div>
          <div className={`text-sm ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Melhor preço
          </div>
          <div className={`text-xs ${effectiveTheme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
            {comparison.bestPrice.store.chain.displayName}
          </div>
        </div>
        
        <div className="text-center">
          <div className={`text-2xl font-bold ${effectiveTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
            {formatPrice(comparison.averagePrice)}
          </div>
          <div className={`text-sm ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Preço médio
          </div>
          <div className={`text-xs ${effectiveTheme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
            {comparison.products.length} produtos
          </div>
        </div>
        
        <div className="text-center">
          <div className={`text-2xl font-bold ${effectiveTheme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`}>
            {formatPrice(comparison.priceRange.max - comparison.priceRange.min)}
          </div>
          <div className={`text-sm ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Diferença máxima
          </div>
          <div className={`text-xs ${effectiveTheme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
            {formatPrice(comparison.priceRange.min)} - {formatPrice(comparison.priceRange.max)}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className={`text-sm font-medium ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Recomendações:
        </h4>
        <div className="flex flex-wrap gap-2">
          {comparison.recommendations.map((rec, index) => (
            <RecommendationBadge key={index} recommendation={rec} />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${effectiveTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className={`text-3xl font-bold ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Comparação de Preços
              </h1>
              <p className={`text-lg ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Compare preços em diferentes supermercados
              </p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className={`px-4 py-2 rounded-lg ${effectiveTheme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} hover:bg-gray-700`}
              >
                Fechar
              </button>
            )}
          </div>
          
          {/* Search */}
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar produto (ex: leite, arroz, feijão)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchTerm)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg ${
                  effectiveTheme === 'dark' 
                    ? 'bg-gray-800 border-gray-700 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
            <button
              onClick={() => handleSearch(searchTerm)}
              disabled={isLoading}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {isLoading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
        </div>

        {/* Results */}
        {comparison && (
          <div>
            <ComparisonSummary comparison={comparison} />
            
            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'products', label: 'Produtos', count: comparison.products.length },
                  { id: 'stores', label: 'Lojas', count: new Set(comparison.products.map(p => p.store.id)).size },
                  { id: 'history', label: 'Histórico', count: null }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : `border-transparent ${effectiveTheme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
                    }`}
                  >
                    <span>{tab.label}</span>
                    {tab.count && (
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        activeTab === tab.id ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Products Tab */}
            {activeTab === 'products' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {comparison.products.map((product) => {
                  const isRecommended = comparison.recommendations.some(r => r.product.id === product.id);
                  return (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      isRecommended={isRecommended}
                    />
                  );
                })}
              </div>
            )}

            {/* Stores Tab */}
            {activeTab === 'stores' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from(new Set(comparison.products.map(p => p.store.id)))
                  .map(storeId => comparison.products.find(p => p.store.id === storeId)?.store)
                  .filter(Boolean)
                  .map((store) => {
                    const storeProducts = comparison.products.filter(p => p.store.id === store!.id);
                    const avgPrice = storeProducts.reduce((sum, p) => sum + p.price, 0) / storeProducts.length;
                    
                    return (
                      <div key={store!.id} className={`${effectiveTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
                        <div className="flex items-center space-x-3 mb-4">
                          <div className={`w-4 h-4 rounded-full ${getStoreColor(store!.chain.id)}`}></div>
                          <div>
                            <h3 className={`font-semibold ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {store!.chain.displayName}
                            </h3>
                            <p className={`text-sm ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {store!.name}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <div className={`text-lg font-bold ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {formatPrice(avgPrice)}
                            </div>
                            <div className={`text-sm ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              Preço médio
                            </div>
                          </div>
                          <div>
                            <div className={`text-lg font-bold ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {storeProducts.length}
                            </div>
                            <div className={`text-sm ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              Produtos
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center space-x-2 text-sm">
                            <MapPinIcon className="h-4 w-4 text-gray-400" />
                            <span className={effectiveTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                              {store!.distance?.toFixed(1)}km de distância
                            </span>
                          </div>
                          {store!.deliveryAvailable && (
                            <div className="flex items-center space-x-2 text-sm">
                              <TruckIcon className="h-4 w-4 text-gray-400" />
                              <span className={effectiveTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                                Entrega em {store!.estimatedDeliveryTime}min • {formatPrice(store!.deliveryFee || 0)}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center space-x-2 text-sm">
                            <StarIcon className="h-4 w-4 text-gray-400" />
                            <span className={effectiveTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                              {store!.rating?.toFixed(1)} • Pedido mínimo: {formatPrice(store!.minOrderValue || 0)}
                            </span>
                          </div>
                        </div>
                        
                        <button className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                          Ver produtos desta loja
                        </button>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!comparison && !isLoading && (
          <div className="text-center py-12">
            <MagnifyingGlassIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className={`text-lg font-medium ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>
              Busque por produtos
            </h3>
            <p className={`text-sm ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Digite o nome de um produto para comparar preços em diferentes supermercados
            </p>
          </div>
        )}
      </div>
    </div>
  );
}