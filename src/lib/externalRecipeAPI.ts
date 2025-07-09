import type { Recipe } from '../types';

// Interfaces para APIs externas
export interface SpoonacularRecipe {
  id: number;
  title: string;
  image: string;
  readyInMinutes: number;
  servings: number;
  sourceUrl: string;
  summary: string;
  cuisines: string[];
  dishTypes: string[];
  diets: string[];
  instructions: string;
  extendedIngredients: Array<{
    id: number;
    name: string;
    amount: number;
    unit: string;
    original: string;
  }>;
  nutrition?: {
    nutrients: Array<{
      name: string;
      amount: number;
      unit: string;
    }>;
  };
}

export interface EdamamRecipe {
  recipe: {
    uri: string;
    label: string;
    image: string;
    source: string;
    url: string;
    shareAs: string;
    yield: number;
    dietLabels: string[];
    healthLabels: string[];
    cautions: string[];
    ingredientLines: string[];
    ingredients: Array<{
      text: string;
      quantity: number;
      measure: string;
      food: string;
      weight: number;
      foodCategory: string;
    }>;
    calories: number;
    totalTime: number;
    cuisineType: string[];
    mealType: string[];
    dishType: string[];
    totalNutrients: Record<string, {
      label: string;
      quantity: number;
      unit: string;
    }>;
  };
}

export interface RecipeSearchFilters {
  cuisine?: string;
  diet?: string;
  intolerances?: string;
  type?: string;
  query?: string;
  maxReadyTime?: number;
  minCalories?: number;
  maxCalories?: number;
  offset?: number;
  number?: number;
}

export interface RecipeSearchResult {
  recipes: Recipe[];
  totalResults: number;
  offset: number;
  hasMore: boolean;
}

class ExternalRecipeAPIService {
  private static instance: ExternalRecipeAPIService;
  private readonly spoonacularApiKey: string;
  private readonly edamamAppId: string;
  private readonly edamamAppKey: string;

  static getInstance(): ExternalRecipeAPIService {
    if (!ExternalRecipeAPIService.instance) {
      ExternalRecipeAPIService.instance = new ExternalRecipeAPIService();
    }
    return ExternalRecipeAPIService.instance;
  }

  constructor() {
    // Em produção, estas keys viriam de variáveis de ambiente
    this.spoonacularApiKey = import.meta.env.VITE_SPOONACULAR_API_KEY || 'demo-key';
    this.edamamAppId = import.meta.env.VITE_EDAMAM_APP_ID || 'demo-id';
    this.edamamAppKey = import.meta.env.VITE_EDAMAM_APP_KEY || 'demo-key';
  }

  // Buscar receitas no Spoonacular
  async searchSpoonacularRecipes(filters: RecipeSearchFilters): Promise<RecipeSearchResult> {
    try {
      // Em modo desenvolvimento, retornar receitas mock
      if (this.spoonacularApiKey === 'demo-key') {
        return this.getMockRecipes(filters);
      }

      // Mapear cuisine do português para inglês se necessário
      const apiCuisine = filters.cuisine ? this.mapCategoryToAPIFormat(filters.cuisine) || filters.cuisine : undefined;
      
      const params = new URLSearchParams({
        apiKey: this.spoonacularApiKey,
        number: (filters.number || 12).toString(),
        offset: (filters.offset || 0).toString(),
        addRecipeInformation: 'true',
        addRecipeInstructions: 'true',
        fillIngredients: 'true',
        addRecipeNutrition: 'true',
        ...(filters.query && { query: filters.query }),
        ...(apiCuisine && { cuisine: apiCuisine }),
        ...(filters.diet && { diet: filters.diet }),
        ...(filters.intolerances && { intolerances: filters.intolerances }),
        ...(filters.type && { type: filters.type }),
        ...(filters.maxReadyTime && { maxReadyTime: filters.maxReadyTime.toString() }),
        ...(filters.minCalories && { minCalories: filters.minCalories.toString() }),
        ...(filters.maxCalories && { maxCalories: filters.maxCalories.toString() }),
      });

      const response = await fetch(`https://api.spoonacular.com/recipes/complexSearch?${params}`);
      
      if (!response.ok) {
        throw new Error(`Spoonacular API error: ${response.status}`);
      }

      const data = await response.json();
      
      const recipes = data.results.map((recipe: SpoonacularRecipe) => 
        this.transformSpoonacularRecipe(recipe)
      );

      return {
        recipes,
        totalResults: data.totalResults,
        offset: data.offset,
        hasMore: data.offset + data.results.length < data.totalResults
      };
    } catch (error) {
      console.error('Error searching Spoonacular recipes:', error);
      return this.getMockRecipes(filters);
    }
  }

