import { dbService } from './database';
import type { Recipe, MealPlan, HouseMember, Ingredient } from '../types';

interface RecipeWithAvailability extends Recipe {
  availabilityScore?: number;
}

export interface MealPlanGeneratorOptions {
  startDate: Date;
  endDate: Date;
  mealsPerDay: ('breakfast' | 'lunch' | 'dinner' | 'snack')[];
  servings: number;
  considerPreferences: boolean;
  considerAvailableIngredients: boolean;
  considerNutritionalBalance: boolean;
  avoidRecentRecipes: boolean;
  maxRepetitions: number;
  budgetConstraint?: number;
}

export interface GeneratedMealPlan {
  mealPlans: Omit<MealPlan, 'id' | 'createdAt' | 'updatedAt'>[];
  analysis: {
    totalRecipes: number;
    nutritionalScore: number;
    ingredientMatchScore: number;
    varietyScore: number;
    estimatedCost: number;
    warnings: string[];
  };
}

class MealPlanGeneratorService {
  private static instance: MealPlanGeneratorService;

  static getInstance(): MealPlanGeneratorService {
    if (!MealPlanGeneratorService.instance) {
      MealPlanGeneratorService.instance = new MealPlanGeneratorService();
    }
    return MealPlanGeneratorService.instance;
  }

  async generateMealPlan(options: MealPlanGeneratorOptions): Promise<GeneratedMealPlan> {
    try {
      // Carregar dados necessários
      const [recipes, members, ingredients, existingMealPlans] = await Promise.all([
        dbService.getRecipes(),
        dbService.getHouseMembers(),
        dbService.getIngredients(),
        this.getExistingMealPlans(options.startDate, options.endDate)
      ]);

      // Filtrar receitas adequadas
      const suitableRecipes = await this.filterSuitableRecipes(
        recipes, 
        members, 
        ingredients, 
        options
      );

      // Gerar plano de refeições
      const mealPlans = this.generateMealSchedule(
        suitableRecipes,
        options,
        existingMealPlans
      );

      // Analisar qualidade do plano
      const analysis = this.analyzeMealPlan(mealPlans, suitableRecipes, ingredients, options);

      return {
        mealPlans,
        analysis
      };
    } catch (error) {
      console.error('Erro ao gerar plano de refeições:', error);
      throw error;
    }
  }

  private async filterSuitableRecipes(
    recipes: Recipe[],
    members: HouseMember[],
    ingredients: Ingredient[],
    options: MealPlanGeneratorOptions
  ): Promise<RecipeWithAvailability[]> {
    let suitableRecipes = [...recipes];

    // Filtrar por preferências dos membros
    if (options.considerPreferences && members.length > 0) {
      const familyRestrictions = members.flatMap(m => m.restrictions);
      const familyAllergies = members.flatMap(m => m.allergies);

      suitableRecipes = suitableRecipes.filter(recipe => {
        // Verificar alergias (prioritário)
        const hasAllergies = familyAllergies.some(allergy =>
          recipe.ingredients.some(ing => 
            ing.name.toLowerCase().includes(allergy.toLowerCase())
          ) || recipe.name.toLowerCase().includes(allergy.toLowerCase())
        );

        if (hasAllergies) return false;

        // Verificar restrições
        const violatesRestrictions = familyRestrictions.some(restriction =>
          recipe.ingredients.some(ing => 
            ing.name.toLowerCase().includes(restriction.toLowerCase())
          ) || recipe.name.toLowerCase().includes(restriction.toLowerCase())
        );

        return !violatesRestrictions;
      });
    }

    // Priorizar receitas com ingredientes disponíveis
    if (options.considerAvailableIngredients) {
      suitableRecipes = suitableRecipes.map(recipe => {
        const availabilityScore = this.calculateIngredientAvailability(recipe, ingredients);
        return { ...recipe, availabilityScore };
      }).sort((a, b) => (b.availabilityScore || 0) - (a.availabilityScore || 0));
    }

    // Evitar receitas recentes
    if (options.avoidRecentRecipes) {
      const recentMealPlans = await this.getRecentMealPlans(30); // Últimos 30 dias
      const recentRecipeIds = recentMealPlans.map(plan => plan.recipeId);
      
      // Separar receitas em recentes e não recentes
      const nonRecentRecipes = suitableRecipes.filter(r => !recentRecipeIds.includes(r.id));
      const recentRecipes = suitableRecipes.filter(r => recentRecipeIds.includes(r.id));
      
      // Priorizar receitas não recentes
      suitableRecipes = [...nonRecentRecipes, ...recentRecipes];
    }

    return suitableRecipes;
  }

