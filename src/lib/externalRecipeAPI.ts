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
      // Em modo desenvolvimento ou com credenciais demo, usar mock
      if (this.edamamAppId === 'demo-id' || this.edamamAppKey === 'demo-key') {
        console.log('Using Edamam mock recipes (demo credentials)');
        return this.getMockRecipes(filters);
      }

      // Mapear cuisine do português para inglês se necessário
      const apiCuisine = filters.cuisine ? this.mapCategoryToAPIFormat(filters.cuisine) || filters.cuisine : undefined;

      const params = new URLSearchParams({
        app_id: this.edamamAppId,
        app_key: this.edamamAppKey,
        type: 'public',
        from: (filters.offset || 0).toString(),
        to: ((filters.offset || 0) + (filters.number || 12)).toString(),
        ...(filters.query && { q: filters.query }),
        ...(apiCuisine && { cuisineType: apiCuisine }),
        ...(filters.diet && { diet: filters.diet }),
        ...(filters.type && { dishType: filters.type }),
        ...(filters.maxReadyTime && { time: `1-${filters.maxReadyTime}` }),
        ...(filters.minCalories && filters.maxCalories && { 
          calories: `${filters.minCalories}-${filters.maxCalories}` 
        }),
      });

      const response = await fetch(`https://api.edamam.com/search?${params}`, {
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Edamam API error: ${response.status} - ${response.statusText}`);
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
      console.warn('Edamam API unavailable, using fallback:', error);
      return this.getFallbackRecipes(filters);
    }
  }

  // Buscar receitas combinando ambas as APIs
  async searchRecipes(filters: RecipeSearchFilters): Promise<RecipeSearchResult> {
    try {
      // Tentar Spoonacular primeiro (mais completo e configurado)
      const spoonacularResult = await this.searchSpoonacularRecipes(filters);
      
      if (spoonacularResult.recipes.length > 0) {
        return spoonacularResult;
      }

      // Fallback para Edamam apenas se tiver credenciais reais
      if (this.edamamAppId !== 'demo-id' && this.edamamAppKey !== 'demo-key') {
        console.log('Trying Edamam as fallback...');
        return await this.searchEdamamRecipes(filters);
      }

      // Se nenhuma API está configurada, usar receitas mock
      console.log('No external APIs configured, using mock recipes');
      return this.getMockRecipes(filters);
    } catch (error) {
      console.warn('Error searching recipes, using fallback:', error);
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

  // Criar múltiplas receitas mock para uma cozinha
  private createMockRecipeForCuisine(cuisine: string): Recipe | null {
    const cuisineRecipes: Record<string, Array<Partial<Recipe>>> = {
      'italiana': [
        {
          name: 'Spaghetti Carbonara Clássico',
          description: 'Autêntica receita italiana com guanciale, ovos, pecorino e pimenta preta',
          tags: ['italiana', 'massa', 'principal'],
          ingredients: [
            { ingredientId: crypto.randomUUID(), name: 'Spaghetti', quantity: 400, unit: 'g', optional: false },
            { ingredientId: crypto.randomUUID(), name: 'Guanciale', quantity: 150, unit: 'g', optional: false },
            { ingredientId: crypto.randomUUID(), name: 'Ovos', quantity: 4, unit: 'unidades', optional: false },
            { ingredientId: crypto.randomUUID(), name: 'Pecorino Romano', quantity: 100, unit: 'g', optional: false }
          ]
        },
        {
          name: 'Risotto ai Funghi',
          description: 'Cremoso risotto italiano com cogumelos porcini',
          tags: ['italiana', 'risotto', 'principal', 'vegetariano'],
          ingredients: [
            { ingredientId: crypto.randomUUID(), name: 'Arroz Arbório', quantity: 300, unit: 'g', optional: false },
            { ingredientId: crypto.randomUUID(), name: 'Cogumelos Porcini', quantity: 200, unit: 'g', optional: false },
            { ingredientId: crypto.randomUUID(), name: 'Caldo de legumes', quantity: 1, unit: 'litro', optional: false },
            { ingredientId: crypto.randomUUID(), name: 'Parmesão', quantity: 100, unit: 'g', optional: false }
          ]
        },
        {
          name: 'Osso Buco alla Milanese',
          description: 'Tradicional ensopado lombardo com jarrete de vitela',
          tags: ['italiana', 'carne', 'principal', 'ensopado'],
          ingredients: [
            { ingredientId: crypto.randomUUID(), name: 'Jarrete de vitela', quantity: 1.5, unit: 'kg', optional: false },
            { ingredientId: crypto.randomUUID(), name: 'Vinho branco', quantity: 1, unit: 'xícara', optional: false },
            { ingredientId: crypto.randomUUID(), name: 'Tomate pelado', quantity: 400, unit: 'g', optional: false },
            { ingredientId: crypto.randomUUID(), name: 'Gremolata', quantity: 1, unit: 'porção', optional: false }
          ]
        }
      ],
      'chinesa': [
        {
          name: 'Frango Xadrez',
          description: 'Delicioso frango refogado com vegetais e amendoim no estilo chinês',
          tags: ['chinesa', 'frango', 'principal'],
          ingredients: [
            { ingredientId: crypto.randomUUID(), name: 'Peito de frango', quantity: 500, unit: 'g', optional: false },
            { ingredientId: crypto.randomUUID(), name: 'Pimentão', quantity: 2, unit: 'unidades', optional: false },
            { ingredientId: crypto.randomUUID(), name: 'Amendoim', quantity: 100, unit: 'g', optional: false },
            { ingredientId: crypto.randomUUID(), name: 'Molho shoyu', quantity: 3, unit: 'colheres de sopa', optional: false }
          ]
        },
        {
          name: 'Pato Laqueado de Pequim',
          description: 'Tradicional pato chinês com pele crocante e molho hoisin',
          tags: ['chinesa', 'pato', 'principal', 'festivo'],
          ingredients: [
            { ingredientId: crypto.randomUUID(), name: 'Pato inteiro', quantity: 1, unit: 'unidade', optional: false },
            { ingredientId: crypto.randomUUID(), name: 'Molho hoisin', quantity: 4, unit: 'colheres de sopa', optional: false },
            { ingredientId: crypto.randomUUID(), name: 'Panquecas chinesas', quantity: 12, unit: 'unidades', optional: false },
            { ingredientId: crypto.randomUUID(), name: 'Cebolinha', quantity: 6, unit: 'talos', optional: false }
          ]
        },
        {
          name: 'Mapo Tofu Autêntico',
          description: 'Picante tofu de Sichuan com carne moída e pimenta Sichuan',
          tags: ['chinesa', 'tofu', 'principal', 'picante'],
          ingredients: [
            { ingredientId: crypto.randomUUID(), name: 'Tofu sedoso', quantity: 400, unit: 'g', optional: false },
            { ingredientId: crypto.randomUUID(), name: 'Carne de porco moída', quantity: 200, unit: 'g', optional: false },
            { ingredientId: crypto.randomUUID(), name: 'Pasta de feijão doubanjiang', quantity: 2, unit: 'colheres de sopa', optional: false },
            { ingredientId: crypto.randomUUID(), name: 'Pimenta Sichuan', quantity: 1, unit: 'colher de chá', optional: false }
          ]
        }
      ],
      'mexicana': [
        {
          name: 'Tacos de Carnitas',
          description: 'Tacos autênticos mexicanos com carne de porco desfiada e temperos especiais',
          tags: ['mexicana', 'porco', 'principal'],
          ingredients: [
            { ingredientId: crypto.randomUUID(), name: 'Paleta de porco', quantity: 1, unit: 'kg', optional: false },
            { ingredientId: crypto.randomUUID(), name: 'Tortillas de milho', quantity: 12, unit: 'unidades', optional: false },
            { ingredientId: crypto.randomUUID(), name: 'Cebola roxa', quantity: 1, unit: 'unidade', optional: false },
            { ingredientId: crypto.randomUUID(), name: 'Coentro', quantity: 1, unit: 'maço', optional: false }
          ]
        },
        {
          name: 'Mole Poblano',
          description: 'Complexo molho mexicano com mais de 20 ingredientes servido com frango',
          tags: ['mexicana', 'frango', 'principal', 'tradicional'],
          ingredients: [
            { ingredientId: crypto.randomUUID(), name: 'Chiles poblanos', quantity: 6, unit: 'unidades', optional: false },
            { ingredientId: crypto.randomUUID(), name: 'Chocolate amargo', quantity: 50, unit: 'g', optional: false },
            { ingredientId: crypto.randomUUID(), name: 'Frango inteiro', quantity: 1, unit: 'unidade', optional: false },
            { ingredientId: crypto.randomUUID(), name: 'Amendoim', quantity: 100, unit: 'g', optional: false }
          ]
        },
        {
          name: 'Chiles en Nogada',
          description: 'Pimentos poblano recheados com picadillo e molho de nozes',
          tags: ['mexicana', 'pimento', 'principal', 'festivo'],
          ingredients: [
            { ingredientId: crypto.randomUUID(), name: 'Chiles poblanos', quantity: 8, unit: 'unidades', optional: false },
            { ingredientId: crypto.randomUUID(), name: 'Carne moída', quantity: 500, unit: 'g', optional: false },
            { ingredientId: crypto.randomUUID(), name: 'Nozes de castela', quantity: 200, unit: 'g', optional: false },
            { ingredientId: crypto.randomUUID(), name: 'Romã', quantity: 1, unit: 'unidade', optional: false }
          ]
        }
      ],
      'japonesa': [
        {
          name: 'Ramen Tradicional',
          description: 'Sopa japonesa com macarrão, caldo rico e diversos complementos',
          tags: ['japonesa', 'sopa', 'principal'],
          ingredients: [
            { ingredientId: crypto.randomUUID(), name: 'Macarrão ramen', quantity: 200, unit: 'g', optional: false },
            { ingredientId: crypto.randomUUID(), name: 'Caldo de osso', quantity: 500, unit: 'ml', optional: false },
            { ingredientId: crypto.randomUUID(), name: 'Ovo cozido', quantity: 2, unit: 'unidades', optional: false },
            { ingredientId: crypto.randomUUID(), name: 'Nori', quantity: 2, unit: 'folhas', optional: false }
          ]
        },
        {
          name: 'Sushi Nigiri Variado',
          description: 'Seleção de nigiri com peixes frescos e arroz temperado',
          tags: ['japonesa', 'peixe', 'entrada', 'cru'],
          ingredients: [
            { ingredientId: crypto.randomUUID(), name: 'Arroz para sushi', quantity: 300, unit: 'g', optional: false },
            { ingredientId: crypto.randomUUID(), name: 'Salmão sashimi', quantity: 200, unit: 'g', optional: false },
            { ingredientId: crypto.randomUUID(), name: 'Atum sashimi', quantity: 200, unit: 'g', optional: false },
            { ingredientId: crypto.randomUUID(), name: 'Wasabi', quantity: 1, unit: 'colher de chá', optional: false }
          ]
        },
        {
          name: 'Tempura de Camarão',
          description: 'Camarões empanados em massa leve e crocante',
          tags: ['japonesa', 'camarão', 'entrada', 'frito'],
          ingredients: [
            { ingredientId: crypto.randomUUID(), name: 'Camarões grandes', quantity: 12, unit: 'unidades', optional: false },
            { ingredientId: crypto.randomUUID(), name: 'Farinha tempura', quantity: 200, unit: 'g', optional: false },
            { ingredientId: crypto.randomUUID(), name: 'Água gelada', quantity: 250, unit: 'ml', optional: false },
            { ingredientId: crypto.randomUUID(), name: 'Molho tentsuyu', quantity: 100, unit: 'ml', optional: false }
          ]
        }
      ],
      'indiana': [
        {
          name: 'Chicken Tikka Masala',
          description: 'Frango marinado em iogurte e especiarias, grelhado e servido em molho cremoso',
          tags: ['indiana', 'frango', 'principal', 'curry'],
          ingredients: [
            { ingredientId: crypto.randomUUID(), name: 'Peito de frango', quantity: 600, unit: 'g', optional: false },
            { ingredientId: crypto.randomUUID(), name: 'Iogurte natural', quantity: 200, unit: 'ml', optional: false },
            { ingredientId: crypto.randomUUID(), name: 'Garam masala', quantity: 2, unit: 'colheres de chá', optional: false },
            { ingredientId: crypto.randomUUID(), name: 'Leite de coco', quantity: 400, unit: 'ml', optional: false }
          ]
        },
        {
          name: 'Biryani de Cordeiro',
          description: 'Arroz basmati aromático cozido com cordeiro e especiarias',
          tags: ['indiana', 'cordeiro', 'principal', 'arroz'],
          ingredients: [
            { ingredientId: crypto.randomUUID(), name: 'Cordeiro em cubos', quantity: 800, unit: 'g', optional: false },
            { ingredientId: crypto.randomUUID(), name: 'Arroz basmati', quantity: 400, unit: 'g', optional: false },
            { ingredientId: crypto.randomUUID(), name: 'Açafrão', quantity: 1, unit: 'pitada', optional: false },
            { ingredientId: crypto.randomUUID(), name: 'Ghee', quantity: 3, unit: 'colheres de sopa', optional: false }
          ]
        }
      ],
      'francesa': [
        {
          name: 'Coq au Vin',
          description: 'Frango braseado em vinho tinto com cogumelos e bacon',
          tags: ['francesa', 'frango', 'principal', 'vinho'],
          ingredients: [
            { ingredientId: crypto.randomUUID(), name: 'Frango inteiro', quantity: 1, unit: 'unidade', optional: false },
            { ingredientId: crypto.randomUUID(), name: 'Vinho tinto', quantity: 750, unit: 'ml', optional: false },
            { ingredientId: crypto.randomUUID(), name: 'Bacon', quantity: 200, unit: 'g', optional: false },
            { ingredientId: crypto.randomUUID(), name: 'Cogumelos paris', quantity: 300, unit: 'g', optional: false }
          ]
        },
        {
          name: 'Bouillabaisse Marseillaise',
          description: 'Tradicional sopa de peixe francesa com rouille e croutons',
          tags: ['francesa', 'peixe', 'sopa', 'mediterrânea'],
          ingredients: [
            { ingredientId: crypto.randomUUID(), name: 'Peixes variados', quantity: 1.5, unit: 'kg', optional: false },
            { ingredientId: crypto.randomUUID(), name: 'Açafrão', quantity: 1, unit: 'pitada', optional: false },
            { ingredientId: crypto.randomUUID(), name: 'Azeite de oliva', quantity: 100, unit: 'ml', optional: false },
            { ingredientId: crypto.randomUUID(), name: 'Rouille', quantity: 1, unit: 'porção', optional: false }
          ]
        }
      ],
      'tailandesa': [
        {
          name: 'Pad Thai Autêntico',
          description: 'Macarrão de arroz refogado com camarão, ovo e molho tamarindo',
          tags: ['tailandesa', 'macarrão', 'camarão', 'principal'],
          ingredients: [
            { ingredientId: crypto.randomUUID(), name: 'Macarrão de arroz', quantity: 300, unit: 'g', optional: false },
            { ingredientId: crypto.randomUUID(), name: 'Camarões médios', quantity: 300, unit: 'g', optional: false },
            { ingredientId: crypto.randomUUID(), name: 'Molho de tamarindo', quantity: 3, unit: 'colheres de sopa', optional: false },
            { ingredientId: crypto.randomUUID(), name: 'Brotos de feijão', quantity: 150, unit: 'g', optional: false }
          ]
        },
        {
          name: 'Tom Yum Goong',
          description: 'Sopa tailandesa picante e azeda com camarão',
          tags: ['tailandesa', 'sopa', 'camarão', 'picante'],
          ingredients: [
            { ingredientId: crypto.randomUUID(), name: 'Camarões grandes', quantity: 500, unit: 'g', optional: false },
            { ingredientId: crypto.randomUUID(), name: 'Capim-limão', quantity: 3, unit: 'talos', optional: false },
            { ingredientId: crypto.randomUUID(), name: 'Folhas de lima kaffir', quantity: 6, unit: 'folhas', optional: false },
            { ingredientId: crypto.randomUUID(), name: 'Pasta de curry vermelho', quantity: 2, unit: 'colheres de sopa', optional: false }
          ]
        }
      ],
      'brasileira': [
        {
          name: 'Feijoada Completa',
          description: 'Tradicional feijoada brasileira com carnes defumadas e acompanhamentos',
          tags: ['brasileira', 'feijão', 'principal', 'tradicional'],
          ingredients: [
            { ingredientId: crypto.randomUUID(), name: 'Feijão preto', quantity: 500, unit: 'g', optional: false },
            { ingredientId: crypto.randomUUID(), name: 'Linguiça calabresa', quantity: 300, unit: 'g', optional: false },
            { ingredientId: crypto.randomUUID(), name: 'Costela de porco', quantity: 500, unit: 'g', optional: false },
            { ingredientId: crypto.randomUUID(), name: 'Paio', quantity: 200, unit: 'g', optional: false }
          ]
        },
        {
          name: 'Moqueca de Peixe Baiana',
          description: 'Peixe cozido no leite de coco com dendê e pimentões',
          tags: ['brasileira', 'peixe', 'principal', 'baiana'],
          ingredients: [
            { ingredientId: crypto.randomUUID(), name: 'Peixe badejo', quantity: 800, unit: 'g', optional: false },
            { ingredientId: crypto.randomUUID(), name: 'Leite de coco', quantity: 400, unit: 'ml', optional: false },
            { ingredientId: crypto.randomUUID(), name: 'Azeite de dendê', quantity: 3, unit: 'colheres de sopa', optional: false },
            { ingredientId: crypto.randomUUID(), name: 'Pimentão amarelo', quantity: 2, unit: 'unidades', optional: false }
          ]
        }
      ]
    };

    const recipeVariants = cuisineRecipes[cuisine.toLowerCase()];
    if (!recipeVariants || !Array.isArray(recipeVariants)) return null;

    // Selecionar receita aleatória da cozinha
    const randomIndex = Math.floor(Math.random() * recipeVariants.length);
    const recipeTemplate = recipeVariants[randomIndex];

    return {
      id: `mock-${cuisine}-${Date.now()}-${randomIndex}`,
      name: recipeTemplate.name!,
      description: recipeTemplate.description!,
      ingredients: recipeTemplate.ingredients!,
      instructions: [
        'Prepare todos os ingredientes conforme a lista',
        'Siga as técnicas tradicionais desta culinária',
        'Tempere com cuidado respeitando os sabores autênticos',
        'Sirva seguindo a apresentação tradicional'
      ],
      prepTime: Math.floor(Math.random() * 30) + 15, // 15-45 min
      cookTime: Math.floor(Math.random() * 60) + 20, // 20-80 min
      servings: Math.floor(Math.random() * 4) + 2,   // 2-6 pessoas
      difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)] as 'easy' | 'medium' | 'hard',
      category: cuisine,
      tags: recipeTemplate.tags!,
      reviews: [],
      imageUrl: 'https://via.placeholder.com/400x300/64748b/ffffff?text=' + encodeURIComponent(recipeTemplate.name!),
      source: 'internet',
      rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0-5.0
      nutrition: {
        calories: Math.floor(Math.random() * 400) + 200,  // 200-600
        protein: Math.floor(Math.random() * 30) + 10,     // 10-40g
        carbs: Math.floor(Math.random() * 60) + 20,       // 20-80g
        fat: Math.floor(Math.random() * 25) + 5,          // 5-30g
        fiber: Math.floor(Math.random() * 10) + 2,        // 2-12g
        sugar: Math.floor(Math.random() * 20) + 5,        // 5-25g
        sodium: Math.floor(Math.random() * 800) + 200     // 200-1000mg
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