  // Buscar receitas no Edamam
  async searchEdamamRecipes(filters: RecipeSearchFilters): Promise<RecipeSearchResult> {
    try {
      const params = new URLSearchParams({
        app_id: this.edamamAppId,
        app_key: this.edamamAppKey,
        type: 'public',
        from: (filters.offset || 0).toString(),
        to: ((filters.offset || 0) + (filters.number || 12)).toString(),
        ...(filters.query && { q: filters.query }),
        ...(filters.cuisine && { cuisineType: filters.cuisine }),
        ...(filters.diet && { diet: filters.diet }),
        ...(filters.type && { dishType: filters.type }),
        ...(filters.maxReadyTime && { time: `1-${filters.maxReadyTime}` }),
        ...(filters.minCalories && filters.maxCalories && { 
          calories: `${filters.minCalories}-${filters.maxCalories}` 
        }),
      });

      const response = await fetch(`https://api.edamam.com/search?${params}`);
      
      if (!response.ok) {
        throw new Error(`Edamam API error: ${response.status}`);
      }

      const data = await response.json();
      
      const recipes = data.hits.map((hit: EdamamRecipe) => 
        this.transformEdamamRecipe(hit.recipe)
      );

      return {
        recipes,
        totalResults: data.count,
        offset: filters.offset || 0,
        hasMore: data.more
      };
    } catch (error) {
      console.error('Error searching Edamam recipes:', error);
      return this.getFallbackRecipes(filters);
    }
  }

  // Buscar receitas combinando ambas as APIs
  async searchRecipes(filters: RecipeSearchFilters): Promise<RecipeSearchResult> {
    try {
      // Tentar Spoonacular primeiro (mais completo)
      const spoonacularResult = await this.searchSpoonacularRecipes(filters);
      
      if (spoonacularResult.recipes.length > 0) {
        return spoonacularResult;
      }

      // Fallback para Edamam se Spoonacular falhar
      return await this.searchEdamamRecipes(filters);
    } catch (error) {
      console.error('Error searching recipes:', error);
      return this.getFallbackRecipes(filters);
    }
  }

