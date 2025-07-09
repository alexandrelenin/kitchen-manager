// import { dbService } from './database';
// import type { Recipe, MealPlan, HouseMember } from '../types';

export interface UserProgress {
  id: string;
  userId: string;
  totalPoints: number;
  level: number;
  currentXP: number;
  xpToNextLevel: number;
  badges: Badge[];
  achievements: Achievement[];
  streaks: Streak[];
  statistics: UserStatistics;
  createdAt: Date;
  updatedAt: Date;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'cooking' | 'planning' | 'economy' | 'health' | 'social' | 'special';
  unlockedAt: Date;
  progress?: number;
  requirement?: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  type: 'recipe' | 'planning' | 'streak' | 'evaluation' | 'social' | 'special';
  progress: number;
  requirement: number;
  isCompleted: boolean;
  completedAt?: Date;
  metadata?: any;
}

export interface Streak {
  id: string;
  type: 'daily_cooking' | 'weekly_planning' | 'recipe_rating' | 'no_waste';
  name: string;
  description: string;
  currentCount: number;
  bestCount: number;
  isActive: boolean;
  lastActivityDate: Date;
  startDate: Date;
}

export interface UserStatistics {
  recipesExecuted: number;
  recipesCreated: number;
  mealsPlanned: number;
  photosUploaded: number;
  ratingsGiven: number;
  variationsCreated: number;
  wastePreventions: number;
  moneyySaved: number;
  cookingTimeTotal: number;
  favoriteCuisine: string;
  averageRating: number;
  perfectWeeksPlanned: number;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  requirements: ChallengeRequirement[];
  progress: number;
  isCompleted: boolean;
  isActive: boolean;
  startDate: Date;
  endDate: Date;
  completedAt?: Date;
}

export interface ChallengeRequirement {
  type: 'execute_recipes' | 'plan_meals' | 'rate_recipes' | 'upload_photos' | 'try_cuisine' | 'save_money';
  target: number;
  current: number;
  description: string;
}

export interface Leaderboard {
  period: 'weekly' | 'monthly' | 'all_time';
  users: LeaderboardEntry[];
  generatedAt: Date;
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  points: number;
  level: number;
  position: number;
  badges: number;
  achievements: number;
  avatar?: string;
}

export interface GamificationEvent {
  type: 'recipe_executed' | 'recipe_rated' | 'meal_planned' | 'photo_uploaded' | 'recipe_created' | 'money_saved';
  data: any;
  timestamp: Date;
}

class GamificationService {
  private static instance: GamificationService;

  static getInstance(): GamificationService {
    if (!GamificationService.instance) {
      GamificationService.instance = new GamificationService();
    }
    return GamificationService.instance;
  }

  // Processar evento e atualizar progresso
  async processEvent(userId: string, event: GamificationEvent): Promise<{
    pointsEarned: number;
    newBadges: Badge[];
    newAchievements: Achievement[];
    levelUp?: boolean;
    newLevel?: number;
  }> {
    try {
      const userProgress = await this.getUserProgress(userId);
      const results = {
        pointsEarned: 0,
        newBadges: [] as Badge[],
        newAchievements: [] as Achievement[],
        levelUp: false,
        newLevel: undefined as number | undefined
      };

      // Calcular pontos baseado no evento
      const basePoints = this.calculateEventPoints(event);
      results.pointsEarned = basePoints;

      // Atualizar estatísticas
      await this.updateUserStatistics(userId, event);

      // Atualizar streaks
      await this.updateStreaks(userId, event);

      // Verificar conquistas
      const newAchievements = await this.checkAchievements(userId, event);
      results.newAchievements = newAchievements;
      results.pointsEarned += newAchievements.reduce((sum, achievement) => sum + achievement.points, 0);

      // Verificar badges
      const newBadges = await this.checkBadges(userId, event);
      results.newBadges = newBadges;

      // Atualizar pontos e nível
      const newTotalPoints = userProgress.totalPoints + results.pointsEarned;
      const levelInfo = this.calculateLevel(newTotalPoints);
      
      if (levelInfo.level > userProgress.level) {
        results.levelUp = true;
        results.newLevel = levelInfo.level;
      }

      // Salvar progresso atualizado
      await this.updateUserProgress(userId, {
        totalPoints: newTotalPoints,
        level: levelInfo.level,
        currentXP: levelInfo.currentXP,
        xpToNextLevel: levelInfo.xpToNextLevel,
        badges: [...userProgress.badges, ...newBadges],
        achievements: [...userProgress.achievements, ...newAchievements]
      });

      return results;
    } catch (error) {
      console.error('Erro ao processar evento de gamificação:', error);
      throw error;
    }
  }

