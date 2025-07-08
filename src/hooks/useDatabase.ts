import { useState, useEffect } from 'react';
import { dbService } from '../lib/database';
import type { Recipe, MealPlan, Ingredient, HouseMember, ShoppingListItem } from '../types';

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const data = await dbService.getRecipes();
      setRecipes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar receitas');
    } finally {
      setLoading(false);
    }
  };

  const addRecipe = async (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await dbService.addRecipe(recipe);
      await fetchRecipes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar receita');
    }
  };

  const updateRecipe = async (id: string, updates: Partial<Recipe>) => {
    try {
      await dbService.updateRecipe(id, updates);
      await fetchRecipes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar receita');
    }
  };

  const deleteRecipe = async (id: string) => {
    try {
      await dbService.deleteRecipe(id);
      await fetchRecipes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar receita');
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  return {
    recipes,
    loading,
    error,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    refetch: fetchRecipes,
  };
}

export function useMealPlans() {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMealPlans = async (startDate: Date, endDate: Date) => {
    try {
      setLoading(true);
      const data = await dbService.getMealPlans(startDate, endDate);
      setMealPlans(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar planejamento');
    } finally {
      setLoading(false);
    }
  };

  const addMealPlan = async (mealPlan: Omit<MealPlan, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await dbService.addMealPlan(mealPlan);
      // Refetch data after adding
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);
      await fetchMealPlans(startDate, endDate);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar planejamento');
    }
  };

  const updateMealPlan = async (id: string, updates: Partial<MealPlan>) => {
    try {
      await dbService.updateMealPlan(id, updates);
      // Refetch data after updating
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);
      await fetchMealPlans(startDate, endDate);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar planejamento');
    }
  };

  const deleteMealPlan = async (id: string) => {
    try {
      await dbService.deleteMealPlan(id);
      // Refetch data after deleting
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);
      await fetchMealPlans(startDate, endDate);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar planejamento');
    }
  };

  return {
    mealPlans,
    loading,
    error,
    addMealPlan,
    updateMealPlan,
    deleteMealPlan,
    fetchMealPlans,
  };
}

export function useIngredients() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIngredients = async () => {
    try {
      setLoading(true);
      const data = await dbService.getIngredients();
      setIngredients(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar ingredientes');
    } finally {
      setLoading(false);
    }
  };

  const addIngredient = async (ingredient: Omit<Ingredient, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await dbService.addIngredient(ingredient);
      await fetchIngredients();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar ingrediente');
    }
  };

  const updateIngredient = async (id: string, updates: Partial<Ingredient>) => {
    try {
      await dbService.updateIngredient(id, updates);
      await fetchIngredients();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar ingrediente');
    }
  };

  const deleteIngredient = async (id: string) => {
    try {
      await dbService.deleteIngredient(id);
      await fetchIngredients();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar ingrediente');
    }
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  return {
    ingredients,
    loading,
    error,
    addIngredient,
    updateIngredient,
    deleteIngredient,
    refetch: fetchIngredients,
  };
}

export function useHouseMembers() {
  const [members, setMembers] = useState<HouseMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const data = await dbService.getHouseMembers();
      setMembers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar membros');
    } finally {
      setLoading(false);
    }
  };

  const addMember = async (member: Omit<HouseMember, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await dbService.addHouseMember(member);
      await fetchMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar membro');
    }
  };

  const updateMember = async (id: string, updates: Partial<HouseMember>) => {
    try {
      await dbService.updateHouseMember(id, updates);
      await fetchMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar membro');
    }
  };

  const deleteMember = async (id: string) => {
    try {
      await dbService.deleteHouseMember(id);
      await fetchMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar membro');
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  return {
    members,
    loading,
    error,
    addMember,
    updateMember,
    deleteMember,
    refetch: fetchMembers,
  };
}

export function useShoppingList() {
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShoppingList = async () => {
    try {
      setLoading(true);
      const data = await dbService.getShoppingList();
      setShoppingList(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar lista de compras');
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (item: Omit<ShoppingListItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await dbService.addShoppingListItem(item);
      await fetchShoppingList();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar item');
    }
  };

  const updateItem = async (id: string, updates: Partial<ShoppingListItem>) => {
    try {
      await dbService.updateShoppingListItem(id, updates);
      await fetchShoppingList();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar item');
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await dbService.deleteShoppingListItem(id);
      await fetchShoppingList();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar item');
    }
  };

  const generateShoppingList = async (startDate: Date, endDate: Date) => {
    try {
      await dbService.generateShoppingList(startDate, endDate);
      await fetchShoppingList();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar lista de compras');
    }
  };

  useEffect(() => {
    fetchShoppingList();
  }, []);

  return {
    shoppingList,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
    generateShoppingList,
    refetch: fetchShoppingList,
  };
}