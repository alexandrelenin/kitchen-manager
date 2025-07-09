import { dbService } from './database';
import type { Recipe, Ingredient, HouseMember, MealPlan } from '../types';

export interface SmartSuggestion {
  id: string;
  type: 'recipe' | 'ingredient' | 'planning' | 'health' | 'economy';
  title: string;
  description: string;
  action?: string;
  priority: 'low' | 'medium' | 'high';
  recipe?: Recipe;
  ingredient?: Ingredient;
  data?: any;
}

export interface SuggestionFilters {
  availableIngredients?: boolean;
  memberPreferences?: boolean;
  seasonalIngredients?: boolean;
  nutritionalBalance?: boolean;
  costOptimization?: boolean;
  wastePrevention?: boolean;
}

class SuggestionsService {
  private static instance: SuggestionsService;

  static getInstance(): SuggestionsService {
    if (!SuggestionsService.instance) {
      SuggestionsService.instance = new SuggestionsService();
    }
    return SuggestionsService.instance;
  }

  // Gerar todas as sugestões
  async getSmartSuggestions(filters: SuggestionFilters = {}): Promise<SmartSuggestion[]> {
    try {
      const suggestions: SmartSuggestion[] = [];

      // Carregar dados necessários
      const [recipes, ingredients, members, mealPlans] = await Promise.all([
        dbService.getRecipes(),
        dbService.getIngredients(),
        dbService.getHouseMembers(),
        this.getRecentMealPlans()
      ]);

      // Sugestões baseadas em ingredientes disponíveis
      if (filters.availableIngredients !== false) {
        const recipeSuggestions = await this.getRecipeSuggestionsFromIngredients(recipes, ingredients);
        suggestions.push(...recipeSuggestions);
      }

      // Sugestões de aproveitamento (ingredientes vencendo)
      if (filters.wastePrevention !== false) {
        const wastePrevention = await this.getWastePreventionSuggestions(recipes, ingredients);
        suggestions.push(...wastePrevention);
      }

      // Sugestões baseadas em preferências dos membros
      if (filters.memberPreferences !== false) {
        const preferenceSuggestions = await this.getPreferenceBasedSuggestions(recipes, members, mealPlans);
        suggestions.push(...preferenceSuggestions);
      }

      // Sugestões nutricionais
      if (filters.nutritionalBalance !== false) {
        const nutritionalSuggestions = await this.getNutritionalSuggestions(recipes, mealPlans);
        suggestions.push(...nutritionalSuggestions);
      }

      // Sugestões de economia
      if (filters.costOptimization !== false) {
        const economySuggestions = await this.getEconomySuggestions(recipes, ingredients);
        suggestions.push(...economySuggestions);
      }

      // Sugestões de planejamento
      const planningSuggestions = await this.getPlanningSuggestions(mealPlans);
      suggestions.push(...planningSuggestions);

      // Sugestão de geração automática de cardápio
      const mealPlanGenerationSuggestion = await this.getMealPlanGenerationSuggestion(mealPlans, recipes);
      if (mealPlanGenerationSuggestion) {
        suggestions.push(mealPlanGenerationSuggestion);
      }

      // Sugestão de otimização de compras
      const shoppingOptimizationSuggestion = await this.getShoppingOptimizationSuggestion(ingredients);
      if (shoppingOptimizationSuggestion) {
        suggestions.push(shoppingOptimizationSuggestion);
      }

      // Sugestão de avaliação de receitas
      const recipeEvaluationSuggestion = await this.getRecipeEvaluationSuggestion(recipes, mealPlans);
      if (recipeEvaluationSuggestion) {
        suggestions.push(recipeEvaluationSuggestion);
      }

      // Sugestão de gamificação
      const gamificationSuggestion = await this.getGamificationSuggestion(mealPlans);
      if (gamificationSuggestion) {
        suggestions.push(gamificationSuggestion);
      }

      // Ordenar por prioridade e relevância
      return this.prioritizeSuggestions(suggestions);
    } catch (error) {
      console.error('Erro ao gerar sugestões:', error);
      return [];
    }
  }

