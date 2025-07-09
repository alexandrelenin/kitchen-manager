import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, effectiveTheme, setTheme } = useTheme();

  const themes = [
    { 
      id: 'light' as const, 
      name: 'Claro', 
      icon: SunIcon,
      description: 'Tema claro'
    },
    { 
      id: 'dark' as const, 
      name: 'Escuro', 
      icon: MoonIcon,
      description: 'Tema escuro'
    },
    { 
      id: 'system' as const, 
      name: 'Sistema', 
      icon: ComputerDesktopIcon,
      description: 'Seguir sistema'
    },
  ];

  const currentTheme = themes.find(t => t.id === theme) || themes[0];
  const CurrentIcon = currentTheme.icon;

  return (
    <div className="relative group">
      <button
        onClick={() => {
          // Ciclar entre os temas
          const currentIndex = themes.findIndex(t => t.id === theme);
          const nextIndex = (currentIndex + 1) % themes.length;
          setTheme(themes[nextIndex].id);
        }}
        className={`
          relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
          ${effectiveTheme === 'dark' 
            ? 'bg-dark-800 text-dark-100 hover:bg-dark-700 border border-dark-600' 
            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }
          hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
          ${effectiveTheme === 'dark' ? 'focus:ring-offset-dark-800' : 'focus:ring-offset-white'}
        `}
        title={currentTheme.description}
      >
        <CurrentIcon className="h-4 w-4" />
        <span className="hidden sm:inline">{currentTheme.name}</span>
        
        {/* Indicador visual do tema efetivo */}
        <div className={`
          w-1.5 h-1.5 rounded-full transition-colors duration-200
          ${effectiveTheme === 'dark' ? 'bg-blue-400' : 'bg-yellow-400'}
        `} />
      </button>

      {/* Tooltip com informações */}
      <div className={`
        absolute right-0 top-full mt-2 py-2 px-3 rounded-lg shadow-lg border z-50
        transform opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 
        transition-all duration-200 pointer-events-none
        ${effectiveTheme === 'dark' 
          ? 'bg-dark-800 text-dark-100 border-dark-600' 
          : 'bg-white text-gray-700 border-gray-200'
        }
      `}>
        <div className="text-xs whitespace-nowrap">
          <div className="font-medium">{currentTheme.name}</div>
          <div className={`${effectiveTheme === 'dark' ? 'text-dark-400' : 'text-gray-500'}`}>
            Efetivo: {effectiveTheme === 'dark' ? 'Escuro' : 'Claro'}
          </div>
        </div>
      </div>
    </div>
  );
}