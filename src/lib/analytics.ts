import { dbService } from './database';
import type { Recipe, MealPlan } from '../types';

export interface FamilyMetrics {
  totalRecipes: number;
  totalMealPlans: number;
  totalIngredients: number;
  averageRecipeRating: number;
  mostPopularRecipes: Array<{ recipe: Recipe; count: number }>;
  weeklyMealPlanningRate: number;
  ingredientUtilizationRate: number;
  foodWasteScore: number;
  estimatedMonthlySavings: number;
  nutritionalBalance: {
    proteins: number;
    carbs: number;
    vegetables: number;
    fruits: number;
  };
}

export interface WeeklyStats {
  plannedMeals: number;
  executedMeals: number;
  shoppingListItems: number;
  purchasedItems: number;
  newRecipesTried: number;
  averagePrepTime: number;
  totalCookingTime: number;
  costSavings: number;
}

export interface MonthlyTrends {
  mealPlanningTrend: Array<{ week: number; planned: number; executed: number }>;
  ingredientUsageTrend: Array<{ week: number; used: number; wasted: number }>;
  recipeCategoryTrend: Array<{ category: string; count: number }>;
  costTrend: Array<{ week: number; planned: number; actual: number }>;
}

class AnalyticsService {
  private static instance: AnalyticsService;

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  // Métricas principais da família
  async getFamilyMetrics(): Promise<FamilyMetrics> {
    try {
      const [recipes, mealPlans, ingredients] = await Promise.all([
        dbService.getRecipes(),
        this.getAllMealPlans(),
        dbService.getIngredients()
      ]);

      // Calcular receitas mais populares
      const recipeUsage = new Map<string, number>();
      mealPlans.forEach(plan => {
        const count = recipeUsage.get(plan.recipeId) || 0;
        recipeUsage.set(plan.recipeId, count + 1);
      });

      const mostPopularRecipes = Array.from(recipeUsage.entries())
        .map(([recipeId, count]) => ({
          recipe: recipes.find(r => r.id === recipeId)!,
          count
        }))
        .filter(item => item.recipe)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Calcular média de avaliações
      const ratedRecipes = recipes.filter(r => r.rating > 0);
      const averageRecipeRating = ratedRecipes.length > 0 
        ? ratedRecipes.reduce((sum, r) => sum + r.rating, 0) / ratedRecipes.length 
        : 0;

      // Calcular taxa de planejamento semanal
      const lastWeek = this.getLastWeekRange();
      const lastWeekPlans = mealPlans.filter(plan => 
        plan.date >= lastWeek.start && plan.date <= lastWeek.end
      );
      const weeklyMealPlanningRate = (lastWeekPlans.length / 21) * 100; // 3 refeições/dia x 7 dias

      // Calcular utilização de ingredientes
      const expiringIngredients = ingredients.filter(ing => 
        ing.expirationDate && ing.expirationDate <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      );
      const ingredientUtilizationRate = ((ingredients.length - expiringIngredients.length) / ingredients.length) * 100;

      // Score de desperdício (baseado em ingredientes vencidos)
      const expiredIngredients = ingredients.filter(ing => 
        ing.expirationDate && ing.expirationDate < new Date()
      );
      const foodWasteScore = Math.max(0, 100 - ((expiredIngredients.length / ingredients.length) * 100));

      // Economia estimada (baseado em não comer fora)
      const estimatedMonthlySavings = lastWeekPlans.length * 25 * 4; // R$ 25 por refeição evitada

      // Balanço nutricional (categorias básicas)
      const nutritionalBalance = this.calculateNutritionalBalance(mostPopularRecipes.map(r => r.recipe));

      return {
        totalRecipes: recipes.length,
        totalMealPlans: mealPlans.length,
        totalIngredients: ingredients.length,
        averageRecipeRating: Math.round(averageRecipeRating * 10) / 10,
        mostPopularRecipes,
        weeklyMealPlanningRate: Math.round(weeklyMealPlanningRate),
        ingredientUtilizationRate: Math.round(ingredientUtilizationRate),
        foodWasteScore: Math.round(foodWasteScore),
        estimatedMonthlySavings,
        nutritionalBalance
      };
    } catch (error) {
      console.error('Erro ao calcular métricas familiares:', error);
      throw error;
    }
  }

  // Estatísticas da semana
  async getWeeklyStats(): Promise<WeeklyStats> {
    try {
      const weekRange = this.getLastWeekRange();
      const [mealPlans, shoppingList, recipes] = await Promise.all([
        this.getMealPlansInRange(weekRange.start, weekRange.end),
        dbService.getShoppingList(),
        dbService.getRecipes()
      ]);

      const plannedMeals = mealPlans.length;
      const executedMeals = mealPlans.length; // Assumindo que todos foram executados por enquanto
      const shoppingListItems = shoppingList.length;
      const purchasedItems = shoppingList.filter(item => item.isPurchased).length;

      // Receitas novas (criadas na última semana)
      const newRecipesTried = recipes.filter(recipe => 
        recipe.createdAt >= weekRange.start && recipe.createdAt <= weekRange.end
      ).length;

      // Tempo médio de preparo
      const usedRecipes = mealPlans
        .map(plan => recipes.find(r => r.id === plan.recipeId))
        .filter(Boolean) as Recipe[];
      
      const averagePrepTime = usedRecipes.length > 0
        ? usedRecipes.reduce((sum, recipe) => sum + recipe.prepTime + recipe.cookTime, 0) / usedRecipes.length
        : 0;

      const totalCookingTime = usedRecipes.reduce((sum, recipe) => sum + recipe.prepTime + recipe.cookTime, 0);

      // Economia estimada
      const costSavings = plannedMeals * 25; // R$ 25 por refeição evitada

      return {
        plannedMeals,
        executedMeals,
        shoppingListItems,
        purchasedItems,
        newRecipesTried,
        averagePrepTime: Math.round(averagePrepTime),
        totalCookingTime,
        costSavings
      };
    } catch (error) {
      console.error('Erro ao calcular estatísticas semanais:', error);
      throw error;
    }
  }

