import React, { useState, useEffect } from 'react';
import { MapPinIcon, CurrencyDollarIcon, ShoppingBagIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { floridaPriceService, FloridaPriceComparison, GeoLocation } from '../lib/floridaPriceScraping';

interface FloridaPriceComparisonProps {
  ingredients: string[];
  userLocation?: GeoLocation;
  onLocationUpdate?: (location: GeoLocation) => void;
  className?: string;
}

interface ZyteStatus {
  enabled: boolean;
  budgetStatus?: {
    used: number;
    remaining: number;
    requestCount: number;
    dailySpent: number;
    dailyBudget: number;
  };
  error?: string;
}

export default function FloridaPriceComparison({ 
  ingredients, 
  userLocation, 
  onLocationUpdate,
  className = '' 
}: FloridaPriceComparisonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [priceComparisons, setPriceComparisons] = useState<FloridaPriceComparison[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<GeoLocation | null>(userLocation || null);
  const [zyteStatus, setZyteStatus] = useState<ZyteStatus>({ enabled: false });
  const [error, setError] = useState<string>('');
  const [radiusMiles, setRadiusMiles] = useState(15);

  // Common Florida locations for testing
  const floridaLocations: GeoLocation[] = [
    {
      latitude: 25.7617,
      longitude: -80.1918,
      zipCode: '33130',
      city: 'Miami',
      state: 'FL'
    },
    {
      latitude: 28.3772,
      longitude: -81.5707,
      zipCode: '32836',
      city: 'Orlando',
      state: 'FL'
    },
    {
      latitude: 27.9506,
      longitude: -82.5369,
      zipCode: '33629',
      city: 'Tampa',
      state: 'FL'
    }
  ];

  useEffect(() => {
    checkZyteStatus();
  }, []);

  useEffect(() => {
    if (selectedLocation && ingredients.length > 0) {
      handlePriceComparison();
    }
  }, [selectedLocation, ingredients]);

  const checkZyteStatus = () => {
    try {
      const status = floridaPriceService.getZyteStatus();
      setZyteStatus(status);
    } catch (error) {
      console.error('Error checking Zyte status:', error);
      setZyteStatus({ enabled: false, error: 'Failed to check Zyte status' });
    }
  };

  const handleLocationChange = (location: GeoLocation) => {
    setSelectedLocation(location);
    onLocationUpdate?.(location);
  };

  const handlePriceComparison = async () => {
    if (!selectedLocation || ingredients.length === 0) return;

    setIsLoading(true);
    setError('');

    try {
      console.log(`Starting Florida price comparison for ${ingredients.length} ingredients`);
      
      const results = await floridaPriceService.compareFloridaPricesWithZyte(
        ingredients,
        selectedLocation,
        radiusMiles,
        zyteStatus.enabled
      );

      setPriceComparisons(results);
      
      // Update Zyte status after requests
      checkZyteStatus();

    } catch (error) {
      console.error('Price comparison error:', error);
      setError(error.message || 'Failed to compare prices');
    } finally {
      setIsLoading(false);
    }
  };

  const getTotalSavings = (): number => {
    return priceComparisons.reduce((total, comparison) => total + comparison.estimatedSavings, 0);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStoreChainColor = (chain: string): string => {
    const colors: Record<string, string> = {
      'publix': 'bg-green-100 text-green-800',
      'winn-dixie': 'bg-blue-100 text-blue-800',
      'whole-foods': 'bg-orange-100 text-orange-800',
      'walmart': 'bg-yellow-100 text-yellow-800',
      'target': 'bg-red-100 text-red-800',
      'aldi': 'bg-purple-100 text-purple-800'
    };
    return colors[chain] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <MapPinIcon className="h-6 w-6 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Florida Price Comparison
          </h3>
        </div>
        
        {/* Zyte Status Indicator */}
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${zyteStatus.enabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {zyteStatus.enabled ? 'Real Data' : 'Demo Mode'}
          </span>
        </div>
      </div>

      {/* Location Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select Florida Location
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {floridaLocations.map((location) => (
            <button
              key={location.zipCode}
              onClick={() => handleLocationChange(location)}
              className={`p-3 rounded-lg border-2 transition-colors ${
                selectedLocation?.zipCode === location.zipCode
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
              }`}
            >
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {location.city}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {location.zipCode}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Radius Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Search Radius: {radiusMiles} miles
        </label>
        <input
          type="range"
          min="5"
          max="25"
          step="5"
          value={radiusMiles}
          onChange={(e) => setRadiusMiles(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
        />
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>5 mi</span>
          <span>15 mi</span>
          <span>25 mi</span>
        </div>
      </div>

      {/* Zyte Budget Status */}
      {zyteStatus.enabled && zyteStatus.budgetStatus && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
            API Budget Status
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-blue-700 dark:text-blue-300">Used:</span>
              <div className="font-medium">{formatCurrency(zyteStatus.budgetStatus.used)}</div>
            </div>
            <div>
              <span className="text-blue-700 dark:text-blue-300">Remaining:</span>
              <div className="font-medium">{formatCurrency(zyteStatus.budgetStatus.remaining)}</div>
            </div>
            <div>
              <span className="text-blue-700 dark:text-blue-300">Daily Spent:</span>
              <div className="font-medium">{formatCurrency(zyteStatus.budgetStatus.dailySpent)}</div>
            </div>
            <div>
              <span className="text-blue-700 dark:text-blue-300">Requests:</span>
              <div className="font-medium">{zyteStatus.budgetStatus.requestCount}</div>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-300">
            Comparing prices across Florida stores...
          </span>
        </div>
      )}

      {/* Results */}
      {!isLoading && priceComparisons.length > 0 && (
        <>
          {/* Summary */}
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-medium text-green-900 dark:text-green-300">
                  Total Potential Savings
                </h4>
                <p className="text-sm text-green-700 dark:text-green-400">
                  By shopping at the best stores for each item
                </p>
              </div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(getTotalSavings())}
              </div>
            </div>
          </div>

          {/* Individual Product Comparisons */}
          <div className="space-y-4">
            {priceComparisons.map((comparison, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-medium text-gray-900 dark:text-white capitalize">
                    {comparison.ingredient}
                  </h5>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {comparison.stores.length} stores found
                  </div>
                </div>

                {/* Best Price Highlight */}
                <div className="mb-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-yellow-800 dark:text-yellow-300">Best Price:</span>
                      <div className="font-medium text-yellow-900 dark:text-yellow-200">
                        {comparison.bestPrice.store.name}
                      </div>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                        getStoreChainColor(comparison.bestPrice.store.chain)
                      }`}>
                        {comparison.bestPrice.store.chain.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-yellow-900 dark:text-yellow-200">
                        {formatCurrency(comparison.bestPrice.price)}
                      </div>
                      <div className="text-sm text-yellow-700 dark:text-yellow-400">
                        per {comparison.bestPrice.unit}
                      </div>
                    </div>
                  </div>
                </div>

                {/* All Store Prices */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {comparison.stores.map((store, storeIndex) => (
                    <div 
                      key={storeIndex} 
                      className={`p-3 rounded-lg border ${
                        store === comparison.bestPrice 
                          ? 'border-green-300 bg-green-50 dark:bg-green-900/20' 
                          : 'border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-1 ${
                            getStoreChainColor(store.store.chain)
                          }`}>
                            {store.store.chain.toUpperCase()}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                            {store.store.name}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {formatCurrency(store.price)}
                          </div>
                          {store.store.distance && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {store.store.distance.toFixed(1)} mi
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Promotions */}
                      {store.promotions && store.promotions.length > 0 && (
                        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded">
                          <div className="text-xs text-red-700 dark:text-red-300 font-medium">
                            🎉 {store.promotions[0].description}
                          </div>
                          <div className="text-xs text-red-600 dark:text-red-400">
                            Save {formatCurrency(store.promotions[0].savings)}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Price Range Info */}
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                    <span>Price Range:</span>
                    <span>
                      {formatCurrency(comparison.priceRange.min)} - {formatCurrency(comparison.priceRange.max)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                    <span>Average Price:</span>
                    <span>{formatCurrency(comparison.averagePrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                    <span>Potential Savings:</span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      {formatCurrency(comparison.estimatedSavings)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Refresh Button */}
          <div className="mt-6 text-center">
            <button
              onClick={handlePriceComparison}
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center mx-auto"
            >
              <ClockIcon className="h-4 w-4 mr-2" />
              Refresh Prices
            </button>
          </div>
        </>
      )}

      {/* Empty State */}
      {!isLoading && priceComparisons.length === 0 && selectedLocation && ingredients.length > 0 && (
        <div className="text-center py-8">
          <ShoppingBagIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Price Data Available
          </h4>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Unable to find price data for the selected ingredients and location.
          </p>
          <button
            onClick={handlePriceComparison}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Instructions */}
      {!selectedLocation && (
        <div className="text-center py-8">
          <MapPinIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Select Your Florida Location
          </h4>
          <p className="text-gray-600 dark:text-gray-300">
            Choose a location above to start comparing grocery prices across Florida stores.
          </p>
        </div>
      )}
    </div>
  );
}