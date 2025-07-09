import { useState, useEffect } from 'react';
import {
  TrophyIcon,
  CheckCircleIcon,
  ClockIcon,
  FireIcon,
  ChartBarIcon,
  ShareIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';
import { AcademicCapIcon as AcademicCapIconSolid } from '@heroicons/react/24/solid';
import { culinaryEducationService, type UserProgress } from '../lib/culinaryEducation';
import { useTheme } from '../contexts/ThemeContext';

interface Certificate {
  id: string;
  title: string;
  description: string;
  requirements: CertificationRequirement[];
  badge: string;
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  earnedAt?: Date;
  isEarned: boolean;
  progress: number; // 0-100
}

interface CertificationRequirement {
  id: string;
  type: 'tutorials' | 'courses' | 'skills' | 'streak' | 'hours';
  description: string;
  target: number;
  current: number;
  completed: boolean;
}

interface CertificationSystemProps {
  onClose?: () => void;
}

export default function CertificationSystem({ onClose }: CertificationSystemProps) {
  const { effectiveTheme } = useTheme();
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCertificationData();
  }, []);

  const loadCertificationData = async () => {
    setIsLoading(true);
    try {
      const progress = await culinaryEducationService.getUserProgress();
      setUserProgress(progress);
      
      if (progress) {
        const certs = generateCertificates(progress);
        setCertificates(certs);
      }
    } catch (error) {
      console.error('Error loading certification data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateCertificates = (progress: UserProgress): Certificate[] => {
    const averageSkill = Object.values(progress.skillLevel).reduce((a, b) => a + b, 0) / Object.keys(progress.skillLevel).length;
    
    return [
      {
        id: 'beginner-chef',
        title: 'Cozinheiro Iniciante',
        description: 'Certificado para quem domina as técnicas básicas da culinária',
        level: 'bronze',
        badge: '🥉',
        requirements: [
          {
            id: 'req-1',
            type: 'tutorials',
            description: 'Completar 5 tutoriais básicos',
            target: 5,
            current: progress.tutorialsCompleted.length,
            completed: progress.tutorialsCompleted.length >= 5
          },
          {
            id: 'req-2',
            type: 'skills',
            description: 'Atingir nível 50 em habilidades básicas',
            target: 50,
            current: averageSkill,
            completed: averageSkill >= 50
          },
          {
            id: 'req-3',
            type: 'streak',
            description: 'Manter sequência de 7 dias',
            target: 7,
            current: progress.streakDays,
            completed: progress.streakDays >= 7
          }
        ],
        earnedAt: progress.tutorialsCompleted.length >= 5 && averageSkill >= 50 && progress.streakDays >= 7 ? new Date() : undefined,
        isEarned: progress.tutorialsCompleted.length >= 5 && averageSkill >= 50 && progress.streakDays >= 7,
        progress: Math.min(100, (
          (Math.min(progress.tutorialsCompleted.length, 5) / 5 * 33) +
          (Math.min(averageSkill, 50) / 50 * 33) +
          (Math.min(progress.streakDays, 7) / 7 * 34)
        ))
      },
      {
        id: 'intermediate-chef',
        title: 'Cozinheiro Intermediário',
        description: 'Certificado para quem domina técnicas intermediárias',
        level: 'silver',
        badge: '🥈',
        requirements: [
          {
            id: 'req-1',
            type: 'tutorials',
            description: 'Completar 15 tutoriais',
            target: 15,
            current: progress.tutorialsCompleted.length,
            completed: progress.tutorialsCompleted.length >= 15
          },
          {
            id: 'req-2',
            type: 'courses',
            description: 'Completar 2 cursos',
            target: 2,
            current: progress.coursesCompleted.length,
            completed: progress.coursesCompleted.length >= 2
          },
          {
            id: 'req-3',
            type: 'hours',
            description: 'Estudar por 20 horas',
            target: 20,
            current: progress.totalHoursStudied,
            completed: progress.totalHoursStudied >= 20
          }
        ],
        earnedAt: undefined,
        isEarned: false,
        progress: Math.min(100, (
          (Math.min(progress.tutorialsCompleted.length, 15) / 15 * 33) +
          (Math.min(progress.coursesCompleted.length, 2) / 2 * 33) +
          (Math.min(progress.totalHoursStudied, 20) / 20 * 34)
        ))
      },
      {
        id: 'advanced-chef',
        title: 'Chef Avançado',
        description: 'Certificado para mestres da culinária',
        level: 'gold',
        badge: '🥇',
        requirements: [
          {
            id: 'req-1',
            type: 'tutorials',
            description: 'Completar 30 tutoriais',
            target: 30,
            current: progress.tutorialsCompleted.length,
            completed: progress.tutorialsCompleted.length >= 30
          },
          {
            id: 'req-2',
            type: 'skills',
            description: 'Nível 80 em todas as habilidades',
            target: 80,
            current: Math.min(...Object.values(progress.skillLevel)),
            completed: Math.min(...Object.values(progress.skillLevel)) >= 80
          },
          {
            id: 'req-3',
            type: 'streak',
            description: 'Sequência de 30 dias',
            target: 30,
            current: progress.streakDays,
            completed: progress.streakDays >= 30
          }
        ],
        earnedAt: undefined,
        isEarned: false,
        progress: Math.min(100, (
          (Math.min(progress.tutorialsCompleted.length, 30) / 30 * 33) +
          (Math.min(Math.min(...Object.values(progress.skillLevel)), 80) / 80 * 33) +
          (Math.min(progress.streakDays, 30) / 30 * 34)
        ))
      },
      {
        id: 'master-chef',
        title: 'Chef Master',
        description: 'O mais alto nível de certificação culinária',
        level: 'platinum',
        badge: '💎',
        requirements: [
          {
            id: 'req-1',
            type: 'tutorials',
            description: 'Completar 50 tutoriais',
            target: 50,
            current: progress.tutorialsCompleted.length,
            completed: progress.tutorialsCompleted.length >= 50
          },
          {
            id: 'req-2',
            type: 'courses',
            description: 'Completar 5 cursos',
            target: 5,
            current: progress.coursesCompleted.length,
            completed: progress.coursesCompleted.length >= 5
          },
          {
            id: 'req-3',
            type: 'hours',
            description: 'Estudar por 100 horas',
            target: 100,
            current: progress.totalHoursStudied,
            completed: progress.totalHoursStudied >= 100
          }
        ],
        earnedAt: undefined,
        isEarned: false,
        progress: Math.min(100, (
          (Math.min(progress.tutorialsCompleted.length, 50) / 50 * 33) +
          (Math.min(progress.coursesCompleted.length, 5) / 5 * 33) +
          (Math.min(progress.totalHoursStudied, 100) / 100 * 34)
        ))
      }
    ];
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'bronze': return 'text-amber-600';
      case 'silver': return 'text-gray-500';
      case 'gold': return 'text-yellow-500';
      case 'platinum': return 'text-purple-500';
      default: return 'text-gray-400';
    }
  };

  const getLevelBgColor = (level: string) => {
    switch (level) {
      case 'bronze': return 'bg-amber-100 border-amber-200';
      case 'silver': return 'bg-gray-100 border-gray-200';
      case 'gold': return 'bg-yellow-100 border-yellow-200';
      case 'platinum': return 'bg-purple-100 border-purple-200';
      default: return 'bg-gray-100 border-gray-200';
    }
  };

  const CertificateCard = ({ certificate }: { certificate: Certificate }) => (
    <div 
      className={`${effectiveTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow border-2 ${
        certificate.isEarned ? getLevelBgColor(certificate.level) : 'border-gray-200'
      }`}
      onClick={() => setSelectedCertificate(certificate)}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`text-3xl ${certificate.isEarned ? '' : 'grayscale'}`}>
            {certificate.badge}
          </div>
          <div>
            <h3 className={`font-semibold ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {certificate.title}
            </h3>
            <p className={`text-sm ${getLevelColor(certificate.level)} font-medium`}>
              {certificate.level.charAt(0).toUpperCase() + certificate.level.slice(1)}
            </p>
          </div>
        </div>
        
        {certificate.isEarned ? (
          <CheckCircleIcon className="h-6 w-6 text-green-500" />
        ) : (
          <div className="text-right">
            <div className={`text-sm font-medium ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {certificate.progress.toFixed(0)}%
            </div>
            <div className={`w-16 bg-gray-200 rounded-full h-2 ${effectiveTheme === 'dark' ? 'bg-gray-700' : ''}`}>
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${certificate.progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
      
      <p className={`text-sm ${effectiveTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
        {certificate.description}
      </p>
      
      <div className="space-y-2">
        {certificate.requirements.map((req) => (
          <div key={req.id} className="flex items-center justify-between">
            <span className={`text-xs ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {req.description}
            </span>
            <div className="flex items-center space-x-2">
              <span className={`text-xs ${effectiveTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {req.current}/{req.target}
              </span>
              {req.completed && <CheckCircleIcon className="h-4 w-4 text-green-500" />}
            </div>
          </div>
        ))}
      </div>
      
      {certificate.earnedAt && (
        <div className={`mt-4 pt-3 border-t ${effectiveTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center text-xs text-gray-500">
            <ClockIcon className="h-4 w-4 mr-1" />
            Conquistado em {certificate.earnedAt.toLocaleDateString()}
          </div>
        </div>
      )}
    </div>
  );

  const CertificateModal = ({ certificate }: { certificate: Certificate }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className={`${effectiveTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-8 max-w-md w-full mx-4`}>
        <div className="text-center mb-6">
          <div className={`text-6xl mb-4 ${certificate.isEarned ? '' : 'grayscale'}`}>
            {certificate.badge}
          </div>
          <h2 className={`text-2xl font-bold ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>
            {certificate.title}
          </h2>
          <p className={`text-lg ${getLevelColor(certificate.level)} font-medium mb-4`}>
            Certificado {certificate.level.charAt(0).toUpperCase() + certificate.level.slice(1)}
          </p>
          <p className={`text-sm ${effectiveTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            {certificate.description}
          </p>
        </div>
        
        <div className="space-y-4 mb-6">
          <h3 className={`font-semibold ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Requisitos:
          </h3>
          {certificate.requirements.map((req) => (
            <div key={req.id} className="flex items-center justify-between">
              <span className={`text-sm ${effectiveTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {req.description}
              </span>
              <div className="flex items-center space-x-2">
                <span className={`text-sm ${effectiveTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {req.current}/{req.target}
                </span>
                {req.completed ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                ) : (
                  <div className={`w-16 bg-gray-200 rounded-full h-2 ${effectiveTheme === 'dark' ? 'bg-gray-700' : ''}`}>
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(req.current / req.target) * 100}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {certificate.isEarned && (
          <div className="flex space-x-3 mb-6">
            <button className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 flex items-center justify-center">
              <ShareIcon className="h-4 w-4 mr-2" />
              Compartilhar
            </button>
            <button className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 flex items-center justify-center">
              <PrinterIcon className="h-4 w-4 mr-2" />
              Imprimir
            </button>
          </div>
        )}
        
        <button
          onClick={() => setSelectedCertificate(null)}
          className={`w-full py-2 px-4 rounded-lg ${
            effectiveTheme === 'dark' 
              ? 'bg-gray-700 text-white hover:bg-gray-600' 
              : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
          }`}
        >
          Fechar
        </button>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
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
                Sistema de Certificações
              </h1>
              <p className={`text-lg ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Conquiste certificados conforme desenvolve suas habilidades culinárias
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
        </div>
        
        {/* Stats */}
        {userProgress && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className={`${effectiveTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 text-center`}>
              <AcademicCapIconSolid className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <div className={`text-2xl font-bold ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {certificates.filter(c => c.isEarned).length}
              </div>
              <div className={`text-sm ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Certificados conquistados
              </div>
            </div>
            
            <div className={`${effectiveTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 text-center`}>
              <TrophyIcon className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <div className={`text-2xl font-bold ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {certificates.filter(c => c.progress >= 100).length}
              </div>
              <div className={`text-sm ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Prontos para conquistar
              </div>
            </div>
            
            <div className={`${effectiveTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 text-center`}>
              <ChartBarIcon className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className={`text-2xl font-bold ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {Math.round(certificates.reduce((sum, cert) => sum + cert.progress, 0) / certificates.length)}%
              </div>
              <div className={`text-sm ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Progresso médio
              </div>
            </div>
            
            <div className={`${effectiveTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 text-center`}>
              <FireIcon className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <div className={`text-2xl font-bold ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {userProgress.streakDays}
              </div>
              <div className={`text-sm ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Dias de sequência
              </div>
            </div>
          </div>
        )}
        
        {/* Certificates grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((certificate) => (
            <CertificateCard key={certificate.id} certificate={certificate} />
          ))}
        </div>
        
        {/* Certificate modal */}
        {selectedCertificate && (
          <CertificateModal certificate={selectedCertificate} />
        )}
      </div>
    </div>
  );
}