  // Sugestões baseadas em ingredientes disponíveis
  private async getRecipeSuggestionsFromIngredients(
    recipes: Recipe[], 
    ingredients: Ingredient[]
  ): Promise<SmartSuggestion[]> {
    const suggestions: SmartSuggestion[] = [];
    const availableIngredients = ingredients.filter(ing => ing.quantity > 0);
    
    const recipeMatches = recipes.map(recipe => {
      const matches = recipe.ingredients.filter(recipeIng => 
        availableIngredients.some(availIng => 
          availIng.name.toLowerCase().includes(recipeIng.name.toLowerCase()) ||
          recipeIng.name.toLowerCase().includes(availIng.name.toLowerCase())
        )
      );
      
      const matchPercentage = (matches.length / recipe.ingredients.length) * 100;
      return { recipe, matchPercentage, matches };
    }).filter(item => item.matchPercentage >= 60) // Pelo menos 60% dos ingredientes
     .sort((a, b) => b.matchPercentage - a.matchPercentage);

    // Top 3 receitas mais compatíveis
    recipeMatches.slice(0, 3).forEach((match, index) => {
      suggestions.push({
        id: `recipe-match-${match.recipe.id}`,
        type: 'recipe',
        title: `Receita Recomendada: ${match.recipe.name}`,
        description: `Você tem ${Math.round(match.matchPercentage)}% dos ingredientes necessários para esta receita.`,
        action: 'Ver receita',
        priority: index === 0 ? 'high' : 'medium',
        recipe: match.recipe,
        data: { matchPercentage: match.matchPercentage, matches: match.matches }
      });
    });

    return suggestions;
  }

  // Sugestões para evitar desperdício
  private async getWastePreventionSuggestions(
    recipes: Recipe[], 
    ingredients: Ingredient[]
  ): Promise<SmartSuggestion[]> {
    const suggestions: SmartSuggestion[] = [];
    const now = new Date();
    
    // Ingredientes vencendo em 3 dias
    const expiringSoon = ingredients.filter(ing => {
      if (!ing.expirationDate) return false;
      const expiration = new Date(ing.expirationDate);
      const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      return expiration <= threeDaysFromNow && expiration > now;
    });

    if (expiringSoon.length > 0) {
      // Encontrar receitas que usam estes ingredientes
      expiringSoon.forEach(ingredient => {
        const compatibleRecipes = recipes.filter(recipe =>
          recipe.ingredients.some(recipeIng =>
            recipeIng.name.toLowerCase().includes(ingredient.name.toLowerCase()) ||
            ingredient.name.toLowerCase().includes(recipeIng.name.toLowerCase())
          )
        );

        if (compatibleRecipes.length > 0) {
          const bestRecipe = compatibleRecipes[0]; // Pegar a primeira (pode ser melhorado com ranking)
          suggestions.push({
            id: `waste-prevention-${ingredient.id}`,
            type: 'ingredient',
            title: `⚠️ ${ingredient.name} vence em breve!`,
            description: `Use em: ${bestRecipe.name}. Vence em ${this.getDaysUntilExpiration(ingredient.expirationDate!)} dias.`,
            action: 'Ver receita',
            priority: 'high',
            ingredient,
            recipe: bestRecipe
          });
        } else {
          suggestions.push({
            id: `waste-alert-${ingredient.id}`,
            type: 'ingredient',
            title: `⚠️ ${ingredient.name} vence em breve!`,
            description: `Vence em ${this.getDaysUntilExpiration(ingredient.expirationDate!)} dias. Considere usar logo.`,
            action: 'Ver estoque',
            priority: 'medium',
            ingredient
          });
        }
      });
    }

    return suggestions;
  }

