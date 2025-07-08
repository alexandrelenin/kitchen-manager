import React, { useState } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, UserIcon } from '@heroicons/react/24/outline';
import type { HouseMember } from '../types';
import { useHouseMembers } from '../hooks/useDatabase';

interface MemberFormData {
  name: string;
  preferences: string[];
  restrictions: string[];
  allergies: string[];
}

export default function MembersManager() {
  const { members, loading, error, addMember, updateMember, deleteMember } = useHouseMembers();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<HouseMember | null>(null);
  const [formData, setFormData] = useState<MemberFormData>({
    name: '',
    preferences: [],
    restrictions: [],
    allergies: [],
  });

  const [newPreference, setNewPreference] = useState('');
  const [newRestriction, setNewRestriction] = useState('');
  const [newAllergy, setNewAllergy] = useState('');

  const resetForm = () => {
    setFormData({
      name: '',
      preferences: [],
      restrictions: [],
      allergies: [],
    });
    setNewPreference('');
    setNewRestriction('');
    setNewAllergy('');
  };

  const openModal = (member?: HouseMember) => {
    if (member) {
      setEditingMember(member);
      setFormData({
        name: member.name,
        preferences: [...member.preferences],
        restrictions: [...member.restrictions],
        allergies: [...member.allergies],
      });
    } else {
      setEditingMember(null);
      resetForm();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingMember(null);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Nome é obrigatório');
      return;
    }

    try {
      if (editingMember) {
        await updateMember(editingMember.id, formData);
      } else {
        await addMember({
          ...formData,
          isActive: true,
        });
      }
      closeModal();
    } catch (error) {
      console.error('Erro ao salvar membro:', error);
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este membro?')) {
      try {
        await deleteMember(id);
      } catch (error) {
        console.error('Erro ao excluir membro:', error);
      }
    }
  };

  const addTag = (type: 'preferences' | 'restrictions' | 'allergies', value: string) => {
    if (value.trim() && !formData[type].includes(value.trim())) {
      setFormData(prev => ({
        ...prev,
        [type]: [...prev[type], value.trim()]
      }));
      
      if (type === 'preferences') setNewPreference('');
      if (type === 'restrictions') setNewRestriction('');
      if (type === 'allergies') setNewAllergy('');
    }
  };

  const removeTag = (type: 'preferences' | 'restrictions' | 'allergies', value: string) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter(item => item !== value)
    }));
  };

  const TagInput = ({ 
    label, 
    type, 
    value, 
    onChange, 
    onAdd, 
    placeholder 
  }: {
    label: string;
    type: 'preferences' | 'restrictions' | 'allergies';
    value: string;
    onChange: (value: string) => void;
    onAdd: () => void;
    placeholder: string;
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), onAdd())}
        />
        <button
          type="button"
          onClick={onAdd}
          className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <PlusIcon className="h-4 w-4" />
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {formData[type].map((item) => (
          <span
            key={item}
            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
          >
            {item}
            <button
              type="button"
              onClick={() => removeTag(type, item)}
              className="ml-1 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );

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
          <h1 className="text-2xl font-bold text-gray-900">Membros da Casa</h1>
          <p className="text-gray-600">Gerencie os membros da família e suas preferências</p>
        </div>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Adicionar Membro
        </button>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((member) => (
          <div key={member.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <UserIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">{member.name}</h3>
                  <p className="text-sm text-gray-500">
                    {member.isActive ? 'Ativo' : 'Inativo'}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => openModal(member)}
                  className="text-gray-400 hover:text-blue-600"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDeleteMember(member.id)}
                  className="text-gray-400 hover:text-red-600"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {member.preferences.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Preferências</h4>
                  <div className="flex flex-wrap gap-1">
                    {member.preferences.map((pref) => (
                      <span
                        key={pref}
                        className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                      >
                        {pref}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {member.restrictions.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Restrições</h4>
                  <div className="flex flex-wrap gap-1">
                    {member.restrictions.map((restriction) => (
                      <span
                        key={restriction}
                        className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full"
                      >
                        {restriction}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {member.allergies.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Alergias</h4>
                  <div className="flex flex-wrap gap-1">
                    {member.allergies.map((allergy) => (
                      <span
                        key={allergy}
                        className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full"
                      >
                        {allergy}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingMember ? 'Editar Membro' : 'Adicionar Membro'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <TagInput
                label="Preferências"
                type="preferences"
                value={newPreference}
                onChange={setNewPreference}
                onAdd={() => addTag('preferences', newPreference)}
                placeholder="Ex: Vegetariano, Doces, etc."
              />

              <TagInput
                label="Restrições"
                type="restrictions"
                value={newRestriction}
                onChange={setNewRestriction}
                onAdd={() => addTag('restrictions', newRestriction)}
                placeholder="Ex: Sem glúten, Pouco sal, etc."
              />

              <TagInput
                label="Alergias"
                type="allergies"
                value={newAllergy}
                onChange={setNewAllergy}
                onAdd={() => addTag('allergies', newAllergy)}
                placeholder="Ex: Amendoim, Leite, etc."
              />

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingMember ? 'Atualizar' : 'Adicionar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}