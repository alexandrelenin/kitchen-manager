import { useState, useEffect } from 'react';
import { 
  gamificationService, 
  type UserProgress, 
  type Challenge, 
  type Leaderboard, 
  type Badge,
  type GamificationEvent
} from '../lib/gamification';

export function useUserProgress(userId: string = 'default-user') {
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProgress = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const progress = await gamificationService.getUserProgress(userId);
      setUserProgress(progress);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar progresso');
    } finally {
      setLoading(false);
    }
  };

  const processEvent = async (event: GamificationEvent) => {
    try {
      setLoading(true);
      setError(null);
      
      const results = await gamificationService.processEvent(userId, event);
      
      // Recarregar progresso após evento
      await fetchUserProgress();
      
      return results;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar evento');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProgress();
  }, [userId]);

  return {
    userProgress,
    loading,
    error,
    processEvent,
    refetch: fetchUserProgress
  };
}

export function useChallenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const activeChallenges = await gamificationService.getActiveChallenges();
      setChallenges(activeChallenges);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar desafios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  return {
    challenges,
    loading,
    error,
    refetch: fetchChallenges
  };
}

export function useLeaderboard(period: 'weekly' | 'monthly' | 'all_time' = 'weekly') {
  const [leaderboard, setLeaderboard] = useState<Leaderboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await gamificationService.getLeaderboard(period);
      setLeaderboard(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar ranking');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [period]);

  return {
    leaderboard,
    loading,
    error,
    refetch: fetchLeaderboard
  };
}

export function useBadges() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBadges = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const availableBadges = await gamificationService.getAvailableBadges();
      setBadges(availableBadges);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar badges');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBadges();
  }, []);

  return {
    badges,
    loading,
    error,
    refetch: fetchBadges
  };
}

// Hook para eventos específicos de gamificação
export function useGamificationActions(userId: string = 'default-user') {
  const executeRecipe = async (recipeId: string, rating?: number) => {
    try {
      await gamificationService.executeRecipe(userId, recipeId, rating);
    } catch (error) {
      console.error('Erro ao processar execução de receita:', error);
    }
  };

  const planMeal = async (mealPlanId: string) => {
    try {
      await gamificationService.planMeal(userId, mealPlanId);
    } catch (error) {
      console.error('Erro ao processar planejamento de refeição:', error);
    }
  };

  const uploadPhoto = async (photoUrl: string, recipeId: string) => {
    try {
      await gamificationService.uploadPhoto(userId, photoUrl, recipeId);
    } catch (error) {
      console.error('Erro ao processar upload de foto:', error);
    }
  };

  const saveMoney = async (amount: number, source: string) => {
    try {
      await gamificationService.saveMoney(userId, amount, source);
    } catch (error) {
      console.error('Erro ao processar economia:', error);
    }
  };

  return {
    executeRecipe,
    planMeal,
    uploadPhoto,
    saveMoney
  };
}