  // Sugestões baseadas em preferências dos membros
  private async getPreferenceBasedSuggestions(
    recipes: Recipe[], 
    members: HouseMember[], 
    recentMealPlans: MealPlan[]
  ): Promise<SmartSuggestion[]> {
    const suggestions: SmartSuggestion[] = [];
    
    // Coletar todas as preferências da família
    const familyPreferences = members.flatMap(member => member.preferences);
    const familyRestrictions = members.flatMap(member => member.restrictions);
    
    // Receitas que atendem preferências e não violam restrições
    const suitableRecipes = recipes.filter(recipe => {
      const meetsPreferences = familyPreferences.some(pref =>
        recipe.name.toLowerCase().includes(pref.toLowerCase()) ||
        recipe.category.toLowerCase().includes(pref.toLowerCase()) ||
        recipe.tags.some(tag => tag.toLowerCase().includes(pref.toLowerCase()))
      );
      
      const violatesRestrictions = familyRestrictions.some(restriction =>
        recipe.name.toLowerCase().includes(restriction.toLowerCase()) ||
        recipe.ingredients.some(ing => ing.name.toLowerCase().includes(restriction.toLowerCase()))
      );
      
      return meetsPreferences && !violatesRestrictions;
    });

    // Receitas ainda não executadas recentemente
    const recentRecipeIds = recentMealPlans.map(plan => plan.recipeId);
    const newRecipes = suitableRecipes.filter(recipe => !recentRecipeIds.includes(recipe.id));

    if (newRecipes.length > 0) {
      const topRecipe = newRecipes.sort((a, b) => b.rating - a.rating)[0];
      suggestions.push({
        id: `preference-based-${topRecipe.id}`,
        type: 'recipe',
        title: `💖 Baseado nas preferências da família`,
        description: `${topRecipe.name} parece perfeito para vocês! Avaliação: ${topRecipe.rating}⭐`,
        action: 'Ver receita',
        priority: 'medium',
        recipe: topRecipe
      });
    }

    return suggestions;
  }

  // Sugestões nutricionais
  private async getNutritionalSuggestions(
    recipes: Recipe[], 
    recentMealPlans: MealPlan[]
  ): Promise<SmartSuggestion[]> {
    const suggestions: SmartSuggestion[] = [];
    
    // Analisar padrão nutricional das receitas recentes
    const recentRecipes = recentMealPlans.map(plan => 
      recipes.find(r => r.id === plan.recipeId)
    ).filter(Boolean) as Recipe[];

    const categories = recentRecipes.map(r => r.category.toLowerCase());
    
    // Verificar se há desbalanceamento
    const hasVegetables = categories.some(cat => 
      cat.includes('legume') || cat.includes('verdura') || cat.includes('salada')
    );
    
    if (!hasVegetables && recentRecipes.length > 0) {
      const vegetableRecipes = recipes.filter(recipe =>
        recipe.category.toLowerCase().includes('legume') ||
        recipe.category.toLowerCase().includes('verdura') ||
        recipe.category.toLowerCase().includes('salada') ||
        recipe.name.toLowerCase().includes('legume') ||
        recipe.name.toLowerCase().includes('verdura')
      );

      if (vegetableRecipes.length > 0) {
        const bestVegRecipe = vegetableRecipes.sort((a, b) => b.rating - a.rating)[0];
        suggestions.push({
          id: `nutrition-vegetables-${bestVegRecipe.id}`,
          type: 'health',
          title: '🥬 Que tal mais vegetais?',
          description: `Suas últimas refeições tiveram poucas verduras. Experimente: ${bestVegRecipe.name}`,
          action: 'Ver receita',
          priority: 'medium',
          recipe: bestVegRecipe
        });
      }
    }

    return suggestions;
  }

  // Sugestões de economia
  private async getEconomySuggestions(
    recipes: Recipe[], 
    ingredients: Ingredient[]
  ): Promise<SmartSuggestion[]> {
    const suggestions: SmartSuggestion[] = [];
    
    // Receitas que usam ingredientes que já temos em abundância
    const abundantIngredients = ingredients.filter(ing => ing.quantity > 5); // Arbitrário
    
    if (abundantIngredients.length > 0) {
      const economyRecipes = recipes.filter(recipe =>
        recipe.ingredients.some(recipeIng =>
          abundantIngredients.some(abundantIng =>
            abundantIng.name.toLowerCase().includes(recipeIng.name.toLowerCase())
          )
        )
      );

      if (economyRecipes.length > 0) {
        const bestEconomyRecipe = economyRecipes.sort((a, b) => b.rating - a.rating)[0];
        suggestions.push({
          id: `economy-${bestEconomyRecipe.id}`,
          type: 'economy',
          title: '💰 Economia inteligente',
          description: `${bestEconomyRecipe.name} usa ingredientes que você já tem em abundância!`,
          action: 'Ver receita',
          priority: 'medium',
          recipe: bestEconomyRecipe
        });
      }
    }

    return suggestions;
  }

