import type { Recipe } from '../types';

export interface ImportResult {
  success: boolean;
  recipe?: Recipe;
  error?: string;
  warnings?: string[];
}

export interface ScrapedRecipe {
  name: string;
  description?: string;
  ingredients: string[];
  instructions: string[];
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  image?: string;
  source?: string;
  sourceUrl: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  category?: string[];
  tags?: string[];
  nutrition?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
}


class RecipeImporterService {
  private static instance: RecipeImporterService;

  static getInstance(): RecipeImporterService {
    if (!RecipeImporterService.instance) {
      RecipeImporterService.instance = new RecipeImporterService();
    }
    return RecipeImporterService.instance;
  }

  // Importar receita de URL
  async importRecipeFromUrl(url: string): Promise<ImportResult> {
    try {
      // Validar URL
      const validationResult = this.validateUrl(url);
      if (!validationResult.isValid) {
        return {
          success: false,
          error: validationResult.error
        };
      }

      // Verificar se é um site suportado
      const siteParser = this.getSiteParser(url);
      if (siteParser) {
        return await siteParser(url);
      }

      // Fallback para parsing genérico
      return await this.parseGenericRecipe(url);
    } catch (error) {
      console.error('Error importing recipe:', error);
      return {
        success: false,
        error: 'Erro ao importar receita. Verifique a URL e tente novamente.'
      };
    }
  }

  // Importar receita de texto
  async importRecipeFromText(text: string): Promise<ImportResult> {
    try {
      const recipe = this.parseRecipeFromText(text);
      
      if (!recipe.name || recipe.ingredients.length === 0) {
        return {
          success: false,
          error: 'Texto não contém informações suficientes para criar uma receita'
        };
      }

      return {
        success: true,
        recipe: this.transformToInternalFormat(recipe)
      };
    } catch (error) {
      console.error('Error importing recipe from text:', error);
      return {
        success: false,
        error: 'Erro ao processar texto da receita'
      };
    }
  }

