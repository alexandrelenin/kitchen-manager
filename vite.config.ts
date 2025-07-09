import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/kitchen-manager/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          vendor: ['react', 'react-dom'],
          icons: ['@heroicons/react'],
          
          // Feature chunks
          database: ['dexie'],
          
          // Component chunks por funcionalidade
          recipes: [
            './src/components/ExpandedRecipeBank.tsx',
            './src/components/RecipeFilters.tsx',
            './src/components/RecipeImporter.tsx',
            './src/lib/externalRecipeAPI.ts',
            './src/lib/recipeCategories.ts',
            './src/lib/recipeImporter.ts'
          ],
          analytics: [
            './src/components/AdvancedDashboard.tsx',
            './src/components/RecipeAnalyticsDashboard.tsx',
            './src/components/TrendsChart.tsx',
            './src/lib/analytics.ts'
          ],
          planning: [
            './src/components/MealPlanGenerator.tsx',
            './src/components/ShoppingOptimizer.tsx',
            './src/lib/mealPlanGenerator.ts',
            './src/lib/shoppingOptimizer.ts'
          ],
          education: [
            './src/components/CulinaryEducation.tsx',
            './src/components/TutorialViewer.tsx',
            './src/lib/culinaryEducation.ts'
          ]
        }
      }
    },
    // Configurações de performance
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    chunkSizeWarningLimit: 1000
  },
  // Otimizações de desenvolvimento
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@heroicons/react/24/outline',
      '@heroicons/react/24/solid',
      'dexie'
    ]
  }
})