  // Sugestões de planejamento
  private async getPlanningSuggestions(recentMealPlans: MealPlan[]): Promise<SmartSuggestion[]> {
    const suggestions: SmartSuggestion[] = [];
    
    // Verificar se há planejamento para os próximos dias
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const futurePlans = recentMealPlans.filter(plan => 
      new Date(plan.date) >= now && new Date(plan.date) <= nextWeek
    );

    if (futurePlans.length < 10) { // Menos de 10 refeições planejadas para a semana
      suggestions.push({
        id: 'planning-week',
        type: 'planning',
        title: '📅 Complete seu planejamento semanal',
        description: `Você tem apenas ${futurePlans.length} refeições planejadas para os próximos 7 dias. Que tal planejar mais?`,
        action: 'Ir para planejamento',
        priority: 'medium'
      });
    }

    // Verificar se não há planejamento para hoje
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    const todayPlans = recentMealPlans.filter(plan => {
      const planDate = new Date(plan.date);
      return planDate >= today && planDate <= todayEnd;
    });

    if (todayPlans.length === 0) {
      suggestions.push({
        id: 'planning-today',
        type: 'planning',
        title: '🍽️ O que vamos comer hoje?',
        description: 'Você ainda não planejou as refeições de hoje. Que tal escolher algo delicioso?',
        action: 'Planejar hoje',
        priority: 'high'
      });
    }

    return suggestions;
  }

  // Sugestão de geração automática de cardápio
  private async getMealPlanGenerationSuggestion(
    recentMealPlans: MealPlan[], 
    recipes: Recipe[]
  ): Promise<SmartSuggestion | null> {
    // Verificar se há receitas suficientes para gerar um plano
    if (recipes.length < 5) return null;
    
    // Verificar se há poucos planos futuros
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const futurePlans = recentMealPlans.filter(plan => 
      new Date(plan.date) >= now && new Date(plan.date) <= nextWeek
    );
    
    if (futurePlans.length < 8) { // Menos de 8 refeições planejadas
      return {
        id: 'meal-plan-generation',
        type: 'planning',
        title: '🤖 Gerador Automático de Cardápio',
        description: `Crie um plano semanal inteligente baseado nos seus ingredientes e preferências. ${recipes.length} receitas disponíveis.`,
        action: 'Gerar cardápio automático',
        priority: 'medium',
        data: { availableRecipes: recipes.length }
      };
    }
    
    return null;
  }

  // Sugestão de otimização de compras
  private async getShoppingOptimizationSuggestion(
    ingredients: Ingredient[]
  ): Promise<SmartSuggestion | null> {
    // Verificar se há itens na lista de compras
    const shoppingList = await dbService.getShoppingList();
    
    if (shoppingList.length >= 5) { // Pelo menos 5 itens para otimizar
      // Verificar se há ingredientes com estoque baixo
      const lowStockItems = ingredients.filter(ing => ing.quantity > 0 && ing.quantity < 3);
      
      return {
        id: 'shopping-optimization',
        type: 'economy',
        title: '🛒 Otimizar Lista de Compras',
        description: `Economize tempo e dinheiro otimizando sua rota de compras. ${shoppingList.length} itens na lista.`,
        action: 'Otimizar compras',
        priority: shoppingList.length > 10 ? 'high' : 'medium',
        data: { 
          itemCount: shoppingList.length,
          lowStockItems: lowStockItems.length,
          estimatedSavings: shoppingList.length * 2 // R$ 2 por item em média
        }
      };
    }
    
    return null;
  }

