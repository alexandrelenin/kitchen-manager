// Sistema de categorização por origem culinária e filtros avançados

export interface CuisineCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  region: string;
  popularDishes: string[];
  characteristics: string[];
}

export interface DietaryRestriction {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  restrictions: string[];
  alternatives: string[];
}

export interface RecipeFilter {
  cuisines: string[];
  diets: string[];
  intolerances: string[];
  mealTypes: string[];
  cookingMethods: string[];
  difficulty: string[];
  maxPrepTime: number;
  maxCookTime: number;
  minServings: number;
  maxServings: number;
  ingredients: {
    include: string[];
    exclude: string[];
  };
  nutrition: {
    maxCalories?: number;
    minProtein?: number;
    maxCarbs?: number;
    maxFat?: number;
  };
  tags: string[];
}

export const CUISINE_CATEGORIES: CuisineCategory[] = [
  {
    id: 'brasileira',
    name: 'Brasileira',
    description: 'Culinária tradicional do Brasil com influências indígenas, africanas e europeias',
    icon: '🇧🇷',
    color: '#22C55E',
    region: 'América do Sul',
    popularDishes: ['Feijoada', 'Moqueca', 'Brigadeiro', 'Pão de Açúcar', 'Coxinha'],
    characteristics: ['Diversidade regional', 'Ingredientes tropicais', 'Pratos fartos', 'Doces tradicionais']
  },
  {
    id: 'italiana',
    name: 'Italiana',
    description: 'Culinária mediterrânea rica em massas, queijos e azeite',
    icon: '🇮🇹',
    color: '#EF4444',
    region: 'Europa',
    popularDishes: ['Pizza', 'Pasta', 'Risotto', 'Gelato', 'Osso Buco'],
    characteristics: ['Ingredientes frescos', 'Simplicidade', 'Queijos artesanais', 'Vinho']
  },
  {
    id: 'japonesa',
    name: 'Japonesa',
    description: 'Culinária oriental focada em frescor, apresentação e umami',
    icon: '🇯🇵',
    color: '#F59E0B',
    region: 'Ásia',
    popularDishes: ['Sushi', 'Ramen', 'Tempura', 'Miso', 'Yakitori'],
    characteristics: ['Apresentação artística', 'Ingredientes frescos', 'Fermentados', 'Chá']
  },
  {
    id: 'francesa',
    name: 'Francesa',
    description: 'Alta gastronomia com técnicas refinadas e sabores complexos',
    icon: '🇫🇷',
    color: '#8B5CF6',
    region: 'Europa',
    popularDishes: ['Coq au Vin', 'Bouillabaisse', 'Croissant', 'Ratatouille', 'Crème Brûlée'],
    characteristics: ['Técnicas clássicas', 'Molhos elaborados', 'Queijos', 'Vinhos finos']
  },
  {
    id: 'mexicana',
    name: 'Mexicana',
    description: 'Culinária vibrante com especiarias, pimentas e sabores intensos',
    icon: '🇲🇽',
    color: '#DC2626',
    region: 'América Central',
    popularDishes: ['Tacos', 'Enchiladas', 'Guacamole', 'Pozole', 'Churros'],
    characteristics: ['Pimentas variadas', 'Especiarias', 'Milho', 'Abacate']
  },
  {
    id: 'indiana',
    name: 'Indiana',
    description: 'Culinária aromática com curry, especiarias e vegetais',
    icon: '🇮🇳',
    color: '#F97316',
    region: 'Ásia',
    popularDishes: ['Curry', 'Biryani', 'Naan', 'Tandoori', 'Masala'],
    characteristics: ['Especiarias complexas', 'Vegetarianismo', 'Leguminosas', 'Pães']
  },
  {
    id: 'chinesa',
    name: 'Chinesa',
    description: 'Culinária milenar com técnicas variadas e ingredientes únicos',
    icon: '🇨🇳',
    color: '#DC2626',
    region: 'Ásia',
    popularDishes: ['Dim Sum', 'Peking Duck', 'Chow Mein', 'Kung Pao', 'Mapo Tofu'],
    characteristics: ['Wok cooking', 'Molho de soja', 'Equilíbrio de sabores', 'Chá']
  },
  {
    id: 'tailandesa',
    name: 'Tailandesa',
    description: 'Culinária equilibrada entre doce, azedo, salgado e picante',
    icon: '🇹🇭',
    color: '#10B981',
    region: 'Ásia',
    popularDishes: ['Pad Thai', 'Tom Yum', 'Green Curry', 'Mango Sticky Rice', 'Som Tam'],
    characteristics: ['Equilíbrio de sabores', 'Ervas frescas', 'Leite de coco', 'Pimentas']
  },
  {
    id: 'grega',
    name: 'Grega',
    description: 'Culinária mediterrânea com azeite, queijos e frutos do mar',
    icon: '🇬🇷',
    color: '#3B82F6',
    region: 'Europa',
    popularDishes: ['Moussaka', 'Gyros', 'Tzatziki', 'Baklava', 'Souvlaki'],
    characteristics: ['Azeite de oliva', 'Queijo feta', 'Frutos do mar', 'Ervas mediterrâneas']
  },
  {
    id: 'espanhola',
    name: 'Espanhola',
    description: 'Culinária regional com frutos do mar, arroz e jamón',
    icon: '🇪🇸',
    color: '#EF4444',
    region: 'Europa',
    popularDishes: ['Paella', 'Tapas', 'Gazpacho', 'Tortilla', 'Sangria'],
    characteristics: ['Frutos do mar', 'Arroz', 'Azeite', 'Jamón ibérico']
  },
  {
    id: 'arabe',
    name: 'Árabe',
    description: 'Culinária do Oriente Médio com especiarias e grãos',
    icon: '🕌',
    color: '#92400E',
    region: 'Oriente Médio',
    popularDishes: ['Hummus', 'Falafel', 'Kebab', 'Baklava', 'Tabbouleh'],
    characteristics: ['Especiarias', 'Grãos', 'Nozes', 'Iogurte']
  },
  {
    id: 'coreana',
    name: 'Coreana',
    description: 'Culinária fermentada com kimchi, gochujang e BBQ',
    icon: '🇰🇷',
    color: '#DC2626',
    region: 'Ásia',
    popularDishes: ['Kimchi', 'Bulgogi', 'Bibimbap', 'Korean BBQ', 'Japchae'],
    characteristics: ['Fermentados', 'Gochujang', 'Banchan', 'Churrasco coreano']
  }
];

