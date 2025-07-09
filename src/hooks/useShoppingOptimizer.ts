import { useState, useEffect } from 'react';
import { shoppingOptimizer, type ShoppingOptimization } from '../lib/shoppingOptimizer';

export function useShoppingOptimizer() {
  const [optimization, setOptimization] = useState<ShoppingOptimization | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const optimizeShoppingList = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await shoppingOptimizer.optimizeShoppingList();
      setOptimization(result);
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao otimizar lista de compras';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearOptimization = () => {
    setOptimization(null);
    setError(null);
  };

  return {
    optimization,
    loading,
    error,
    optimizeShoppingList,
    clearOptimization
  };
}

export function useShoppingSuggestions() {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const optimization = await shoppingOptimizer.optimizeShoppingList();
      setSuggestions(optimization.suggestions);
      
      return optimization.suggestions;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar sugestões de compras';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  return {
    suggestions,
    loading,
    error,
    refetch: fetchSuggestions
  };
}