// import type { Recipe } from '../types';

// Interfaces para sistema educativo
export interface CulinaryTutorial {
  id: string;
  title: string;
  description: string;
  category: 'basic' | 'intermediate' | 'advanced';
  technique: string;
  duration: number; // em minutos
  difficulty: 'easy' | 'medium' | 'hard';
  videoUrl?: string;
  steps: TutorialStep[];
  equipment: string[];
  tips: string[];
  warnings: string[];
  tags: string[];
  relatedRecipes: string[];
  thumbnailUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TutorialStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  imageUrl?: string;
  videoUrl?: string;
  duration: number; // em segundos
  keyPoints: string[];
  commonMistakes: string[];
}

export interface CulinaryTechnique {
  id: string;
  name: string;
  category: 'cutting' | 'cooking' | 'baking' | 'seasoning' | 'presentation';
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  basicSteps: string[];
  detailedSteps: TutorialStep[];
  equipment: string[];
  tips: string[];
  variations: string[];
  useCases: string[];
  tutorials: string[]; // IDs dos tutoriais relacionados
}

export interface CulinaryDictionary {
  id: string;
  term: string;
  definition: string;
  category: 'ingredient' | 'technique' | 'equipment' | 'measurement' | 'cuisine';
  translations: Record<string, string>;
  relatedTerms: string[];
  examples: string[];
}

export interface CulinaryCourse {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // em horas
  lessons: CourseLesson[];
  prerequisites: string[];
  objectives: string[];
  instructor: string;
  thumbnailUrl: string;
  price: number;
  rating: number;
  enrolledCount: number;
  certificateAvailable: boolean;
}

export interface CourseLesson {
  id: string;
  title: string;
  description: string;
  duration: number; // em minutos
  videoUrl?: string;
  tutorials: string[]; // IDs dos tutoriais
  quiz?: Quiz;
  completed: boolean;
}

export interface Quiz {
  id: string;
  questions: QuizQuestion[];
  passingScore: number;
  timeLimit?: number; // em minutos
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface UserProgress {
  userId: string;
  tutorialsCompleted: string[];
  coursesEnrolled: string[];
  coursesCompleted: string[];
  certificatesEarned: string[];
  skillLevel: Record<string, number>; // técnica -> nível (0-100)
  totalHoursStudied: number;
  streakDays: number;
  lastStudyDate: Date;
}

class CulinaryEducationService {
  private static instance: CulinaryEducationService;
  private tutorials: CulinaryTutorial[] = [];
  private techniques: CulinaryTechnique[] = [];
  private dictionary: CulinaryDictionary[] = [];
  private courses: CulinaryCourse[] = [];
  private userProgress: UserProgress | null = null;

