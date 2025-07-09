import { dbService } from './database';
import type { ShoppingListItem, Ingredient, Recipe, MealPlan } from '../types';

export interface ShoppingOptimization {
  route: ShoppingRoute;
  costAnalysis: CostAnalysis;
  suggestions: ShoppingSuggestion[];
  timing: ShoppingTiming;
}

export interface ShoppingRoute {
  totalDistance: number;
  estimatedTime: number;
  stores: OptimizedStore[];
  items: ShoppingListItem[];
}

export interface OptimizedStore {
  id: string;
  name: string;
  address: string;
  items: ShoppingListItem[];
  estimatedCost: number;
  rating: number;
  distance: number;
}

export interface CostAnalysis {
  totalBudget: number;
  estimatedCost: number;
  savings: number;
  alternatives: CostAlternative[];
  priceComparison: PriceComparison[];
}

export interface CostAlternative {
  item: ShoppingListItem;
  alternatives: Array<{
    name: string;
    price: number;
    savings: number;
    quality: 'higher' | 'similar' | 'lower';
  }>;
}

export interface PriceComparison {
  item: ShoppingListItem;
  stores: Array<{
    storeName: string;
    price: number;
    availability: boolean;
  }>;
}

export interface ShoppingSuggestion {
  id: string;
  type: 'bulk_buy' | 'seasonal' | 'promotion' | 'substitute' | 'timing';
  title: string;
  description: string;
  savings: number;
  priority: 'high' | 'medium' | 'low';
  item?: ShoppingListItem;
  data?: any;
}

export interface ShoppingTiming {
  bestDay: string;
  bestTime: string;
  crowdLevel: 'low' | 'medium' | 'high';
  promotionDays: string[];
  reasoning: string;
}

class ShoppingOptimizerService {
  private static instance: ShoppingOptimizerService;

  static getInstance(): ShoppingOptimizerService {
    if (!ShoppingOptimizerService.instance) {
      ShoppingOptimizerService.instance = new ShoppingOptimizerService();
    }
    return ShoppingOptimizerService.instance;
  }

  async optimizeShoppingList(): Promise<ShoppingOptimization> {
    try {
      const [shoppingList, ingredients, recipes, mealPlans] = await Promise.all([
        dbService.getShoppingList(),
        dbService.getIngredients(),
        dbService.getRecipes(),
        this.getUpcomingMealPlans()
      ]);

      // Analisar lista de compras atual
      const enrichedList = await this.enrichShoppingList(shoppingList, ingredients);
      
      // Otimizar rota de compras
      const route = await this.optimizeShoppingRoute(enrichedList);
      
      // Análise de custos
      const costAnalysis = await this.analyzeCosts(enrichedList);
      
      // Gerar sugestões inteligentes
      const suggestions = await this.generateShoppingSuggestions(
        enrichedList, 
        ingredients, 
        recipes, 
        mealPlans
      );
      
      // Otimizar timing de compras
      const timing = await this.optimizeShoppingTiming(enrichedList);

      return {
        route,
        costAnalysis,
        suggestions,
        timing
      };
    } catch (error) {
      console.error('Erro ao otimizar lista de compras:', error);
      throw error;
    }
  }

  private async enrichShoppingList(
    shoppingList: ShoppingListItem[], 
    ingredients: Ingredient[]
  ): Promise<ShoppingListItem[]> {
    return shoppingList.map(item => {
      // Verificar se já temos o item em estoque
      const existingIngredient = ingredients.find(ing => 
        ing.name.toLowerCase().includes(item.name.toLowerCase())
      );

      return {
        ...item,
        // Adicionar informações extras
        estimatedPrice: this.estimateItemPrice(item),
        priority: this.calculateItemPriority(item, existingIngredient),
        category: this.categorizeItem(item),
        alternatives: this.findAlternatives(item)
      };
    });
  }

