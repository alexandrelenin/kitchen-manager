import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initializeCordonBleuRecipes } from './data/cordonBleuRecipes'

// Initialize database with Le Cordon Bleu recipes
initializeCordonBleuRecipes();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
