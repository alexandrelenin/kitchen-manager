import { useState, useEffect } from 'react';
import { eventManager } from '../lib/eventManager';
import type { 
  EventTemplate, 
  EventPlanning
} from '../lib/eventManager';
import type { Event } from '../types';

export function useEventTemplates() {
  const [templates, setTemplates] = useState<EventTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setLoading(true);
        const templateList = await eventManager.getEventTemplates();
        setTemplates(templateList);
      } catch (err) {
        setError('Erro ao carregar templates de eventos');
        console.error('Error loading event templates:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, []);

  return { templates, loading, error };
}

export function useEventPlanning(eventId: string | null) {
  const [planning, setPlanning] = useState<EventPlanning | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) {
      setPlanning(null);
      return;
    }

    const loadPlanning = async () => {
      try {
        setLoading(true);
        setError(null);
        const eventPlanning = await eventManager.generateEventPlanning(eventId);
        setPlanning(eventPlanning);
      } catch (err) {
        setError('Erro ao gerar planejamento do evento');
        console.error('Error generating event planning:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPlanning();
  }, [eventId]);

  const updateTask = async (taskId: string, isCompleted: boolean) => {
    if (!eventId || !planning) return;

    try {
      await eventManager.updateEventTask(eventId, taskId, isCompleted);
      
      // Atualizar estado local
      setPlanning(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          timeline: prev.timeline.map(task => 
            task.id === taskId ? { ...task, isCompleted } : task
          )
        };
      });
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Erro ao atualizar tarefa');
    }
  };

  const updateShoppingItem = async (itemName: string, isPurchased: boolean) => {
    if (!eventId || !planning) return;

    try {
      await eventManager.updateShoppingItem(eventId, itemName, isPurchased);
      
      // Atualizar estado local
      setPlanning(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          shopping: {
            ...prev.shopping,
            items: prev.shopping.items.map(item => 
              item.ingredientName === itemName ? { ...item, isPurchased } : item
            )
          }
        };
      });
    } catch (err) {
      console.error('Error updating shopping item:', err);
      setError('Erro ao atualizar item de compras');
    }
  };

  return { 
    planning, 
    loading, 
    error, 
    updateTask, 
    updateShoppingItem 
  };
}

export function useEventCreation() {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createEvent = async (
    templateId: string,
    eventDate: Date,
    guestCount: number,
    customizations?: Partial<Event>
  ): Promise<string | null> => {
    try {
      setCreating(true);
      setError(null);
      
      const eventId = await eventManager.createEventFromTemplate(
        templateId,
        eventDate,
        guestCount,
        customizations
      );
      
      return eventId;
    } catch (err) {
      setError('Erro ao criar evento');
      console.error('Error creating event:', err);
      return null;
    } finally {
      setCreating(false);
    }
  };

  return { createEvent, creating, error };
}

export function useSeasonalSuggestions() {
  const [suggestions, setSuggestions] = useState<EventTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        setLoading(true);
        const currentSeason = getCurrentSeason();
        const seasonalEvents = await eventManager.getEventSuggestions(currentSeason);
        setSuggestions(seasonalEvents);
      } catch (err) {
        console.error('Error loading seasonal suggestions:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSuggestions();
  }, []);

  return { suggestions, loading };
}

// Função auxiliar para determinar a estação atual
function getCurrentSeason(): string {
  const month = new Date().getMonth();
  
  if (month >= 2 && month <= 4) return 'autumn'; // Outono no Brasil: Mar-Mai
  if (month >= 5 && month <= 7) return 'winter'; // Inverno: Jun-Ago
  if (month >= 8 && month <= 10) return 'spring'; // Primavera: Set-Nov
  return 'summer'; // Verão: Dez-Fev
}