import { ClockIcon, UserGroupIcon, CalendarDaysIcon, ShoppingBagIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import SmartSuggestions from './SmartSuggestions';
import MealPlanGenerator from './MealPlanGenerator';
import ShoppingOptimizer from './ShoppingOptimizer';
import GamificationWidget from './GamificationWidget';
import GamificationDashboard from './GamificationDashboard';
import EventWidget from './EventWidget';
import ExpandedRecipeBank from './ExpandedRecipeBank';
import { useRecipeOfTheDay } from '../hooks/useSuggestions';
import { useState } from 'react';

export default function Dashboard() {
  const { recipe: suggestedRecipe } = useRecipeOfTheDay();
  const [showMealPlanGenerator, setShowMealPlanGenerator] = useState(false);
  const [showShoppingOptimizer, setShowShoppingOptimizer] = useState(false);
  const [showGamificationDashboard, setShowGamificationDashboard] = useState(false);
  const [showExpandedRecipeBank, setShowExpandedRecipeBank] = useState(false);
  
  const todaysMeal = suggestedRecipe || {
    name: 'Boeuf Bourguignon',
    prepTime: 45,
    cookTime: 180,
    servings: 4,
    difficulty: 'medium' as const,
    image: 'https://via.placeholder.com/300x200/64748b/ffffff?text=Receita+do+Dia',
  };

  const weeklyStats = [
    { name: 'Refeições Planejadas', value: '14', icon: CalendarDaysIcon },
    { name: 'Itens no Estoque', value: '42', icon: ShoppingBagIcon },
    { name: 'Membros da Casa', value: '4', icon: UserGroupIcon },
    { name: 'Receitas Favoritas', value: '23', icon: ClockIcon },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Bem-vindo ao seu gerenciador de cozinha</p>
      </div>

      {/* Today's Recipe */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Receita do Dia</h2>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <img
                src="https://via.placeholder.com/300x200/64748b/ffffff?text=Receita+do+Dia"
                alt={todaysMeal.name}
                className="w-full md:w-48 h-32 object-cover rounded-lg bg-gray-100"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{todaysMeal.name}</h3>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <ClockIcon className="h-4 w-4" />
                  Preparo: {todaysMeal.prepTime}min
                </div>
                <div className="flex items-center gap-1">
                  <ClockIcon className="h-4 w-4" />
                  Cozimento: {todaysMeal.cookTime}min
                </div>
                <div className="flex items-center gap-1">
                  <UserGroupIcon className="h-4 w-4" />
                  {todaysMeal.servings} porções
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Dificuldade:</span>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Médio
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {weeklyStats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <stat.icon className="h-6 w-6 text-gray-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <button 
              onClick={() => setShowMealPlanGenerator(true)}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <CalendarDaysIcon className="h-6 w-6 text-blue-600 mb-2" />
              <p className="text-sm font-medium text-gray-900">Planejar Semana</p>
            </button>
            <button 
              onClick={() => setShowShoppingOptimizer(true)}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ShoppingBagIcon className="h-6 w-6 text-green-600 mb-2" />
              <p className="text-sm font-medium text-gray-900">Otimizar Compras</p>
            </button>
            <button 
              onClick={() => setShowExpandedRecipeBank(true)}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <BookOpenIcon className="h-6 w-6 text-orange-600 mb-2" />
              <p className="text-sm font-medium text-gray-900">Banco de Receitas</p>
            </button>
          </div>
        </div>
      </div>

      {/* This Week's Menu Preview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Menu da Semana</h2>
          <div className="space-y-3">
            {[
              { day: 'Segunda', meal: 'Coq au Vin', time: 'Jantar' },
              { day: 'Terça', meal: 'Ratatouille', time: 'Almoço' },
              { day: 'Quarta', meal: 'Cassoulet', time: 'Jantar' },
              { day: 'Quinta', meal: 'Bouillabaisse', time: 'Jantar' },
              { day: 'Sexta', meal: 'Confit de Canard', time: 'Jantar' },
            ].map((item) => (
              <div key={item.day} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="font-medium text-gray-900">{item.day}</p>
                  <p className="text-sm text-gray-600">{item.time}</p>
                </div>
                <p className="text-sm font-medium text-gray-900">{item.meal}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gerador de Plano de Refeições */}
      {showMealPlanGenerator && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Gerador de Cardápio</h2>
            <button
              onClick={() => setShowMealPlanGenerator(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          <MealPlanGenerator 
            onPlanGenerated={() => setShowMealPlanGenerator(false)}
          />
        </div>
      )}

      {/* Otimizador de Compras */}
      {showShoppingOptimizer && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Otimizador de Compras</h2>
            <button
              onClick={() => setShowShoppingOptimizer(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          <ShoppingOptimizer 
            onOptimizationComplete={() => setShowShoppingOptimizer(false)}
          />
        </div>
      )}

      {/* Gamificação Dashboard */}
      {showGamificationDashboard && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Dashboard de Gamificação</h2>
            <button
              onClick={() => setShowGamificationDashboard(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          <GamificationDashboard />
        </div>
      )}

      {/* Banco de Receitas Expandido */}
      {showExpandedRecipeBank && (
        <div className="space-y-4">
          <ExpandedRecipeBank 
            onClose={() => setShowExpandedRecipeBank(false)}
            onRecipeSelect={(recipe) => {
              console.log('Recipe selected:', recipe);
              // Aqui você pode adicionar lógica para abrir detalhes da receita
            }}
          />
        </div>
      )}

      {/* Grid de Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sugestões Inteligentes */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <SmartSuggestions compact={false} maxSuggestions={4} />
          </div>
        </div>

        {/* Widget de Gamificação */}
        <div className="lg:col-span-1">
          <GamificationWidget 
            onViewFull={() => setShowGamificationDashboard(true)}
          />
        </div>
      </div>

      {/* Segunda linha de widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Widget de Eventos */}
        <div>
          <EventWidget />
        </div>

        {/* Espaço para futuros widgets */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center py-8">
            <div className="text-gray-400 text-sm">Mais widgets em breve...</div>
          </div>
        </div>
      </div>
    </div>
  );
}