  private async optimizeShoppingRoute(items: ShoppingListItem[]): Promise<ShoppingRoute> {
    // Simular dados de lojas (em uma implementação real, viria de APIs)
    const stores: OptimizedStore[] = [
      {
        id: 'supermarket-1',
        name: 'Supermercado Extra',
        address: 'Av. Principal, 123',
        items: items.filter(() => Math.random() > 0.3), // 70% dos itens disponíveis
        estimatedCost: items.reduce((sum, item) => sum + (item.estimatedPrice || 10), 0) * 0.9,
        rating: 4.2,
        distance: 2.5
      },
      {
        id: 'supermarket-2',
        name: 'Mercado São João',
        address: 'Rua das Flores, 456',
        items: items.filter(() => Math.random() > 0.2), // 80% dos itens disponíveis
        estimatedCost: items.reduce((sum, item) => sum + (item.estimatedPrice || 10), 0) * 0.85,
        rating: 4.5,
        distance: 1.8
      },
      {
        id: 'organic-store',
        name: 'Empório Orgânico',
        address: 'Praça Verde, 789',
        items: items.filter(item => item.category === 'vegetables' || item.category === 'fruits'),
        estimatedCost: items.filter(item => item.category === 'vegetables' || item.category === 'fruits')
          .reduce((sum, item) => sum + (item.estimatedPrice || 15), 0) * 1.2,
        rating: 4.8,
        distance: 3.2
      }
    ];

    // Algoritmo simples de otimização de rota
    const optimizedStores = this.optimizeStoreSelection(stores, items);
    
    return {
      totalDistance: optimizedStores.reduce((sum, store) => sum + store.distance, 0),
      estimatedTime: optimizedStores.length * 30 + (optimizedStores.reduce((sum, store) => sum + store.distance, 0) * 5),
      stores: optimizedStores,
      items
    };
  }

  private optimizeStoreSelection(stores: OptimizedStore[], _items: ShoppingListItem[]): OptimizedStore[] {
    // Algoritmo simples: priorizar lojas com melhor custo-benefício
    return stores
      .filter(store => store.items.length > 0)
      .sort((a, b) => {
        const scoreA = (a.rating * 0.3) + ((100 - a.estimatedCost / 10) * 0.4) + ((10 - a.distance) * 0.3);
        const scoreB = (b.rating * 0.3) + ((100 - b.estimatedCost / 10) * 0.4) + ((10 - b.distance) * 0.3);
        return scoreB - scoreA;
      })
      .slice(0, 2); // Máximo 2 lojas para simplificar
  }

  private async analyzeCosts(items: ShoppingListItem[]): Promise<CostAnalysis> {
    const estimatedCost = items.reduce((sum, item) => sum + (item.estimatedPrice || 10), 0);
    const budget = estimatedCost * 1.2; // 20% de margem
    
    const alternatives = items
      .filter(item => item.alternatives && item.alternatives.length > 0)
      .map(item => ({
        item,
        alternatives: item.alternatives || []
      }));

    const priceComparison = items.map(item => ({
      item,
      stores: [
        { storeName: 'Supermercado Extra', price: item.estimatedPrice || 10, availability: true },
        { storeName: 'Mercado São João', price: (item.estimatedPrice || 10) * 0.95, availability: true },
        { storeName: 'Empório Orgânico', price: (item.estimatedPrice || 10) * 1.15, availability: Math.random() > 0.3 }
      ]
    }));

    const potentialSavings = alternatives.reduce((sum, alt) => {
      const bestAlternative = alt.alternatives.reduce((best, current) => 
        current.savings > best.savings ? current : best, 
        { savings: 0 } as any
      );
      return sum + bestAlternative.savings;
    }, 0);

    return {
      totalBudget: budget,
      estimatedCost,
      savings: potentialSavings,
      alternatives: alternatives as CostAlternative[],
      priceComparison
    };
  }