export const DIETARY_RESTRICTIONS: DietaryRestriction[] = [
  {
    id: 'vegetariana',
    name: 'Vegetariana',
    description: 'Sem carne, mas permite laticínios e ovos',
    icon: '🥬',
    color: '#22C55E',
    restrictions: ['carne', 'frango', 'peixe', 'frutos do mar'],
    alternatives: ['proteína vegetal', 'leguminosas', 'nozes', 'sementes']
  },
  {
    id: 'vegana',
    name: 'Vegana',
    description: 'Sem produtos de origem animal',
    icon: '🌱',
    color: '#16A34A',
    restrictions: ['carne', 'frango', 'peixe', 'laticínios', 'ovos', 'mel'],
    alternatives: ['leites vegetais', 'proteínas vegetais', 'nutritional yeast']
  },
  {
    id: 'sem-gluten',
    name: 'Sem Glúten',
    description: 'Livre de trigo, centeio, cevada e aveia',
    icon: '🌾',
    color: '#F59E0B',
    restrictions: ['trigo', 'centeio', 'cevada', 'aveia'],
    alternatives: ['arroz', 'quinoa', 'milho', 'batata']
  },
  {
    id: 'sem-lactose',
    name: 'Sem Lactose',
    description: 'Livre de laticínios',
    icon: '🥛',
    color: '#3B82F6',
    restrictions: ['leite', 'queijo', 'manteiga', 'iogurte', 'creme'],
    alternatives: ['leites vegetais', 'queijos vegetais', 'manteiga vegetal']
  },
  {
    id: 'cetogenica',
    name: 'Cetogênica',
    description: 'Baixo carboidrato, alta gordura',
    icon: '🥑',
    color: '#10B981',
    restrictions: ['açúcar', 'pão', 'massas', 'arroz', 'batata'],
    alternatives: ['gorduras saudáveis', 'proteínas', 'vegetais baixo carbo']
  },
  {
    id: 'paleolitica',
    name: 'Paleolítica',
    description: 'Alimentos não processados como nossos ancestrais',
    icon: '🦴',
    color: '#92400E',
    restrictions: ['grãos', 'leguminosas', 'laticínios', 'açúcar processado'],
    alternatives: ['carnes', 'peixes', 'vegetais', 'frutas', 'nozes']
  },
  {
    id: 'low-carb',
    name: 'Low Carb',
    description: 'Baixo teor de carboidratos',
    icon: '🥩',
    color: '#DC2626',
    restrictions: ['pão', 'massas', 'arroz', 'batata', 'açúcar'],
    alternatives: ['proteínas', 'vegetais folhosos', 'gorduras saudáveis']
  },
  {
    id: 'diabetica',
    name: 'Diabética',
    description: 'Controle de açúcar e carboidratos',
    icon: '🩺',
    color: '#7C3AED',
    restrictions: ['açúcar', 'doces', 'carboidratos refinados'],
    alternatives: ['adoçantes naturais', 'fibras', 'proteínas']
  },
  {
    id: 'mediterranea',
    name: 'Mediterrânea',
    description: 'Rica em azeite, peixes e vegetais',
    icon: '🫒',
    color: '#059669',
    restrictions: ['carnes vermelhas em excesso', 'processados'],
    alternatives: ['azeite', 'peixes', 'vegetais', 'nozes', 'frutas']
  },
  {
    id: 'kosher',
    name: 'Kosher',
    description: 'Conforme leis alimentares judaicas',
    icon: '✡️',
    color: '#6366F1',
    restrictions: ['porco', 'frutos do mar sem escamas', 'mistura carne/leite'],
    alternatives: ['carnes kosher', 'peixes com escamas', 'vegetais']
  },
  {
    id: 'halal',
    name: 'Halal',
    description: 'Conforme leis alimentares islâmicas',
    icon: '☪️',
    color: '#059669',
    restrictions: ['porco', 'álcool', 'carne não halal'],
    alternatives: ['carnes halal', 'frutos do mar', 'vegetais']
  }
];

