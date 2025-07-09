import { dbService } from './database';
import type { Event, Recipe } from '../types';

export interface EventTemplate {
  id: string;
  name: string;
  description: string;
  category: 'holiday' | 'celebration' | 'seasonal' | 'custom';
  icon: string;
  defaultGuestCount: number;
  suggestedRecipes: string[];
  preparationDays: number;
  menuStructure: MenuSection[];
  shoppingAdvance: number;
}

export interface MenuSection {
  id: string;
  name: string;
  order: number;
  required: boolean;
  recipeSuggestions: string[];
  estimatedServingTime?: string;
}

export interface EventPlanning {
  eventId: string;
  timeline: EventTask[];
  menu: PlannedMenu;
  shopping: EventShoppingList;
  budgetEstimate: number;
}

export interface EventTask {
  id: string;
  name: string;
  description: string;
  dueDate: Date;
  category: 'shopping' | 'preparation' | 'cooking' | 'setup' | 'other';
  isCompleted: boolean;
  estimatedTime: number;
  dependencies?: string[];
}

export interface PlannedMenu {
  sections: PlannedMenuSection[];
  totalRecipes: number;
  estimatedCost: number;
  preparationTime: number;
  servingOrder: string[];
}

export interface PlannedMenuSection {
  sectionId: string;
  name: string;
  recipes: Recipe[];
  notes?: string;
  servingTime?: string;
}

export interface EventShoppingList {
  items: EventShoppingItem[];
  totalCost: number;
  categories: string[];
  lastUpdated: Date;
}

export interface EventShoppingItem {
  ingredientName: string;
  quantity: number;
  unit: string;
  category: string;
  estimatedCost: number;
  isPurchased: boolean;
  priority: 'high' | 'medium' | 'low';
  notes?: string;
}

class EventManagerService {
  private static instance: EventManagerService;

  static getInstance(): EventManagerService {
    if (!EventManagerService.instance) {
      EventManagerService.instance = new EventManagerService();
    }
    return EventManagerService.instance;
  }

  // Buscar templates de eventos
  async getEventTemplates(): Promise<EventTemplate[]> {
    return [
      {
        id: 'christmas-dinner',
        name: 'Ceia de Natal',
        description: 'Ceia tradicional de Natal para a família',
        category: 'holiday',
        icon: '🎄',
        defaultGuestCount: 8,
        suggestedRecipes: ['roasted-turkey', 'glazed-ham', 'potato-gratin'],
        preparationDays: 3,
        menuStructure: [
          {
            id: 'appetizers',
            name: 'Entradas',
            order: 1,
            required: false,
            recipeSuggestions: ['cheese-board', 'shrimp-cocktail'],
            estimatedServingTime: '19:00'
          },
          {
            id: 'main-course',
            name: 'Prato Principal',
            order: 2,
            required: true,
            recipeSuggestions: ['roasted-turkey', 'glazed-ham'],
            estimatedServingTime: '20:00'
          },
          {
            id: 'sides',
            name: 'Acompanhamentos',
            order: 3,
            required: true,
            recipeSuggestions: ['potato-gratin', 'green-beans'],
            estimatedServingTime: '20:00'
          },
          {
            id: 'desserts',
            name: 'Sobremesas',
            order: 4,
            required: false,
            recipeSuggestions: ['christmas-cake', 'pudding'],
            estimatedServingTime: '21:30'
          }
        ],
        shoppingAdvance: 2
      },
      {
        id: 'birthday-party',
        name: 'Festa de Aniversário',
        description: 'Celebração de aniversário',
        category: 'celebration',
        icon: '🎂',
        defaultGuestCount: 12,
        suggestedRecipes: ['birthday-cake', 'party-snacks'],
        preparationDays: 1,
        menuStructure: [
          {
            id: 'snacks',
            name: 'Lanches',
            order: 1,
            required: true,
            recipeSuggestions: ['party-sandwiches', 'mini-quiches']
          },
          {
            id: 'main',
            name: 'Prato Principal',
            order: 2,
            required: false,
            recipeSuggestions: ['pizza', 'pasta-buffet']
          },
          {
            id: 'cake',
            name: 'Bolo',
            order: 3,
            required: true,
            recipeSuggestions: ['birthday-cake', 'cupcakes']
          }
        ],
        shoppingAdvance: 1
      },
      {
        id: 'bbq-party',
        name: 'Churrasco',
        description: 'Churrasco para amigos e família',
        category: 'seasonal',
        icon: '🔥',
        defaultGuestCount: 15,
        suggestedRecipes: ['grilled-meat', 'bbq-sides'],
        preparationDays: 1,
        menuStructure: [
          {
            id: 'grilled',
            name: 'Grelhados',
            order: 1,
            required: true,
            recipeSuggestions: ['beef-steaks', 'chicken-wings', 'sausages']
          },
          {
            id: 'salads',
            name: 'Saladas',
            order: 2,
            required: true,
            recipeSuggestions: ['potato-salad', 'coleslaw', 'green-salad']
          },
          {
            id: 'drinks',
            name: 'Bebidas',
            order: 3,
            required: false,
            recipeSuggestions: ['sangria', 'lemonade']
          }
        ],
        shoppingAdvance: 1
      }
    ];
  }

