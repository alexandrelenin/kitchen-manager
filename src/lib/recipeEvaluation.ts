import { dbService } from './database';
import type { Recipe } from '../types';

export interface RecipeExecution {
  id: string;
  recipeId: string;
  executedAt: Date;
  actualPrepTime: number;
  actualCookTime: number;
  actualServings: number;
  difficulty: 'easier' | 'as_expected' | 'harder';
  photos: string[];
  notes: string;
  variations: RecipeVariation[];
  rating: DetailedRating;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecipeVariation {
  id: string;
  type: 'ingredient_substitution' | 'technique_change' | 'seasoning_adjustment' | 'other';
  description: string;
  originalValue: string;
  newValue: string;
  impact: 'improved' | 'neutral' | 'worsened';
  notes?: string;
}

export interface DetailedRating {
  overall: number;
  taste: number;
  difficulty: number;
  preparation: number;
  presentation: number;
  value: number; // custo-benefício
  wouldMakeAgain: boolean;
  familyApproval: FamilyApproval[];
}

export interface FamilyApproval {
  memberId: string;
  memberName: string;
  rating: number;
  comments?: string;
  favoritePart?: string;
}

export interface RecipeAnalytics {
  executionCount: number;
  averageRating: DetailedRating;
  averageActualTime: number;
  successRate: number;
  popularVariations: RecipeVariation[];
  familyFavoriteScore: number;
  improvementSuggestions: string[];
}

class RecipeEvaluationService {
  private static instance: RecipeEvaluationService;

  static getInstance(): RecipeEvaluationService {
    if (!RecipeEvaluationService.instance) {
      RecipeEvaluationService.instance = new RecipeEvaluationService();
    }
    return RecipeEvaluationService.instance;
  }

  // Registrar execução de receita
  async recordRecipeExecution(execution: Omit<RecipeExecution, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const newExecution: RecipeExecution = {
        id: crypto.randomUUID(),
        ...execution,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Simular salvamento no IndexedDB (expandir dbService depois)
      console.log('Saving recipe execution:', newExecution);
      
      // Atualizar rating da receita
      await this.updateRecipeRating(execution.recipeId, execution.rating);
      
      return newExecution.id;
    } catch (error) {
      console.error('Erro ao registrar execução da receita:', error);
      throw error;
    }
  }

  // Atualizar rating da receita
  private async updateRecipeRating(recipeId: string, newRating: DetailedRating): Promise<void> {
    try {
      const recipes = await dbService.getRecipes();
      const recipe = recipes.find(r => r.id === recipeId);
      if (!recipe) throw new Error('Receita não encontrada');

      // Calcular novo rating médio
      const executions = await this.getRecipeExecutions(recipeId);
      const totalRatings = executions.length + 1; // +1 para o novo rating
      
      const averageOverall = executions.reduce((sum, exec) => sum + exec.rating.overall, newRating.overall) / totalRatings;
      
      // Atualizar receita com novo rating
      const updatedRecipe = {
        ...recipe,
        rating: Math.round(averageOverall * 10) / 10, // Arredondar para 1 casa decimal
        updatedAt: new Date()
      };

      await dbService.updateRecipe(recipeId, updatedRecipe);
    } catch (error) {
      console.error('Erro ao atualizar rating da receita:', error);
    }
  }

  // Buscar execuções de uma receita
  async getRecipeExecutions(_recipeId: string): Promise<RecipeExecution[]> {
    // Simulação - em implementação real, viria do IndexedDB
    return [];
  }

  // Analisar performance de uma receita
  async analyzeRecipePerformance(recipeId: string): Promise<RecipeAnalytics> {
    try {
      const executions = await this.getRecipeExecutions(recipeId);
      
      if (executions.length === 0) {
        return this.getDefaultAnalytics();
      }

      const executionCount = executions.length;
      
      // Calcular ratings médios
      const averageRating: DetailedRating = {
        overall: this.calculateAverage(executions, 'overall'),
        taste: this.calculateAverage(executions, 'taste'),
        difficulty: this.calculateAverage(executions, 'difficulty'),
        preparation: this.calculateAverage(executions, 'preparation'),
        presentation: this.calculateAverage(executions, 'presentation'),
        value: this.calculateAverage(executions, 'value'),
        wouldMakeAgain: executions.filter(e => e.rating.wouldMakeAgain).length / executions.length > 0.5,
        familyApproval: []
      };

      // Calcular tempo médio real
      const averageActualTime = executions.reduce((sum, exec) => 
        sum + exec.actualPrepTime + exec.actualCookTime, 0
      ) / executions.length;

      // Taxa de sucesso (ratings >= 4)
      const successRate = executions.filter(e => e.rating.overall >= 4).length / executions.length;

      // Variações populares
      const allVariations = executions.flatMap(e => e.variations);
      const variationMap = new Map<string, { variation: RecipeVariation; count: number }>();
      
      allVariations.forEach(variation => {
        const key = `${variation.type}-${variation.description}`;
        if (variationMap.has(key)) {
          variationMap.get(key)!.count++;
        } else {
          variationMap.set(key, { variation, count: 1 });
        }
      });

      const popularVariations = Array.from(variationMap.values())
        .filter(item => item.count >= 2) // Aparecer pelo menos 2 vezes
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map(item => item.variation);

      // Score de aprovação familiar
      const familyRatings = executions.flatMap(e => e.rating.familyApproval);
      const familyFavoriteScore = familyRatings.length > 0 
        ? familyRatings.reduce((sum, approval) => sum + approval.rating, 0) / familyRatings.length
        : 0;

      // Sugestões de melhoria
      const improvementSuggestions = this.generateImprovementSuggestions(executions, averageRating);

      return {
        executionCount,
        averageRating,
        averageActualTime,
        successRate,
        popularVariations,
        familyFavoriteScore,
        improvementSuggestions
      };
    } catch (error) {
      console.error('Erro ao analisar performance da receita:', error);
      return this.getDefaultAnalytics();
    }
  }

