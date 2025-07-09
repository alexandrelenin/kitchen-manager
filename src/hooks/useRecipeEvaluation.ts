import { useState, useEffect } from 'react';
import { 
  recipeEvaluationService, 
  type RecipeExecution, 
  type RecipeAnalytics, 
  type RecipeVariation 
} from '../lib/recipeEvaluation';
import type { Recipe } from '../types';

export function useRecipeEvaluation(recipeId?: string) {
  const [executions, setExecutions] = useState<RecipeExecution[]>([]);
  const [analytics, setAnalytics] = useState<RecipeAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExecutions = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await recipeEvaluationService.getRecipeExecutions(id);
      setExecutions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar execuções');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await recipeEvaluationService.analyzeRecipePerformance(id);
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar analytics');
    } finally {
      setLoading(false);
    }
  };

  const recordExecution = async (execution: Omit<RecipeExecution, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      setError(null);
      
      await recipeEvaluationService.recordRecipeExecution(execution);
      
      // Recarregar dados após gravação
      if (recipeId) {
        await Promise.all([
          fetchExecutions(recipeId),
          fetchAnalytics(recipeId)
        ]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao registrar execução');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addVariation = async (variation: Omit<RecipeVariation, 'id'>) => {
    if (!recipeId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      await recipeEvaluationService.addRecipeVariation(recipeId, variation);
      
      // Recarregar analytics
      await fetchAnalytics(recipeId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar variação');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const uploadPhoto = async (file: File): Promise<string> => {
    try {
      setLoading(true);
      const photoUrl = await recipeEvaluationService.uploadExecutionPhoto(file);
      return photoUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro no upload da foto');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (recipeId) {
      Promise.all([
        fetchExecutions(recipeId),
        fetchAnalytics(recipeId)
      ]);
    }
  }, [recipeId]);

  return {
    executions,
    analytics,
    loading,
    error,
    recordExecution,
    addVariation,
    uploadPhoto,
    refetch: () => {
      if (recipeId) {
        Promise.all([
          fetchExecutions(recipeId),
          fetchAnalytics(recipeId)
        ]);
      }
    }
  };
}

export function useTopRatedRecipes(limit: number = 10) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTopRecipes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await recipeEvaluationService.getTopRatedRecipes(limit);
      setRecipes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar receitas top');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopRecipes();
  }, [limit]);

  return {
    recipes,
    loading,
    error,
    refetch: fetchTopRecipes
  };
}

export function useRecipesNeedingImprovement() {
  const [recipes, setRecipes] = useState<Array<{ recipe: Recipe; issues: string[] }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecipesWithIssues = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await recipeEvaluationService.getRecipesNeedingImprovement();
      setRecipes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar receitas com problemas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipesWithIssues();
  }, []);

  return {
    recipes,
    loading,
    error,
    refetch: fetchRecipesWithIssues
  };
}