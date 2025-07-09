import React from 'react';
import { Bars3Icon, HomeIcon, CalendarDaysIcon, BookOpenIcon, ShoppingBagIcon, UserGroupIcon, Cog6ToothIcon, ChartBarIcon, XMarkIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import ThemeToggle from './ThemeToggle';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

const navigation = [
  { name: 'Dashboard', href: 'dashboard', icon: HomeIcon },
  { name: 'Analytics', href: 'analytics', icon: ChartBarIcon },
  { name: 'Cardápio', href: 'meal-plan', icon: CalendarDaysIcon },
  { name: 'Banco de Receitas', href: 'recipes', icon: BookOpenIcon },
  { name: 'Culinária Educativa', href: 'education', icon: AcademicCapIcon },
  { name: 'Estoque', href: 'inventory', icon: ShoppingBagIcon },
  { name: 'Lista de Compras', href: 'shopping', icon: ShoppingBagIcon },
  { name: 'Membros', href: 'members', icon: UserGroupIcon },
  { name: 'Configurações', href: 'settings', icon: Cog6ToothIcon },
];

export default function Layout({ children, currentPage, onPageChange }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 transition-colors duration-200">
      {/* Mobile menu */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-dark-800 shadow-xl transition-colors duration-200">
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-dark-100">Kitchen Manager</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-500 dark:text-dark-400 hover:text-gray-700 dark:hover:text-dark-200 transition-colors"
            >
              <span className="sr-only">Fechar menu</span>
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <nav className="mt-5 px-2">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  onPageChange(item.href);
                  setSidebarOpen(false);
                }}
                className={`${
                  currentPage === item.href
                    ? 'bg-gray-100 dark:bg-dark-700 text-gray-900 dark:text-dark-100'
                    : 'text-gray-600 dark:text-dark-300 hover:bg-gray-50 dark:hover:bg-dark-700 hover:text-gray-900 dark:hover:text-dark-100'
                } group flex w-full items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-white dark:bg-dark-800 shadow transition-colors duration-200">
          <div className="flex h-16 items-center px-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-dark-100">Kitchen Manager</h1>
          </div>
          <nav className="mt-5 flex-1 px-2 pb-4">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => onPageChange(item.href)}
                className={`${
                  currentPage === item.href
                    ? 'bg-gray-100 dark:bg-dark-700 text-gray-900 dark:text-dark-100'
                    : 'text-gray-600 dark:text-dark-300 hover:bg-gray-50 dark:hover:bg-dark-700 hover:text-gray-900 dark:hover:text-dark-100'
                } group flex w-full items-center px-2 py-2 text-sm font-medium rounded-md mb-1 transition-colors duration-200`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white dark:bg-dark-800 shadow-sm transition-colors duration-200">
          <div className="flex h-16 items-center justify-between px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 dark:text-dark-400 hover:text-gray-700 dark:hover:text-dark-200 transition-colors lg:hidden"
            >
              <span className="sr-only">Abrir menu</span>
              <Bars3Icon className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-dark-100 lg:hidden">Kitchen Manager</h1>
            
            {/* Theme toggle - visible on all screens */}
            <div className="flex items-center gap-4">
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}