  // Validar URL
  private validateUrl(url: string): { isValid: boolean; error?: string } {
    try {
      const urlObj = new URL(url);
      
      // Verificar se é HTTPS
      if (urlObj.protocol !== 'https:') {
        return {
          isValid: false,
          error: 'URL deve usar HTTPS'
        };
      }

      // Verificar domínios bloqueados
      const blockedDomains = ['localhost', '127.0.0.1', '0.0.0.0'];
      if (blockedDomains.some(domain => urlObj.hostname.includes(domain))) {
        return {
          isValid: false,
          error: 'URL não é permitida'
        };
      }

      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        error: 'URL inválida'
      };
    }
  }

  // Obter parser específico para site
  private getSiteParser(url: string): ((url: string) => Promise<ImportResult>) | null {
    const hostname = new URL(url).hostname.toLowerCase();

    const parsers: Record<string, (url: string) => Promise<ImportResult>> = {
      'tudogostoso.com.br': this.parseTudoGostoso.bind(this),
      'panelinha.com.br': this.parsePanelinha.bind(this),
      'receitasnestle.com.br': this.parseNestle.bind(this),
      'cybercook.com.br': this.parseCybercook.bind(this),
      'allrecipes.com': this.parseAllRecipes.bind(this),
      'food.com': this.parseFood.bind(this),
      'epicurious.com': this.parseEpicurious.bind(this),
      'cookpad.com': this.parseCookpad.bind(this)
    };

    return parsers[hostname] || null;
  }

  // Parser genérico usando JSON-LD
  private async parseGenericRecipe(url: string): Promise<ImportResult> {
    try {
      // Em uma implementação real, usaríamos um serviço de scraping
      // Por enquanto, retornamos uma estrutura simulada
      const mockRecipe: ScrapedRecipe = {
        name: 'Receita Importada',
        description: 'Receita importada de ' + new URL(url).hostname,
        ingredients: ['Ingredientes não disponíveis'],
        instructions: ['Instruções não disponíveis'],
        sourceUrl: url,
        source: new URL(url).hostname,
        image: 'https://via.placeholder.com/400x300/64748b/ffffff?text=Receita'
      };

      return {
        success: true,
        recipe: this.transformToInternalFormat(mockRecipe),
        warnings: ['Parsing genérico - algumas informações podem estar incompletas']
      };
    } catch (error) {
      return {
        success: false,
        error: 'Não foi possível importar a receita deste site'
      };
    }
  }

  // Parser para Tudo Gostoso
  private async parseTudoGostoso(url: string): Promise<ImportResult> {
    try {
      // Simulação de parsing do Tudo Gostoso
      const mockRecipe: ScrapedRecipe = {
        name: 'Receita do Tudo Gostoso',
        description: 'Deliciosa receita brasileira',
        ingredients: [
          '2 xícaras de farinha de trigo',
          '1 xícara de açúcar',
          '3 ovos',
          '1/2 xícara de óleo',
          '1 xícara de leite',
          '1 colher de sopa de fermento em pó'
        ],
        instructions: [
          'Misture todos os ingredientes secos',
          'Adicione os líquidos e mexa bem',
          'Asse em forno pré-aquecido a 180°C por 30 minutos'
        ],
        prepTime: 15,
        cookTime: 30,
        servings: 8,
        sourceUrl: url,
        source: 'Tudo Gostoso',
        category: ['brasileira', 'doce'],
        difficulty: 'easy'
      };

      return {
        success: true,
        recipe: this.transformToInternalFormat(mockRecipe)
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao importar receita do Tudo Gostoso'
      };
    }
  }

  // Parser para Panelinha
  private async parsePanelinha(url: string): Promise<ImportResult> {
    try {
      const mockRecipe: ScrapedRecipe = {
        name: 'Receita da Panelinha',
        description: 'Receita especial da Rita Lobo',
        ingredients: [
          '500g de carne moída',
          '1 cebola picada',
          '2 tomates picados',
          '2 dentes de alho',
          'Sal e pimenta a gosto',
          'Azeite para refogar'
        ],
        instructions: [
          'Refogue a cebola e o alho no azeite',
          'Adicione a carne moída e cozinhe até dourar',
          'Acrescente os tomates e temperos',
          'Cozinhe por mais 15 minutos'
        ],
        prepTime: 10,
        cookTime: 20,
        servings: 4,
        sourceUrl: url,
        source: 'Panelinha',
        category: ['brasileira', 'principal'],
        difficulty: 'medium'
      };

      return {
        success: true,
        recipe: this.transformToInternalFormat(mockRecipe)
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao importar receita da Panelinha'
      };
    }
  }

  // Parser para Nestlé
  private async parseNestle(url: string): Promise<ImportResult> {
    try {
      const mockRecipe: ScrapedRecipe = {
        name: 'Receita Nestlé',
        description: 'Receita prática e saborosa',
        ingredients: [
          '1 lata de leite condensado',
          '1 lata de creme de leite',
          '2 colheres de sopa de chocolate em pó',
          'Chocolate granulado para decorar'
        ],
        instructions: [
          'Misture o leite condensado com o chocolate em pó',
          'Leve ao fogo mexendo sempre até engrossar',
          'Retire do fogo e adicione o creme de leite',
          'Decore com chocolate granulado'
        ],
        prepTime: 5,
        cookTime: 10,
        servings: 6,
        sourceUrl: url,
        source: 'Receitas Nestlé',
        category: ['doce', 'sobremesa'],
        difficulty: 'easy'
      };

      return {
        success: true,
        recipe: this.transformToInternalFormat(mockRecipe)
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao importar receita da Nestlé'
      };
    }
  }

  // Parser para Cybercook
  private async parseCybercook(url: string): Promise<ImportResult> {
    return this.parseGenericRecipe(url);
  }

  // Parser para AllRecipes
  private async parseAllRecipes(url: string): Promise<ImportResult> {
    return this.parseGenericRecipe(url);
  }

  // Parser para Food.com
  private async parseFood(url: string): Promise<ImportResult> {
    return this.parseGenericRecipe(url);
  }

  // Parser para Epicurious
  private async parseEpicurious(url: string): Promise<ImportResult> {
    return this.parseGenericRecipe(url);
  }

  // Parser para Cookpad
  private async parseCookpad(url: string): Promise<ImportResult> {
    return this.parseGenericRecipe(url);
  }



  // Processar receita de texto livre
  private parseRecipeFromText(text: string): ScrapedRecipe {
    const lines = text.split('\n').filter(line => line.trim());
    
    let name = '';
    let description = '';
    const ingredients: string[] = [];
    const instructions: string[] = [];
    
    let currentSection = 'name';
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.toLowerCase().includes('ingredientes')) {
        currentSection = 'ingredients';
        continue;
      }
      
      if (trimmedLine.toLowerCase().includes('modo de preparo') || 
          trimmedLine.toLowerCase().includes('preparo') ||
          trimmedLine.toLowerCase().includes('instruções')) {
        currentSection = 'instructions';
        continue;
      }
      
      switch (currentSection) {
        case 'name':
          if (!name) {
            name = trimmedLine;
            currentSection = 'description';
          }
          break;
        case 'description':
          if (trimmedLine.toLowerCase().includes('ingredientes')) {
            currentSection = 'ingredients';
          } else {
            description += (description ? ' ' : '') + trimmedLine;
          }
          break;
        case 'ingredients':
          if (trimmedLine && !trimmedLine.toLowerCase().includes('modo de preparo')) {
            ingredients.push(trimmedLine.replace(/^[-•*]\s*/, ''));
          }
          break;
        case 'instructions':
          if (trimmedLine) {
            instructions.push(trimmedLine.replace(/^\d+\.\s*/, ''));
          }
          break;
      }
    }
    
    return {
      name: name || 'Receita Importada',
      description,
      ingredients,
      instructions,
      sourceUrl: '',
      source: 'Texto'
    };
  }

  // Converter para formato interno
  private transformToInternalFormat(scraped: ScrapedRecipe): Recipe {
    return {
      id: crypto.randomUUID(),
      name: scraped.name,
      description: scraped.description || '',
      ingredients: scraped.ingredients.map(ingredient => ({
        ingredientId: crypto.randomUUID(),
        name: ingredient,
        quantity: 1,
        unit: 'unidade',
        optional: false
      })),
      instructions: scraped.instructions,
      prepTime: scraped.prepTime || 30,
      cookTime: scraped.cookTime || 30,
      servings: scraped.servings || 4,
      difficulty: scraped.difficulty || 'medium',
      category: scraped.category?.[0] || 'outros',
      tags: scraped.tags || [],
      reviews: [],
      imageUrl: scraped.image || 'https://via.placeholder.com/400x300/64748b/ffffff?text=Receita',
      source: 'internet',
      sourceUrl: scraped.sourceUrl,
      rating: 0,
      nutrition: scraped.nutrition ? {
        calories: scraped.nutrition.calories || 0,
        protein: scraped.nutrition.protein || 0,
        carbs: scraped.nutrition.carbs || 0,
        fat: scraped.nutrition.fat || 0
      } : undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }


  // Obter sites suportados
  getSupportedSites(): Array<{name: string; domain: string; logo: string}> {
    return [
      {
        name: 'Tudo Gostoso',
        domain: 'tudogostoso.com.br',
        logo: 'https://via.placeholder.com/32x32/64748b/ffffff?text=Logo'
      },
      {
        name: 'Panelinha',
        domain: 'panelinha.com.br',
        logo: 'https://via.placeholder.com/32x32/64748b/ffffff?text=Logo'
      },
      {
        name: 'Receitas Nestlé',
        domain: 'receitasnestle.com.br',
        logo: 'https://via.placeholder.com/32x32/64748b/ffffff?text=Logo'
      },
      {
        name: 'Cybercook',
        domain: 'cybercook.com.br',
        logo: 'https://via.placeholder.com/32x32/64748b/ffffff?text=Logo'
      },
      {
        name: 'AllRecipes',
        domain: 'allrecipes.com',
        logo: 'https://via.placeholder.com/32x32/64748b/ffffff?text=Logo'
      },
      {
        name: 'Food.com',
        domain: 'food.com',
        logo: 'https://via.placeholder.com/32x32/64748b/ffffff?text=Logo'
      },
      {
        name: 'Epicurious',
        domain: 'epicurious.com',
        logo: 'https://via.placeholder.com/32x32/64748b/ffffff?text=Logo'
      },
      {
        name: 'Cookpad',
        domain: 'cookpad.com',
        logo: 'https://via.placeholder.com/32x32/64748b/ffffff?text=Logo'
      }
    ];
  }

  // Validar receita importada
  validateImportedRecipe(recipe: Recipe): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];

    if (!recipe.name || recipe.name.trim().length < 3) {
      issues.push('Nome da receita deve ter pelo menos 3 caracteres');
    }

    if (!recipe.ingredients || recipe.ingredients.length === 0) {
      issues.push('Receita deve ter pelo menos 1 ingrediente');
    }

    if (!recipe.instructions || recipe.instructions.length === 0) {
      issues.push('Receita deve ter pelo menos 1 instrução');
    }

    if (recipe.prepTime <= 0 || recipe.cookTime <= 0) {
      issues.push('Tempos de preparo e cozimento devem ser maiores que 0');
    }

    if (recipe.servings <= 0) {
      issues.push('Número de porções deve ser maior que 0');
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }
}

export const recipeImporter = RecipeImporterService.getInstance();