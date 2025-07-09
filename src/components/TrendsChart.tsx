import { useAnalytics } from '../hooks/useAnalytics';

interface TrendData {
  week: number;
  value: number;
  label: string;
}

interface SimpleChartProps {
  data: TrendData[];
  title: string;
  color: string;
  unit?: string;
}

function SimpleChart({ data, title, color, unit = '' }: SimpleChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p>Dados insuficientes para mostrar tendência</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900">{title}</h4>
      <div className="relative h-32">
        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-px bg-gray-200" />
          ))}
        </div>
        
        {/* Chart area */}
        <svg className="absolute inset-0 w-full h-full">
          <defs>
            <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.8 }} />
              <stop offset="100%" style={{ stopColor: color, stopOpacity: 0.1 }} />
            </linearGradient>
          </defs>
          
          {/* Line chart */}
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="2"
            points={data.map((point, index) => {
              const x = (index / (data.length - 1)) * 100;
              const y = 100 - ((point.value - minValue) / range) * 100;
              return `${x},${y}`;
            }).join(' ')}
            vectorEffect="non-scaling-stroke"
          />
          
          {/* Area fill */}
          <polygon
            fill={`url(#gradient-${color})`}
            points={[
              ...data.map((point, index) => {
                const x = (index / (data.length - 1)) * 100;
                const y = 100 - ((point.value - minValue) / range) * 100;
                return `${x},${y}`;
              }),
              `100,100`,
              `0,100`
            ].join(' ')}
          />
          
          {/* Data points */}
          {data.map((point, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = 100 - ((point.value - minValue) / range) * 100;
            return (
              <circle
                key={index}
                cx={`${x}%`}
                cy={`${y}%`}
                r="3"
                fill={color}
                className="cursor-pointer"
              >
                <title>{`Semana ${point.week}: ${point.value}${unit}`}</title>
              </circle>
            );
          })}
        </svg>
      </div>
      
      {/* X-axis labels */}
      <div className="flex justify-between text-xs text-gray-500">
        {data.map((point) => (
          <span key={point.week}>Sem {point.week}</span>
        ))}
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: color }} />
          <span className="text-gray-600">{title}</span>
        </div>
        <div className="text-gray-900 font-medium">
          {data[data.length - 1]?.value}{unit}
        </div>
      </div>
    </div>
  );
}

function CategoryChart({ data }: { data: Array<{ category: string; count: number }> }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p>Nenhuma categoria de receita encontrada</p>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.count, 0);
  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900">Receitas por Categoria</h4>
      <div className="space-y-3">
        {data.slice(0, 7).map((item, index) => {
          const percentage = (item.count / total) * 100;
          const color = colors[index % colors.length];
          
          return (
            <div key={item.category} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-gray-700">{item.category}</span>
                </div>
                <span className="text-gray-900 font-medium">{item.count}x</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${percentage}%`,
                    backgroundColor: color
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function TrendsChart() {
  const { monthlyTrends, loading, error } = useAnalytics();

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Tendências e Histórico</h2>
          <p className="text-gray-600">Análise temporal dos seus hábitos culinários</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Carregando tendências...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Tendências e Histórico</h2>
          <p className="text-gray-600">Análise temporal dos seus hábitos culinários</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">Erro ao carregar tendências: {error}</div>
        </div>
      </div>
    );
  }

  const mealPlanData = monthlyTrends?.mealPlanningTrend?.map(item => ({
    week: item.week,
    value: item.planned,
    label: `${item.planned} planejadas`
  })) || [];

  const ingredientUsageData = monthlyTrends?.ingredientUsageTrend?.map(item => ({
    week: item.week,
    value: item.used,
    label: `${item.used} utilizados`
  })) || [];

  const costData = monthlyTrends?.costTrend?.map(item => ({
    week: item.week,
    value: item.planned,
    label: `R$ ${item.planned}`
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Tendências e Histórico</h2>
        <p className="text-gray-600">Análise temporal dos seus hábitos culinários</p>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Meal Planning Trend */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <SimpleChart
            data={mealPlanData}
            title="Planejamento de Refeições"
            color="#3b82f6"
            unit=" refeições"
          />
        </div>

        {/* Ingredient Usage Trend */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <SimpleChart
            data={ingredientUsageData}
            title="Uso de Ingredientes"
            color="#10b981"
            unit=" ingredientes"
          />
        </div>

        {/* Cost Trend */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <SimpleChart
            data={costData}
            title="Evolução de Custos"
            color="#f59e0b"
            unit=""
          />
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <CategoryChart data={monthlyTrends?.recipeCategoryTrend || []} />
        </div>
      </div>

      {/* Insights Section */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 p-6">
        <h3 className="text-lg font-medium text-purple-900 mb-4">Insights das Tendências</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {monthlyTrends && (
            <>
              {/* Trend Analysis */}
              {monthlyTrends.mealPlanningTrend && monthlyTrends.mealPlanningTrend.length > 1 && (
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">📈 Planejamento</h4>
                  <p className="text-sm text-gray-600">
                    {(() => {
                      const trend = monthlyTrends.mealPlanningTrend;
                      const latest = trend[trend.length - 1]?.planned || 0;
                      const previous = trend[trend.length - 2]?.planned || 0;
                      const change = latest - previous;
                      
                      if (change > 0) {
                        return `Você está planejando ${change} refeições a mais que na semana passada! 🎉`;
                      } else if (change < 0) {
                        return `Você planejou ${Math.abs(change)} refeições a menos esta semana. Que tal retomar o ritmo? 💪`;
                      } else {
                        return 'Seu planejamento está consistente! Mantenha o bom trabalho! ⭐';
                      }
                    })()}
                  </p>
                </div>
              )}

              {/* Category Insights */}
              {monthlyTrends.recipeCategoryTrend && monthlyTrends.recipeCategoryTrend.length > 0 && (
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">🍽️ Preferências</h4>
                  <p className="text-sm text-gray-600">
                    Sua categoria favorita é <strong>{monthlyTrends.recipeCategoryTrend[0]?.category}</strong> com{' '}
                    {monthlyTrends.recipeCategoryTrend[0]?.count} receitas executadas.
                    {monthlyTrends.recipeCategoryTrend.length > 1 && (
                      <> Seguida por <strong>{monthlyTrends.recipeCategoryTrend[1]?.category}</strong>.</>
                    )}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}