export const MEAL_TYPES = [
  { id: 'cafe-da-manha', name: 'Café da Manhã', icon: '🌅' },
  { id: 'almoco', name: 'Almoço', icon: '☀️' },
  { id: 'jantar', name: 'Jantar', icon: '🌙' },
  { id: 'lanche', name: 'Lanche', icon: '🥪' },
  { id: 'sobremesa', name: 'Sobremesa', icon: '🍰' },
  { id: 'aperitivo', name: 'Aperitivo', icon: '🍸' },
  { id: 'brunch', name: 'Brunch', icon: '🥂' }
];

export const COOKING_METHODS = [
  { id: 'grelhado', name: 'Grelhado', icon: '🔥' },
  { id: 'assado', name: 'Assado', icon: '🔥' },
  { id: 'frito', name: 'Frito', icon: '🍳' },
  { id: 'cozido', name: 'Cozido', icon: '🍲' },
  { id: 'refogado', name: 'Refogado', icon: '🥄' },
  { id: 'no-forno', name: 'No Forno', icon: '🔥' },
  { id: 'vapor', name: 'No Vapor', icon: '💨' },
  { id: 'cru', name: 'Cru', icon: '🥗' },
  { id: 'marinado', name: 'Marinado', icon: '🧂' },
  { id: 'defumado', name: 'Defumado', icon: '💨' }
];

export const DIFFICULTY_LEVELS = [
  { id: 'easy', name: 'Fácil', icon: '😊', color: '#22C55E' },
  { id: 'medium', name: 'Médio', icon: '🤔', color: '#F59E0B' },
  { id: 'hard', name: 'Difícil', icon: '😤', color: '#EF4444' }
];

