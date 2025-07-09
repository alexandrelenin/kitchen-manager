import { useState, useEffect } from 'react';
import { suggestionsService, type SmartSuggestion, type SuggestionFilters } from '../lib/suggestions';
import type { Recipe } from '../types';

export function useSuggestions(filters?: SuggestionFilters) {
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await suggestionsService.getSmartSuggestions(filters);
      setSuggestions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar sugestões');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, [JSON.stringify(filters)]);

  return {
    suggestions,
    loading,
    error,
    refetch: fetchSuggestions
  };
}

export function useRecipeOfTheDay() {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecipeOfTheDay = async () => {
      try {
        setLoading(true);
        const data = await suggestionsService.getRecipeOfTheDay();
        setRecipe(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar receita do dia');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipeOfTheDay();
  }, []);

  return { recipe, loading, error };
}

export function useUrgentAlerts() {
  const [alerts, setAlerts] = useState<SmartSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const data = await suggestionsService.getUrgentAlerts();
      setAlerts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar alertas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  return {
    alerts,
    loading,
    error,
    refetch: fetchAlerts
  };
}