  private generateMealSchedule(
    recipes: RecipeWithAvailability[],
    options: MealPlanGeneratorOptions,
    existingMealPlans: MealPlan[]
  ): Omit<MealPlan, 'id' | 'createdAt' | 'updatedAt'>[] {
    const mealPlans: Omit<MealPlan, 'id' | 'createdAt' | 'updatedAt'>[] = [];
    const usedRecipes = new Map<string, number>(); // Track recipe usage
    
    // Categorizar receitas por tipo de refeição
    const recipesByMeal = this.categorizeRecipesByMeal(recipes);
    
    // Iterar por cada dia
    const currentDate = new Date(options.startDate);
    while (currentDate <= options.endDate) {
      // Para cada tipo de refeição do dia
      for (const mealType of options.mealsPerDay) {
        // Verificar se já existe planejamento para este slot
        const existingPlan = existingMealPlans.find(plan => 
          this.isSameDay(new Date(plan.date), currentDate) && plan.meal === mealType
        );

        if (!existingPlan) {
          // Selecionar receita apropriada
          const selectedRecipe = this.selectRecipeForMeal(
            recipesByMeal[mealType] || recipes,
            usedRecipes,
            options.maxRepetitions,
            mealType
          );

          if (selectedRecipe) {
            mealPlans.push({
              date: new Date(currentDate),
              meal: mealType,
              recipeId: selectedRecipe.id,
              servings: options.servings,
              notes: `Gerado automaticamente`
            });

            // Incrementar uso da receita
            const currentUsage = usedRecipes.get(selectedRecipe.id) || 0;
            usedRecipes.set(selectedRecipe.id, currentUsage + 1);
          }
        }
      }
      
      // Próximo dia
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return mealPlans;
  }

  private categorizeRecipesByMeal(recipes: RecipeWithAvailability[]): Record<string, RecipeWithAvailability[]> {
    const categories = {
      breakfast: [] as RecipeWithAvailability[],
      lunch: [] as RecipeWithAvailability[],
      dinner: [] as RecipeWithAvailability[],
      snack: [] as RecipeWithAvailability[]
    };

    recipes.forEach(recipe => {
      const name = recipe.name.toLowerCase();
      const category = recipe.category.toLowerCase();
      const tags = recipe.tags.map(tag => tag.toLowerCase());

      // Categorização inteligente baseada em palavras-chave
      if (this.matchesKeywords(name, category, tags, [
        'café', 'breakfast', 'manhã', 'cereal', 'pão', 'torrada', 'ovo', 'panqueca'
      ])) {
        categories.breakfast.push(recipe);
      } else if (this.matchesKeywords(name, category, tags, [
        'lanche', 'snack', 'biscoito', 'bolo', 'doce', 'fruta', 'vitamina'
      ])) {
        categories.snack.push(recipe);
      } else if (recipe.prepTime + recipe.cookTime <= 30) {
        // Receitas rápidas para almoço
        categories.lunch.push(recipe);
      } else {
        // Receitas mais elaboradas para jantar
        categories.dinner.push(recipe);
      }
    });

    // Se alguma categoria ficou vazia, distribuir receitas
    Object.keys(categories).forEach(meal => {
      if (categories[meal as keyof typeof categories].length === 0) {
        categories[meal as keyof typeof categories] = recipes.slice();
      }
    });

    return categories;
  }

  private selectRecipeForMeal(
    availableRecipes: RecipeWithAvailability[],
    usedRecipes: Map<string, number>,
    maxRepetitions: number,
    mealType: string
  ): RecipeWithAvailability | null {
    // Filtrar receitas que não excederam o limite de repetições
    const eligibleRecipes = availableRecipes.filter(recipe => 
      (usedRecipes.get(recipe.id) || 0) < maxRepetitions
    );

    if (eligibleRecipes.length === 0) {
      return availableRecipes[0] || null; // Fallback para qualquer receita
    }

    // Aplicar algoritmo de seleção ponderada
    const scoredRecipes = eligibleRecipes.map(recipe => {
      let score = recipe.rating * 20; // Base score from rating
      
      // Bonus por menos uso
      const usage = usedRecipes.get(recipe.id) || 0;
      score += (maxRepetitions - usage) * 10;
      
      // Bonus por adequação ao tipo de refeição
      if (this.isRecipeSuitableForMeal(recipe, mealType)) {
        score += 15;
      }
      
      // Bonus por ingredientes disponíveis (se calculado)
      if (recipe.availabilityScore) {
        score += recipe.availabilityScore * 5;
      }

      return { recipe, score };
    });

    // Ordenar por score e adicionar elemento de aleatoriedade
    scoredRecipes.sort((a, b) => b.score - a.score);
    
    // Selecionar entre os top 3 com peso
    const topRecipes = scoredRecipes.slice(0, Math.min(3, scoredRecipes.length));
    const totalWeight = topRecipes.reduce((sum, _, index) => sum + (topRecipes.length - index), 0);
    const randomWeight = Math.random() * totalWeight;
    
    let currentWeight = 0;
    for (let i = 0; i < topRecipes.length; i++) {
      currentWeight += topRecipes.length - i;
      if (randomWeight <= currentWeight) {
        return topRecipes[i].recipe;
      }
    }

    return topRecipes[0]?.recipe || null;
  }

  private isRecipeSuitableForMeal(recipe: Recipe, mealType: string): boolean {
    const name = recipe.name.toLowerCase();
    const category = recipe.category.toLowerCase();
    const tags = recipe.tags.map(tag => tag.toLowerCase());

    switch (mealType) {
      case 'breakfast':
        return this.matchesKeywords(name, category, tags, [
          'café', 'breakfast', 'manhã', 'cereal', 'pão', 'torrada', 'ovo', 'panqueca'
        ]);
      case 'lunch':
        return recipe.prepTime + recipe.cookTime <= 45; // Receitas até 45min
      case 'dinner':
        return recipe.prepTime + recipe.cookTime >= 30; // Receitas mais elaboradas
      case 'snack':
        return this.matchesKeywords(name, category, tags, [
          'lanche', 'snack', 'biscoito', 'bolo', 'doce', 'fruta', 'vitamina'
        ]);
      default:
        return true;
    }
  }

  private calculateIngredientAvailability(recipe: Recipe, ingredients: Ingredient[]): number {
    const totalIngredients = recipe.ingredients.length;
    if (totalIngredients === 0) return 0;

    const availableIngredients = recipe.ingredients.filter(recipeIng =>
      ingredients.some(ing => 
        ing.quantity > 0 && (
          ing.name.toLowerCase().includes(recipeIng.name.toLowerCase()) ||
          recipeIng.name.toLowerCase().includes(ing.name.toLowerCase())
        )
      )
    ).length;

    return (availableIngredients / totalIngredients) * 100;
  }

  private analyzeMealPlan(
    mealPlans: Omit<MealPlan, 'id' | 'createdAt' | 'updatedAt'>[],
    recipes: RecipeWithAvailability[],
    ingredients: Ingredient[],
    _options: MealPlanGeneratorOptions
  ) {
    const usedRecipes = mealPlans.map(plan => 
      recipes.find(r => r.id === plan.recipeId)!
    ).filter(Boolean);

    // Score nutricional (variedade de categorias)
    const categories = new Set(usedRecipes.map(r => r.category));
    const nutritionalScore = Math.min((categories.size / 5) * 100, 100);

    // Score de compatibilidade com ingredientes
    const avgIngredientMatch = usedRecipes.reduce((sum, recipe) => 
      sum + this.calculateIngredientAvailability(recipe, ingredients), 0
    ) / usedRecipes.length;

    // Score de variedade (receitas únicas vs total)
    const uniqueRecipes = new Set(usedRecipes.map(r => r.id));
    const varietyScore = (uniqueRecipes.size / usedRecipes.length) * 100;

    // Custo estimado
    const estimatedCost = usedRecipes.reduce((sum, _recipe) => sum + 25, 0); // R$ 25 por receita

    // Avisos
    const warnings: string[] = [];
    if (nutritionalScore < 60) {
      warnings.push('Baixa variedade nutricional - considere adicionar mais categorias de receitas');
    }
    if (avgIngredientMatch < 50) {
      warnings.push('Muitos ingredientes não disponíveis - verifique seu estoque');
    }
    if (varietyScore < 70) {
      warnings.push('Muita repetição de receitas - considere expandir seu repertório');
    }

    return {
      totalRecipes: usedRecipes.length,
      nutritionalScore: Math.round(nutritionalScore),
      ingredientMatchScore: Math.round(avgIngredientMatch),
      varietyScore: Math.round(varietyScore),
      estimatedCost,
      warnings
    };
  }

  // Helper methods
  private matchesKeywords(name: string, category: string, tags: string[], keywords: string[]): boolean {
    return keywords.some(keyword => 
      name.includes(keyword) || 
      category.includes(keyword) || 
      tags.some(tag => tag.includes(keyword))
    );
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  private async getExistingMealPlans(startDate: Date, endDate: Date): Promise<MealPlan[]> {
    return dbService.getMealPlans(startDate, endDate);
  }

  private async getRecentMealPlans(days: number): Promise<MealPlan[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    return dbService.getMealPlans(startDate, endDate);
  }

  // Método público para gerar plano semanal rápido
  async generateWeeklyMealPlan(
    startDate: Date = new Date(),
    options: Partial<MealPlanGeneratorOptions> = {}
  ): Promise<GeneratedMealPlan> {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6); // 7 dias

    const defaultOptions: MealPlanGeneratorOptions = {
      startDate,
      endDate,
      mealsPerDay: ['lunch', 'dinner'],
      servings: 4,
      considerPreferences: true,
      considerAvailableIngredients: true,
      considerNutritionalBalance: true,
      avoidRecentRecipes: true,
      maxRepetitions: 1,
      ...options
    };

    return this.generateMealPlan(defaultOptions);
  }
}

export const mealPlanGenerator = MealPlanGeneratorService.getInstance();