import React, { useState, useEffect } from 'react';
import { MapPinIcon, CurrencyDollarIcon, ChevronRightIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { floridaPriceService, GeoLocation } from '../lib/floridaPriceScraping';

interface FloridaPriceWidgetProps {
  ingredients?: string[];
  className?: string;
  onExpandClick?: () => void;
}

export default function FloridaPriceWidget({ 
  ingredients = [], 
  className = '',
  onExpandClick
}: FloridaPriceWidgetProps) {
  const [zyteStatus, setZyteStatus] = useState<any>({ enabled: false });
  const [isLoading, setIsLoading] = useState(false);
  const [quickComparison, setQuickComparison] = useState<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<GeoLocation>({
    latitude: 25.7617,
    longitude: -80.1918,
    zipCode: '33130',
    city: 'Miami',
    state: 'FL'
  });

  useEffect(() => {
    checkZyteStatus();
    if (ingredients.length > 0) {
      performQuickComparison();
    }
  }, [ingredients]);

  const checkZyteStatus = () => {
    try {
      const status = floridaPriceService.getZyteStatus();
      setZyteStatus(status);
    } catch (error) {
      console.error('Error checking Zyte status:', error);
    }
  };

  const performQuickComparison = async () => {
    if (ingredients.length === 0) return;

    setIsLoading(true);
    try {
      // Take first 3 ingredients for quick comparison
      const sampleIngredients = ingredients.slice(0, 3);
      
      const results = await floridaPriceService.compareFloridaPricesWithZyte(
        sampleIngredients,
        selectedLocation,
        15,
        zyteStatus.enabled
      );

      if (results.length > 0) {
        const totalSavings = results.reduce((sum, r) => sum + r.estimatedSavings, 0);
        const avgSavings = totalSavings / results.length;
        
        setQuickComparison({
          itemsCompared: results.length,
          totalSavings,
          avgSavings,
          bestStore: results[0]?.bestPrice?.store?.chain || 'unknown',
          lastUpdated: new Date()
        });
      }

      // Update Zyte status after requests
      checkZyteStatus();
      
    } catch (error) {
      console.error('Quick comparison error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStoreDisplayName = (chain: string): string => {
    const names: Record<string, string> = {
      'publix': 'Publix',
      'winn-dixie': 'Winn-Dixie',
      'whole-foods': 'Whole Foods',
      'walmart': 'Walmart',
      'target': 'Target',
      'aldi': 'ALDI'
    };
    return names[chain] || chain.toUpperCase();
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <MapPinIcon className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Florida Prices
          </h3>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Zyte Status */}
          <div className={`w-2 h-2 rounded-full ${zyteStatus.enabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          
          {/* Settings Icon */}
          <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <Cog6ToothIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Location Display */}
      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-blue-900 dark:text-blue-300">
              Current Location
            </div>
            <div className="text-lg font-semibold text-blue-800 dark:text-blue-200">
              {selectedLocation.city}, FL
            </div>
          </div>
          <div className="text-sm text-blue-700 dark:text-blue-400">
            {selectedLocation.zipCode}
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
            Checking prices...
          </span>
        </div>
      ) : quickComparison ? (
        <>
          {/* Quick Results */}
          <div className="space-y-3 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Items compared:
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {quickComparison.itemsCompared}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Potential savings:
              </span>
              <span className="font-bold text-green-600 dark:text-green-400">
                {formatCurrency(quickComparison.totalSavings)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Best store:
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {getStoreDisplayName(quickComparison.bestStore)}
              </span>
            </div>
          </div>

          {/* Last Updated */}
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Updated {quickComparison.lastUpdated.toLocaleTimeString()}
          </div>
        </>
      ) : ingredients.length === 0 ? (
        <div className="text-center py-6">
          <CurrencyDollarIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Add ingredients to your shopping list to see Florida price comparisons
          </p>
        </div>
      ) : (
        <div className="text-center py-6">
          <button
            onClick={performQuickComparison}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Check Florida Prices
          </button>
        </div>
      )}

      {/* Zyte Budget Status (if enabled and has budget info) */}
      {zyteStatus.enabled && zyteStatus.budgetStatus && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
              API Budget
            </span>
            <span className="text-xs text-yellow-700 dark:text-yellow-400">
              {zyteStatus.budgetStatus.requestCount} requests
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-yellow-700 dark:text-yellow-400">
              Used: {formatCurrency(zyteStatus.budgetStatus.used)}
            </span>
            <span className="text-yellow-700 dark:text-yellow-400">
              Remaining: {formatCurrency(zyteStatus.budgetStatus.remaining)}
            </span>
          </div>
          
          {/* Budget Progress Bar */}
          <div className="mt-2 w-full bg-yellow-200 dark:bg-yellow-900 rounded-full h-2">
            <div 
              className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${(zyteStatus.budgetStatus.used / (zyteStatus.budgetStatus.used + zyteStatus.budgetStatus.remaining)) * 100}%` 
              }}
            ></div>
          </div>
        </div>
      )}

      {/* API Status Info */}
      <div className="mb-4 p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${zyteStatus.enabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {zyteStatus.enabled ? 'Real-time data' : 'Demo mode'}
            </span>
          </div>
          
          {zyteStatus.enabled && (
            <span className="text-xs text-green-600 dark:text-green-400 font-medium">
              LIVE
            </span>
          )}
        </div>
        
        {!zyteStatus.enabled && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Set ZYTE_API_KEY to enable real price scraping
          </p>
        )}
      </div>

      {/* Expand Button */}
      <button
        onClick={onExpandClick}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center transition-colors"
      >
        <span className="mr-2">View Full Comparison</span>
        <ChevronRightIcon className="h-4 w-4" />
      </button>

      {/* Footer Info */}
      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
        Prices from major Florida grocery chains
      </div>
    </div>
  );
}