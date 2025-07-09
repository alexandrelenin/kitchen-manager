import { useState, useEffect } from 'react';
import {
  PlayIcon,
  PauseIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  WrenchScrewdriverIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';
import { type CulinaryTutorial } from '../lib/culinaryEducation';
import { useTheme } from '../contexts/ThemeContext';

interface TutorialViewerProps {
  tutorial: CulinaryTutorial;
  onComplete: (tutorialId: string) => void;
  onClose: () => void;
}

export default function TutorialViewer({ tutorial, onComplete, onClose }: TutorialViewerProps) {
  const { effectiveTheme } = useTheme();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [isPlaying, setIsPlaying] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [userNotes, setUserNotes] = useState('');

  const currentStep = tutorial.steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / tutorial.steps.length) * 100;

  useEffect(() => {
    // Carregar progresso salvo do localStorage
    const savedProgress = localStorage.getItem(`tutorial-${tutorial.id}-progress`);
    if (savedProgress) {
      const { completedSteps: saved, currentStep, notes } = JSON.parse(savedProgress);
      setCompletedSteps(new Set(saved));
      setCurrentStepIndex(currentStep);
      setUserNotes(notes || '');
    }
  }, [tutorial.id]);

  const saveProgress = () => {
    const progressData = {
      completedSteps: Array.from(completedSteps),
      currentStep: currentStepIndex,
      notes: userNotes
    };
    localStorage.setItem(`tutorial-${tutorial.id}-progress`, JSON.stringify(progressData));
  };

  const handleStepComplete = (stepId: string) => {
    const newCompleted = new Set(completedSteps);
    newCompleted.add(stepId);
    setCompletedSteps(newCompleted);
    saveProgress();
  };

  const handleNextStep = () => {
    if (currentStepIndex < tutorial.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      saveProgress();
    }
  };

  const handlePreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      saveProgress();
    }
  };

  const handleTutorialComplete = () => {
    onComplete(tutorial.id);
    localStorage.removeItem(`tutorial-${tutorial.id}-progress`);
  };

  const isStepCompleted = (stepId: string) => completedSteps.has(stepId);
  const allStepsCompleted = tutorial.steps.every(step => isStepCompleted(step.id));

  return (
    <div className={`fixed inset-0 z-50 ${effectiveTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} overflow-hidden`}>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className={`${effectiveTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} border-b border-gray-200 dark:border-gray-700 px-6 py-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onClose}
                className={`p-2 rounded-lg ${effectiveTheme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
              <div>
                <h1 className={`text-xl font-semibold ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {tutorial.title}
                </h1>
                <p className={`text-sm ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Passo {currentStepIndex + 1} de {tutorial.steps.length}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <ClockIcon className="h-4 w-4 text-gray-500" />
                <span className={`text-sm ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {tutorial.duration}min
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  tutorial.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                  tutorial.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {tutorial.difficulty === 'easy' ? 'Fácil' : 
                   tutorial.difficulty === 'medium' ? 'Médio' : 'Difícil'}
                </span>
              </div>
              
              {allStepsCompleted ? (
                <button
                  onClick={handleTutorialComplete}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center space-x-2"
                >
                  <CheckCircleIconSolid className="h-4 w-4" />
                  <span>Concluir Tutorial</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowNotes(!showNotes)}
                  className={`px-4 py-2 rounded-lg ${
                    effectiveTheme === 'dark' 
                      ? 'bg-gray-700 text-white hover:bg-gray-600' 
                      : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                  }`}
                >
                  Anotações
                </button>
              )}
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Progresso do tutorial
              </span>
              <span className={`text-sm font-medium ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {Math.round(progress)}%
              </span>
            </div>
            <div className={`w-full bg-gray-200 rounded-full h-2 ${effectiveTheme === 'dark' ? 'bg-gray-700' : ''}`}>
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex-1 flex">
          {/* Main content */}
          <div className="flex-1 flex flex-col">
            {/* Video/Image area */}
            <div className={`${effectiveTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6 border-b border-gray-200 dark:border-gray-700`}>
              <div className="aspect-video bg-gray-900 rounded-lg mb-4 relative overflow-hidden">
                {currentStep.videoUrl ? (
                  <iframe
                    src={currentStep.videoUrl}
                    title={currentStep.title}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : currentStep.imageUrl ? (
                  <img
                    src={currentStep.imageUrl}
                    alt={currentStep.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800">
                    <div className="text-center">
                      <PlayIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-400">Demonstração em vídeo</p>
                    </div>
                  </div>
                )}
                
                {/* Play/Pause overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-4 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all"
                  >
                    {isPlaying ? (
                      <PauseIcon className="h-8 w-8 text-white" />
                    ) : (
                      <PlayIcon className="h-8 w-8 text-white" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Step content */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-2xl font-bold ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {currentStep.title}
                  </h2>
                  <button
                    onClick={() => handleStepComplete(currentStep.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                      isStepCompleted(currentStep.id)
                        ? 'bg-green-500 text-white'
                        : `border-2 border-dashed border-gray-300 ${effectiveTheme === 'dark' ? 'text-gray-400 hover:border-gray-500' : 'text-gray-600 hover:border-gray-400'}`
                    }`}
                  >
                    <CheckCircleIcon className="h-5 w-5" />
                    <span>{isStepCompleted(currentStep.id) ? 'Concluído' : 'Marcar como concluído'}</span>
                  </button>
                </div>
                
                <div className="prose max-w-none mb-8">
                  <p className={`text-lg ${effectiveTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {currentStep.description}
                  </p>
                </div>
                
                {/* Duration */}
                <div className="flex items-center space-x-2 mb-6">
                  <ClockIcon className="h-5 w-5 text-gray-500" />
                  <span className={`text-sm ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Tempo estimado: {Math.floor(currentStep.duration / 60)}:{(currentStep.duration % 60).toString().padStart(2, '0')}
                  </span>
                </div>
                
                {/* Key points */}
                {currentStep.keyPoints.length > 0 && (
                  <div className="mb-6">
                    <h3 className={`text-lg font-semibold ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'} mb-3 flex items-center`}>
                      <LightBulbIcon className="h-5 w-5 text-yellow-500 mr-2" />
                      Pontos-chave
                    </h3>
                    <ul className="space-y-2">
                      {currentStep.keyPoints.map((point, index) => (
                        <li key={index} className={`flex items-start ${effectiveTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          <span className="text-blue-500 mr-2">•</span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Common mistakes */}
                {currentStep.commonMistakes.length > 0 && (
                  <div className="mb-6">
                    <h3 className={`text-lg font-semibold ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'} mb-3 flex items-center`}>
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
                      Erros comuns
                    </h3>
                    <ul className="space-y-2">
                      {currentStep.commonMistakes.map((mistake, index) => (
                        <li key={index} className={`flex items-start ${effectiveTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          <span className="text-red-500 mr-2">⚠</span>
                          {mistake}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation */}
            <div className={`${effectiveTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} border-t border-gray-200 dark:border-gray-700 px-6 py-4`}>
              <div className="flex items-center justify-between">
                <button
                  onClick={handlePreviousStep}
                  disabled={currentStepIndex === 0}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                    currentStepIndex === 0
                      ? 'text-gray-400 cursor-not-allowed'
                      : `${effectiveTheme === 'dark' ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'}`
                  }`}
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                  <span>Anterior</span>
                </button>
                
                <div className="flex space-x-2">
                  {tutorial.steps.map((step, index) => (
                    <button
                      key={step.id}
                      onClick={() => setCurrentStepIndex(index)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                        index === currentStepIndex
                          ? 'bg-blue-500 text-white'
                          : isStepCompleted(step.id)
                          ? 'bg-green-500 text-white'
                          : `${effectiveTheme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`
                      }`}
                    >
                      {isStepCompleted(step.id) ? (
                        <CheckCircleIcon className="h-4 w-4" />
                      ) : (
                        index + 1
                      )}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={handleNextStep}
                  disabled={currentStepIndex === tutorial.steps.length - 1}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                    currentStepIndex === tutorial.steps.length - 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : `${effectiveTheme === 'dark' ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'}`
                  }`}
                >
                  <span>Próximo</span>
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className={`w-80 ${effectiveTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} border-l border-gray-200 dark:border-gray-700 p-6 overflow-y-auto`}>
            {/* Tutorial info */}
            <div className="mb-6">
              <h3 className={`text-lg font-semibold ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'} mb-3`}>
                Sobre este tutorial
              </h3>
              <p className={`text-sm ${effectiveTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
                {tutorial.description}
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <ClockIcon className="h-4 w-4 text-gray-500 mr-2" />
                  <span className={effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    {tutorial.duration} minutos
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <WrenchScrewdriverIcon className="h-4 w-4 text-gray-500 mr-2" />
                  <span className={effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    {tutorial.steps.length} passos
                  </span>
                </div>
              </div>
            </div>

            {/* Equipment needed */}
            {tutorial.equipment.length > 0 && (
              <div className="mb-6">
                <h3 className={`text-lg font-semibold ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'} mb-3`}>
                  Equipamentos necessários
                </h3>
                <ul className="space-y-2">
                  {tutorial.equipment.map((item, index) => (
                    <li key={index} className={`flex items-center text-sm ${effectiveTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      <span className="text-blue-500 mr-2">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tips */}
            {tutorial.tips.length > 0 && (
              <div className="mb-6">
                <h3 className={`text-lg font-semibold ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'} mb-3 flex items-center`}>
                  <LightBulbIcon className="h-5 w-5 text-yellow-500 mr-2" />
                  Dicas
                </h3>
                <ul className="space-y-2">
                  {tutorial.tips.map((tip, index) => (
                    <li key={index} className={`text-sm ${effectiveTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      💡 {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Warnings */}
            {tutorial.warnings.length > 0 && (
              <div className="mb-6">
                <h3 className={`text-lg font-semibold ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'} mb-3 flex items-center`}>
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
                  Atenção
                </h3>
                <ul className="space-y-2">
                  {tutorial.warnings.map((warning, index) => (
                    <li key={index} className={`text-sm ${effectiveTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      ⚠️ {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Notes */}
            {showNotes && (
              <div className="mb-6">
                <h3 className={`text-lg font-semibold ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'} mb-3`}>
                  Suas anotações
                </h3>
                <textarea
                  value={userNotes}
                  onChange={(e) => setUserNotes(e.target.value)}
                  onBlur={saveProgress}
                  placeholder="Faça suas anotações aqui..."
                  className={`w-full h-32 p-3 border rounded-lg resize-none ${
                    effectiveTheme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}