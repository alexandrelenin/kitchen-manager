import { useState, useEffect } from 'react';
import { analyticsService, type FamilyMetrics, type WeeklyStats, type MonthlyTrends } from '../lib/analytics';

export function useAnalytics() {
  const [familyMetrics, setFamilyMetrics] = useState<FamilyMetrics | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrends | null>(null);
  const [foodWasteAnalysis, setFoodWasteAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const [metrics, weekly, trends, waste] = await Promise.all([
        analyticsService.getFamilyMetrics(),
        analyticsService.getWeeklyStats(),
        analyticsService.getMonthlyTrends(),
        analyticsService.getFoodWasteAnalysis()
      ]);

      setFamilyMetrics(metrics);
      setWeeklyStats(weekly);
      setMonthlyTrends(trends);
      setFoodWasteAnalysis(waste);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar analytics');
      console.error('Erro no useAnalytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return {
    familyMetrics,
    weeklyStats,
    monthlyTrends,
    foodWasteAnalysis,
    loading,
    error,
    refetch: fetchAnalytics
  };
}

// Hook específico para métricas de família
export function useFamilyMetrics() {
  const [metrics, setMetrics] = useState<FamilyMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const data = await analyticsService.getFamilyMetrics();
        setMetrics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar métricas');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  return { metrics, loading, error };
}

// Hook específico para estatísticas semanais
export function useWeeklyStats() {
  const [stats, setStats] = useState<WeeklyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await analyticsService.getWeeklyStats();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar estatísticas');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
}