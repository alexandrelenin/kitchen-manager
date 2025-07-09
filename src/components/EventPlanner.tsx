import { useState } from 'react';
import {
  CalendarIcon,
  UsersIcon,
  SparklesIcon,
  CheckCircleIcon,
  ClockIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { useEventTemplates, useEventCreation, useSeasonalSuggestions } from '../hooks/useEvents';
import type { EventTemplate } from '../lib/eventManager';

interface EventPlannerProps {
  onEventCreated?: (eventId: string) => void;
  onClose?: () => void;
}

export default function EventPlanner({ onEventCreated, onClose }: EventPlannerProps) {
  const [step, setStep] = useState<'templates' | 'details' | 'confirmation'>('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<EventTemplate | null>(null);
  const [eventDate, setEventDate] = useState('');
  const [guestCount, setGuestCount] = useState(8);
  const [eventName, setEventName] = useState('');
  const [eventNotes, setEventNotes] = useState('');

  const { templates, loading: templatesLoading } = useEventTemplates();
  const { suggestions } = useSeasonalSuggestions();
  const { createEvent, creating, error } = useEventCreation();

  const handleTemplateSelect = (template: EventTemplate) => {
    setSelectedTemplate(template);
    setEventName(template.name);
    setGuestCount(template.defaultGuestCount);
    setStep('details');
  };

  const handleCreateEvent = async () => {
    if (!selectedTemplate || !eventDate) return;

    const eventId = await createEvent(
      selectedTemplate.id,
      new Date(eventDate),
      guestCount,
      {
        name: eventName,
        notes: eventNotes
      }
    );

    if (eventId) {
      setStep('confirmation');
      onEventCreated?.(eventId);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (templatesLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <SparklesIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Planejador de Eventos</h2>
              <p className="text-sm text-gray-600">
                {step === 'templates' && 'Escolha um template para seu evento'}
                {step === 'details' && 'Configure os detalhes do seu evento'}
                {step === 'confirmation' && 'Evento criado com sucesso!'}
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              ✕
            </button>
          )}
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mt-6">
          <div className="flex items-center space-x-4">
            <StepIndicator 
              step={1} 
              label="Template" 
              active={step === 'templates'} 
              completed={step !== 'templates'} 
            />
            <div className="w-8 h-px bg-gray-300"></div>
            <StepIndicator 
              step={2} 
              label="Detalhes" 
              active={step === 'details'} 
              completed={step === 'confirmation'} 
            />
            <div className="w-8 h-px bg-gray-300"></div>
            <StepIndicator 
              step={3} 
              label="Confirmação" 
              active={step === 'confirmation'} 
              completed={false} 
            />
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Step 1: Template Selection */}
        {step === 'templates' && (
          <div className="space-y-6">
            {/* Seasonal Suggestions */}
            {suggestions.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <StarIcon className="h-5 w-5 text-yellow-500" />
                  Sugestões da Temporada
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {suggestions.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onSelect={handleTemplateSelect}
                      featured
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All Templates */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Todos os Templates
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onSelect={handleTemplateSelect}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Event Details */}
        {step === 'details' && selectedTemplate && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{selectedTemplate.icon}</span>
                <div>
                  <h3 className="font-medium text-blue-900">{selectedTemplate.name}</h3>
                  <p className="text-sm text-blue-700">{selectedTemplate.description}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Event Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Evento
                </label>
                <input
                  type="text"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Ceia de Natal da Família Silva"
                />
              </div>

              {/* Event Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data do Evento
                </label>
                <input
                  type="datetime-local"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Guest Count */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Convidados
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                    className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center font-medium">{guestCount} pessoas</span>
                  <button
                    type="button"
                    onClick={() => setGuestCount(guestCount + 1)}
                    className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Preparation Days */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preparação
                </label>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <ClockIcon className="h-4 w-4" />
                  {selectedTemplate.preparationDays} dia(s) de antecedência
                </div>
              </div>
            </div>

            {/* Event Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações
              </label>
              <textarea
                value={eventNotes}
                onChange={(e) => setEventNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Adicione observações especiais sobre o evento..."
              />
            </div>

            {/* Menu Structure Preview */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Estrutura do Menu</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedTemplate.menuStructure.map((section) => (
                  <div key={section.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{section.name}</span>
                      {section.required && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                          Obrigatório
                        </span>
                      )}
                    </div>
                    {section.estimatedServingTime && (
                      <div className="text-xs text-gray-500">
                        Servir às {section.estimatedServingTime}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep('templates')}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Voltar
              </button>
              <button
                onClick={handleCreateEvent}
                disabled={!eventName || !eventDate || creating}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {creating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Criando...
                  </>
                ) : (
                  'Criar Evento'
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 'confirmation' && selectedTemplate && eventDate && (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Evento Criado com Sucesso!
              </h3>
              <p className="text-gray-600">
                Seu evento "{eventName}" foi criado e o planejamento está pronto.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 text-left max-w-md mx-auto">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Data:</span>
                  <span className="font-medium">{formatDate(eventDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Convidados:</span>
                  <span className="font-medium">{guestCount} pessoas</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Preparação:</span>
                  <span className="font-medium">{selectedTemplate.preparationDays} dia(s)</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setStep('templates');
                  setSelectedTemplate(null);
                  setEventName('');
                  setEventDate('');
                  setEventNotes('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Criar Outro Evento
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Fechar
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TemplateCard({ 
  template, 
  onSelect, 
  featured = false 
}: { 
  template: EventTemplate; 
  onSelect: (template: EventTemplate) => void;
  featured?: boolean;
}) {
  return (
    <div 
      className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
        featured 
          ? 'border-yellow-300 bg-yellow-50 hover:border-yellow-400' 
          : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={() => onSelect(template)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{template.icon}</span>
          <div>
            <h4 className="font-medium text-gray-900">{template.name}</h4>
            <p className="text-sm text-gray-600 capitalize">{template.category}</p>
          </div>
        </div>
        {featured && (
          <StarIcon className="h-5 w-5 text-yellow-500" />
        )}
      </div>
      
      <p className="text-sm text-gray-600 mb-3">{template.description}</p>
      
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <UsersIcon className="h-3 w-3" />
          {template.defaultGuestCount} pessoas
        </div>
        <div className="flex items-center gap-1">
          <CalendarIcon className="h-3 w-3" />
          {template.preparationDays} dia(s)
        </div>
      </div>
    </div>
  );
}

function StepIndicator({ 
  step, 
  label, 
  active, 
  completed 
}: { 
  step: number; 
  label: string; 
  active: boolean; 
  completed: boolean; 
}) {
  return (
    <div className="flex flex-col items-center">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
        completed 
          ? 'bg-green-600 text-white' 
          : active 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-200 text-gray-600'
      }`}>
        {completed ? '✓' : step}
      </div>
      <span className={`text-xs mt-1 ${
        active ? 'text-blue-600 font-medium' : 'text-gray-500'
      }`}>
        {label}
      </span>
    </div>
  );
}