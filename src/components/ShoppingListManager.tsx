import React, { useState, useMemo } from 'react';
import { PlusIcon, TrashIcon, SparklesIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { CheckIcon as CheckIconSolid } from '@heroicons/react/24/solid';
import { startOfWeek, endOfWeek } from 'date-fns';
import type { ShoppingListItem } from '../types';
import { useShoppingList } from '../hooks/useDatabase';
import { useTheme } from '../contexts/ThemeContext';
import PriceComparisonWidget from './PriceComparisonWidget';
import PriceComparison from './PriceComparison';

const categories = [
  'Carnes e Aves',
  'Peixes e Frutos do Mar',
  'Laticínios',
  'Hortifruti',
  'Grãos e Cereais',
  'Temperos e Condimentos',
  'Bebidas',
  'Congelados',
  'Outros'
];

interface NewItemData {
  name: string;
  quantity: number;
  unit: string;
  category: string;
}

export default function ShoppingListManager() {
  const { shoppingList, loading, error, addItem, updateItem, deleteItem, generateShoppingList } = useShoppingList();
  const { effectiveTheme } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPriceComparison, setShowPriceComparison] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<string>('');
  const [newItem, setNewItem] = useState<NewItemData>({
    name: '',
    quantity: 1,
    unit: 'un',
    category: categories[0],
  });

  const groupedItems = useMemo(() => {
    const groups: Record<string, ShoppingListItem[]> = {};
    shoppingList.forEach(item => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    return groups;
  }, [shoppingList]);

  const stats = useMemo(() => {
    const total = shoppingList.length;
    const purchased = shoppingList.filter(item => item.isPurchased).length;
    const remaining = total - purchased;
    const progress = total > 0 ? (purchased / total) * 100 : 0;
    
    return { total, purchased, remaining, progress };
  }, [shoppingList]);

  const unpurchasedIngredients = useMemo(() => {
    return shoppingList
      .filter(item => !item.isPurchased)
      .map(item => item.name);
  }, [shoppingList]);

  const handleOpenPriceComparison = (ingredient: string = '') => {
    setSelectedIngredient(ingredient);
    setShowPriceComparison(true);
  };

  const handleClosePriceComparison = () => {
    setShowPriceComparison(false);
    setSelectedIngredient('');
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newItem.name.trim()) {
      alert('Nome do item é obrigatório');
      return;
    }

    try {
      await addItem({
        ...newItem,
        isPurchased: false,
        isGenerated: false,
      });
      setNewItem({
        name: '',
        quantity: 1,
        unit: 'un',
        category: categories[0],
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
    }
  };

  const handleToggleItem = async (item: ShoppingListItem) => {
    try {
      await updateItem(item.id, { isPurchased: !item.isPurchased });
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este item?')) {
      try {
        await deleteItem(id);
      } catch (error) {
        console.error('Erro ao excluir item:', error);
      }
    }
  };

  const handleGenerateList = async () => {
    setIsGenerating(true);
    try {
      const startDate = startOfWeek(new Date(), { weekStartsOn: 0 });
      const endDate = endOfWeek(new Date(), { weekStartsOn: 0 });
      await generateShoppingList(startDate, endDate);
    } catch (error) {
      console.error('Erro ao gerar lista:', error);
      alert('Erro ao gerar lista de compras. Verifique se há receitas planejadas para esta semana.');
    } finally {
      setIsGenerating(false);
    }
  };

  const clearPurchased = async () => {
    if (confirm('Tem certeza que deseja remover todos os itens comprados?')) {
      try {
        const purchasedItems = shoppingList.filter(item => item.isPurchased);
        await Promise.all(purchasedItems.map(item => deleteItem(item.id)));
      } catch (error) {
        console.error('Erro ao limpar itens comprados:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-red-800">Erro: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Lista de Compras</h1>
          <p className={`${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Gerencie sua lista de compras</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleGenerateList}
            disabled={isGenerating}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
          >
            <SparklesIcon className="h-5 w-5 mr-2" />
            {isGenerating ? 'Gerando...' : 'Gerar Lista'}
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Adicionar Item
          </button>
        </div>
      </div>

      {/* Progress */}
      {shoppingList.length > 0 && (
        <div className={`${effectiveTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm border ${effectiveTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'} p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg font-semibold ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Progresso das Compras</h2>
            <div className={`text-sm ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {stats.purchased} de {stats.total} itens
            </div>
          </div>
          <div className={`w-full ${effectiveTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2 mb-4`}>
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${stats.progress}%` }}
            />
          </div>
          <div className={`flex justify-between text-sm ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            <span>{stats.remaining} itens restantes</span>
            <span>{Math.round(stats.progress)}% completo</span>
          </div>
          {stats.purchased > 0 && (
            <div className="mt-4">
              <button
                onClick={clearPurchased}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Limpar itens comprados
              </button>
            </div>
          )}
        </div>
      )}

      {/* Price Comparison Widget */}
      {unpurchasedIngredients.length > 0 && (
        <PriceComparisonWidget
          ingredients={unpurchasedIngredients}
          onOpenFullComparison={handleOpenPriceComparison}
        />
      )}

      {/* Shopping List */}
      {shoppingList.length === 0 ? (
        <div className={`${effectiveTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm border ${effectiveTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'} p-12 text-center`}>
          <div className={`${effectiveTheme === 'dark' ? 'text-gray-500' : 'text-gray-400'} mb-4`}>
            <SparklesIcon className="h-12 w-12 mx-auto" />
          </div>
          <h3 className={`text-lg font-medium ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>Lista vazia</h3>
          <p className={`${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
            Adicione itens manualmente ou gere uma lista baseada no seu planejamento de cardápio.
          </p>
          <div className="space-x-3">
            <button
              onClick={handleGenerateList}
              disabled={isGenerating}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              <SparklesIcon className="h-5 w-5 mr-2" />
              {isGenerating ? 'Gerando...' : 'Gerar Lista'}
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Adicionar Item
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category} className={`${effectiveTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm border ${effectiveTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className={`px-6 py-4 border-b ${effectiveTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-medium ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{category}</h3>
                <p className={`text-sm ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {items.filter(item => !item.isPurchased).length} de {items.length} itens
                </p>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-4 p-3 rounded-lg border transition-colors ${
                        item.isPurchased
                          ? `${effectiveTheme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`
                          : `${effectiveTheme === 'dark' ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-gray-300'}`
                      }`}
                    >
                      <button
                        onClick={() => handleToggleItem(item)}
                        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                          item.isPurchased
                            ? 'bg-green-600 border-green-600 text-white'
                            : 'border-gray-300 hover:border-green-500'
                        }`}
                      >
                        {item.isPurchased && <CheckIconSolid className="h-4 w-4" />}
                      </button>
                      
                      <div className="flex-1">
                        <div className={`font-medium ${
                          item.isPurchased ? `${effectiveTheme === 'dark' ? 'text-gray-500' : 'text-gray-500'} line-through` : `${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'}`
                        }`}>
                          {item.name}
                        </div>
                        <div className={`text-sm ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {item.quantity} {item.unit}
                          {item.isGenerated && (
                            <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                              Auto
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className={`${effectiveTheme === 'dark' ? 'text-gray-500 hover:text-red-400' : 'text-gray-400 hover:text-red-600'} p-1`}
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${effectiveTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-md mx-4`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-bold ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Adicionar Item</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className={`${effectiveTheme === 'dark' ? 'text-gray-500 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${effectiveTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Nome do Item *
                </label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full px-3 py-2 border ${effectiveTheme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${effectiveTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Quantidade *
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 1 }))}
                    className={`w-full px-3 py-2 border ${effectiveTheme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${effectiveTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Unidade *
                  </label>
                  <select
                    value={newItem.unit}
                    onChange={(e) => setNewItem(prev => ({ ...prev, unit: e.target.value }))}
                    className={`w-full px-3 py-2 border ${effectiveTheme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    required
                  >
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="L">L</option>
                    <option value="mL">mL</option>
                    <option value="un">un</option>
                    <option value="dz">dz</option>
                    <option value="pct">pct</option>
                    <option value="lata">lata</option>
                    <option value="garrafa">garrafa</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${effectiveTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Categoria *
                </label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
                  className={`w-full px-3 py-2 border ${effectiveTheme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={`px-4 py-2 ${effectiveTheme === 'dark' ? 'text-gray-300 bg-gray-600 hover:bg-gray-500' : 'text-gray-700 bg-gray-200 hover:bg-gray-300'} rounded-md`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Price Comparison Modal */}
      {showPriceComparison && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <PriceComparison
              ingredient={selectedIngredient}
              onClose={handleClosePriceComparison}
            />
          </div>
        </div>
      )}
    </div>
  );
}