  // Buscar receitas mais bem avaliadas
  async getTopRatedRecipes(limit: number = 10): Promise<Recipe[]> {
    try {
      const recipes = await dbService.getRecipes();
      return recipes
        .sort((a, b) => b.rating - a.rating)
        .slice(0, limit);
    } catch (error) {
      console.error('Erro ao buscar receitas bem avaliadas:', error);
      return [];
    }
  }

  // Buscar receitas que precisam de melhoria
  async getRecipesNeedingImprovement(): Promise<Array<{ recipe: Recipe; issues: string[] }>> {
    try {
      const recipes = await dbService.getRecipes();
      const recipesWithIssues: Array<{ recipe: Recipe; issues: string[] }> = [];

      for (const recipe of recipes) {
        const analytics = await this.analyzeRecipePerformance(recipe.id);
        const issues: string[] = [];

        if (analytics.averageRating.overall < 3) {
          issues.push('Rating baixo');
        }
        if (analytics.successRate < 0.6) {
          issues.push('Taxa de sucesso baixa');
        }
        if (analytics.familyFavoriteScore < 3) {
          issues.push('Aprovação familiar baixa');
        }
        if (analytics.averageActualTime > recipe.prepTime + recipe.cookTime + 30) {
          issues.push('Tempo real muito maior que estimado');
        }

        if (issues.length > 0) {
          recipesWithIssues.push({ recipe, issues });
        }
      }

      return recipesWithIssues.sort((a, b) => b.issues.length - a.issues.length);
    } catch (error) {
      console.error('Erro ao buscar receitas com problemas:', error);
      return [];
    }
  }

  // Adicionar variação a uma receita
  async addRecipeVariation(
    recipeId: string, 
    variation: Omit<RecipeVariation, 'id'>
  ): Promise<void> {
    try {
      // Em implementação real, salvaria no IndexedDB
      console.log('Adding variation to recipe:', recipeId, variation);
    } catch (error) {
      console.error('Erro ao adicionar variação:', error);
      throw error;
    }
  }

  // Upload de foto de execução
  async uploadExecutionPhoto(file: File): Promise<string> {
    try {
      // Simular upload de imagem
      const photoUrl = URL.createObjectURL(file);
      console.log('Photo uploaded:', photoUrl);
      return photoUrl;
    } catch (error) {
      console.error('Erro no upload da foto:', error);
      throw error;
    }
  }

  // Helper methods
  private calculateAverage(executions: RecipeExecution[], field: keyof DetailedRating): number {
    if (executions.length === 0) return 0;
    
    const sum = executions.reduce((total, exec) => {
      const value = exec.rating[field];
      return total + (typeof value === 'number' ? value : 0);
    }, 0);
    
    return Math.round((sum / executions.length) * 10) / 10;
  }

  private generateImprovementSuggestions(
    executions: RecipeExecution[], 
    averageRating: DetailedRating
  ): string[] {
    const suggestions: string[] = [];

    if (averageRating.taste < 3.5) {
      suggestions.push('Considere ajustar temperos e sabores');
    }
    if (averageRating.difficulty > 4) {
      suggestions.push('Simplifique as instruções para reduzir dificuldade');
    }
    if (averageRating.preparation < 3.5) {
      suggestions.push('Melhore a clareza das instruções de preparo');
    }
    if (averageRating.presentation < 3.5) {
      suggestions.push('Adicione dicas de apresentação e decoração');
    }

    // Analisar variações bem-sucedidas
    const goodVariations = executions
      .flatMap(e => e.variations)
      .filter(v => v.impact === 'improved');
    
    if (goodVariations.length > 0) {
      suggestions.push('Considere incorporar as variações mais populares à receita base');
    }

    return suggestions;
  }

  private getDefaultAnalytics(): RecipeAnalytics {
    return {
      executionCount: 0,
      averageRating: {
        overall: 0,
        taste: 0,
        difficulty: 0,
        preparation: 0,
        presentation: 0,
        value: 0,
        wouldMakeAgain: false,
        familyApproval: []
      },
      averageActualTime: 0,
      successRate: 0,
      popularVariations: [],
      familyFavoriteScore: 0,
      improvementSuggestions: []
    };
  }
}

export const recipeEvaluationService = RecipeEvaluationService.getInstance();