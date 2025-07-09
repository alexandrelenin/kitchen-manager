import { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import AdvancedDashboard from './components/AdvancedDashboard';
import MembersManager from './components/MembersManager';
import InventoryManager from './components/InventoryManager';
import RecipesManager from './components/RecipesManager';
import MealPlanCalendar from './components/MealPlanCalendar';
import ShoppingListManager from './components/ShoppingListManager';
import { useRecipes, useMealPlans } from './hooks/useDatabase';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { recipes } = useRecipes();
  const { mealPlans, addMealPlan, deleteMealPlan } = useMealPlans();

  const handleMealPlanAdd = async (date: Date, meal: string, recipe: any) => {
    await addMealPlan({
      date,
      meal: meal as 'breakfast' | 'lunch' | 'dinner' | 'snack',
      recipeId: recipe.id,
      servings: recipe.servings,
    });
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'analytics':
        return <AdvancedDashboard />;
      case 'members':
        return <MembersManager />;
      case 'inventory':
        return <InventoryManager />;
      case 'recipes':
        return <RecipesManager />;
      case 'meal-plan':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Planejamento de Cardápio</h1>
              <p className="text-gray-600">Organize suas refeições da semana</p>
            </div>
            <MealPlanCalendar
              currentDate={new Date()}
              mealPlans={mealPlans}
              recipes={recipes}
              onMealPlanAdd={handleMealPlanAdd}
              onMealPlanRemove={deleteMealPlan}
            />
          </div>
        );
      case 'shopping':
        return <ShoppingListManager />;
      case 'settings':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
              <p className="text-gray-600">Configure suas preferências</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-gray-500">Configurações em desenvolvimento...</p>
            </div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}

export default App;