  private async generateShoppingSuggestions(
    shoppingList: ShoppingListItem[],
    ingredients: Ingredient[],
    _recipes: Recipe[],
    _mealPlans: MealPlan[]
  ): Promise<ShoppingSuggestion[]> {
    const suggestions: ShoppingSuggestion[] = [];

    // Sugestão de compra em quantidade
    const bulkItems = shoppingList.filter(item => this.isBulkWorthy(item));
    bulkItems.forEach(item => {
      suggestions.push({
        id: `bulk-${item.id}`,
        type: 'bulk_buy',
        title: `💰 Comprar ${item.name} em quantidade`,
        description: `Economize 15% comprando pacote familiar de ${item.name}`,
        savings: (item.estimatedPrice || 10) * 0.15,
        priority: 'medium',
        item,
        data: { bulkSize: item.quantity * 3, savingsPercentage: 15 }
      });
    });

    // Sugestões sazonais
    const seasonalItems = this.getSeasonalSuggestions();
    seasonalItems.forEach(suggestion => suggestions.push(suggestion));

    // Sugestões de substituição
    const substitutions = this.getSubstitutionSuggestions(shoppingList, ingredients);
    substitutions.forEach(suggestion => suggestions.push(suggestion));

    // Sugestão de timing
    if (this.isWeekend()) {
      suggestions.push({
        id: 'timing-weekend',
        type: 'timing',
        title: '⏰ Melhor horário para compras',
        description: 'Evite multidões: compre entre 8h-10h ou após 20h',
        savings: 0,
        priority: 'low',
        data: { bestTimes: ['08:00-10:00', '20:00-22:00'] }
      });
    }

    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }).slice(0, 6);
  }

  private async optimizeShoppingTiming(_items: ShoppingListItem[]): Promise<ShoppingTiming> {
    const today = new Date();
    const dayOfWeek = today.getDay();
    
    // Lógica simples para determinar melhor timing
    const bestDay = dayOfWeek === 0 || dayOfWeek === 6 ? 'Terça-feira' : 'Hoje';
    const bestTime = dayOfWeek === 0 || dayOfWeek === 6 ? '09:00' : '19:00';
    
    return {
      bestDay,
      bestTime,
      crowdLevel: dayOfWeek === 0 || dayOfWeek === 6 ? 'high' : 'medium',
      promotionDays: ['Quarta-feira', 'Quinta-feira'],
      reasoning: dayOfWeek === 0 || dayOfWeek === 6 
        ? 'Fins de semana são mais movimentados. Prefira terças-feiras pela manhã.'
        : 'Horário ideal para evitar filas e encontrar produtos frescos.'
    };
  }

  // Helper methods
  private estimateItemPrice(item: ShoppingListItem): number {
    // Preços base estimados por categoria
    const basePrices: Record<string, number> = {
      'vegetables': 8,
      'fruits': 12,
      'meat': 25,
      'dairy': 15,
      'grains': 10,
      'seasonings': 5,
      'beverages': 8,
      'cleaning': 12,
      'other': 10
    };
    
    const category = this.categorizeItem(item);
    const basePrice = basePrices[category] || 10;
    
    // Ajustar por quantidade
    return basePrice * (item.quantity || 1);
  }

  private calculateItemPriority(_item: ShoppingListItem, existingIngredient?: Ingredient): 'high' | 'medium' | 'low' {
    if (!existingIngredient || existingIngredient.quantity === 0) {
      return 'high'; // Item essencial que não temos
    }
    
    if (existingIngredient.quantity < 2) {
      return 'medium'; // Estoque baixo
    }
    
    return 'low'; // Temos suficiente
  }

  private categorizeItem(item: ShoppingListItem): string {
    const name = item.name.toLowerCase();
    
    if (name.includes('carne') || name.includes('frango') || name.includes('peixe')) return 'meat';
    if (name.includes('leite') || name.includes('queijo') || name.includes('iogurte')) return 'dairy';
    if (name.includes('tomate') || name.includes('cebola') || name.includes('alface')) return 'vegetables';
    if (name.includes('banana') || name.includes('maçã') || name.includes('laranja')) return 'fruits';
    if (name.includes('arroz') || name.includes('feijão') || name.includes('macarrão')) return 'grains';
    if (name.includes('sal') || name.includes('açúcar') || name.includes('tempero')) return 'seasonings';
    if (name.includes('água') || name.includes('suco') || name.includes('refrigerante')) return 'beverages';
    if (name.includes('detergente') || name.includes('sabão')) return 'cleaning';
    
    return 'other';
  }

  private findAlternatives(item: ShoppingListItem): Array<{name: string; price: number; savings: number; quality: 'higher' | 'similar' | 'lower'}> {
    const basePrice = item.estimatedPrice || 10;
    
    // Sugestões genéricas de alternativas
    return [
      {
        name: `${item.name} (marca própria)`,
        price: basePrice * 0.7,
        savings: basePrice * 0.3,
        quality: 'similar'
      },
      {
        name: `${item.name} (orgânico)`,
        price: basePrice * 1.3,
        savings: 0,
        quality: 'higher'
      }
    ];
  }

  private isBulkWorthy(item: ShoppingListItem): boolean {
    const category = this.categorizeItem(item);
    const bulkCategories = ['grains', 'cleaning', 'seasonings'];
    return bulkCategories.includes(category) && (item.quantity || 1) >= 2;
  }

  private getSeasonalSuggestions(): ShoppingSuggestion[] {
    const month = new Date().getMonth();
    const suggestions: ShoppingSuggestion[] = [];
    
    // Sugestões sazonais baseadas no mês
    if (month >= 11 || month <= 1) { // Verão
      suggestions.push({
        id: 'seasonal-summer',
        type: 'seasonal',
        title: '🌞 Frutas da estação em promoção',
        description: 'Aproveite: manga, abacaxi e melancia estão mais baratos',
        savings: 20,
        priority: 'medium',
        data: { fruits: ['manga', 'abacaxi', 'melancia'] }
      });
    } else if (month >= 5 && month <= 7) { // Inverno
      suggestions.push({
        id: 'seasonal-winter',
        type: 'seasonal',
        title: '🍲 Ingredientes para sopas',
        description: 'Época ideal para abóbora, mandioca e batata-doce',
        savings: 15,
        priority: 'medium',
        data: { vegetables: ['abóbora', 'mandioca', 'batata-doce'] }
      });
    }
    
    return suggestions;
  }

  private getSubstitutionSuggestions(
    shoppingList: ShoppingListItem[], 
    ingredients: Ingredient[]
  ): ShoppingSuggestion[] {
    const suggestions: ShoppingSuggestion[] = [];
    
    shoppingList.forEach(item => {
      // Verificar se temos ingredientes similares em estoque
      const similar = ingredients.find(ing => 
        ing.quantity > 0 && 
        this.areIngredientsSimilar(item.name, ing.name)
      );
      
      if (similar) {
        suggestions.push({
          id: `substitute-${item.id}`,
          type: 'substitute',
          title: `🔄 Use ${similar.name} que você já tem`,
          description: `Em vez de comprar ${item.name}, use ${similar.name} do seu estoque`,
          savings: item.estimatedPrice || 10,
          priority: 'high',
          item,
          data: { substitute: similar.name }
        });
      }
    });
    
    return suggestions;
  }

  private areIngredientsSimilar(name1: string, name2: string): boolean {
    const similar = [
      ['cebola', 'cebola roxa'],
      ['tomate', 'tomate cereja'],
      ['alface', 'rúcula'],
      ['limão', 'lima'],
      ['açúcar', 'açúcar cristal', 'açúcar refinado']
    ];
    
    return similar.some(group => 
      group.includes(name1.toLowerCase()) && group.includes(name2.toLowerCase())
    );
  }

  private isWeekend(): boolean {
    const today = new Date().getDay();
    return today === 0 || today === 6;
  }

  private async getUpcomingMealPlans(): Promise<MealPlan[]> {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7); // Próximos 7 dias
    return dbService.getMealPlans(startDate, endDate);
  }
}

export const shoppingOptimizer = ShoppingOptimizerService.getInstance();