  // Tendências mensais
  async getMonthlyTrends(): Promise<MonthlyTrends> {
    try {
      const last4Weeks = this.getLast4WeeksRanges();
      const recipes = await dbService.getRecipes();

      // Tendência de planejamento
      const mealPlanningTrend = await Promise.all(
        last4Weeks.map(async (week, index) => {
          const plans = await this.getMealPlansInRange(week.start, week.end);
          return {
            week: index + 1,
            planned: plans.length,
            executed: plans.length // Assumindo execução completa
          };
        })
      );

      // Tendência de uso de ingredientes
      const ingredientUsageTrend = await Promise.all(
        last4Weeks.map(async (week, index) => {
          const ingredients = await dbService.getIngredients();
          const used = ingredients.filter(ing => 
            ing.purchaseDate && ing.purchaseDate >= week.start && ing.purchaseDate <= week.end
          ).length;
          const wasted = ingredients.filter(ing => 
            ing.expirationDate && ing.expirationDate >= week.start && ing.expirationDate <= week.end && ing.expirationDate < new Date()
          ).length;
          
          return {
            week: index + 1,
            used,
            wasted
          };
        })
      );

      // Tendência por categoria de receita
      const allMealPlans = await this.getAllMealPlans();
      const categoryCount = new Map<string, number>();
      
      allMealPlans.forEach(plan => {
        const recipe = recipes.find(r => r.id === plan.recipeId);
        if (recipe) {
          const count = categoryCount.get(recipe.category) || 0;
          categoryCount.set(recipe.category, count + 1);
        }
      });

      const recipeCategoryTrend = Array.from(categoryCount.entries())
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count);

      // Tendência de custos
      const costTrend = mealPlanningTrend.map(week => ({
        week: week.week,
        planned: week.planned * 20, // Custo estimado por refeição planejada
        actual: week.executed * 25 // Custo real estimado
      }));

      return {
        mealPlanningTrend,
        ingredientUsageTrend,
        recipeCategoryTrend,
        costTrend
      };
    } catch (error) {
      console.error('Erro ao calcular tendências mensais:', error);
      throw error;
    }
  }

  // Análise de desperdício
  async getFoodWasteAnalysis() {
    try {
      const ingredients = await dbService.getIngredients();
      const now = new Date();
      
      const expired = ingredients.filter(ing => 
        ing.expirationDate && ing.expirationDate < now
      );
      
      const expiringSoon = ingredients.filter(ing => 
        ing.expirationDate && 
        ing.expirationDate > now && 
        ing.expirationDate <= new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
      );

      const totalCostWasted = expired.reduce((sum, ing) => sum + (ing.cost || 0), 0);
      
      return {
        expiredItems: expired.length,
        expiringSoonItems: expiringSoon.length,
        totalCostWasted,
        wastePercentage: (expired.length / ingredients.length) * 100,
        expiredIngredients: expired,
        expiringSoonIngredients: expiringSoon
      };
    } catch (error) {
      console.error('Erro ao analisar desperdício:', error);
      throw error;
    }
  }

  // Helpers
  private async getAllMealPlans(): Promise<MealPlan[]> {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 3); // Últimos 3 meses
    const endDate = new Date();
    return dbService.getMealPlans(startDate, endDate);
  }

  private async getMealPlansInRange(start: Date, end: Date): Promise<MealPlan[]> {
    return dbService.getMealPlans(start, end);
  }

  private getLastWeekRange() {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);
    return { start, end };
  }

  private getLast4WeeksRanges() {
    const ranges = [];
    for (let i = 3; i >= 0; i--) {
      const end = new Date();
      end.setDate(end.getDate() - (i * 7));
      const start = new Date(end);
      start.setDate(start.getDate() - 7);
      ranges.push({ start, end });
    }
    return ranges;
  }

  private calculateNutritionalBalance(recipes: Recipe[]) {
    // Análise simples baseada em categorias
    const categories = recipes.map(r => r.category.toLowerCase());
    
    return {
      proteins: this.countCategoryMatches(categories, ['carne', 'peixe', 'frango', 'ovo']),
      carbs: this.countCategoryMatches(categories, ['massa', 'arroz', 'pão', 'batata']),
      vegetables: this.countCategoryMatches(categories, ['legume', 'verdura', 'salada']),
      fruits: this.countCategoryMatches(categories, ['fruta', 'sobremesa'])
    };
  }

  private countCategoryMatches(categories: string[], keywords: string[]): number {
    return categories.filter(cat => 
      keywords.some(keyword => cat.includes(keyword))
    ).length;
  }
}

export const analyticsService = AnalyticsService.getInstance();