  // Buscar progresso do usuário
  async getUserProgress(userId: string): Promise<UserProgress> {
    // Simulação - em implementação real viria do IndexedDB
    const defaultProgress: UserProgress = {
      id: crypto.randomUUID(),
      userId,
      totalPoints: 0,
      level: 1,
      currentXP: 0,
      xpToNextLevel: 100,
      badges: [],
      achievements: [],
      streaks: this.getDefaultStreaks(),
      statistics: this.getDefaultStatistics(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return defaultProgress;
  }

  // Buscar desafios ativos
  async getActiveChallenges(): Promise<Challenge[]> {
    const now = new Date();
    
    // Gerar desafios dinâmicos
    const challenges: Challenge[] = [
      {
        id: 'daily-cook',
        name: 'Chef do Dia',
        description: 'Execute 2 receitas hoje',
        icon: '👨‍🍳',
        type: 'daily',
        difficulty: 'easy',
        points: 50,
        requirements: [{
          type: 'execute_recipes',
          target: 2,
          current: 0,
          description: 'Receitas executadas hoje'
        }],
        progress: 0,
        isCompleted: false,
        isActive: true,
        startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
      },
      {
        id: 'weekly-planner',
        name: 'Planejador da Semana',
        description: 'Planeje todas as refeições da semana',
        icon: '📅',
        type: 'weekly',
        difficulty: 'medium',
        points: 200,
        requirements: [{
          type: 'plan_meals',
          target: 14,
          current: 0,
          description: 'Refeições planejadas esta semana'
        }],
        progress: 0,
        isCompleted: false,
        isActive: true,
        startDate: this.getWeekStart(now),
        endDate: this.getWeekEnd(now)
      },
      {
        id: 'monthly-explorer',
        name: 'Explorador Culinário',
        description: 'Experimente 5 cuisines diferentes este mês',
        icon: '🌍',
        type: 'monthly',
        difficulty: 'hard',
        points: 500,
        requirements: [{
          type: 'try_cuisine',
          target: 5,
          current: 0,
          description: 'Cuisines diferentes experimentadas'
        }],
        progress: 0,
        isCompleted: false,
        isActive: true,
        startDate: new Date(now.getFullYear(), now.getMonth(), 1),
        endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0)
      }
    ];

    return challenges;
  }

  // Buscar ranking/leaderboard
  async getLeaderboard(period: 'weekly' | 'monthly' | 'all_time'): Promise<Leaderboard> {
    // Simulação de dados
    const mockUsers: LeaderboardEntry[] = [
      {
        userId: 'user1',
        userName: 'Chef Master',
        points: 2850,
        level: 12,
        position: 1,
        badges: 15,
        achievements: 32
      },
      {
        userId: 'user2',
        userName: 'Cozinheiro Pro',
        points: 2340,
        level: 10,
        position: 2,
        badges: 12,
        achievements: 28
      },
      {
        userId: 'user3',
        userName: 'Família Gourmet',
        points: 1890,
        level: 8,
        position: 3,
        badges: 9,
        achievements: 23
      }
    ];

    return {
      period,
      users: mockUsers,
      generatedAt: new Date()
    };
  }

  // Buscar todas as badges disponíveis
  async getAvailableBadges(): Promise<Badge[]> {
    return [
      {
        id: 'first-recipe',
        name: 'Primeira Receita',
        description: 'Execute sua primeira receita',
        icon: '🍳',
        rarity: 'common',
        category: 'cooking',
        unlockedAt: new Date(),
        requirement: 1
      },
      {
        id: 'recipe-master',
        name: 'Mestre das Receitas',
        description: 'Execute 100 receitas',
        icon: '👨‍🍳',
        rarity: 'epic',
        category: 'cooking',
        unlockedAt: new Date(),
        requirement: 100
      },
      {
        id: 'perfect-week',
        name: 'Semana Perfeita',
        description: 'Planeje todas as refeições de uma semana',
        icon: '🗓️',
        rarity: 'rare',
        category: 'planning',
        unlockedAt: new Date(),
        requirement: 14
      },
      {
        id: 'photographer',
        name: 'Fotógrafo Culinário',
        description: 'Faça upload de 50 fotos',
        icon: '📸',
        rarity: 'rare',
        category: 'social',
        unlockedAt: new Date(),
        requirement: 50
      },
      {
        id: 'money-saver',
        name: 'Economista',
        description: 'Economize R$ 500 com planejamento',
        icon: '💰',
        rarity: 'epic',
        category: 'economy',
        unlockedAt: new Date(),
        requirement: 500
      },
      {
        id: 'streak-legend',
        name: 'Lenda da Consistência',
        description: 'Mantenha uma sequência de 30 dias',
        icon: '🔥',
        rarity: 'legendary',
        category: 'special',
        unlockedAt: new Date(),
        requirement: 30
      }
    ];
  }

  // Métodos privados auxiliares
  private calculateEventPoints(event: GamificationEvent): number {
    const pointsMap = {
      'recipe_executed': 10,
      'recipe_rated': 5,
      'meal_planned': 3,
      'photo_uploaded': 2,
      'recipe_created': 25,
      'money_saved': 1 // 1 ponto por real economizado
    };

    let basePoints = pointsMap[event.type] || 0;
    
    // Multiplicadores especiais
    if (event.type === 'money_saved' && event.data?.amount) {
      basePoints = Math.floor(event.data.amount);
    }

    return basePoints;
  }

  private calculateLevel(totalPoints: number): { level: number; currentXP: number; xpToNextLevel: number } {
    let level = 1;
    let pointsForCurrentLevel = 0;
    let pointsForNextLevel = 100;

    while (totalPoints >= pointsForNextLevel) {
      level++;
      pointsForCurrentLevel = pointsForNextLevel;
      pointsForNextLevel += Math.floor(100 * Math.pow(1.2, level - 1));
    }

    return {
      level,
      currentXP: totalPoints - pointsForCurrentLevel,
      xpToNextLevel: pointsForNextLevel - totalPoints
    };
  }

  private async updateUserStatistics(userId: string, event: GamificationEvent): Promise<void> {
    // Atualizar estatísticas baseado no evento
    console.log('Updating user statistics for:', userId, event);
  }

  private async updateStreaks(userId: string, event: GamificationEvent): Promise<void> {
    // Atualizar streaks baseado no evento
    console.log('Updating streaks for:', userId, event);
  }

  private async checkAchievements(userId: string, event: GamificationEvent): Promise<Achievement[]> {
    // Verificar se o evento desbloqueou novas conquistas
    console.log('Checking achievements for:', userId, event);
    return [];
  }

  private async checkBadges(userId: string, event: GamificationEvent): Promise<Badge[]> {
    // Verificar se o evento desbloqueou novas badges
    console.log('Checking badges for:', userId, event);
    return [];
  }

  private async updateUserProgress(userId: string, updates: Partial<UserProgress>): Promise<void> {
    // Salvar atualizações no progresso do usuário
    console.log('Updating user progress:', userId, updates);
  }

  private getDefaultStreaks(): Streak[] {
    return [
      {
        id: 'daily-cooking',
        type: 'daily_cooking',
        name: 'Sequência de Culinária',
        description: 'Dias consecutivos cozinhando',
        currentCount: 0,
        bestCount: 0,
        isActive: false,
        lastActivityDate: new Date(),
        startDate: new Date()
      },
      {
        id: 'weekly-planning',
        type: 'weekly_planning',
        name: 'Planejamento Semanal',
        description: 'Semanas consecutivas planejadas',
        currentCount: 0,
        bestCount: 0,
        isActive: false,
        lastActivityDate: new Date(),
        startDate: new Date()
      }
    ];
  }

  private getDefaultStatistics(): UserStatistics {
    return {
      recipesExecuted: 0,
      recipesCreated: 0,
      mealsPlanned: 0,
      photosUploaded: 0,
      ratingsGiven: 0,
      variationsCreated: 0,
      wastePreventions: 0,
      moneyySaved: 0,
      cookingTimeTotal: 0,
      favoriteCuisine: '',
      averageRating: 0,
      perfectWeeksPlanned: 0
    };
  }

  private getWeekStart(date: Date): Date {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(start.setDate(diff));
  }

  private getWeekEnd(date: Date): Date {
    const end = this.getWeekStart(date);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return end;
  }

  // Métodos públicos para eventos específicos
  async executeRecipe(userId: string, recipeId: string, rating?: number): Promise<void> {
    await this.processEvent(userId, {
      type: 'recipe_executed',
      data: { recipeId, rating },
      timestamp: new Date()
    });
  }

  async planMeal(userId: string, mealPlanId: string): Promise<void> {
    await this.processEvent(userId, {
      type: 'meal_planned',
      data: { mealPlanId },
      timestamp: new Date()
    });
  }

  async uploadPhoto(userId: string, photoUrl: string, recipeId: string): Promise<void> {
    await this.processEvent(userId, {
      type: 'photo_uploaded',
      data: { photoUrl, recipeId },
      timestamp: new Date()
    });
  }

  async saveMoney(userId: string, amount: number, source: string): Promise<void> {
    await this.processEvent(userId, {
      type: 'money_saved',
      data: { amount, source },
      timestamp: new Date()
    });
  }
}

export const gamificationService = GamificationService.getInstance();