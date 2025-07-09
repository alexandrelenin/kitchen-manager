import { useState } from 'react';
import {
  StarIcon,
  CameraIcon,
  ClockIcon,
  UserGroupIcon,
  PlusIcon,
  XMarkIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { useRecipeEvaluation } from '../hooks/useRecipeEvaluation';
import type { DetailedRating, RecipeVariation, RecipeExecution } from '../lib/recipeEvaluation';
import type { Recipe } from '../types';

interface RecipeEvaluationFormProps {
  recipe: Recipe;
  onSubmit?: (execution: RecipeExecution) => void;
  onCancel?: () => void;
}

export default function RecipeEvaluationForm({ recipe, onSubmit, onCancel }: RecipeEvaluationFormProps) {
  const { recordExecution, uploadPhoto, loading } = useRecipeEvaluation(recipe.id);
  
  // Form state
  const [actualPrepTime, setActualPrepTime] = useState(recipe.prepTime);
  const [actualCookTime, setActualCookTime] = useState(recipe.cookTime);
  const [actualServings, setActualServings] = useState(recipe.servings);
  const [difficulty, setDifficulty] = useState<'easier' | 'as_expected' | 'harder'>('as_expected');
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [variations, setVariations] = useState<RecipeVariation[]>([]);
  const [rating, setRating] = useState<DetailedRating>({
    overall: 4,
    taste: 4,
    difficulty: 3,
    preparation: 4,
    presentation: 4,
    value: 4,
    wouldMakeAgain: true,
    familyApproval: []
  });

  const [showVariationForm, setShowVariationForm] = useState(false);

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      try {
        const photoUrl = await uploadPhoto(file);
        setPhotos(prev => [...prev, photoUrl]);
      } catch (error) {
        console.error('Erro no upload da foto:', error);
      }
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const addVariation = (variation: Omit<RecipeVariation, 'id'>) => {
    const newVariation: RecipeVariation = {
      id: crypto.randomUUID(),
      ...variation
    };
    setVariations(prev => [...prev, newVariation]);
    setShowVariationForm(false);
  };

  const removeVariation = (id: string) => {
    setVariations(prev => prev.filter(v => v.id !== id));
  };


  const updateRating = (field: keyof DetailedRating, value: number | boolean) => {
    setRating(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const execution: Omit<RecipeExecution, 'id' | 'createdAt' | 'updatedAt'> = {
        recipeId: recipe.id,
        executedAt: new Date(),
        actualPrepTime,
        actualCookTime,
        actualServings,
        difficulty,
        photos,
        notes,
        variations,
        rating
      };

      await recordExecution(execution);
      onSubmit?.(execution as RecipeExecution);
    } catch (error) {
      console.error('Erro ao enviar avaliação:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Avaliar Execução</h3>
          <p className="text-gray-600">{recipe.name}</p>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tempo e Porções Reais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <ClockIcon className="h-4 w-4 inline mr-1" />
              Tempo de Preparo Real (min)
            </label>
            <input
              type="number"
              value={actualPrepTime}
              onChange={(e) => setActualPrepTime(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <ClockIcon className="h-4 w-4 inline mr-1" />
              Tempo de Cozimento Real (min)
            </label>
            <input
              type="number"
              value={actualCookTime}
              onChange={(e) => setActualCookTime(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <UserGroupIcon className="h-4 w-4 inline mr-1" />
              Porções Reais
            </label>
            <input
              type="number"
              value={actualServings}
              onChange={(e) => setActualServings(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Dificuldade Percebida */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dificuldade Percebida
          </label>
          <div className="flex space-x-4">
            {[
              { value: 'easier', label: 'Mais Fácil', color: 'green' },
              { value: 'as_expected', label: 'Como Esperado', color: 'blue' },
              { value: 'harder', label: 'Mais Difícil', color: 'red' }
            ].map((option) => (
              <label key={option.value} className="flex items-center">
                <input
                  type="radio"
                  value={option.value}
                  checked={difficulty === option.value}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="mr-2"
                />
                <span className={`text-${option.color}-600`}>{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Avaliação Detalhada */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Avaliação Detalhada</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'overall', label: 'Avaliação Geral' },
              { key: 'taste', label: 'Sabor' },
              { key: 'difficulty', label: 'Dificuldade' },
              { key: 'preparation', label: 'Clareza do Preparo' },
              { key: 'presentation', label: 'Apresentação' },
              { key: 'value', label: 'Custo-Benefício' }
            ].map((item) => (
              <div key={item.key}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {item.label}
                </label>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => updateRating(item.key as keyof DetailedRating, star)}
                      className="focus:outline-none"
                    >
                      {star <= (rating[item.key as keyof DetailedRating] as number) ? (
                        <StarIconSolid className="h-6 w-6 text-yellow-400" />
                      ) : (
                        <StarIcon className="h-6 w-6 text-gray-300" />
                      )}
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    {rating[item.key as keyof DetailedRating] as number}/5
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={rating.wouldMakeAgain}
                onChange={(e) => updateRating('wouldMakeAgain', e.target.checked)}
                className="mr-2"
              />
              <HeartIcon className="h-4 w-4 mr-1 text-red-500" />
              <span className="text-sm font-medium text-gray-700">Faria novamente</span>
            </label>
          </div>
        </div>

        {/* Fotos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <CameraIcon className="h-4 w-4 inline mr-1" />
            Fotos da Execução
          </label>
          
          <div className="flex flex-wrap gap-4 mb-4">
            {photos.map((photo, index) => (
              <div key={index} className="relative">
                <img
                  src={photo}
                  alt={`Execução ${index + 1}`}
                  className="w-24 h-24 object-cover rounded-lg border border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
            
            <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400">
              <CameraIcon className="h-8 w-8 text-gray-400" />
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Variações */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-900">Variações Aplicadas</h4>
            <button
              type="button"
              onClick={() => setShowVariationForm(true)}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
            >
              <PlusIcon className="h-4 w-4" />
              Adicionar Variação
            </button>
          </div>
          
          {variations.map((variation) => (
            <div key={variation.id} className="border border-gray-200 rounded-lg p-3 mb-2 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{variation.description}</p>
                <p className="text-sm text-gray-600">
                  {variation.originalValue} → {variation.newValue}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeVariation(variation.id)}
                className="text-red-500 hover:text-red-700"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Notas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notas e Observações
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Compartilhe suas observações, dicas e comentários sobre esta execução..."
          />
        </div>

        {/* Botões */}
        <div className="flex justify-end space-x-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar Avaliação'}
          </button>
        </div>
      </form>

      {/* Modal de Variação */}
      {showVariationForm && (
        <VariationForm
          onSubmit={addVariation}
          onCancel={() => setShowVariationForm(false)}
        />
      )}
    </div>
  );
}

function VariationForm({ 
  onSubmit, 
  onCancel 
}: { 
  onSubmit: (variation: Omit<RecipeVariation, 'id'>) => void;
  onCancel: () => void;
}) {
  const [type, setType] = useState<RecipeVariation['type']>('ingredient_substitution');
  const [description, setDescription] = useState('');
  const [originalValue, setOriginalValue] = useState('');
  const [newValue, setNewValue] = useState('');
  const [impact, setImpact] = useState<RecipeVariation['impact']>('neutral');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      type,
      description,
      originalValue,
      newValue,
      impact,
      notes
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Adicionar Variação</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Variação
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as RecipeVariation['type'])}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ingredient_substitution">Substituição de Ingrediente</option>
              <option value="technique_change">Mudança de Técnica</option>
              <option value="seasoning_adjustment">Ajuste de Tempero</option>
              <option value="other">Outro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Substituição de leite por leite de coco"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Original
              </label>
              <input
                type="text"
                value={originalValue}
                onChange={(e) => setOriginalValue(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Leite integral"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Novo
              </label>
              <input
                type="text"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Leite de coco"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Impacto no Resultado
            </label>
            <select
              value={impact}
              onChange={(e) => setImpact(e.target.value as RecipeVariation['impact'])}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="improved">Melhorou</option>
              <option value="neutral">Neutro</option>
              <option value="worsened">Piorou</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Detalhes sobre a variação..."
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
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
  );
}