  // Criar evento a partir de template
  async createEventFromTemplate(
    templateId: string,
    eventDate: Date,
    guestCount: number,
    customizations?: Partial<Event>
  ): Promise<string> {
    const template = await this.getEventTemplate(templateId);
    if (!template) throw new Error('Template não encontrado');

    const event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'> = {
      name: customizations?.name || template.name,
      date: eventDate,
      guestCount,
      recipes: template.suggestedRecipes,
      notes: customizations?.notes || `Evento criado a partir do template: ${template.name}`,
      ...customizations
    };

    return await dbService.addEvent(event);
  }

  // Gerar planejamento completo do evento
  async generateEventPlanning(eventId: string): Promise<EventPlanning> {
    const events = await dbService.getEvents();
    const event = events.find(e => e.id === eventId);
    if (!event) throw new Error('Evento não encontrado');

    const recipes = await Promise.all(
      event.recipes.map((id: string) => dbService.getRecipeById(id))
    );
    const validRecipes = recipes.filter(Boolean) as Recipe[];

    // Gerar timeline de tarefas
    const timeline = this.generateEventTimeline(event, validRecipes);
    
    // Gerar menu estruturado
    const menu = this.generatePlannedMenu(validRecipes);
    
    // Gerar lista de compras
    const shopping = this.generateEventShoppingList(validRecipes, event.guestCount);
    
    // Estimar orçamento
    const budgetEstimate = this.calculateEventBudget(shopping);

    return {
      eventId,
      timeline,
      menu,
      shopping,
      budgetEstimate
    };
  }

  private async getEventTemplate(templateId: string): Promise<EventTemplate | null> {
    const templates = await this.getEventTemplates();
    return templates.find(t => t.id === templateId) || null;
  }

  private generateEventTimeline(event: Event, recipes: Recipe[]): EventTask[] {
    const tasks: EventTask[] = [];
    const eventDate = new Date(event.date);

    // Task de compras (2 dias antes)
    const shoppingDate = new Date(eventDate);
    shoppingDate.setDate(shoppingDate.getDate() - 2);
    
    tasks.push({
      id: 'shopping',
      name: 'Fazer Compras',
      description: 'Comprar todos os ingredientes necessários',
      dueDate: shoppingDate,
      category: 'shopping',
      isCompleted: false,
      estimatedTime: 120
    });

    // Tasks de preparação (1 dia antes)
    const prepDate = new Date(eventDate);
    prepDate.setDate(prepDate.getDate() - 1);
    
    tasks.push({
      id: 'prep-day',
      name: 'Preparações Antecipadas',
      description: 'Preparar ingredientes e receitas que podem ser feitas com antecedência',
      dueDate: prepDate,
      category: 'preparation',
      isCompleted: false,
      estimatedTime: 180,
      dependencies: ['shopping']
    });

    // Tasks do dia do evento
    recipes.forEach((recipe, index) => {
      const cookingTime = new Date(eventDate);
      cookingTime.setHours(cookingTime.getHours() - (recipes.length - index));

      tasks.push({
        id: `cook-${recipe.id}`,
        name: `Preparar ${recipe.name}`,
        description: `Executar receita: ${recipe.name}`,
        dueDate: cookingTime,
        category: 'cooking',
        isCompleted: false,
        estimatedTime: recipe.prepTime + recipe.cookTime,
        dependencies: ['prep-day']
      });
    });

    // Task de montagem final
    const setupTime = new Date(eventDate);
    setupTime.setHours(setupTime.getHours() - 1);
    
    tasks.push({
      id: 'final-setup',
      name: 'Montagem Final',
      description: 'Organizar mesa, decoração e apresentação final',
      dueDate: setupTime,
      category: 'setup',
      isCompleted: false,
      estimatedTime: 60,
      dependencies: tasks.filter(t => t.category === 'cooking').map(t => t.id)
    });

    return tasks.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  }

  private generatePlannedMenu(recipes: Recipe[]): PlannedMenu {
    const sections: PlannedMenuSection[] = [
      {
        sectionId: 'main',
        name: 'Pratos Principais',
        recipes: recipes.filter(r => r.category.includes('main') || r.category.includes('principal')),
        servingTime: '20:00'
      },
      {
        sectionId: 'sides',
        name: 'Acompanhamentos',
        recipes: recipes.filter(r => r.category.includes('side') || r.category.includes('acompanhamento')),
        servingTime: '20:00'
      },
      {
        sectionId: 'desserts',
        name: 'Sobremesas',
        recipes: recipes.filter(r => r.category.includes('dessert') || r.category.includes('sobremesa')),
        servingTime: '21:30'
      }
    ];

    // Se não há categorização clara, colocar tudo como principal
    if (sections.every(s => s.recipes.length === 0)) {
      sections[0].recipes = recipes;
    }

    const totalPreparationTime = recipes.reduce((sum, recipe) => 
      sum + recipe.prepTime + recipe.cookTime, 0
    );

    return {
      sections: sections.filter(s => s.recipes.length > 0),
      totalRecipes: recipes.length,
      estimatedCost: recipes.length * 35, // R$ 35 por receita estimado
      preparationTime: totalPreparationTime,
      servingOrder: sections.map(s => s.sectionId)
    };
  }

  private generateEventShoppingList(recipes: Recipe[], guestCount: number): EventShoppingList {
    const ingredientMap = new Map<string, EventShoppingItem>();

    recipes.forEach(recipe => {
      recipe.ingredients.forEach(ingredient => {
        // Calcular quantidade necessária baseado no número de convidados
        const scaleFactor = guestCount / recipe.servings;
        const neededQuantity = ingredient.quantity * scaleFactor;

        const key = ingredient.name.toLowerCase();
        if (ingredientMap.has(key)) {
          const existing = ingredientMap.get(key)!;
          existing.quantity += neededQuantity;
        } else {
          ingredientMap.set(key, {
            ingredientName: ingredient.name,
            quantity: neededQuantity,
            unit: ingredient.unit,
            category: this.categorizeIngredient(ingredient.name),
            estimatedCost: this.estimateIngredientCost(ingredient.name, neededQuantity),
            isPurchased: false,
            priority: ingredient.optional ? 'low' : 'high'
          });
        }
      });
    });

    const itemsArray = Array.from(ingredientMap.values());
    const totalCost = itemsArray.reduce((sum, item) => sum + item.estimatedCost, 0);
    const categories = [...new Set(itemsArray.map(item => item.category))];

    return {
      items: itemsArray,
      totalCost,
      categories,
      lastUpdated: new Date()
    };
  }

  private calculateEventBudget(shopping: EventShoppingList): number {
    // Adicionar margem de 20% ao custo dos ingredientes
    const ingredientCost = shopping.totalCost;
    const margin = ingredientCost * 0.2;
    const decorationCost = 50; // Estimativa para decoração
    const miscCost = 30; // Custos diversos

    return ingredientCost + margin + decorationCost + miscCost;
  }

  private categorizeIngredient(name: string): string {
    const categories = {
      'meat': ['carne', 'frango', 'peixe', 'beef', 'chicken', 'fish'],
      'vegetables': ['tomate', 'cebola', 'alho', 'batata', 'cenoura'],
      'dairy': ['leite', 'queijo', 'manteiga', 'creme'],
      'pantry': ['farinha', 'açúcar', 'sal', 'óleo', 'tempero'],
      'beverages': ['vinho', 'suco', 'água', 'refrigerante']
    };

    const lowerName = name.toLowerCase();
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => lowerName.includes(keyword))) {
        return category;
      }
    }
    return 'other';
  }

  private estimateIngredientCost(name: string, quantity: number): number {
    const baseCosts: Record<string, number> = {
      'meat': 25,
      'vegetables': 3,
      'dairy': 8,
      'pantry': 5,
      'beverages': 10,
      'other': 7
    };

    const category = this.categorizeIngredient(name);
    const baseCost = baseCosts[category] || baseCosts.other;
    
    return baseCost * Math.max(quantity, 1);
  }

  // Métodos públicos para gerenciar eventos
  async updateEventTask(eventId: string, taskId: string, isCompleted: boolean): Promise<void> {
    console.log('Updating task:', eventId, taskId, isCompleted);
    // Em implementação real, salvaria no banco
  }

  async updateShoppingItem(eventId: string, itemName: string, isPurchased: boolean): Promise<void> {
    console.log('Updating shopping item:', eventId, itemName, isPurchased);
    // Em implementação real, salvaria no banco
  }

  async getEventSuggestions(season: string): Promise<EventTemplate[]> {
    const templates = await this.getEventTemplates();
    
    // Filtrar por época do ano
    const seasonalEvents = {
      'winter': ['christmas-dinner'],
      'summer': ['bbq-party'],
      'spring': ['easter-lunch'],
      'fall': ['thanksgiving-dinner']
    };

    const seasonalIds = seasonalEvents[season as keyof typeof seasonalEvents] || [];
    return templates.filter(t => seasonalIds.includes(t.id) || t.category === 'celebration');
  }
}

export const eventManager = EventManagerService.getInstance();