export const INTOLERANCES = [
  { id: 'lactose', name: 'Lactose', icon: '🥛' },
  { id: 'gluten', name: 'Glúten', icon: '🌾' },
  { id: 'nuts', name: 'Nozes', icon: '🥜' },
  { id: 'soy', name: 'Soja', icon: '🫘' },
  { id: 'eggs', name: 'Ovos', icon: '🥚' },
  { id: 'seafood', name: 'Frutos do Mar', icon: '🦐' },
  { id: 'shellfish', name: 'Crustáceos', icon: '🦞' },
  { id: 'dairy', name: 'Laticínios', icon: '🧀' },
  { id: 'sulfites', name: 'Sulfitos', icon: '🍷' },
  { id: 'sesame', name: 'Gergelim', icon: '🌰' }
];

class RecipeCategoryService {
  private static instance: RecipeCategoryService;

  static getInstance(): RecipeCategoryService {
    if (!RecipeCategoryService.instance) {
      RecipeCategoryService.instance = new RecipeCategoryService();
    }
    return RecipeCategoryService.instance;
  }

  // Obter todas as categorias de culinária
  getCuisineCategories(): CuisineCategory[] {
    return CUISINE_CATEGORIES;
  }

  // Obter categoria por ID
  getCuisineCategory(id: string): CuisineCategory | undefined {
    return CUISINE_CATEGORIES.find(category => category.id === id);
  }

  // Obter todas as restrições dietéticas
  getDietaryRestrictions(): DietaryRestriction[] {
    return DIETARY_RESTRICTIONS;
  }

  // Obter restrição dietética por ID
  getDietaryRestriction(id: string): DietaryRestriction | undefined {
    return DIETARY_RESTRICTIONS.find(restriction => restriction.id === id);
  }

  // Obter tipos de refeição
  getMealTypes() {
    return MEAL_TYPES;
  }

  // Obter métodos de cozimento
  getCookingMethods() {
    return COOKING_METHODS;
  }

  // Obter níveis de dificuldade
  getDifficultyLevels() {
    return DIFFICULTY_LEVELS;
  }

  // Obter intolerâncias
  getIntolerances() {
    return INTOLERANCES;
  }

  // Validar se uma receita atende às restrições dietéticas
  validateRecipeForDiet(recipe: any, dietId: string): boolean {
    const diet = this.getDietaryRestriction(dietId);
    if (!diet) return true;

    const recipeText = `${recipe.name} ${recipe.description} ${recipe.ingredients.map((i: any) => i.name).join(' ')}`.toLowerCase();
    
    return !diet.restrictions.some(restriction => 
      recipeText.includes(restriction.toLowerCase())
    );
  }

  // Validar se uma receita atende às intolerâncias
  validateRecipeForIntolerances(recipe: any, intolerances: string[]): boolean {
    const recipeText = `${recipe.name} ${recipe.description} ${recipe.ingredients.map((i: any) => i.name).join(' ')}`.toLowerCase();
    
    return !intolerances.some(intolerance => {
      const intoleranceData = INTOLERANCES.find(i => i.id === intolerance);
      return intoleranceData && recipeText.includes(intoleranceData.name.toLowerCase());
    });
  }

  // Categorizar receita automaticamente
  categorizeRecipe(recipe: any): string[] {
    const categories = new Set<string>();
    const recipeText = `${recipe.name} ${recipe.description} ${recipe.tags?.join(' ') || ''}`.toLowerCase();

    // Detectar culinária por palavras-chave
    CUISINE_CATEGORIES.forEach(cuisine => {
      const keywords = [...cuisine.popularDishes, ...cuisine.characteristics].map(k => k.toLowerCase());
      if (keywords.some(keyword => recipeText.includes(keyword))) {
        categories.add(cuisine.id);
      }
    });

    // Detectar tipo de refeição
    MEAL_TYPES.forEach(mealType => {
      if (recipeText.includes(mealType.name.toLowerCase())) {
        categories.add(mealType.id);
      }
    });

    return Array.from(categories);
  }