  // Transformar receita do Spoonacular para o formato interno
  private transformSpoonacularRecipe(recipe: SpoonacularRecipe): Recipe {
    return {
      id: `spoonacular-${recipe.id}`,
      name: recipe.title,
      description: this.stripHtml(recipe.summary || ''),
      ingredients: recipe.extendedIngredients.map(ing => ({
        ingredientId: crypto.randomUUID(),
        name: ing.name,
        quantity: ing.amount,
        unit: ing.unit,
        optional: false
      })),
      instructions: this.parseInstructions(recipe.instructions || '').map(inst => inst.instruction),
      prepTime: Math.max(5, Math.floor(recipe.readyInMinutes * 0.3)),
      cookTime: Math.max(5, Math.floor(recipe.readyInMinutes * 0.7)),
      servings: recipe.servings || 4,
      difficulty: this.calculateDifficulty(recipe.readyInMinutes, recipe.extendedIngredients.length),
      category: this.mapCategories(recipe.cuisines, recipe.dishTypes)[0] || 'outros',
      tags: [...recipe.cuisines, ...recipe.dishTypes, ...recipe.diets],
      imageUrl: recipe.image || 'https://via.placeholder.com/400x300/64748b/ffffff?text=Receita',
      source: 'internet',
      sourceUrl: recipe.sourceUrl,
      rating: 0,
      reviews: [],
      nutrition: recipe.nutrition ? {
        calories: recipe.nutrition.nutrients.find(n => n.name === 'Calories')?.amount || 0,
        protein: recipe.nutrition.nutrients.find(n => n.name === 'Protein')?.amount || 0,
        carbs: recipe.nutrition.nutrients.find(n => n.name === 'Carbohydrates')?.amount || 0,
        fat: recipe.nutrition.nutrients.find(n => n.name === 'Fat')?.amount || 0,
        fiber: recipe.nutrition.nutrients.find(n => n.name === 'Fiber')?.amount || 0,
        sugar: recipe.nutrition.nutrients.find(n => n.name === 'Sugar')?.amount || 0,
        sodium: recipe.nutrition.nutrients.find(n => n.name === 'Sodium')?.amount || 0
      } : undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  // Transformar receita do Edamam para o formato interno
  private transformEdamamRecipe(recipe: EdamamRecipe['recipe']): Recipe {
    return {
      id: `edamam-${recipe.uri.split('#recipe_')[1]}`,
      name: recipe.label,
      description: `Receita ${recipe.cuisineType.join(', ')} com ${recipe.ingredients.length} ingredientes`,
      ingredients: recipe.ingredients.map(ing => ({
        ingredientId: crypto.randomUUID(),
        name: ing.food,
        quantity: ing.quantity,
        unit: ing.measure || 'unidade',
        optional: false
      })),
      instructions: recipe.ingredientLines,
      prepTime: Math.max(10, Math.floor((recipe.totalTime || 30) * 0.4)),
      cookTime: Math.max(10, Math.floor((recipe.totalTime || 30) * 0.6)),
      servings: recipe.yield || 4,
      difficulty: this.calculateDifficulty(recipe.totalTime || 30, recipe.ingredients.length),
      category: this.mapEdamamCategories(recipe.cuisineType, recipe.dishType)[0] || 'outros',
      tags: [...recipe.cuisineType, ...recipe.dishType, ...recipe.dietLabels, ...recipe.healthLabels],
      imageUrl: recipe.image || 'https://via.placeholder.com/400x300/64748b/ffffff?text=Receita',
      source: 'internet',
      sourceUrl: recipe.url,
      rating: 0,
      reviews: [],
      nutrition: {
        calories: Math.round(recipe.calories / recipe.yield),
        protein: Math.round((recipe.totalNutrients.PROCNT?.quantity || 0) / recipe.yield),
        carbs: Math.round((recipe.totalNutrients.CHOCDF?.quantity || 0) / recipe.yield),
        fat: Math.round((recipe.totalNutrients.FAT?.quantity || 0) / recipe.yield),
        fiber: Math.round((recipe.totalNutrients.FIBTG?.quantity || 0) / recipe.yield),
        sugar: Math.round((recipe.totalNutrients.SUGAR?.quantity || 0) / recipe.yield),
        sodium: Math.round((recipe.totalNutrients.NA?.quantity || 0) / recipe.yield)
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  // Funções auxiliares
  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').slice(0, 200);
  }

  private parseInstructions(instructions: string): Array<{step: number; instruction: string}> {
    const steps = instructions.split(/\d+\.|\n/).filter(step => step.trim());
    return steps.map((step, index) => ({
      step: index + 1,
      instruction: step.trim()
    }));
  }

  private calculateDifficulty(time: number, ingredientCount: number): 'easy' | 'medium' | 'hard' {
    const score = (time / 60) + (ingredientCount / 10);
    if (score < 1.5) return 'easy';
    if (score < 3) return 'medium';
    return 'hard';
  }

  private mapCategories(cuisines: string[], dishTypes: string[]): string[] {
    const categories = new Set<string>();
    
    // Mapear cuisines
    cuisines.forEach(cuisine => {
      const mapped = this.mapCuisineToCategory(cuisine);
      if (mapped) categories.add(mapped);
    });

    // Mapear dish types
    dishTypes.forEach(dishType => {
      const mapped = this.mapDishTypeToCategory(dishType);
      if (mapped) categories.add(mapped);
    });

    return Array.from(categories);
  }

  private mapEdamamCategories(cuisineTypes: string[], dishTypes: string[]): string[] {
    const categories = new Set<string>();
    
    cuisineTypes.forEach(cuisine => {
      const mapped = this.mapCuisineToCategory(cuisine);
      if (mapped) categories.add(mapped);
    });

    dishTypes.forEach(dishType => {
      const mapped = this.mapDishTypeToCategory(dishType);
      if (mapped) categories.add(mapped);
    });

    return Array.from(categories);
  }

  private mapCuisineToCategory(cuisine: string): string | null {
    const cuisineMap: Record<string, string> = {
      'italian': 'italiana',
      'chinese': 'chinesa',
      'japanese': 'japonesa',
      'mexican': 'mexicana',
      'indian': 'indiana',
      'french': 'francesa',
      'thai': 'tailandesa',
      'greek': 'grega',
      'spanish': 'espanhola',
      'american': 'americana',
      'brazilian': 'brasileira',
      'mediterranean': 'mediterrânea',
      'middle eastern': 'árabe',
      'korean': 'coreana',
      'vietnamese': 'vietnamita'
    };

    return cuisineMap[cuisine.toLowerCase()] || null;
  }

  // Mapear categorias do nosso sistema para a API (português -> inglês)
  private mapCategoryToAPIFormat(category: string): string | null {
    const categoryToAPIMap: Record<string, string> = {
      'brasileira': 'brazilian',
      'italiana': 'italian',
      'chinesa': 'chinese',
      'japonesa': 'japanese',
      'mexicana': 'mexican',
      'indiana': 'indian',
      'francesa': 'french',
      'tailandesa': 'thai',
      'grega': 'greek',
      'espanhola': 'spanish',
      'americana': 'american',
      'mediterrânea': 'mediterranean',
      'árabe': 'middle eastern',
      'coreana': 'korean',
      'vietnamita': 'vietnamese'
    };

    return categoryToAPIMap[category.toLowerCase()] || null;
  }

  // Criar receita mock específica para uma cozinha
  private createMockRecipeForCuisine(cuisine: string): Recipe | null {
    const cuisineRecipes: Record<string, Partial<Recipe>> = {
      'italiana': {
        name: 'Spaghetti Carbonara Clássico',
        description: 'Autêntica receita italiana com guanciale, ovos, pecorino e pimenta preta',
        category: 'italiana',
        tags: ['italiana', 'massa', 'principal'],
        ingredients: [
          { ingredientId: crypto.randomUUID(), name: 'Spaghetti', quantity: 400, unit: 'g', optional: false },
          { ingredientId: crypto.randomUUID(), name: 'Guanciale', quantity: 150, unit: 'g', optional: false },
          { ingredientId: crypto.randomUUID(), name: 'Ovos', quantity: 4, unit: 'unidades', optional: false },
          { ingredientId: crypto.randomUUID(), name: 'Pecorino Romano', quantity: 100, unit: 'g', optional: false }
        ]
      },
      'chinesa': {
        name: 'Frango Xadrez',
        description: 'Delicioso frango refogado com vegetais e amendoim no estilo chinês',
        category: 'chinesa',
        tags: ['chinesa', 'frango', 'principal'],
        ingredients: [
          { ingredientId: crypto.randomUUID(), name: 'Peito de frango', quantity: 500, unit: 'g', optional: false },
          { ingredientId: crypto.randomUUID(), name: 'Pimentão', quantity: 2, unit: 'unidades', optional: false },
          { ingredientId: crypto.randomUUID(), name: 'Amendoim', quantity: 100, unit: 'g', optional: false },
          { ingredientId: crypto.randomUUID(), name: 'Molho shoyu', quantity: 3, unit: 'colheres de sopa', optional: false }
        ]
      },
      'mexicana': {
        name: 'Tacos de Carnitas',
        description: 'Tacos autênticos mexicanos com carne de porco desfiada e temperos especiais',
        category: 'mexicana',
        tags: ['mexicana', 'porco', 'principal'],
        ingredients: [
          { ingredientId: crypto.randomUUID(), name: 'Paleta de porco', quantity: 1, unit: 'kg', optional: false },
          { ingredientId: crypto.randomUUID(), name: 'Tortillas de milho', quantity: 12, unit: 'unidades', optional: false },
          { ingredientId: crypto.randomUUID(), name: 'Cebola roxa', quantity: 1, unit: 'unidade', optional: false },
          { ingredientId: crypto.randomUUID(), name: 'Coentro', quantity: 1, unit: 'maço', optional: false }
        ]
      },
      'japonesa': {
        name: 'Ramen Tradicional',
        description: 'Sopa japonesa com macarrão, caldo rico e diversos complementos',
        category: 'japonesa',
        tags: ['japonesa', 'sopa', 'principal'],
        ingredients: [
          { ingredientId: crypto.randomUUID(), name: 'Macarrão ramen', quantity: 200, unit: 'g', optional: false },
          { ingredientId: crypto.randomUUID(), name: 'Caldo de osso', quantity: 500, unit: 'ml', optional: false },
          { ingredientId: crypto.randomUUID(), name: 'Ovo cozido', quantity: 2, unit: 'unidades', optional: false },
          { ingredientId: crypto.randomUUID(), name: 'Nori', quantity: 2, unit: 'folhas', optional: false }
        ]
      }
    };

    const recipeTemplate = cuisineRecipes[cuisine.toLowerCase()];
    if (!recipeTemplate) return null;

    return {
      id: `mock-${cuisine}-${Date.now()}`,
      name: recipeTemplate.name!,
      description: recipeTemplate.description!,
      ingredients: recipeTemplate.ingredients!,
      instructions: [
        'Prepare todos os ingredientes',
        'Siga a técnica tradicional da culinária',
        'Tempere a gosto',
        'Sirva quente'
      ],
      prepTime: 20,
      cookTime: 30,
      servings: 4,
      difficulty: 'medium',
      category: recipeTemplate.category!,
      tags: recipeTemplate.tags!,
      reviews: [],
      imageUrl: 'https://via.placeholder.com/400x300/64748b/ffffff?text=' + encodeURIComponent(recipeTemplate.name!),
      source: 'internet',
      rating: 4.2,
      nutrition: {
        calories: 350,
        protein: 25,
        carbs: 30,
        fat: 15,
        fiber: 5,
        sugar: 8,
        sodium: 800
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private mapDishTypeToCategory(dishType: string): string | null {
    const dishTypeMap: Record<string, string> = {
      'main course': 'principal',
      'side dish': 'acompanhamento',
      'dessert': 'sobremesa',
      'appetizer': 'entrada',
      'salad': 'salada',
      'soup': 'sopa',
      'beverage': 'bebida',
      'breakfast': 'café da manhã',
      'lunch': 'almoço',
      'dinner': 'jantar',
      'snack': 'lanche'
    };

    return dishTypeMap[dishType.toLowerCase()] || null;
  }

  // Receitas mock para desenvolvimento
  private getMockRecipes(filters: RecipeSearchFilters): RecipeSearchResult {
    const mockRecipes: Recipe[] = [
      {
        id: 'mock-1',
        name: 'Bolo de Chocolate Fácil',
        description: 'Um delicioso bolo de chocolate super fácil de fazer',
        ingredients: [
          { ingredientId: crypto.randomUUID(), name: 'Farinha de trigo', quantity: 2, unit: 'xícaras', optional: false },
          { ingredientId: crypto.randomUUID(), name: 'Açúcar', quantity: 1.5, unit: 'xícaras', optional: false },
          { ingredientId: crypto.randomUUID(), name: 'Chocolate em pó', quantity: 0.5, unit: 'xícara', optional: false },
          { ingredientId: crypto.randomUUID(), name: 'Ovos', quantity: 3, unit: 'unidades', optional: false },
          { ingredientId: crypto.randomUUID(), name: 'Óleo', quantity: 0.5, unit: 'xícara', optional: false },
          { ingredientId: crypto.randomUUID(), name: 'Leite', quantity: 1, unit: 'xícara', optional: false },
          { ingredientId: crypto.randomUUID(), name: 'Fermento em pó', quantity: 1, unit: 'colher de sopa', optional: false }
        ],
        instructions: [
          'Pré-aqueça o forno a 180°C',
          'Misture todos os ingredientes secos em uma tigela',
          'Em outra tigela, bata os ovos, óleo e leite',
          'Combine os ingredientes secos com os líquidos',
          'Despeje em forma untada e enfarinhada',
          'Asse por 30-35 minutos até dourar'
        ],
        prepTime: 15,
        cookTime: 35,
        servings: 8,
        difficulty: 'easy',
        category: 'sobremesa',
        tags: ['doce', 'chocolate', 'festa'],
        reviews: [],
        imageUrl: 'https://via.placeholder.com/400x300/64748b/ffffff?text=Receita',
        source: 'internet',
        sourceUrl: 'https://example.com/bolo-chocolate',
        rating: 4.5,
        nutrition: {
          calories: 280,
          protein: 6,
          carbs: 45,
          fat: 12,
          fiber: 3,
          sugar: 25,
          sodium: 150
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'mock-2',
        name: 'Salada Caesar Tradicional',
        description: 'Clássica salada Caesar com molho cremoso',
        ingredients: [
          { ingredientId: crypto.randomUUID(), name: 'Alface romana', quantity: 1, unit: 'pé', optional: false },
          { ingredientId: crypto.randomUUID(), name: 'Parmesão ralado', quantity: 0.5, unit: 'xícara', optional: false },
          { ingredientId: crypto.randomUUID(), name: 'Croutons', quantity: 1, unit: 'xícara', optional: false },
          { ingredientId: crypto.randomUUID(), name: 'Maionese', quantity: 0.25, unit: 'xícara', optional: false },
          { ingredientId: crypto.randomUUID(), name: 'Suco de limão', quantity: 2, unit: 'colheres de sopa', optional: false },
          { ingredientId: crypto.randomUUID(), name: 'Alho', quantity: 2, unit: 'dentes', optional: false }
        ],
        instructions: [
          'Lave e corte a alface em pedaços',
          'Prepare o molho misturando maionese, limão e alho',
          'Tempere a alface com o molho',
          'Adicione parmesão e croutons',
          'Sirva imediatamente'
        ],
        prepTime: 15,
        cookTime: 0,
        servings: 4,
        difficulty: 'easy',
        category: 'salada',
        tags: ['salada', 'vegetariano', 'rápido'],
        reviews: [],
        imageUrl: 'https://via.placeholder.com/400x300/64748b/ffffff?text=Receita',
        source: 'internet',
        sourceUrl: 'https://example.com/salada-caesar',
        rating: 4.2,
        nutrition: {
          calories: 180,
          protein: 8,
          carbs: 12,
          fat: 14,
          fiber: 4,
          sugar: 3,
          sodium: 320
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Criar receitas específicas por cozinha se não houver mock específico
    if (filters.cuisine && !filters.query) {
      const cuisineRecipe = this.createMockRecipeForCuisine(filters.cuisine);
      if (cuisineRecipe) {
        return {
          recipes: [cuisineRecipe],
          totalResults: 1,
          offset: filters.offset || 0,
          hasMore: false
        };
      }
    }

    // Aplicar filtros básicos se fornecidos
    let filteredRecipes = mockRecipes;
    
    if (filters.query) {
      filteredRecipes = filteredRecipes.filter(recipe => 
        recipe.name.toLowerCase().includes(filters.query!.toLowerCase()) ||
        recipe.description.toLowerCase().includes(filters.query!.toLowerCase())
      );
    }

    if (filters.cuisine) {
      filteredRecipes = filteredRecipes.filter(recipe => 
        recipe.category === filters.cuisine || recipe.tags.includes(filters.cuisine!)
      );
    }

    return {
      recipes: filteredRecipes.slice(filters.offset || 0, (filters.offset || 0) + (filters.number || 12)),
      totalResults: filteredRecipes.length,
      offset: filters.offset || 0,
      hasMore: (filters.offset || 0) + (filters.number || 12) < filteredRecipes.length
    };
  }

  // Receitas de fallback quando APIs falham
  private getFallbackRecipes(_filters: RecipeSearchFilters): RecipeSearchResult {
    const fallbackRecipes: Recipe[] = [
      {
        id: 'fallback-1',
        name: 'Receita Indisponível',
        description: 'APIs externas temporariamente indisponíveis. Tente novamente em alguns minutos.',
        ingredients: [],
        instructions: [],
        prepTime: 0,
        cookTime: 0,
        servings: 1,
        difficulty: 'easy',
        category: 'outros',
        tags: [],
        reviews: [],
        imageUrl: 'https://via.placeholder.com/400x300/64748b/ffffff?text=Receita',
        source: 'internet',
        rating: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    return {
      recipes: fallbackRecipes,
      totalResults: 0,
      offset: 0,
      hasMore: false
    };
  }

  // Obter receita detalhada por ID
  async getRecipeDetails(id: string): Promise<Recipe | null> {
    try {
      if (id.startsWith('spoonacular-')) {
        const spoonacularId = id.replace('spoonacular-', '');
        const response = await fetch(
          `https://api.spoonacular.com/recipes/${spoonacularId}/information?apiKey=${this.spoonacularApiKey}&includeNutrition=true`
        );
        
        if (!response.ok) throw new Error('Recipe not found');
        
        const recipe = await response.json();
        return this.transformSpoonacularRecipe(recipe);
      }

      // Para Edamam, redirecionar para busca por ID
      return null;
    } catch (error) {
      console.error('Error fetching recipe details:', error);
      return null;
    }
  }

  // Obter receitas aleatórias
  async getRandomRecipes(count: number = 6): Promise<Recipe[]> {
    try {
      const response = await fetch(
        `https://api.spoonacular.com/recipes/random?apiKey=${this.spoonacularApiKey}&number=${count}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch random recipes');
      
      const data = await response.json();
      return data.recipes.map((recipe: SpoonacularRecipe) => 
        this.transformSpoonacularRecipe(recipe)
      );
    } catch (error) {
      console.error('Error fetching random recipes:', error);
      return [];
    }
  }

  // Obter informações nutricionais
  async getNutritionInfo(ingredientList: string[]): Promise<any> {
    try {
      const ingredients = ingredientList.join('\n');
      const response = await fetch(
        `https://api.spoonacular.com/recipes/parseIngredients?apiKey=${this.spoonacularApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `ingredientList=${encodeURIComponent(ingredients)}&servings=1&includeNutrition=true`
        }
      );
      
      if (!response.ok) throw new Error('Failed to get nutrition info');
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching nutrition info:', error);
      return null;
    }
  }
}

export const externalRecipeAPI = ExternalRecipeAPIService.getInstance();