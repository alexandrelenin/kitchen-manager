import { useState } from 'react';
import {
  LinkIcon,
  DocumentTextIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { recipeImporter, type ImportResult } from '../lib/recipeImporter';
import { dbService } from '../lib/database';
import type { Recipe } from '../types';

interface RecipeImporterProps {
  onRecipeImported?: (recipe: Recipe) => void;
  onClose?: () => void;
}

export default function RecipeImporter({ onRecipeImported, onClose }: RecipeImporterProps) {
  const [activeTab, setActiveTab] = useState<'url' | 'text'>('url');
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleImportFromUrl = async () => {
    if (!url.trim()) return;

    setIsImporting(true);
    setImportResult(null);
    
    try {
      const result = await recipeImporter.importRecipeFromUrl(url);
      setImportResult(result);
      setShowResult(true);
      
      if (result.success && result.recipe) {
        await saveRecipe(result.recipe);
      }
    } catch (error) {
      setImportResult({
        success: false,
        error: 'Erro inesperado ao importar receita'
      });
      setShowResult(true);
    } finally {
      setIsImporting(false);
    }
  };

  const handleImportFromText = async () => {
    if (!text.trim()) return;

    setIsImporting(true);
    setImportResult(null);
    
    try {
      const result = await recipeImporter.importRecipeFromText(text);
      setImportResult(result);
      setShowResult(true);
      
      if (result.success && result.recipe) {
        await saveRecipe(result.recipe);
      }
    } catch (error) {
      setImportResult({
        success: false,
        error: 'Erro inesperado ao processar texto'
      });
      setShowResult(true);
    } finally {
      setIsImporting(false);
    }
  };

  const saveRecipe = async (recipe: Recipe) => {
    try {
      await dbService.addRecipe(recipe);
      onRecipeImported?.(recipe);
    } catch (error) {
      console.error('Error saving imported recipe:', error);
    }
  };

  const handleTryAgain = () => {
    setShowResult(false);
    setImportResult(null);
    setUrl('');
    setText('');
  };

  const supportedSites = recipeImporter.getSupportedSites();

  if (showResult && importResult) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 max-w-2xl mx-auto">
        <div className="p-6">
          <div className="text-center">
            {importResult.success ? (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircleIcon className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-900 mb-2">
                    Receita Importada com Sucesso!
                  </h3>
                  <p className="text-green-700">
                    "{importResult.recipe?.name}" foi adicionada às suas receitas.
                  </p>
                </div>
                
                {importResult.warnings && importResult.warnings.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                      <div className="text-left">
                        <h4 className="font-medium text-yellow-800">Avisos:</h4>
                        <ul className="text-sm text-yellow-700 mt-1">
                          {importResult.warnings.map((warning, index) => (
                            <li key={index}>• {warning}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
                
                {importResult.recipe && (
                  <div className="bg-gray-50 rounded-lg p-4 text-left">
                    <div className="flex items-center gap-3 mb-3">
                      <img 
                        src={importResult.recipe.imageUrl || 'https://via.placeholder.com/400x300/64748b/ffffff?text=Receita'} 
                        alt={importResult.recipe.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <h4 className="font-medium text-gray-900">{importResult.recipe.name}</h4>
                        <p className="text-sm text-gray-600">{importResult.recipe.source}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Preparo:</span>
                        <span className="font-medium ml-1">{importResult.recipe.prepTime}min</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Cozimento:</span>
                        <span className="font-medium ml-1">{importResult.recipe.cookTime}min</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Porções:</span>
                        <span className="font-medium ml-1">{importResult.recipe.servings}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <XMarkIcon className="h-8 w-8 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-red-900 mb-2">
                    Erro ao Importar Receita
                  </h3>
                  <p className="text-red-700">
                    {importResult.error}
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex justify-center gap-4 pt-6">
              <button
                onClick={handleTryAgain}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Tentar Novamente
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Fechar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <CloudArrowUpIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Importar Receita</h2>
              <p className="text-sm text-gray-600">
                Importe receitas de sites ou texto
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mt-4">
          <button
            onClick={() => setActiveTab('url')}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === 'url'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <LinkIcon className="h-4 w-4" />
            Por URL
          </button>
          <button
            onClick={() => setActiveTab('text')}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === 'text'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <DocumentTextIcon className="h-4 w-4" />
            Por Texto
          </button>
        </div>
      </div>

      <div className="p-6">
        {activeTab === 'url' ? (
          <div className="space-y-6">
            {/* URL Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL da Receita
              </label>
              <div className="flex">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://exemplo.com/receita"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleImportFromUrl}
                  disabled={!url.trim() || isImporting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isImporting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Importando...
                    </>
                  ) : (
                    <>
                      <CloudArrowUpIcon className="h-4 w-4" />
                      Importar
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Supported Sites */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Sites Suportados:
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {supportedSites.map((site) => (
                  <div key={site.domain} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg">
                    <img 
                      src={site.logo} 
                      alt={site.name}
                      className="w-6 h-6 rounded"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{site.name}</div>
                      <div className="text-xs text-gray-500">{site.domain}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Dicas para Importação:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Certifique-se de que a URL é da página específica da receita</li>
                <li>• Sites suportados têm melhor precisão na importação</li>
                <li>• Algumas informações podem precisar de ajustes manuais</li>
                <li>• Verifique sempre os ingredientes e instruções após importar</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Text Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Texto da Receita
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={12}
                placeholder="Cole aqui o texto da receita com ingredientes e modo de preparo..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Import Button */}
            <div className="flex justify-end">
              <button
                onClick={handleImportFromText}
                disabled={!text.trim() || isImporting}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isImporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processando...
                  </>
                ) : (
                  <>
                    <DocumentTextIcon className="h-4 w-4" />
                    Processar Texto
                  </>
                )}
              </button>
            </div>

            {/* Example Format */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Formato Sugerido:</h4>
              <div className="text-sm text-gray-700 space-y-2">
                <div>
                  <strong>Nome da Receita</strong><br />
                  Breve descrição da receita
                </div>
                <div>
                  <strong>Ingredientes:</strong><br />
                  • 2 xícaras de farinha de trigo<br />
                  • 1 xícara de açúcar<br />
                  • 3 ovos
                </div>
                <div>
                  <strong>Modo de Preparo:</strong><br />
                  1. Misture os ingredientes secos<br />
                  2. Adicione os líquidos<br />
                  3. Asse por 30 minutos
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}