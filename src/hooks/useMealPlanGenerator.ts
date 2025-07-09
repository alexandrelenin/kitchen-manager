import { useState } from 'react';
import { mealPlanGenerator, type MealPlanGeneratorOptions, type GeneratedMealPlan } from '../lib/mealPlanGenerator';
import { dbService } from '../lib/database';

export function useMealPlanGenerator() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedMealPlan | null>(null);

  const generateMealPlan = async (options: MealPlanGeneratorOptions) => {
    try {
      setLoading(true);
      setError(null);
      
      const plan = await mealPlanGenerator.generateMealPlan(options);
      setGeneratedPlan(plan);
      
      return plan;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao gerar plano de refeições';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const generateWeeklyPlan = async (startDate?: Date, options?: Partial<MealPlanGeneratorOptions>) => {
    try {
      setLoading(true);
      setError(null);
      
      const plan = await mealPlanGenerator.generateWeeklyMealPlan(startDate, options);
      setGeneratedPlan(plan);
      
      return plan;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao gerar plano semanal';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const saveMealPlan = async (plan: GeneratedMealPlan) => {
    try {
      setLoading(true);
      setError(null);
      
      // Salvar cada refeição do plano
      for (const mealPlan of plan.mealPlans) {
        await dbService.addMealPlan(mealPlan);
      }
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao salvar plano de refeições';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearPlan = () => {
    setGeneratedPlan(null);
    setError(null);
  };

  return {
    loading,
    error,
    generatedPlan,
    generateMealPlan,
    generateWeeklyPlan,
    saveMealPlan,
    clearPlan
  };
}