  // Sugerir receitas similares baseadas em categoria
  getSimilarRecipesByCategory(recipe: any, allRecipes: any[]): any[] {
    const recipeCategories = new Set(recipe.category || []);
    const recipeTags = new Set(recipe.tags || []);

    return allRecipes
      .filter(r => r.id !== recipe.id)
      .map(r => {
        const categoryMatch = (r.category || []).filter((c: string) => recipeCategories.has(c)).length;
        const tagMatch = (r.tags || []).filter((t: string) => recipeTags.has(t)).length;
        return {
          recipe: r,
          score: categoryMatch * 2 + tagMatch
        };
      })
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(r => r.recipe);
  }

  // Aplicar filtros avançados
  applyFilters(recipes: any[], filters: Partial<RecipeFilter>): any[] {
    return recipes.filter(recipe => {
      // Filtro por culinária
      if (filters.cuisines && filters.cuisines.length > 0) {
        const hasMatchingCuisine = filters.cuisines.some(cuisine => 
          recipe.category?.includes(cuisine) || recipe.tags?.includes(cuisine)
        );
        if (!hasMatchingCuisine) return false;
      }

      // Filtro por dieta
      if (filters.diets && filters.diets.length > 0) {
        const passesAllDiets = filters.diets.every(diet => 
          this.validateRecipeForDiet(recipe, diet)
        );
        if (!passesAllDiets) return false;
      }

      // Filtro por intolerâncias
      if (filters.intolerances && filters.intolerances.length > 0) {
        if (!this.validateRecipeForIntolerances(recipe, filters.intolerances)) {
          return false;
        }
      }

      // Filtro por dificuldade
      if (filters.difficulty && filters.difficulty.length > 0) {
        if (!filters.difficulty.includes(recipe.difficulty)) return false;
      }

      // Filtro por tempo
      if (filters.maxPrepTime && recipe.prepTime > filters.maxPrepTime) return false;
      if (filters.maxCookTime && recipe.cookTime > filters.maxCookTime) return false;

      // Filtro por porções
      if (filters.minServings && recipe.servings < filters.minServings) return false;
      if (filters.maxServings && recipe.servings > filters.maxServings) return false;

      // Filtro por ingredientes
      if (filters.ingredients) {
        const recipeIngredients = recipe.ingredients?.map((i: any) => i.name.toLowerCase()) || [];
        
        if (filters.ingredients.include && filters.ingredients.include.length > 0) {
          const hasRequiredIngredients = filters.ingredients.include.every(ingredient =>
            recipeIngredients.some((ri: any) => ri.includes(ingredient.toLowerCase()))
          );
          if (!hasRequiredIngredients) return false;
        }

        if (filters.ingredients.exclude && filters.ingredients.exclude.length > 0) {
          const hasExcludedIngredients = filters.ingredients.exclude.some(ingredient =>
            recipeIngredients.some((ri: any) => ri.includes(ingredient.toLowerCase()))
          );
          if (hasExcludedIngredients) return false;
        }
      }

      // Filtro por nutrição
      if (filters.nutrition && recipe.nutrition) {
        if (filters.nutrition.maxCalories && recipe.nutrition.calories > filters.nutrition.maxCalories) return false;
        if (filters.nutrition.minProtein && recipe.nutrition.protein < filters.nutrition.minProtein) return false;
        if (filters.nutrition.maxCarbs && recipe.nutrition.carbs > filters.nutrition.maxCarbs) return false;
        if (filters.nutrition.maxFat && recipe.nutrition.fat > filters.nutrition.maxFat) return false;
      }

      return true;
    });
  }

  // Obter estatísticas de categorias
  getCategoryStats(recipes: any[]): Record<string, number> {
    const stats: Record<string, number> = {};

    recipes.forEach(recipe => {
      (recipe.category || []).forEach((category: string) => {
        stats[category] = (stats[category] || 0) + 1;
      });
    });

    return stats;
  }

  // Obter receitas trending por categoria
  getTrendingByCategory(recipes: any[], categoryId: string): any[] {
    return recipes
      .filter(recipe => recipe.category?.includes(categoryId))
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 10);
  }
}

export const recipeCategoryService = RecipeCategoryService.getInstance();