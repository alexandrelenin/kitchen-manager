import { 
  LightBulbIcon, 
  FireIcon, 
  ExclamationTriangleIcon,
  HeartIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { useSuggestions } from '../hooks/useSuggestions';
import type { SmartSuggestion } from '../lib/suggestions';

interface SuggestionCardProps {
  suggestion: SmartSuggestion;
  onAction?: (suggestion: SmartSuggestion) => void;
}

function SuggestionCard({ suggestion, onAction }: SuggestionCardProps) {
  const getIcon = () => {
    switch (suggestion.type) {
      case 'recipe':
        return FireIcon;
      case 'ingredient':
        return ExclamationTriangleIcon;
      case 'health':
        return HeartIcon;
      case 'economy':
        return CurrencyDollarIcon;
      case 'planning':
        return CalendarDaysIcon;
      default:
        return LightBulbIcon;
    }
  };

  const getColor = () => {
    switch (suggestion.priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getBorderColor = () => {
    switch (suggestion.priority) {
      case 'high':
        return 'border-red-200';
      case 'medium':
        return 'border-yellow-200';
      case 'low':
        return 'border-blue-200';
      default:
        return 'border-gray-200';
    }
  };

  const getBackgroundColor = () => {
    switch (suggestion.priority) {
      case 'high':
        return 'bg-red-50';
      case 'medium':
        return 'bg-yellow-50';
      case 'low':
        return 'bg-blue-50';
      default:
        return 'bg-gray-50';
    }
  };

  const Icon = getIcon();

  return (
    <div className={`rounded-lg border p-4 ${getBorderColor()} ${getBackgroundColor()} hover:shadow-md transition-shadow cursor-pointer`}
         onClick={() => onAction && onAction(suggestion)}>
      <div className="flex items-start space-x-3">
        <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${getColor()} flex items-center justify-center`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 mb-1">
            {suggestion.title}
          </h4>
          <p className="text-sm text-gray-600 mb-2">
            {suggestion.description}
          </p>
          
          {/* Additional info for recipe suggestions */}
          {suggestion.recipe && (
            <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
              <span>⭐ {suggestion.recipe.rating}</span>
              <span>🕒 {suggestion.recipe.prepTime + suggestion.recipe.cookTime}min</span>
              <span>👥 {suggestion.recipe.servings} porções</span>
            </div>
          )}
          
          {/* Match percentage for ingredient-based suggestions */}
          {suggestion.data?.matchPercentage && (
            <div className="mb-2">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>Compatibilidade com seus ingredientes</span>
                <span>{Math.round(suggestion.data.matchPercentage)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${suggestion.data.matchPercentage}%` }}
                />
              </div>
            </div>
          )}
          
          {suggestion.action && (
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-700">
                {suggestion.action}
              </span>
              <ChevronRightIcon className="h-4 w-4 text-gray-400" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface SmartSuggestionsProps {
  filters?: any;
  onSuggestionAction?: (suggestion: SmartSuggestion) => void;
  compact?: boolean;
  maxSuggestions?: number;
}

export default function SmartSuggestions({ 
  filters, 
  onSuggestionAction, 
  compact = false,
  maxSuggestions = 6
}: SmartSuggestionsProps) {
  const { suggestions, loading, error } = useSuggestions(filters);

  const handleSuggestionAction = (suggestion: SmartSuggestion) => {
    if (onSuggestionAction) {
      onSuggestionAction(suggestion);
    } else {
      // Ações padrão
      switch (suggestion.type) {
        case 'recipe':
          console.log('Abrir receita:', suggestion.recipe?.name);
          break;
        case 'ingredient':
          console.log('Ver ingrediente:', suggestion.ingredient?.name);
          break;
        case 'planning':
          console.log('Ir para planejamento');
          break;
        default:
          console.log('Ação para sugestão:', suggestion.title);
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {!compact && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Sugestões Inteligentes</h3>
            <p className="text-gray-600">Recomendações personalizadas para você</p>
          </div>
        )}
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-500">Gerando sugestões...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        {!compact && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Sugestões Inteligentes</h3>
            <p className="text-gray-600">Recomendações personalizadas para você</p>
          </div>
        )}
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">Erro ao carregar sugestões: {error}</div>
        </div>
      </div>
    );
  }

  const displaySuggestions = suggestions.slice(0, maxSuggestions);

  if (displaySuggestions.length === 0) {
    return (
      <div className="space-y-4">
        {!compact && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Sugestões Inteligentes</h3>
            <p className="text-gray-600">Recomendações personalizadas para você</p>
          </div>
        )}
        <div className="text-center py-8">
          <LightBulbIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Nenhuma sugestão disponível no momento.</p>
          <p className="text-sm text-gray-400 mt-1">
            Execute mais receitas e adicione ingredientes para receber sugestões personalizadas!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!compact && (
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Sugestões Inteligentes</h3>
            <p className="text-gray-600">Recomendações personalizadas para você</p>
          </div>
          <div className="text-sm text-gray-500">
            {displaySuggestions.length} de {suggestions.length} sugestões
          </div>
        </div>
      )}

      <div className={compact ? "space-y-3" : "grid grid-cols-1 md:grid-cols-2 gap-4"}>
        {displaySuggestions.map((suggestion) => (
          <SuggestionCard
            key={suggestion.id}
            suggestion={suggestion}
            onAction={handleSuggestionAction}
          />
        ))}
      </div>

      {/* Priority Summary */}
      {!compact && suggestions.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <span className="text-gray-600">
                  {suggestions.filter(s => s.priority === 'high').length} Urgentes
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                <span className="text-gray-600">
                  {suggestions.filter(s => s.priority === 'medium').length} Importantes
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <span className="text-gray-600">
                  {suggestions.filter(s => s.priority === 'low').length} Sugestões
                </span>
              </div>
            </div>
            <span className="text-gray-500">
              Atualizado agora
            </span>
          </div>
        </div>
      )}
    </div>
  );
}