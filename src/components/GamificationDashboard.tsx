import { useState } from 'react';
import {
  TrophyIcon,
  FireIcon,
  StarIcon,
  GiftIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useUserProgress, useChallenges, useLeaderboard, useBadges } from '../hooks/useGamification';
import type { Badge, Challenge, UserProgress, Streak } from '../lib/gamification';

interface GamificationDashboardProps {
  userId?: string;
}

export default function GamificationDashboard({ userId = 'default-user' }: GamificationDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'challenges' | 'badges' | 'leaderboard'>('overview');
  
  const { userProgress, loading: progressLoading } = useUserProgress(userId);
  const { challenges, loading: challengesLoading } = useChallenges();
  const { leaderboard, loading: leaderboardLoading } = useLeaderboard('weekly');
  const { badges, loading: badgesLoading } = useBadges();

  if (progressLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando seu progresso...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!userProgress) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <TrophyIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Erro ao carregar dados de gamificação</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com Progresso */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Nível {userProgress.level}</h2>
            <p className="text-blue-100">Chef em Progresso</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{userProgress.totalPoints.toLocaleString()}</div>
            <div className="text-blue-100">pontos totais</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span>XP para o próximo nível</span>
            <span>{userProgress.currentXP}/{userProgress.currentXP + userProgress.xpToNextLevel}</span>
          </div>
          <div className="w-full bg-blue-500 rounded-full h-3">
            <div 
              className="bg-white h-3 rounded-full transition-all duration-500"
              style={{ 
                width: `${(userProgress.currentXP / (userProgress.currentXP + userProgress.xpToNextLevel)) * 100}%` 
              }}
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-xl font-bold">{userProgress.badges.length}</div>
            <div className="text-blue-100 text-sm">Badges</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold">{userProgress.achievements.length}</div>
            <div className="text-blue-100 text-sm">Conquistas</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold">
              {userProgress.streaks.reduce((max, streak) => Math.max(max, streak.bestCount), 0)}
            </div>
            <div className="text-blue-100 text-sm">Melhor Sequência</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Visão Geral', icon: ChartBarIcon },
              { id: 'challenges', label: 'Desafios', icon: GiftIcon },
              { id: 'badges', label: 'Badges', icon: StarIcon },
              { id: 'leaderboard', label: 'Ranking', icon: TrophyIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <OverviewTab userProgress={userProgress} />
          )}
          
          {activeTab === 'challenges' && (
            <ChallengesTab challenges={challenges} loading={challengesLoading} />
          )}
          
          {activeTab === 'badges' && (
            <BadgesTab 
              userBadges={userProgress.badges} 
              allBadges={badges} 
              loading={badgesLoading} 
            />
          )}
          
          {activeTab === 'leaderboard' && (
            <LeaderboardTab leaderboard={leaderboard} loading={leaderboardLoading} />
          )}
        </div>
      </div>
    </div>
  );
}

