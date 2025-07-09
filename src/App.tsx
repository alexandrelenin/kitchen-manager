import { useState, Suspense, lazy } from 'react';
import Layout from './components/Layout';
import { ThemeProvider } from './contexts/ThemeContext';
import Dashboard from './components/Dashboard'; // Manter não-lazy por ser página inicial
import LoadingSpinner from './components/LoadingSpinner';
import { useRecipes, useMealPlans } from './hooks/useDatabase';

// Lazy loading dos componentes pesados
const AdvancedDashboard = lazy(() => import('./components/AdvancedDashboard'));
const MembersManager = lazy(() => import('./components/MembersManager'));
const InventoryManager = lazy(() => import('./components/InventoryManager'));
const ExpandedRecipeBank = lazy(() => import('./components/ExpandedRecipeBank'));
const MealPlanCalendar = lazy(() => import('./components/MealPlanCalendar'));
const ShoppingListManager = lazy(() => import('./components/ShoppingListManager'));
const CulinaryEducation = lazy(() => import('./components/CulinaryEducation'));

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
        return <ExpandedRecipeBank />;
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
      case 'education':
        return <CulinaryEducation />;
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
    <ThemeProvider>
      <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
        <Suspense fallback={<LoadingSpinner size="lg" text="Carregando página..." className="min-h-96" />}>
          {renderPage()}
        </Suspense>
      </Layout>
    </ThemeProvider>
  );
}

export default App;