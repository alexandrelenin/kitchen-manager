export interface HouseMember {
  id: string;
  name: string;
  preferences: string[];
  restrictions: string[];
  allergies: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Ingredient {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expirationDate?: Date;
  purchaseDate?: Date;
  cost?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecipeIngredient {
  ingredientId: string;
  name: string;
  quantity: number;
  unit: string;
  optional?: boolean;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: Date;
  userId?: string;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: RecipeIngredient[];
  instructions: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  tags: string[];
  rating: number;
  reviews: Review[];
  source: 'own' | 'cordon-bleu' | 'internet' | 'community';
  videoUrl?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MealPlan {
  id: string;
  date: Date;
  meal: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  recipeId: string;
  servings: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShoppingListItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  isPurchased: boolean;
  isGenerated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Event {
  id: string;
  name: string;
  date: Date;
  guestCount: number;
  recipes: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Settings {
  id: string;
  householdSize: number;
  preferredMealTimes: string[];
  defaultServings: number;
  shoppingDays: string[];
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}