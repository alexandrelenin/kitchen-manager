import Dexie, { type Table } from 'dexie';
import type {
  HouseMember,
  Ingredient,
  Recipe,
  MealPlan,
  ShoppingListItem,
  Event,
  Settings,
} from '../types';

export class KitchenDatabase extends Dexie {
  houseMembers!: Table<HouseMember>;
  ingredients!: Table<Ingredient>;
  recipes!: Table<Recipe>;
  mealPlans!: Table<MealPlan>;
  shoppingList!: Table<ShoppingListItem>;
  events!: Table<Event>;
  settings!: Table<Settings>;

  constructor() {
    super('KitchenManagerDB');
    this.version(1).stores({
      houseMembers: '++id, name, isActive',
      ingredients: '++id, name, category, expirationDate',
      recipes: '++id, name, category, difficulty, rating, source',
      mealPlans: '++id, date, meal, recipeId',
      shoppingList: '++id, name, category, isPurchased, isGenerated',
      events: '++id, name, date',
      settings: '++id',
    });
  }
}

export const db = new KitchenDatabase();

// Database service functions
export const dbService = {
  // House Members
  async addHouseMember(member: Omit<HouseMember, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = new Date();
    const id = await db.houseMembers.add({
      ...member,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    });
    return id as string;
  },

  async getHouseMembers(): Promise<HouseMember[]> {
    return db.houseMembers.where('isActive').equals(1).toArray();
  },

  async updateHouseMember(id: string, updates: Partial<HouseMember>): Promise<void> {
    await db.houseMembers.update(id, {
      ...updates,
      updatedAt: new Date(),
    });
  },

  async deleteHouseMember(id: string): Promise<void> {
    await db.houseMembers.update(id, { isActive: false, updatedAt: new Date() });
  },

  // Ingredients
  async addIngredient(ingredient: Omit<Ingredient, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = new Date();
    const id = await db.ingredients.add({
      ...ingredient,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    });
    return id as string;
  },

  async getIngredients(): Promise<Ingredient[]> {
    return db.ingredients.orderBy('name').toArray();
  },

  async getIngredientsByCategory(category: string): Promise<Ingredient[]> {
    return db.ingredients.where('category').equals(category).toArray();
  },

  async getExpiringIngredients(days: number = 7): Promise<Ingredient[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    return db.ingredients
      .where('expirationDate')
      .below(futureDate)
      .toArray();
  },

  async updateIngredient(id: string, updates: Partial<Ingredient>): Promise<void> {
    await db.ingredients.update(id, {
      ...updates,
      updatedAt: new Date(),
    });
  },

  async deleteIngredient(id: string): Promise<void> {
    await db.ingredients.delete(id);
  },

  // Recipes
  async addRecipe(recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = new Date();
    const id = await db.recipes.add({
      ...recipe,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    });
    return id as string;
  },

  async getRecipes(): Promise<Recipe[]> {
    return db.recipes.orderBy('name').toArray();
  },

  async getRecipesByCategory(category: string): Promise<Recipe[]> {
    return db.recipes.where('category').equals(category).toArray();
  },

  async getRecipeById(id: string): Promise<Recipe | undefined> {
    return db.recipes.get(id);
  },

  async searchRecipes(query: string): Promise<Recipe[]> {
    return db.recipes
      .filter(recipe => 
        recipe.name.toLowerCase().includes(query.toLowerCase()) ||
        recipe.description.toLowerCase().includes(query.toLowerCase()) ||
        recipe.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      )
      .toArray();
  },

  async updateRecipe(id: string, updates: Partial<Recipe>): Promise<void> {
    await db.recipes.update(id, {
      ...updates,
      updatedAt: new Date(),
    });
  },

  async deleteRecipe(id: string): Promise<void> {
    await db.recipes.delete(id);
  },

  // Meal Plans
  async addMealPlan(mealPlan: Omit<MealPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = new Date();
    const id = await db.mealPlans.add({
      ...mealPlan,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    });
    return id as string;
  },

  async getMealPlans(startDate: Date, endDate: Date): Promise<MealPlan[]> {
    return db.mealPlans
      .where('date')
      .between(startDate, endDate)
      .toArray();
  },

  async getMealPlanByDate(date: Date): Promise<MealPlan[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return db.mealPlans
      .where('date')
      .between(startOfDay, endOfDay)
      .toArray();
  },

  async updateMealPlan(id: string, updates: Partial<MealPlan>): Promise<void> {
    await db.mealPlans.update(id, {
      ...updates,
      updatedAt: new Date(),
    });
  },

  async deleteMealPlan(id: string): Promise<void> {
    await db.mealPlans.delete(id);
  },

  // Shopping List
  async addShoppingListItem(item: Omit<ShoppingListItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = new Date();
    const id = await db.shoppingList.add({
      ...item,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    });
    return id as string;
  },

  async getShoppingList(): Promise<ShoppingListItem[]> {
    return db.shoppingList.orderBy('category').toArray();
  },

  async updateShoppingListItem(id: string, updates: Partial<ShoppingListItem>): Promise<void> {
    await db.shoppingList.update(id, {
      ...updates,
      updatedAt: new Date(),
    });
  },

  async deleteShoppingListItem(id: string): Promise<void> {
    await db.shoppingList.delete(id);
  },

  async clearShoppingList(): Promise<void> {
    await db.shoppingList.clear();
  },

  // Events
  async addEvent(event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = new Date();
    const id = await db.events.add({
      ...event,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    });
    return id as string;
  },

  async getEvents(): Promise<Event[]> {
    return db.events.orderBy('date').toArray();
  },

  async getEventById(id: string): Promise<Event | undefined> {
    return db.events.get(id);
  },

  async updateEvent(id: string, updates: Partial<Event>): Promise<void> {
    await db.events.update(id, {
      ...updates,
      updatedAt: new Date(),
    });
  },

  async deleteEvent(id: string): Promise<void> {
    await db.events.delete(id);
  },

  // Settings
  async getSettings(): Promise<Settings | undefined> {
    return db.settings.orderBy('id').first();
  },

  async updateSettings(updates: Partial<Settings>): Promise<void> {
    const existing = await this.getSettings();
    if (existing) {
      await db.settings.update(existing.id, {
        ...updates,
        updatedAt: new Date(),
      });
    } else {
      const now = new Date();
      await db.settings.add({
        id: crypto.randomUUID(),
        householdSize: 4,
        preferredMealTimes: ['breakfast', 'lunch', 'dinner'],
        defaultServings: 4,
        shoppingDays: ['saturday'],
        currency: 'BRL',
        createdAt: now,
        updatedAt: now,
        ...updates,
      });
    }
  },

  // Utility functions
  async generateShoppingList(startDate: Date, endDate: Date): Promise<void> {
    const mealPlans = await this.getMealPlans(startDate, endDate);
    const ingredients = await this.getIngredients();
    const recipes = await this.getRecipes();
    
    const shoppingItems = new Map<string, ShoppingListItem>();
    
    for (const mealPlan of mealPlans) {
      const recipe = recipes.find(r => r.id === mealPlan.recipeId);
      if (!recipe) continue;
      
      for (const recipeIngredient of recipe.ingredients) {
        const ingredient = ingredients.find(i => i.id === recipeIngredient.ingredientId);
        if (!ingredient) continue;
        
        const requiredQuantity = (recipeIngredient.quantity / recipe.servings) * mealPlan.servings;
        const availableQuantity = ingredient.quantity || 0;
        const neededQuantity = Math.max(0, requiredQuantity - availableQuantity);
        
        if (neededQuantity > 0) {
          const key = `${recipeIngredient.name}-${recipeIngredient.unit}`;
          const existingItem = shoppingItems.get(key);
          
          if (existingItem) {
            existingItem.quantity += neededQuantity;
          } else {
            shoppingItems.set(key, {
              id: crypto.randomUUID(),
              name: recipeIngredient.name,
              quantity: neededQuantity,
              unit: recipeIngredient.unit,
              category: ingredient.category,
              isPurchased: false,
              isGenerated: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          }
        }
      }
    }
    
    for (const item of shoppingItems.values()) {
      await this.addShoppingListItem(item);
    }
  },
};