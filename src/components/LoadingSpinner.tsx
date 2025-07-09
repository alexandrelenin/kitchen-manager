
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export default function LoadingSpinner({ 
  size = 'md', 
  text = 'Carregando...', 
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className={`flex flex-col items-center justify-center py-8 ${className}`}>
      <div className={`
        ${sizeClasses[size]} 
        border-4 border-primary-200 dark:border-dark-600 
        border-t-primary-600 dark:border-t-primary-400
        rounded-full animate-spin
      `} />
      {text && (
        <p className={`
          mt-4 text-gray-600 dark:text-dark-300 
          ${textSizeClasses[size]}
          animate-pulse
        `}>
          {text}
        </p>
      )}
    </div>
  );
}

// Loading para páginas completas
export function PageLoadingSpinner({ text = 'Carregando página...' }: { text?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-900 transition-colors duration-200">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
}

// Loading para seções
export function SectionLoadingSpinner({ text = 'Carregando...' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center py-12">
      <LoadingSpinner size="md" text={text} />
    </div>
  );
}

// Loading inline pequeno
export function InlineLoadingSpinner({ text }: { text?: string }) {
  return (
    <div className="flex items-center gap-2">
      <LoadingSpinner size="sm" text="" />
      {text && <span className="text-sm text-gray-600 dark:text-dark-300">{text}</span>}
    </div>
  );
}