  static getInstance(): CulinaryEducationService {
    if (!CulinaryEducationService.instance) {
      CulinaryEducationService.instance = new CulinaryEducationService();
    }
    return CulinaryEducationService.instance;
  }

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Tutoriais mock
    this.tutorials = [
      {
        id: 'tutorial-1',
        title: 'Como Cortar Cebola sem Chorar',
        description: 'Aprenda a técnica correta para cortar cebola sem lágrimas',
        category: 'basic',
        technique: 'knife_skills',
        duration: 8,
        difficulty: 'easy',
        videoUrl: 'https://www.youtube.com/embed/dCGS067s0zo',
        steps: [
          {
            id: 'step-1',
            stepNumber: 1,
            title: 'Preparação',
            description: 'Mantenha a cebola na geladeira por 30 minutos antes de cortar',
            duration: 30,
            keyPoints: ['Cebola fria produz menos compostos que irritam os olhos'],
            commonMistakes: ['Cortar cebola em temperatura ambiente']
          },
          {
            id: 'step-2',
            stepNumber: 2,
            title: 'Corte inicial',
            description: 'Corte a cebola ao meio, mantendo a raiz intacta',
            duration: 15,
            keyPoints: ['A raiz ajuda a manter a cebola unida'],
            commonMistakes: ['Remover a raiz muito cedo']
          },
          {
            id: 'step-3',
            stepNumber: 3,
            title: 'Cortes paralelos',
            description: 'Faça cortes paralelos horizontais',
            duration: 20,
            keyPoints: ['Mantenha os dedos curvados para proteção'],
            commonMistakes: ['Cortar muito rápido sem controle']
          }
        ],
        equipment: ['Faca afiada', 'Tábua de corte'],
        tips: [
          'Use uma faca bem afiada para cortes limpos',
          'Respire pela boca, não pelo nariz',
          'Deixe água correndo próxima à tábua'
        ],
        warnings: [
          'Mantenha os dedos sempre curvados',
          'Não force a faca'
        ],
        tags: ['básico', 'técnica', 'corte', 'cebola'],
        relatedRecipes: ['recipe-1', 'recipe-2'],
        thumbnailUrl: 'https://via.placeholder.com/300x200/4F46E5/ffffff?text=Cortar+Cebola',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'tutorial-2',
        title: 'Refogado Perfeito',
        description: 'Domine a técnica do refogado para dar sabor às suas receitas',
        category: 'intermediate',
        technique: 'sauteing',
        duration: 12,
        difficulty: 'medium',
        videoUrl: 'https://www.youtube.com/embed/sample-2',
        steps: [
          {
            id: 'step-1',
            stepNumber: 1,
            title: 'Aquecimento da panela',
            description: 'Aqueça a panela em fogo médio antes de adicionar óleo',
            duration: 60,
            keyPoints: ['Panela quente garante refogado uniforme'],
            commonMistakes: ['Adicionar óleo em panela fria']
          },
          {
            id: 'step-2',
            stepNumber: 2,
            title: 'Adição dos ingredientes',
            description: 'Adicione ingredientes em ordem de tempo de cozimento',
            duration: 90,
            keyPoints: ['Cebola primeiro, depois alho', 'Movimento constante'],
            commonMistakes: ['Adicionar tudo ao mesmo tempo']
          }
        ],
        equipment: ['Panela', 'Espátula de madeira', 'Óleo'],
        tips: [
          'Nunca deixe o alho queimar',
          'Use fogo médio para controle',
          'Adicione sal no final'
        ],
        warnings: [
          'Óleo muito quente pode queimar os ingredientes'
        ],
        tags: ['intermediário', 'refogado', 'tempero', 'base'],
        relatedRecipes: ['recipe-3', 'recipe-4'],
        thumbnailUrl: 'https://via.placeholder.com/300x200/10B981/ffffff?text=Refogado',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'tutorial-3',
        title: 'Massa de Pão Básica',
        description: 'Aprenda a fazer massa de pão do zero com técnica profissional',
        category: 'advanced',
        technique: 'kneading',
        duration: 25,
        difficulty: 'hard',
        videoUrl: 'https://www.youtube.com/embed/sample-3',
        steps: [
          {
            id: 'step-1',
            stepNumber: 1,
            title: 'Ativação do fermento',
            description: 'Dissolva o fermento em água morna com açúcar',
            duration: 300,
            keyPoints: ['Água entre 35-40°C', 'Espere espumar'],
            commonMistakes: ['Água muito quente mata o fermento']
          },
          {
            id: 'step-2',
            stepNumber: 2,
            title: 'Mistura dos ingredientes',
            description: 'Combine farinha, sal e fermento ativado',
            duration: 180,
            keyPoints: ['Misture gradualmente', 'Forme uma massa coesa'],
            commonMistakes: ['Adicionar sal direto no fermento']
          },
          {
            id: 'step-3',
            stepNumber: 3,
            title: 'Sova da massa',
            description: 'Sove por 10-15 minutos até ficar lisa e elástica',
            duration: 600,
            keyPoints: ['Use força das palmas', 'Teste da janela'],
            commonMistakes: ['Parar de sovar muito cedo']
          }
        ],
        equipment: ['Tigela grande', 'Pano limpo', 'Balança'],
        tips: [
          'Massa bem sovada é essencial',
          'Deixe crescer em local morno',
          'Primeira fermentação deve dobrar o volume'
        ],
        warnings: [
          'Não adicione farinha demais',
          'Respeite o tempo de fermentação'
        ],
        tags: ['avançado', 'panificação', 'massa', 'fermento'],
        relatedRecipes: ['recipe-5', 'recipe-6'],
        thumbnailUrl: 'https://via.placeholder.com/300x200/F59E0B/ffffff?text=Massa+Pão',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Técnicas culinárias mock
    this.techniques = [
      {
        id: 'technique-1',
        name: 'Brunoise',
        category: 'cutting',
        description: 'Corte em cubos pequenos e uniformes (2mm)',
        difficulty: 'medium',
        basicSteps: [
          'Corte em fatias de 2mm',
          'Empilhe as fatias',
          'Corte em bastões de 2mm',
          'Corte os bastões em cubos'
        ],
        detailedSteps: [],
        equipment: ['Faca afiada', 'Tábua de corte'],
        tips: [
          'Mantenha os dedos curvados',
          'Use movimentos rítmicos',
          'Faca deve estar sempre afiada'
        ],
        variations: ['Brunoise fina (1mm)', 'Brunoise média (4mm)'],
        useCases: ['Mirepoix', 'Guarnições', 'Molhos'],
        tutorials: ['tutorial-1']
      },
      {
        id: 'technique-2',
        name: 'Mise en Place',
        category: 'cooking',
        description: 'Organização e preparação de todos os ingredientes antes do cozimento',
        difficulty: 'easy',
        basicSteps: [
          'Leia a receita completamente',
          'Separe todos os ingredientes',
          'Prepare utensílios necessários',
          'Pré-processe ingredientes'
        ],
        detailedSteps: [],
        equipment: ['Tigelas pequenas', 'Colheres medidoras', 'Balanças'],
        tips: [
          'Economiza tempo durante o cozimento',
          'Evita erros e esquecimentos',
          'Permite cozinhar com mais tranquilidade'
        ],
        variations: ['Mise en place completa', 'Mise en place parcial'],
        useCases: ['Todas as receitas', 'Especialmente frituras e refogados'],
        tutorials: ['tutorial-2']
      }
    ];

    // Dicionário culinário mock
    this.dictionary = [
      {
        id: 'dict-1',
        term: 'Mirepoix',
        definition: 'Mistura clássica francesa de vegetais cortados em cubos: cebola, cenoura e aipo',
        category: 'technique',
        translations: {
          'french': 'Mirepoix',
          'english': 'Mirepoix',
          'spanish': 'Mirepoix',
          'italian': 'Soffritto'
        },
        relatedTerms: ['Brunoise', 'Sofrito', 'Holy Trinity'],
        examples: [
          'Base para molhos',
          'Fundo para sopas',
          'Tempero para braseados'
        ]
      },
      {
        id: 'dict-2',
        term: 'Julienne',
        definition: 'Corte em bastões finos e uniformes, geralmente 2mm x 2mm x 5cm',
        category: 'technique',
        translations: {
          'french': 'Julienne',
          'english': 'Julienne',
          'spanish': 'Juliana',
          'italian': 'Julienne'
        },
        relatedTerms: ['Brunoise', 'Chiffonade', 'Bâtonnet'],
        examples: [
          'Cenoura julienne',
          'Batata palha',
          'Guarnição de saladas'
        ]
      },
      {
        id: 'dict-3',
        term: 'Emulsão',
        definition: 'Mistura estável de dois líquidos que normalmente não se misturam, como óleo e água',
        category: 'technique',
        translations: {
          'french': 'Émulsion',
          'english': 'Emulsion',
          'spanish': 'Emulsión',
          'italian': 'Emulsione'
        },
        relatedTerms: ['Maionese', 'Hollandaise', 'Vinagrete'],
        examples: [
          'Maionese',
          'Molho holandês',
          'Vinagrete'
        ]
      }
    ];

    // Cursos mock
    this.courses = [
      {
        id: 'course-1',
        title: 'Fundamentos da Cozinha',
        description: 'Curso completo para iniciantes aprenderem as bases da culinária',
        level: 'beginner',
        duration: 8,
        lessons: [
          {
            id: 'lesson-1',
            title: 'Segurança na Cozinha',
            description: 'Aprenda as regras básicas de segurança alimentar',
            duration: 45,
            tutorials: ['tutorial-1'],
            completed: false
          },
          {
            id: 'lesson-2',
            title: 'Técnicas de Corte',
            description: 'Domine os cortes básicos da culinária',
            duration: 60,
            tutorials: ['tutorial-1'],
            completed: false
          },
          {
            id: 'lesson-3',
            title: 'Métodos de Cocção',
            description: 'Entenda os diferentes métodos de cozimento',
            duration: 75,
            tutorials: ['tutorial-2'],
            completed: false
          }
        ],
        prerequisites: [],
        objectives: [
          'Dominar técnicas básicas de corte',
          'Entender métodos de cocção',
          'Aplicar segurança alimentar'
        ],
        instructor: 'Chef Maria Silva',
        thumbnailUrl: 'https://via.placeholder.com/400x250/6366F1/ffffff?text=Fundamentos',
        price: 0,
        rating: 4.8,
        enrolledCount: 1250,
        certificateAvailable: true
      },
      {
        id: 'course-2',
        title: 'Panificação Artesanal',
        description: 'Aprenda a fazer pães artesanais do zero',
        level: 'intermediate',
        duration: 12,
        lessons: [
          {
            id: 'lesson-1',
            title: 'Ingredientes da Panificação',
            description: 'Conheça os ingredientes essenciais',
            duration: 60,
            tutorials: ['tutorial-3'],
            completed: false
          },
          {
            id: 'lesson-2',
            title: 'Fermentação',
            description: 'Entenda o processo de fermentação',
            duration: 90,
            tutorials: ['tutorial-3'],
            completed: false
          }
        ],
        prerequisites: ['Fundamentos da Cozinha'],
        objectives: [
          'Fazer massa básica de pão',
          'Entender fermentação',
          'Criar pães artesanais'
        ],
        instructor: 'Mestre Padeiro João',
        thumbnailUrl: 'https://via.placeholder.com/400x250/F59E0B/ffffff?text=Panificação',
        price: 89.90,
        rating: 4.9,
        enrolledCount: 680,
        certificateAvailable: true
      }
    ];

    // Progresso do usuário mock
    this.userProgress = {
      userId: 'user-1',
      tutorialsCompleted: ['tutorial-1'],
      coursesEnrolled: ['course-1'],
      coursesCompleted: [],
      certificatesEarned: [],
      skillLevel: {
        'knife_skills': 60,
        'sauteing': 30,
        'kneading': 10
      },
      totalHoursStudied: 2.5,
      streakDays: 3,
      lastStudyDate: new Date()
    };
  }

  // Métodos para tutoriais
  async getTutorials(category?: string, difficulty?: string): Promise<CulinaryTutorial[]> {
    let filtered = this.tutorials;
    
    if (category) {
      filtered = filtered.filter(t => t.category === category);
    }
    
    if (difficulty) {
      filtered = filtered.filter(t => t.difficulty === difficulty);
    }
    
    return filtered;
  }

  async getTutorialById(id: string): Promise<CulinaryTutorial | null> {
    return this.tutorials.find(t => t.id === id) || null;
  }

  async getPopularTutorials(limit = 5): Promise<CulinaryTutorial[]> {
    return this.tutorials.slice(0, limit);
  }

  // Métodos para técnicas
  async getTechniques(category?: string): Promise<CulinaryTechnique[]> {
    if (category) {
      return this.techniques.filter(t => t.category === category);
    }
    return this.techniques;
  }

  async getTechniqueById(id: string): Promise<CulinaryTechnique | null> {
    return this.techniques.find(t => t.id === id) || null;
  }

  // Métodos para dicionário
  async searchDictionary(term: string): Promise<CulinaryDictionary[]> {
    const searchTerm = term.toLowerCase();
    return this.dictionary.filter(d => 
      d.term.toLowerCase().includes(searchTerm) ||
      d.definition.toLowerCase().includes(searchTerm)
    );
  }

  async getDictionaryByCategory(category: string): Promise<CulinaryDictionary[]> {
    return this.dictionary.filter(d => d.category === category);
  }

  // Métodos para cursos
  async getCourses(level?: string): Promise<CulinaryCourse[]> {
    if (level) {
      return this.courses.filter(c => c.level === level);
    }
    return this.courses;
  }

  async getCourseById(id: string): Promise<CulinaryCourse | null> {
    return this.courses.find(c => c.id === id) || null;
  }

  async enrollInCourse(courseId: string): Promise<boolean> {
    if (!this.userProgress) return false;
    
    if (!this.userProgress.coursesEnrolled.includes(courseId)) {
      this.userProgress.coursesEnrolled.push(courseId);
    }
    
    return true;
  }

  // Métodos para progresso do usuário
  async getUserProgress(): Promise<UserProgress | null> {
    return this.userProgress;
  }

  async markTutorialCompleted(tutorialId: string): Promise<boolean> {
    if (!this.userProgress) return false;
    
    if (!this.userProgress.tutorialsCompleted.includes(tutorialId)) {
      this.userProgress.tutorialsCompleted.push(tutorialId);
      
      // Atualizar skill level
      const tutorial = await this.getTutorialById(tutorialId);
      if (tutorial && this.userProgress) {
        const currentLevel = this.userProgress.skillLevel[tutorial.technique] || 0;
        this.userProgress.skillLevel[tutorial.technique] = Math.min(100, currentLevel + 10);
      }
      
      // Atualizar streak
      const today = new Date();
      const lastStudy = new Date(this.userProgress.lastStudyDate);
      const daysDiff = Math.floor((today.getTime() - lastStudy.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        this.userProgress.streakDays++;
      } else if (daysDiff > 1) {
        this.userProgress.streakDays = 1;
      }
      
      this.userProgress.lastStudyDate = today;
      if (tutorial) {
        this.userProgress.totalHoursStudied += tutorial.duration / 60;
      }
    }
    
    return true;
  }

  async getRecommendedTutorials(limit = 3): Promise<CulinaryTutorial[]> {
    if (!this.userProgress) return this.tutorials.slice(0, limit);
    
    // Recomendar baseado no que ainda não foi completado
    const incomplete = this.tutorials.filter(t => 
      !this.userProgress!.tutorialsCompleted.includes(t.id)
    );
    
    // Priorizar tutoriais básicos se o usuário é iniciante
    const averageSkill = Object.values(this.userProgress.skillLevel).reduce((a, b) => a + b, 0) / 
                         Object.keys(this.userProgress.skillLevel).length;
    
    if (averageSkill < 30) {
      return incomplete.filter(t => t.category === 'basic').slice(0, limit);
    }
    
    return incomplete.slice(0, limit);
  }

  // Métodos para busca
  async searchAll(query: string): Promise<{
    tutorials: CulinaryTutorial[];
    techniques: CulinaryTechnique[];
    dictionary: CulinaryDictionary[];
    courses: CulinaryCourse[];
  }> {
    const searchTerm = query.toLowerCase();
    
    return {
      tutorials: this.tutorials.filter(t => 
        t.title.toLowerCase().includes(searchTerm) ||
        t.description.toLowerCase().includes(searchTerm) ||
        t.tags.some(tag => tag.includes(searchTerm))
      ),
      techniques: this.techniques.filter(t => 
        t.name.toLowerCase().includes(searchTerm) ||
        t.description.toLowerCase().includes(searchTerm)
      ),
      dictionary: await this.searchDictionary(query),
      courses: this.courses.filter(c => 
        c.title.toLowerCase().includes(searchTerm) ||
        c.description.toLowerCase().includes(searchTerm)
      )
    };
  }
}

export const culinaryEducationService = CulinaryEducationService.getInstance();