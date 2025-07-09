import {
  TrophyIcon,
  FireIcon,
  StarIcon,
  GiftIcon,
  ChevronRightIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useUserProgress, useChallenges } from '../hooks/useGamification';
import type { Challenge } from '../lib/gamification';

interface GamificationWidgetProps {
  userId?: string;
  onViewFull?: () => void;
}

export default function GamificationWidget({ userId = 'default-user', onViewFull }: GamificationWidgetProps) {
  const { userProgress, loading } = useUserProgress(userId);
  const { challenges } = useChallenges();

  if (loading || !userProgress) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-3"></div>
          <div className="h-2 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  const activeChallenges = challenges.filter(c => c.isActive && !c.isCompleted).slice(0, 2);
  const activeStreaks = userProgress.streaks.filter(s => s.isActive);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrophyIcon className="h-5 w-5 text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-900">Gamificação</h3>
        </div>
        {onViewFull && (
          <button
            onClick={onViewFull}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
          >
            Ver tudo
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Level Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {userProgress.level}
            </div>
            <span className="font-medium text-gray-900">Nível {userProgress.level}</span>
          </div>
          <div className="text-sm text-gray-600">
            {userProgress.totalPoints.toLocaleString()} pts
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
            style={{ 
              width: `${(userProgress.currentXP / (userProgress.currentXP + userProgress.xpToNextLevel)) * 100}%` 
            }}
          />
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {userProgress.xpToNextLevel} XP para o próximo nível
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900">{userProgress.badges.length}</div>
          <div className="text-xs text-gray-600 flex items-center justify-center gap-1">
            <StarIcon className="h-3 w-3" />
            Badges
          </div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900">{userProgress.achievements.length}</div>
          <div className="text-xs text-gray-600 flex items-center justify-center gap-1">
            <TrophyIcon className="h-3 w-3" />
            Conquistas
          </div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900">
            {userProgress.streaks.reduce((max, streak) => Math.max(max, streak.currentCount), 0)}
          </div>
          <div className="text-xs text-gray-600 flex items-center justify-center gap-1">
            <FireIcon className="h-3 w-3" />
            Sequência
          </div>
        </div>
      </div>

      {/* Active Streaks */}
      {activeStreaks.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-1">
            <FireIcon className="h-4 w-4 text-orange-500" />
            Sequências Ativas
          </h4>
          <div className="space-y-2">
            {activeStreaks.slice(0, 2).map((streak) => (
              <div key={streak.id} className="flex items-center justify-between p-2 bg-orange-50 border border-orange-200 rounded">
                <div>
                  <div className="text-sm font-medium text-gray-900">{streak.name}</div>
                  <div className="text-xs text-gray-600">{streak.description}</div>
                </div>
                <div className="text-lg font-bold text-orange-600">{streak.currentCount}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Challenges */}
      {activeChallenges.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-1">
            <GiftIcon className="h-4 w-4 text-purple-500" />
            Desafios Ativos
          </h4>
          <div className="space-y-2">
            {activeChallenges.map((challenge) => (
              <ChallengePreview key={challenge.id} challenge={challenge} />
            ))}
          </div>
        </div>
      )}

      {/* Recent Badges */}
      {userProgress.badges.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Badges Recentes</h4>
          <div className="flex gap-2">
            {userProgress.badges.slice(-3).map((badge) => (
              <div key={badge.id} className="flex-1 text-center p-2 bg-gray-50 rounded">
                <div className="text-lg mb-1">{badge.icon}</div>
                <div className="text-xs text-gray-600 font-medium">{badge.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {userProgress.badges.length === 0 && activeChallenges.length === 0 && activeStreaks.length === 0 && (
        <div className="text-center py-6">
          <SparklesIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <div className="text-sm text-gray-600 mb-2">Comece sua jornada culinária!</div>
          <div className="text-xs text-gray-500">Execute receitas para ganhar pontos e badges</div>
        </div>
      )}
    </div>
  );
}

function ChallengePreview({ challenge }: { challenge: Challenge }) {
  const progress = challenge.requirements[0]; // Pegar primeiro requirement
  const progressPercentage = progress ? (progress.current / progress.target) * 100 : 0;

  return (
    <div className="p-3 border border-gray-200 rounded bg-white">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm">{challenge.icon}</span>
          <div className="text-sm font-medium text-gray-900">{challenge.name}</div>
        </div>
        <div className="text-xs font-medium text-blue-600">+{challenge.points}</div>
      </div>
      
      {progress && (
        <div>
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>{progress.description}</span>
            <span>{progress.current}/{progress.target}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}