function OverviewTab({ userProgress }: { userProgress: UserProgress }) {
  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Suas Estatísticas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Receitas Executadas', value: userProgress.statistics.recipesExecuted, icon: '🍳' },
            { label: 'Refeições Planejadas', value: userProgress.statistics.mealsPlanned, icon: '📅' },
            { label: 'Fotos Enviadas', value: userProgress.statistics.photosUploaded, icon: '📸' },
            { label: 'Avaliações Dadas', value: userProgress.statistics.ratingsGiven, icon: '⭐' },
            { label: 'Variações Criadas', value: userProgress.statistics.variationsCreated, icon: '🔄' },
            { label: 'Desperdício Evitado', value: userProgress.statistics.wastePreventions, icon: '♻️' },
            { label: 'Dinheiro Economizado', value: `R$ ${userProgress.statistics.moneyySaved}`, icon: '💰' },
            { label: 'Tempo Cozinhando', value: `${Math.round(userProgress.statistics.cookingTimeTotal / 60)}h`, icon: '⏱️' }
          ].map((stat, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Sequências Ativas */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sequências Ativas</h3>
        <div className="space-y-3">
          {userProgress.streaks.map((streak) => (
            <StreakCard key={streak.id} streak={streak} />
          ))}
        </div>
      </div>

      {/* Badges Recentes */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Badges Recentes</h3>
        {userProgress.badges.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {userProgress.badges.slice(-5).map((badge) => (
              <BadgeCard key={badge.id} badge={badge} size="small" />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Execute receitas para ganhar suas primeiras badges!</p>
        )}
      </div>
    </div>
  );
}

function ChallengesTab({ challenges, loading }: { challenges: Challenge[]; loading: boolean }) {
  if (loading) {
    return <div className="text-center py-8">Carregando desafios...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Desafios Ativos</h3>
      
      {challenges.length === 0 ? (
        <div className="text-center py-8">
          <GiftIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Nenhum desafio ativo no momento</p>
        </div>
      ) : (
        <div className="space-y-4">
          {challenges.map((challenge) => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </div>
      )}
    </div>
  );
}

function BadgesTab({ 
  userBadges, 
  allBadges, 
  loading 
}: { 
  userBadges: Badge[]; 
  allBadges: Badge[]; 
  loading: boolean;
}) {
  if (loading) {
    return <div className="text-center py-8">Carregando badges...</div>;
  }

  const unlockedBadgeIds = new Set(userBadges.map(b => b.id));

  return (
    <div className="space-y-6">
      {/* Badges Conquistadas */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Badges Conquistadas ({userBadges.length})
        </h3>
        {userBadges.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {userBadges.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Você ainda não conquistou nenhuma badge.</p>
        )}
      </div>

      {/* Badges Disponíveis */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Badges Disponíveis ({allBadges.filter(b => !unlockedBadgeIds.has(b.id)).length})
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {allBadges
            .filter(badge => !unlockedBadgeIds.has(badge.id))
            .map((badge) => (
              <BadgeCard key={badge.id} badge={badge} locked />
            ))}
        </div>
      </div>
    </div>
  );
}

function LeaderboardTab({ leaderboard, loading }: { leaderboard: any; loading: boolean }) {
  if (loading) {
    return <div className="text-center py-8">Carregando ranking...</div>;
  }

  if (!leaderboard) {
    return <div className="text-center py-8">Erro ao carregar ranking</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Ranking Semanal</h3>
        <div className="text-sm text-gray-500">
          Atualizado: {leaderboard.generatedAt.toLocaleDateString('pt-BR')}
        </div>
      </div>
      
      <div className="space-y-3">
        {leaderboard.users.map((user: any, index: number) => (
          <div key={user.userId} className={`flex items-center gap-4 p-4 rounded-lg border ${
            index < 3 ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
              index === 0 ? 'bg-yellow-500' :
              index === 1 ? 'bg-gray-400' :
              index === 2 ? 'bg-orange-500' :
              'bg-blue-500'
            }`}>
              {user.position}
            </div>
            
            <div className="flex-1">
              <div className="font-medium text-gray-900">{user.userName}</div>
              <div className="text-sm text-gray-600">Nível {user.level}</div>
            </div>
            
            <div className="text-right">
              <div className="font-bold text-gray-900">{user.points.toLocaleString()}</div>
              <div className="text-sm text-gray-600">pontos</div>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <StarIcon className="h-4 w-4" />
              {user.badges}
              <TrophyIcon className="h-4 w-4 ml-2" />
              {user.achievements}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StreakCard({ streak }: { streak: Streak }) {
  return (
    <div className={`p-4 rounded-lg border ${
      streak.isActive ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${
            streak.isActive ? 'bg-orange-100' : 'bg-gray-100'
          }`}>
            <FireIcon className={`h-5 w-5 ${
              streak.isActive ? 'text-orange-600' : 'text-gray-400'
            }`} />
          </div>
          <div>
            <div className="font-medium text-gray-900">{streak.name}</div>
            <div className="text-sm text-gray-600">{streak.description}</div>
          </div>
        </div>
        
        <div className="text-right">
          <div className={`text-2xl font-bold ${
            streak.isActive ? 'text-orange-600' : 'text-gray-400'
          }`}>
            {streak.currentCount}
          </div>
          <div className="text-sm text-gray-500">
            Melhor: {streak.bestCount}
          </div>
        </div>
      </div>
    </div>
  );
}

function ChallengeCard({ challenge }: { challenge: Challenge }) {
  
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{challenge.icon}</div>
          <div>
            <div className="font-medium text-gray-900">{challenge.name}</div>
            <div className="text-sm text-gray-600">{challenge.description}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={`px-2 py-1 rounded text-xs font-medium ${
            challenge.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
            challenge.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {challenge.difficulty === 'easy' ? 'Fácil' :
             challenge.difficulty === 'medium' ? 'Médio' : 'Difícil'}
          </div>
          <div className="text-sm font-medium text-blue-600">
            +{challenge.points} pts
          </div>
        </div>
      </div>
      
      {/* Progress */}
      <div className="space-y-2">
        {challenge.requirements.map((req, index) => (
          <div key={index}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">{req.description}</span>
              <span className="font-medium">{req.current}/{req.target}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(req.current / req.target) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      
      {/* Timer */}
      <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <ClockIcon className="h-4 w-4" />
          {challenge.type === 'daily' && 'Termina hoje'}
          {challenge.type === 'weekly' && 'Termina esta semana'}
          {challenge.type === 'monthly' && 'Termina este mês'}
        </div>
        
        {challenge.isCompleted && (
          <div className="flex items-center gap-1 text-green-600">
            <CheckCircleIcon className="h-4 w-4" />
            Concluído!
          </div>
        )}
      </div>
    </div>
  );
}

function BadgeCard({ 
  badge, 
  locked = false, 
  size = 'normal' 
}: { 
  badge: Badge; 
  locked?: boolean; 
  size?: 'small' | 'normal';
}) {
  const isSmall = size === 'small';
  
  return (
    <div className={`${
      isSmall ? 'p-2' : 'p-4'
    } border rounded-lg text-center ${
      locked ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300'
    } ${!locked && badge.rarity === 'legendary' ? 'ring-2 ring-purple-300' : ''}
    ${!locked && badge.rarity === 'epic' ? 'ring-2 ring-orange-300' : ''}
    ${!locked && badge.rarity === 'rare' ? 'ring-2 ring-blue-300' : ''}`}>
      
      <div className={`${isSmall ? 'text-2xl mb-1' : 'text-4xl mb-3'} ${
        locked ? 'grayscale opacity-50' : ''
      }`}>
        {locked ? '🔒' : badge.icon}
      </div>
      
      <div className={`${isSmall ? 'text-xs' : 'text-sm'} font-medium text-gray-900 ${
        locked ? 'opacity-50' : ''
      }`}>
        {badge.name}
      </div>
      
      {!isSmall && (
        <div className={`text-xs text-gray-600 mt-1 ${
          locked ? 'opacity-50' : ''
        }`}>
          {badge.description}
        </div>
      )}
      
      {!isSmall && !locked && (
        <div className={`mt-2 px-2 py-1 rounded text-xs font-medium ${
          badge.rarity === 'legendary' ? 'bg-purple-100 text-purple-800' :
          badge.rarity === 'epic' ? 'bg-orange-100 text-orange-800' :
          badge.rarity === 'rare' ? 'bg-blue-100 text-blue-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {badge.rarity === 'legendary' ? 'Lendária' :
           badge.rarity === 'epic' ? 'Épica' :
           badge.rarity === 'rare' ? 'Rara' : 'Comum'}
        </div>
      )}
      
      {locked && badge.requirement && (
        <div className="mt-2 text-xs text-gray-500">
          {badge.requirement} {badge.category === 'cooking' ? 'receitas' : 'ações'}
        </div>
      )}
    </div>
  );
}