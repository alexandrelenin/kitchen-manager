import { useState, useEffect } from 'react';
import {
  PlayIcon,
  BookOpenIcon,
  StarIcon,
  ClockIcon,
  UserGroupIcon,
  AcademicCapIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
  FireIcon,
  TrophyIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { PlayIcon as PlayIconSolid } from '@heroicons/react/24/solid';
import { 
  culinaryEducationService, 
  type CulinaryTutorial, 
  type CulinaryTechnique, 
  type CulinaryDictionary, 
  type CulinaryCourse,
  type UserProgress
} from '../lib/culinaryEducation';
import { useTheme } from '../contexts/ThemeContext';
import TutorialViewer from './TutorialViewer';
import CertificationSystem from './CertificationSystem';

interface CulinaryEducationProps {
  onClose?: () => void;
}

export default function CulinaryEducation({ onClose }: CulinaryEducationProps) {
  const { effectiveTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'tutorials' | 'techniques' | 'dictionary' | 'courses' | 'progress' | 'certificates'>('tutorials');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Data states
  const [tutorials, setTutorials] = useState<CulinaryTutorial[]>([]);
  const [techniques, setTechniques] = useState<CulinaryTechnique[]>([]);
  const [dictionary, setDictionary] = useState<CulinaryDictionary[]>([]);
  const [courses, setCourses] = useState<CulinaryCourse[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [recommendedTutorials, setRecommendedTutorials] = useState<CulinaryTutorial[]>([]);
  const [selectedTutorial, setSelectedTutorial] = useState<CulinaryTutorial | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [tutorialsData, techniquesData, dictionaryData, coursesData, progressData, recommendedData] = await Promise.all([
        culinaryEducationService.getTutorials(),
        culinaryEducationService.getTechniques(),
        culinaryEducationService.searchDictionary(''),
        culinaryEducationService.getCourses(),
        culinaryEducationService.getUserProgress(),
        culinaryEducationService.getRecommendedTutorials()
      ]);

      setTutorials(tutorialsData);
      setTechniques(techniquesData);
      setDictionary(dictionaryData.slice(0, 20)); // Limitar resultados iniciais
      setCourses(coursesData);
      setUserProgress(progressData);
      setRecommendedTutorials(recommendedData);
    } catch (error) {
      console.error('Error loading culinary education data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      await loadData();
      return;
    }

    const results = await culinaryEducationService.searchAll(searchQuery);
    setTutorials(results.tutorials);
    setTechniques(results.techniques);
    setDictionary(results.dictionary);
    setCourses(results.courses);
  };

  const handleTutorialComplete = async (tutorialId: string) => {
    await culinaryEducationService.markTutorialCompleted(tutorialId);
    const newProgress = await culinaryEducationService.getUserProgress();
    setUserProgress(newProgress);
    setSelectedTutorial(null);
  };

  const handleCourseEnroll = async (courseId: string) => {
    await culinaryEducationService.enrollInCourse(courseId);
    const newProgress = await culinaryEducationService.getUserProgress();
    setUserProgress(newProgress);
  };

  const TutorialCard = ({ tutorial }: { tutorial: CulinaryTutorial }) => {
    const isCompleted = userProgress?.tutorialsCompleted.includes(tutorial.id);
    
    return (
      <div className={`${effectiveTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer`}
           onClick={() => setSelectedTutorial(tutorial)}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            {isCompleted ? (
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
            ) : (
              <PlayIcon className="h-5 w-5 text-blue-500" />
            )}
            <span className={`text-xs px-2 py-1 rounded-full ${
              tutorial.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
              tutorial.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {tutorial.difficulty === 'easy' ? 'Fácil' : 
               tutorial.difficulty === 'medium' ? 'Médio' : 'Difícil'}
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <ClockIcon className="h-4 w-4 mr-1" />
            {tutorial.duration}min
          </div>
        </div>
        
        <img 
          src={tutorial.thumbnailUrl} 
          alt={tutorial.title}
          className="w-full h-32 object-cover rounded-md mb-3"
        />
        
        <h3 className={`font-semibold ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>
          {tutorial.title}
        </h3>
        
        <p className={`text-sm ${effectiveTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-3`}>
          {tutorial.description}
        </p>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {tutorial.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className={`text-xs px-2 py-1 rounded-full ${
              effectiveTheme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
            }`}>
              {tag}
            </span>
          ))}
        </div>
        
        <div className="flex items-center justify-between">
          <span className={`text-xs ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {tutorial.steps.length} passos
          </span>
          <button className="text-blue-500 hover:text-blue-600 text-sm font-medium">
            {isCompleted ? 'Revisar' : 'Assistir'}
          </button>
        </div>
      </div>
    );
  };

  const TechniqueCard = ({ technique }: { technique: CulinaryTechnique }) => {
    const skillLevel = userProgress?.skillLevel[technique.id] || 0;
    
    return (
      <div className={`${effectiveTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow`}>
        <div className="flex items-start justify-between mb-3">
          <h3 className={`font-semibold ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {technique.name}
          </h3>
          <span className={`text-xs px-2 py-1 rounded-full ${
            technique.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
            technique.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {technique.difficulty === 'easy' ? 'Fácil' : 
             technique.difficulty === 'medium' ? 'Médio' : 'Difícil'}
          </span>
        </div>
        
        <p className={`text-sm ${effectiveTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
          {technique.description}
        </p>
        
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Seu nível
            </span>
            <span className={`text-sm font-medium ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {skillLevel}%
            </span>
          </div>
          <div className={`w-full bg-gray-200 rounded-full h-2 ${effectiveTheme === 'dark' ? 'bg-gray-700' : ''}`}>
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${skillLevel}%` }}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <h4 className={`text-sm font-medium ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Passos básicos:
          </h4>
          <ul className={`text-sm ${effectiveTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'} space-y-1`}>
            {technique.basicSteps.slice(0, 3).map((step, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                {step}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <span className={`text-xs ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {technique.tutorials.length} tutoriais
          </span>
          <button className="text-blue-500 hover:text-blue-600 text-sm font-medium">
            Ver detalhes
          </button>
        </div>
      </div>
    );
  };

  const DictionaryCard = ({ term }: { term: CulinaryDictionary }) => (
    <div className={`${effectiveTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow`}>
      <div className="flex items-start justify-between mb-2">
        <h3 className={`font-semibold ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {term.term}
        </h3>
        <span className={`text-xs px-2 py-1 rounded-full ${
          effectiveTheme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
        }`}>
          {term.category}
        </span>
      </div>
      
      <p className={`text-sm ${effectiveTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-3`}>
        {term.definition}
      </p>
      
      {term.examples.length > 0 && (
        <div className="mb-3">
          <h4 className={`text-xs font-medium ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mb-1`}>
            Exemplos:
          </h4>
          <div className="flex flex-wrap gap-1">
            {term.examples.slice(0, 3).map((example, index) => (
              <span key={index} className={`text-xs px-2 py-1 rounded-full ${
                effectiveTheme === 'dark' ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'
              }`}>
                {example}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {term.relatedTerms.length > 0 && (
        <div className="text-xs text-gray-500">
          Relacionado: {term.relatedTerms.slice(0, 2).join(', ')}
        </div>
      )}
    </div>
  );

  const CourseCard = ({ course }: { course: CulinaryCourse }) => {
    const isEnrolled = userProgress?.coursesEnrolled.includes(course.id);
    const isCompleted = userProgress?.coursesCompleted.includes(course.id);
    
    return (
      <div className={`${effectiveTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer`}>
        <img 
          src={course.thumbnailUrl} 
          alt={course.title}
          className="w-full h-32 object-cover rounded-md mb-4"
        />
        
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            {isCompleted ? (
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
            ) : isEnrolled ? (
              <PlayIconSolid className="h-5 w-5 text-blue-500" />
            ) : (
              <BookOpenIcon className="h-5 w-5 text-gray-400" />
            )}
            <span className={`text-xs px-2 py-1 rounded-full ${
              course.level === 'beginner' ? 'bg-green-100 text-green-800' :
              course.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {course.level === 'beginner' ? 'Iniciante' : 
               course.level === 'intermediate' ? 'Intermediário' : 'Avançado'}
            </span>
          </div>
          <div className="text-right">
            <div className="flex items-center text-sm text-gray-500 mb-1">
              <ClockIcon className="h-4 w-4 mr-1" />
              {course.duration}h
            </div>
            <div className="flex items-center">
              <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
              <span className="text-sm font-medium">{course.rating}</span>
            </div>
          </div>
        </div>
        
        <h3 className={`font-semibold ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>
          {course.title}
        </h3>
        
        <p className={`text-sm ${effectiveTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
          {course.description}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <UserGroupIcon className="h-4 w-4 mr-1" />
            {course.enrolledCount} alunos
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <AcademicCapIcon className="h-4 w-4 mr-1" />
            {course.certificateAvailable ? 'Certificado' : 'Sem certificado'}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className={`text-lg font-bold ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {course.price === 0 ? 'Gratuito' : `R$ ${course.price.toFixed(2)}`}
          </span>
          <button 
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              isEnrolled 
                ? 'bg-green-500 text-white' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              if (!isEnrolled) {
                handleCourseEnroll(course.id);
              }
            }}
          >
            {isCompleted ? 'Concluído' : isEnrolled ? 'Continuar' : 'Inscrever-se'}
          </button>
        </div>
      </div>
    );
  };

  const ProgressDashboard = () => {
    if (!userProgress) return null;
    
    const totalSkills = Object.keys(userProgress.skillLevel).length;
    const averageSkill = Object.values(userProgress.skillLevel).reduce((a, b) => a + b, 0) / totalSkills;
    
    return (
      <div className="space-y-6">
        {/* Stats overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={`${effectiveTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 text-center`}>
            <TrophyIcon className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <div className={`text-2xl font-bold ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {userProgress.tutorialsCompleted.length}
            </div>
            <div className={`text-sm ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Tutoriais concluídos
            </div>
          </div>
          
          <div className={`${effectiveTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 text-center`}>
            <FireIcon className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <div className={`text-2xl font-bold ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {userProgress.streakDays}
            </div>
            <div className={`text-sm ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Dias consecutivos
            </div>
          </div>
          
          <div className={`${effectiveTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 text-center`}>
            <ClockIcon className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className={`text-2xl font-bold ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {userProgress.totalHoursStudied.toFixed(1)}h
            </div>
            <div className={`text-sm ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Horas estudadas
            </div>
          </div>
          
          <div className={`${effectiveTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 text-center`}>
            <ChartBarIcon className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className={`text-2xl font-bold ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {averageSkill.toFixed(0)}%
            </div>
            <div className={`text-sm ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Nível médio
            </div>
          </div>
        </div>
        
        {/* Skills breakdown */}
        <div className={`${effectiveTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6`}>
          <h3 className={`text-lg font-semibold ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>
            Habilidades Culinárias
          </h3>
          <div className="space-y-4">
            {Object.entries(userProgress.skillLevel).map(([skill, level]) => (
              <div key={skill}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm ${effectiveTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {skill.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                  <span className={`text-sm font-medium ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {level}%
                  </span>
                </div>
                <div className={`w-full bg-gray-200 rounded-full h-2 ${effectiveTheme === 'dark' ? 'bg-gray-700' : ''}`}>
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${level}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Recommended tutorials */}
        <div className={`${effectiveTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6`}>
          <h3 className={`text-lg font-semibold ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>
            Recomendados para você
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendedTutorials.map((tutorial) => (
              <TutorialCard key={tutorial.id} tutorial={tutorial} />
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Render tutorial viewer if selected
  if (selectedTutorial) {
    return (
      <TutorialViewer
        tutorial={selectedTutorial}
        onComplete={handleTutorialComplete}
        onClose={() => setSelectedTutorial(null)}
      />
    );
  }

  return (
    <div className={`min-h-screen ${effectiveTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className={`text-3xl font-bold ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Culinária Educativa
              </h1>
              <p className={`text-lg ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Aprenda técnicas culinárias com tutoriais profissionais
              </p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className={`px-4 py-2 rounded-lg ${effectiveTheme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} hover:bg-gray-700`}
              >
                Fechar
              </button>
            )}
          </div>
          
          {/* Search and filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar tutoriais, técnicas, termos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg ${
                  effectiveTheme === 'dark' 
                    ? 'bg-gray-800 border-gray-700 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Buscar
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg ${
                effectiveTheme === 'dark' 
                  ? 'bg-gray-800 text-white hover:bg-gray-700' 
                  : 'bg-white text-gray-900 hover:bg-gray-50'
              }`}
            >
              <FunnelIcon className="h-5 w-5" />
            </button>
          </div>
          
          {/* Filters */}
          {showFilters && (
            <div className={`${effectiveTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 mb-6`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${effectiveTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Categoria
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className={`w-full p-2 border rounded-lg ${
                      effectiveTheme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="">Todas as categorias</option>
                    <option value="basic">Básico</option>
                    <option value="intermediate">Intermediário</option>
                    <option value="advanced">Avançado</option>
                  </select>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${effectiveTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Dificuldade
                  </label>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className={`w-full p-2 border rounded-lg ${
                      effectiveTheme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="">Todas as dificuldades</option>
                    <option value="easy">Fácil</option>
                    <option value="medium">Médio</option>
                    <option value="hard">Difícil</option>
                  </select>
                </div>
                
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSelectedCategory('');
                      setSelectedDifficulty('');
                      setSearchQuery('');
                      loadData();
                    }}
                    className={`px-4 py-2 rounded-lg ${
                      effectiveTheme === 'dark' 
                        ? 'bg-gray-700 text-white hover:bg-gray-600' 
                        : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                    }`}
                  >
                    Limpar filtros
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'tutorials', label: 'Tutoriais', icon: PlayIcon },
              { id: 'techniques', label: 'Técnicas', icon: BookOpenIcon },
              { id: 'dictionary', label: 'Dicionário', icon: AcademicCapIcon },
              { id: 'courses', label: 'Cursos', icon: UserGroupIcon },
              { id: 'progress', label: 'Progresso', icon: ChartBarIcon },
              { id: 'certificates', label: 'Certificados', icon: TrophyIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : `border-transparent ${effectiveTheme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
        
        {/* Content */}
        <div className="mb-8">
          {activeTab === 'tutorials' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tutorials.map((tutorial) => (
                <TutorialCard key={tutorial.id} tutorial={tutorial} />
              ))}
            </div>
          )}
          
          {activeTab === 'techniques' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {techniques.map((technique) => (
                <TechniqueCard key={technique.id} technique={technique} />
              ))}
            </div>
          )}
          
          {activeTab === 'dictionary' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dictionary.map((term) => (
                <DictionaryCard key={term.id} term={term} />
              ))}
            </div>
          )}
          
          {activeTab === 'courses' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
          
          {activeTab === 'progress' && <ProgressDashboard />}
          
          {activeTab === 'certificates' && <CertificationSystem />}
        </div>
      </div>
    </div>
  );
}