  // Sugestão de avaliação de receitas
  private async getRecipeEvaluationSuggestion(
    recipes: Recipe[],
    mealPlans: MealPlan[]
  ): Promise<SmartSuggestion | null> {
    // Verificar receitas executadas recentemente sem avaliação
    const recentMealPlans = mealPlans.filter(plan => {
      const planDate = new Date(plan.date);
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      return planDate >= threeDaysAgo && planDate <= new Date();
    });

    if (recentMealPlans.length >= 2) { // Pelo menos 2 receitas executadas recentemente
      const executedRecipes = recentMealPlans.map(plan => 
        recipes.find(r => r.id === plan.recipeId)
      ).filter(Boolean);

      return {
        id: 'recipe-evaluation',
        type: 'recipe',
        title: '⭐ Avalie suas receitas recentes',
        description: `Você executou ${recentMealPlans.length} receitas nos últimos dias. Compartilhe sua experiência para melhorar futuras execuções!`,
        action: 'Avaliar receitas',
        priority: 'medium',
        data: { 
          recentExecutions: recentMealPlans.length,
          recipesToEvaluate: executedRecipes.map(r => r?.name).filter(Boolean)
        }
      };
    }
    
    return null;
  }

  // Sugestão de gamificação
  private async getGamificationSuggestion(
    mealPlans: MealPlan[]
  ): Promise<SmartSuggestion | null> {
    // Verificar atividade recente do usuário
    const recentActivity = mealPlans.filter(plan => {
      const planDate = new Date(plan.date);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return planDate >= sevenDaysAgo;
    });

    // Se há atividade, sugerir engajamento com gamificação
    if (recentActivity.length >= 3) {
      return {
        id: 'gamification-engagement',
        type: 'planning',
        title: '🎮 Desafios e Conquistas',
        description: `Você está ativo! Veja seus pontos, badges e participe de desafios culinários. ${recentActivity.length} atividades esta semana.`,
        action: 'Ver gamificação',
        priority: 'low',
        data: { 
          weeklyActivity: recentActivity.length,
          potentialPoints: recentActivity.length * 10
        }
      };
    }

    // Se pouca atividade, incentivar engajamento
    if (recentActivity.length === 0) {
      return {
        id: 'gamification-start',
        type: 'planning',
        title: '🏆 Comece sua Jornada Culinária',
        description: 'Execute receitas, planeje refeições e ganhe pontos! Desbloqueie badges e participe de desafios.',
        action: 'Descobrir gamificação',
        priority: 'medium',
        data: { 
          firstTimeUser: true,
          welcomeBonus: 50
        }
      };
    }
    
    return null;
  }

  // Ordenar sugestões por prioridade e relevância
  private prioritizeSuggestions(suggestions: SmartSuggestion[]): SmartSuggestion[] {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    
    return suggestions.sort((a, b) => {
      // Primeiro por prioridade
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      // Depois por tipo (waste prevention primeiro)
      const typeOrder = { ingredient: 4, planning: 3, recipe: 2, health: 1, economy: 1 };
      return (typeOrder[b.type] || 0) - (typeOrder[a.type] || 0);
    }).slice(0, 8); // Máximo 8 sugestões
  }

  // Helpers
  private async getRecentMealPlans(): Promise<MealPlan[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 14); // Últimas 2 semanas
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7); // Próxima semana
    return dbService.getMealPlans(startDate, endDate);
  }

  private getDaysUntilExpiration(expirationDate: Date): number {
    const now = new Date();
    const expiration = new Date(expirationDate);
    const diffTime = expiration.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Métodos públicos para sugestões específicas
  async getRecipeOfTheDay(): Promise<Recipe | null> {
    try {
      const suggestions = await this.getSmartSuggestions({ availableIngredients: true });
      const recipeSuggestion = suggestions.find(s => s.type === 'recipe' && s.recipe);
      return recipeSuggestion?.recipe || null;
    } catch (error) {
      console.error('Erro ao obter receita do dia:', error);
      return null;
    }
  }

  async getUrgentAlerts(): Promise<SmartSuggestion[]> {
    try {
      const suggestions = await this.getSmartSuggestions({ wastePrevention: true });
      return suggestions.filter(s => s.priority === 'high');
    } catch (error) {
      console.error('Erro ao obter alertas urgentes:', error);
      return [];
    }
  }
}

export const suggestionsService = SuggestionsService.getInstance();