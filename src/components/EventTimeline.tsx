import { useState } from 'react';
import {
  CheckCircleIcon,
  ClockIcon,
  ShoppingBagIcon,
  FireIcon,
  WrenchScrewdriverIcon,
  EllipsisHorizontalCircleIcon,
  CalendarIcon,
  ListBulletIcon,
  CurrencyDollarIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import { useEventPlanning } from '../hooks/useEvents';
import type { EventTask, EventShoppingItem } from '../lib/eventManager';

interface EventTimelineProps {
  eventId: string;
}

export default function EventTimeline({ eventId }: EventTimelineProps) {
  const [activeTab, setActiveTab] = useState<'timeline' | 'menu' | 'shopping' | 'budget'>('timeline');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['timeline']));
  
  const { planning, loading, error, updateTask, updateShoppingItem } = useEventPlanning(eventId);

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !planning) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <div className="text-red-600 text-sm">
            {error || 'Erro ao carregar planejamento do evento'}
          </div>
        </div>
      </div>
    );
  }

  const completedTasks = planning.timeline.filter(task => task.isCompleted).length;
  const progressPercentage = (completedTasks / planning.timeline.length) * 100;

  const tasksByCategory = planning.timeline.reduce((acc, task) => {
    if (!acc[task.category]) {
      acc[task.category] = [];
    }
    acc[task.category].push(task);
    return acc;
  }, {} as Record<string, EventTask[]>);

  const completedShoppingItems = planning.shopping.items.filter(item => item.isPurchased).length;
  const shoppingProgress = (completedShoppingItems / planning.shopping.items.length) * 100;

  const itemsByCategory = planning.shopping.items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, EventShoppingItem[]>);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Planejamento do Evento</h2>
        
        {/* Progress Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{completedTasks}/{planning.timeline.length}</div>
            <div className="text-sm text-gray-600">Tarefas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{completedShoppingItems}/{planning.shopping.items.length}</div>
            <div className="text-sm text-gray-600">Compras</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{planning.menu.totalRecipes}</div>
            <div className="text-sm text-gray-600">Receitas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">R$ {planning.budgetEstimate.toFixed(0)}</div>
            <div className="text-sm text-gray-600">Orçamento</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progresso Geral</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <TabButton
            active={activeTab === 'timeline'}
            onClick={() => setActiveTab('timeline')}
            icon={CalendarIcon}
            label="Timeline"
          />
          <TabButton
            active={activeTab === 'menu'}
            onClick={() => setActiveTab('menu')}
            icon={FireIcon}
            label="Menu"
          />
          <TabButton
            active={activeTab === 'shopping'}
            onClick={() => setActiveTab('shopping')}
            icon={ShoppingBagIcon}
            label="Compras"
          />
          <TabButton
            active={activeTab === 'budget'}
            onClick={() => setActiveTab('budget')}
            icon={CurrencyDollarIcon}
            label="Orçamento"
          />
        </div>
      </div>

      <div className="p-6">
        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <div className="space-y-6">
            {Object.entries(tasksByCategory).map(([category, tasks]) => (
              <div key={category} className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleSection(`timeline-${category}`)}
                  className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <TaskCategoryIcon category={category} />
                    <div>
                      <h3 className="font-medium text-gray-900 capitalize">
                        {getCategoryName(category)}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {tasks.filter(t => t.isCompleted).length}/{tasks.length} concluídas
                      </p>
                    </div>
                  </div>
                  {expandedSections.has(`timeline-${category}`) ? (
                    <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                
                {expandedSections.has(`timeline-${category}`) && (
                  <div className="border-t border-gray-200 p-4 space-y-3">
                    {tasks.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()).map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onToggle={(completed) => updateTask(task.id, completed)}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Menu Tab */}
        {activeTab === 'menu' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{planning.menu.totalRecipes}</div>
                <div className="text-sm text-blue-700">Total de Receitas</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{Math.round(planning.menu.preparationTime / 60)}h</div>
                <div className="text-sm text-green-700">Tempo de Preparo</div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">R$ {planning.menu.estimatedCost.toFixed(0)}</div>
                <div className="text-sm text-yellow-700">Custo Estimado</div>
              </div>
            </div>

            {planning.menu.sections.map((section) => (
              <div key={section.sectionId} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">{section.name}</h3>
                  {section.servingTime && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <ClockIcon className="h-4 w-4" />
                      {section.servingTime}
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {section.recipes.map((recipe) => (
                    <div key={recipe.id} className="bg-gray-50 rounded p-3">
                      <h4 className="font-medium text-gray-900">{recipe.name}</h4>
                      <div className="text-sm text-gray-600 mt-1">
                        Preparo: {recipe.prepTime}min | Cozimento: {recipe.cookTime}min
                      </div>
                      {recipe.servings && (
                        <div className="text-sm text-gray-600">
                          Serve: {recipe.servings} pessoas
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {section.notes && (
                  <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                    {section.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Shopping Tab */}
        {activeTab === 'shopping' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{planning.shopping.items.length}</div>
                <div className="text-sm text-purple-700">Total de Itens</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{Math.round(shoppingProgress)}%</div>
                <div className="text-sm text-green-700">Progresso</div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">R$ {planning.shopping.totalCost.toFixed(0)}</div>
                <div className="text-sm text-yellow-700">Custo Total</div>
              </div>
            </div>

            {/* Shopping Progress */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progresso das Compras</span>
                <span>{completedShoppingItems}/{planning.shopping.items.length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${shoppingProgress}%` }}
                />
              </div>
            </div>

            {Object.entries(itemsByCategory).map(([category, items]) => (
              <div key={category} className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleSection(`shopping-${category}`)}
                  className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <ListBulletIcon className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 capitalize">{category}</h3>
                      <p className="text-sm text-gray-600">
                        {items.filter(i => i.isPurchased).length}/{items.length} comprados
                      </p>
                    </div>
                  </div>
                  {expandedSections.has(`shopping-${category}`) ? (
                    <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                
                {expandedSections.has(`shopping-${category}`) && (
                  <div className="border-t border-gray-200 p-4 space-y-2">
                    {items.map((item) => (
                      <ShoppingItem
                        key={`${item.ingredientName}-${item.category}`}
                        item={item}
                        onToggle={(purchased) => updateShoppingItem(item.ingredientName, purchased)}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Budget Tab */}
        {activeTab === 'budget' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-4">Breakdown de Custos</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ingredientes</span>
                    <span className="font-medium">R$ {planning.shopping.totalCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Margem (20%)</span>
                    <span className="font-medium">R$ {(planning.shopping.totalCost * 0.2).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Decoração</span>
                    <span className="font-medium">R$ 50.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Diversos</span>
                    <span className="font-medium">R$ 30.00</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold">
                    <span>Total</span>
                    <span>R$ {planning.budgetEstimate.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-4">Custos por Categoria</h3>
                <div className="space-y-3">
                  {Object.entries(itemsByCategory).map(([category, items]) => {
                    const categoryTotal = items.reduce((sum, item) => sum + item.estimatedCost, 0);
                    return (
                      <div key={category} className="flex justify-between">
                        <span className="text-gray-600 capitalize">{category}</span>
                        <span className="font-medium">R$ {categoryTotal.toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Dicas de Economia</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Compre ingredientes não perecíveis com antecedência</li>
                <li>• Verifique promoções nos supermercados da região</li>
                <li>• Considere comprar em quantidade para itens com boa margem</li>
                <li>• Reutilize decorações de eventos anteriores</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({ 
  active, 
  onClick, 
  icon: Icon, 
  label 
}: { 
  active: boolean; 
  onClick: () => void; 
  icon: React.ComponentType<{ className?: string }>; 
  label: string; 
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all ${
        active
          ? 'bg-white text-gray-900 shadow-sm'
          : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function TaskCategoryIcon({ category }: { category: string }) {
  const iconProps = "h-5 w-5";
  
  switch (category) {
    case 'shopping':
      return <ShoppingBagIcon className={`${iconProps} text-purple-600`} />;
    case 'preparation':
      return <WrenchScrewdriverIcon className={`${iconProps} text-blue-600`} />;
    case 'cooking':
      return <FireIcon className={`${iconProps} text-orange-600`} />;
    case 'setup':
      return <ClockIcon className={`${iconProps} text-green-600`} />;
    default:
      return <EllipsisHorizontalCircleIcon className={`${iconProps} text-gray-600`} />;
  }
}

function getCategoryName(category: string): string {
  const names: Record<string, string> = {
    shopping: 'Compras',
    preparation: 'Preparação',
    cooking: 'Cozimento',
    setup: 'Montagem',
    other: 'Outros'
  };
  return names[category] || category;
}

function TaskItem({ 
  task, 
  onToggle 
}: { 
  task: EventTask; 
  onToggle: (completed: boolean) => void; 
}) {
  const isOverdue = !task.isCompleted && new Date() > task.dueDate;
  
  return (
    <div className={`flex items-center gap-3 p-3 rounded border ${
      task.isCompleted 
        ? 'bg-green-50 border-green-200' 
        : isOverdue 
          ? 'bg-red-50 border-red-200'
          : 'bg-white border-gray-200'
    }`}>
      <button
        onClick={() => onToggle(!task.isCompleted)}
        className="flex-shrink-0"
      >
        <CheckCircleIcon className={`h-5 w-5 ${
          task.isCompleted ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'
        }`} />
      </button>
      
      <div className="flex-1">
        <h4 className={`font-medium ${
          task.isCompleted ? 'text-green-900 line-through' : 'text-gray-900'
        }`}>
          {task.name}
        </h4>
        <p className="text-sm text-gray-600">{task.description}</p>
        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
          <span>
            {task.dueDate.toLocaleDateString('pt-BR', { 
              day: '2-digit', 
              month: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
          <span>{task.estimatedTime}min</span>
        </div>
      </div>
    </div>
  );
}

function ShoppingItem({ 
  item, 
  onToggle 
}: { 
  item: EventShoppingItem; 
  onToggle: (purchased: boolean) => void; 
}) {
  return (
    <div className={`flex items-center gap-3 p-2 rounded ${
      item.isPurchased ? 'bg-green-50' : 'bg-white'
    }`}>
      <button
        onClick={() => onToggle(!item.isPurchased)}
        className="flex-shrink-0"
      >
        <CheckCircleIcon className={`h-4 w-4 ${
          item.isPurchased ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'
        }`} />
      </button>
      
      <div className="flex-1">
        <div className={`flex justify-between items-start ${
          item.isPurchased ? 'text-green-900' : 'text-gray-900'
        }`}>
          <span className={`font-medium ${item.isPurchased ? 'line-through' : ''}`}>
            {item.ingredientName}
          </span>
          <span className="text-sm font-medium">
            R$ {item.estimatedCost.toFixed(2)}
          </span>
        </div>
        <div className="text-sm text-gray-600">
          {item.quantity} {item.unit}
          {item.priority === 'high' && (
            <span className="ml-2 text-xs bg-red-100 text-red-600 px-1 rounded">
              Prioritário
            </span>
          )}
        </div>
        {item.notes && (
          <div className="text-xs text-gray-500 mt-1">{item.notes}</div>
        )}
      </div>
    </div>
  );
}