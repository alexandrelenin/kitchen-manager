import { useState } from 'react';
import {
  SparklesIcon,
  CalendarIcon,
  UsersIcon,
  PlusIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { useSeasonalSuggestions } from '../hooks/useEvents';
import EventPlanner from './EventPlanner';
import type { EventTemplate } from '../lib/eventManager';

interface EventWidgetProps {
  onViewFull?: () => void;
}

export default function EventWidget({ onViewFull }: EventWidgetProps) {
  const [showPlanner, setShowPlanner] = useState(false);
  const { suggestions, loading } = useSeasonalSuggestions();

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (showPlanner) {
    return (
      <EventPlanner
        onEventCreated={(eventId) => {
          console.log('Event created:', eventId);
          setShowPlanner(false);
        }}
        onClose={() => setShowPlanner(false)}
      />
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <SparklesIcon className="h-5 w-5 text-purple-500" />
          <h3 className="text-lg font-semibold text-gray-900">Eventos & Ocasiões</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPlanner(true)}
            className="flex items-center gap-1 text-sm bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700"
          >
            <PlusIcon className="h-4 w-4" />
            Criar Evento
          </button>
          {onViewFull && (
            <button
              onClick={onViewFull}
              className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700"
            >
              Ver tudo
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {suggestions.length > 0 ? (
        <div className="space-y-4">
          <div className="text-sm text-gray-600 mb-3">
            Sugestões para a temporada atual:
          </div>
          
          {suggestions.slice(0, 3).map((template) => (
            <EventSuggestionCard
              key={template.id}
              template={template}
              onSelect={() => setShowPlanner(true)}
            />
          ))}

          {suggestions.length > 3 && (
            <div className="text-center pt-2">
              <button
                onClick={() => setShowPlanner(true)}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Ver mais {suggestions.length - 3} sugestões
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <SparklesIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <div className="text-sm text-gray-600 mb-2">Planeje eventos especiais</div>
          <div className="text-xs text-gray-500 mb-4">
            Crie eventos personalizados com cardápios e timeline
          </div>
          <button
            onClick={() => setShowPlanner(true)}
            className="flex items-center gap-2 mx-auto bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            <PlusIcon className="h-4 w-4" />
            Criar Primeiro Evento
          </button>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-200">
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900">3</div>
          <div className="text-xs text-gray-600">Templates</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900">0</div>
          <div className="text-xs text-gray-600">Eventos Ativos</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900">0</div>
          <div className="text-xs text-gray-600">Concluídos</div>
        </div>
      </div>
    </div>
  );
}

function EventSuggestionCard({ 
  template, 
  onSelect 
}: { 
  template: EventTemplate; 
  onSelect: () => void; 
}) {
  return (
    <div 
      className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-purple-300 hover:bg-purple-50 transition-all"
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{template.icon}</span>
          <div>
            <h4 className="font-medium text-gray-900">{template.name}</h4>
            <p className="text-sm text-gray-600">{template.description}</p>
          </div>
        </div>
        <ChevronRightIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
      </div>
      
      <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <UsersIcon className="h-3 w-3" />
            {template.defaultGuestCount} pessoas
          </div>
          <div className="flex items-center gap-1">
            <CalendarIcon className="h-3 w-3" />
            {template.preparationDays} dia(s)
          </div>
        </div>
        <div className="text-purple-600 font-medium capitalize">
          {template.category}
        </div>
      </div>
    </div>
  );
}