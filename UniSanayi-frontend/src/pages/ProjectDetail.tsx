import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import { projectService, applicationService } from '../services/apiService';

interface ProjectDetail {
  id: string;
  title: string;
  description: string;
  projectType: string;
  durationDays: number;
  budgetAmount?: number;
  currency?: string;
  locationCity?: string;
  locationRequirement?: string;
  maxApplicants?: number;
  applicationDeadline?: string;
  projectStartDate?: string;
  status?: string;
  viewCount: number;
  companyName: string;
  companyIndustry?: string;
  companyDescription?: string;
  companyWebsite?: string;
  companyLocationCity?: string;
  skillRequirements?: SkillRequirement[];
  createdAt: string;
  updatedAt: string;
}

interface SkillRequirement {
  skillId: number;
  skillName: string;
  skillCategory: string;
  requiredLevel: string;
  isMandatory: boolean;
  weightPercentage?: number;
}

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [showApplicationForm, setShowApplicationForm] = useState<boolean>(false);
  const [applicationData, setApplicationData] = useState({
  coverLetter: ''
   }); 
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) {
        setError('Geçersiz proje ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await projectService.getProjectDetail(id);
        
        if (response.success) {
          setProject(response.data);
        } else {
          setError(response.message || 'Proje yüklenemedi');
        }
      } catch (error: any) {
        setError('API bağlantı hatası: ' + error.message);
        console.error('Project Detail API Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  const handleApplyClick = () => {
  if (!isAuthenticated) {
    alert('Başvuru yapmak için giriş yapmanız gerekiyor.');
    navigate('/login');
    return;
  }
  
  if (user?.userType !== 'Student') {
    alert('Sadece öğrenciler projelere başvuru yapabilir.');
    return;
  }

  setShowApplicationForm(true);
  setTimeout(() => {
    const formElement = document.getElementById('application-form');
    if (formElement) {
      formElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
    }
  }, 100);
  };
  
const handleSubmitApplication = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!applicationData.coverLetter.trim()) {
    setSubmitError('Motivasyon mektubu zorunludur.');
    return;
  }
  
  if (applicationData.coverLetter.trim().length < 50) {
    setSubmitError('Motivasyon mektubu en az 50 karakter olmalıdır.');
    return;
  }
  
  if (!project || !user) return;
  
  setSubmitting(true);
  setSubmitError('');
  setSubmitSuccess('');
  
  try {
    const token = localStorage.getItem('unisanayi_token');
    if (!token) {
      setSubmitError('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
      return;
    }
    
    const response = await applicationService.applyToProject(
      project.id, 
      applicationData.coverLetter.trim(),
      token
    );
    
    if (response.success) {
      setSubmitSuccess('Başvurunuz başarıyla gönderildi! Şirket tarafından değerlendirilecek.');
      setApplicationData({ coverLetter: '' });
      
      // 3 saniye sonra formu kapat
      setTimeout(() => {
        setShowApplicationForm(false);
        setSubmitSuccess('');
      }, 3000);
    } else {
      setSubmitError(response.message || 'Başvuru gönderilemedi.');
    }
  } catch (error: any) {
    console.error('Application submit error:', error);
    if (error.response?.data?.message) {
      setSubmitError(error.response.data.message);
    } else {
      setSubmitError('Sunucu hatası oluştu. Lütfen tekrar deneyin.');
    }
  } finally {
    setSubmitting(false);
  }
};

  const getProjectTypeDisplayName = (type: string) => {
    const types: { [key: string]: string } = {
      'Internship': 'Staj',
      'PartTime': 'Yarı Zamanlı',
      'FullTime': 'Tam Zamanlı',
      'Freelance': 'Serbest',
      'Research': 'Araştırma',
      'Thesis': 'Tez'
    };
    return types[type] || type;
  };

  const getLocationDisplayName = (requirement: string) => {
    const locations: { [key: string]: string } = {
      'Remote': 'Uzaktan',
      'On-site': 'Ofiste',
      'Hybrid': 'Hibrit'
    };
    return locations[requirement] || requirement;
  };

  const getLevelDisplayName = (level: string) => {
    const levels: { [key: string]: string } = {
      'Beginner': 'Başlangıç',
      'Intermediate': 'Orta',
      'Advanced': 'İleri'
    };
    return levels[level] || level;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <>
        <Header />
        <div style={{ 
          minHeight: '100vh', 
          backgroundColor: '#f8f9fa', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center' 
        }}>
          <div style={{ 
            textAlign: 'center', 
            backgroundColor: 'white',
            padding: '40px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{ 
              width: '50px', 
              height: '50px', 
              border: '4px solid #f3f4f6', 
              borderTop: '4px solid #667eea', 
              borderRadius: '50%', 
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }}></div>
            <div style={{ fontSize: '18px', color: '#667eea', fontWeight: '500' }}>
              Proje yükleniyor...
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error || !project) {
    return (
      <>
        <Header />
        <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', padding: '20px' }}>
          <div style={{ 
            maxWidth: '600px', 
            margin: '100px auto', 
            textAlign: 'center', 
            backgroundColor: 'white',
            padding: '50px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>😕</div>
            <h2 style={{ color: '#e53e3e', marginBottom: '15px' }}>Proje Bulunamadı</h2>
            <p style={{ color: '#6b7280', marginBottom: '30px', lineHeight: '1.6' }}>
              {error || 'Aradığınız proje mevcut değil veya kaldırılmış olabilir.'}
            </p>
            <button 
              onClick={() => navigate('/')}
              style={{
                padding: '12px 24px',
                backgroundColor: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#5a67d8'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#667eea'}
            >
              🏠 Ana Sayfaya Dön
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', padding: '20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Breadcrumb */}
          <div style={{ marginBottom: '20px' }}>
            <button 
              onClick={() => navigate('/')}
              style={{
                background: 'none',
                border: 'none',
                color: '#667eea',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 0',
                fontWeight: '500'
              }}
              onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
              onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
            >
              ← Ana Sayfa / Proje Detayları
            </button>
          </div>

          {/* Proje Başlık Kartı */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '40px', 
            borderRadius: '16px', 
            marginBottom: '24px', 
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '40px' }}>
              <div style={{ flex: 1 }}>
                <h1 style={{ 
                  color: '#1f2937', 
                  marginBottom: '16px', 
                  fontSize: '32px', 
                  fontWeight: '700',
                  lineHeight: '1.2'
                }}>
                  {project.title}
                </h1>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '18px' }}>🏢</span>
                    <span style={{ color: '#667eea', fontWeight: '600', fontSize: '18px' }}>
                      {project.companyName}
                    </span>
                  </div>
                  {project.companyIndustry && (
                    <div style={{ 
                      padding: '4px 12px', 
                      backgroundColor: '#f3f4f6', 
                      borderRadius: '20px',
                      fontSize: '14px',
                      color: '#6b7280'
                    }}>
                      {project.companyIndustry}
                    </div>
                  )}
                </div>
                
                {/* Proje Özellik Badges */}
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    padding: '8px 16px',
                    backgroundColor: '#eff6ff',
                    borderRadius: '10px',
                    border: '1px solid #dbeafe'
                  }}>
                    <span style={{ fontSize: '16px' }}>📋</span>
                    <span style={{ color: '#1e40af', fontWeight: '500', fontSize: '14px' }}>
                      {getProjectTypeDisplayName(project.projectType)}
                    </span>
                  </div>
                  
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    padding: '8px 16px',
                    backgroundColor: '#f0fdf4',
                    borderRadius: '10px',
                    border: '1px solid #dcfce7'
                  }}>
                    <span style={{ fontSize: '16px' }}>⏱️</span>
                    <span style={{ color: '#166534', fontWeight: '500', fontSize: '14px' }}>
                      {project.durationDays} gün
                    </span>
                  </div>
                  
                  {project.budgetAmount && (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      padding: '8px 16px',
                      backgroundColor: '#fef3e2',
                      borderRadius: '10px',
                      border: '1px solid #fed7aa'
                    }}>
                      <span style={{ fontSize: '16px' }}>💰</span>
                      <span style={{ color: '#c2410c', fontWeight: '500', fontSize: '14px' }}>
                        {project.budgetAmount.toLocaleString('tr-TR')} {project.currency || 'TL'}
                      </span>
                    </div>
                  )}
                  
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    padding: '8px 16px',
                    backgroundColor: '#fdf4ff',
                    borderRadius: '10px',
                    border: '1px solid #f3e8ff'
                  }}>
                    <span style={{ fontSize: '16px' }}>📍</span>
                    <span style={{ color: '#86198f', fontWeight: '500', fontSize: '14px' }}>
                      {project.locationCity || 'Şehir Belirtilmemiş'} - {getLocationDisplayName(project.locationRequirement || 'Remote')}
                    </span>
                  </div>
                  
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    padding: '8px 16px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <span style={{ fontSize: '16px' }}>👁️</span>
                    <span style={{ color: '#64748b', fontWeight: '500', fontSize: '14px' }}>
                      {project.viewCount} görüntülenme
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Başvuru Butonu */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-end' }}>
                <button
                  onClick={handleApplyClick}
                  disabled={showApplicationForm}
                  style={{
                    padding: '16px 32px',
                    backgroundColor: showApplicationForm ? '#9ca3af' : '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: showApplicationForm ? 'not-allowed' : 'pointer',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseOver={(e) => {
                    if (!showApplicationForm) {
                      e.currentTarget.style.backgroundColor = '#059669';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!showApplicationForm) {
                      e.currentTarget.style.backgroundColor = '#10b981';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  <span style={{ fontSize: '18px' }}>📝</span>
                  {showApplicationForm ? 'Form Açık' : 'Projeye Başvur'}
                </button>

                {project.applicationDeadline && (
                  <div style={{ 
                    backgroundColor: '#fef3c7', 
                    border: '2px solid #f59e0b', 
                    padding: '12px 16px', 
                    borderRadius: '10px',
                    textAlign: 'center',
                    maxWidth: '200px'
                  }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#92400e', marginBottom: '4px' }}>
                      ⏰ Son Başvuru
                    </div>
                    <div style={{ fontSize: '13px', color: '#b45309' }}>
                      {formatDate(project.applicationDeadline)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
            
          
            <div>
              {/* Proje Açıklaması */}
              <div style={{ 
                backgroundColor: 'white', 
                padding: '32px', 
                borderRadius: '16px', 
                marginBottom: '24px', 
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <span style={{ fontSize: '24px' }}>📖</span>
                  <h3 style={{ color: '#1f2937', margin: 0, fontSize: '20px', fontWeight: '600' }}>
                    Proje Açıklaması
                  </h3>
                </div>
                <div style={{ 
                  color: '#4b5563', 
                  lineHeight: '1.7', 
                  whiteSpace: 'pre-wrap',
                  fontSize: '15px'
                }}>
                  {project.description}
                </div>
              </div>

              {/* Skill Requirements */}
              {project.skillRequirements && project.skillRequirements.length > 0 && (
                <div style={{ 
                  backgroundColor: 'white', 
                  padding: '32px', 
                  borderRadius: '16px', 
                  marginBottom: '24px', 
                  boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <span style={{ fontSize: '24px' }}>🎯</span>
                    <h3 style={{ color: '#1f2937', margin: 0, fontSize: '20px', fontWeight: '600' }}>
                      Aranan Yetkinlikler
                    </h3>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                    {project.skillRequirements.map((skill) => (
                      <div 
                        key={skill.skillId}
                        style={{
                          padding: '16px 20px',
                          border: skill.isMandatory ? '2px solid #ef4444' : '2px solid #e5e7eb',
                          borderRadius: '12px',
                          backgroundColor: skill.isMandatory ? '#fef2f2' : '#f9fafb',
                          transition: 'transform 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                      >
                        <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '8px', fontSize: '16px' }}>
                          {skill.skillName}
                        </div>
                        <div style={{ 
                          fontSize: '12px', 
                          color: '#6b7280', 
                          marginBottom: '12px',
                          textTransform: 'uppercase',
                          fontWeight: '500',
                          letterSpacing: '0.05em'
                        }}>
                          {skill.skillCategory}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ 
                            fontSize: '12px', 
                            padding: '4px 12px', 
                            borderRadius: '20px',
                            backgroundColor: '#667eea',
                            color: 'white',
                            fontWeight: '500'
                          }}>
                            {getLevelDisplayName(skill.requiredLevel)}
                          </span>
                          {skill.isMandatory && (
                            <span style={{ 
                              fontSize: '12px', 
                              color: '#dc2626', 
                              fontWeight: '600',
                              backgroundColor: '#fecaca',
                              padding: '4px 8px',
                              borderRadius: '16px'
                            }}>
                              ZORUNLU
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sağ Kolon - Şirket & Proje Bilgileri */}
            <div>
              {/* Şirket Bilgileri */}
              <div style={{ 
                backgroundColor: 'white', 
                padding: '28px', 
                borderRadius: '16px', 
                marginBottom: '24px', 
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <span style={{ fontSize: '24px' }}>🏢</span>
                  <h3 style={{ color: '#1f2937', margin: 0, fontSize: '18px', fontWeight: '600' }}>
                    Şirket Hakkında
                  </h3>
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontWeight: '700', color: '#1f2937', fontSize: '20px', marginBottom: '6px' }}>
                    {project.companyName}
                  </div>
                  {project.companyIndustry && (
                    <div style={{ color: '#6b7280', fontSize: '14px' }}>
                      {project.companyIndustry} sektörü
                    </div>
                  )}
                </div>

                {project.companyDescription && (
                  <div style={{ 
                    color: '#4b5563', 
                    fontSize: '14px', 
                    lineHeight: '1.6',
                    marginBottom: '20px',
                    padding: '16px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '10px',
                    border: '1px solid #e5e7eb'
                  }}>
                    {project.companyDescription}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {project.companyLocationCity && (
                    <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px' }}>📍</span>
                      <span style={{ color: '#4b5563', fontSize: '14px' }}>{project.companyLocationCity}</span>
                    </div>
                  )}

                  {project.companyWebsite && (
                    <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px' }}>🌐</span>
                      <a 
                        href={project.companyWebsite} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ color: '#667eea', textDecoration: 'none', fontSize: '14px' }}
                        onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                        onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
                      >
                        {project.companyWebsite.replace('https://', '').replace('http://', '')}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Proje İstatistikleri */}
              <div style={{ 
                backgroundColor: 'white', 
                padding: '28px', 
                borderRadius: '16px', 
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <span style={{ fontSize: '24px' }}>📊</span>
                  <h3 style={{ color: '#1f2937', margin: 0, fontSize: '18px', fontWeight: '600' }}>
                    Proje Detayları
                  </h3>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {project.maxApplicants && (
                    <div style={{ 
                      marginBottom: '16px', 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      padding: '12px',
                      backgroundColor: '#f0f9ff',
                      borderRadius: '8px',
                      border: '1px solid #e0f2fe'
                    }}>
                      <span style={{ fontSize: '14px', color: '#0369a1', fontWeight: '500' }}>👥 Max Başvuru:</span>
                      <span style={{ fontSize: '14px', color: '#0c4a6e', fontWeight: '600' }}>{project.maxApplicants} kişi</span>
                    </div>
                  )}

                  {project.projectStartDate && (
                    <div style={{ 
                      marginBottom: '16px', 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      padding: '12px',
                      backgroundColor: '#f0fdf4',
                      borderRadius: '8px',
                      border: '1px solid #dcfce7'
                    }}>
                      <span style={{ fontSize: '14px', color: '#166534', fontWeight: '500' }}>🚀 Başlangıç:</span>
                      <span style={{ fontSize: '14px', color: '#14532d', fontWeight: '600' }}>{formatDate(project.projectStartDate)}</span>
                    </div>
                  )}

                  <div style={{ 
                    marginBottom: '16px', 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    padding: '12px',
                    backgroundColor: '#fef7ff',
                    borderRadius: '8px',
                    border: '1px solid #f3e8ff'
                  }}>
                    <span style={{ fontSize: '14px', color: '#86198f', fontWeight: '500' }}>📅 İlan Tarihi:</span>
                    <span style={{ fontSize: '14px', color: '#701a75', fontWeight: '600' }}>{formatDate(project.createdAt)}</span>
                  </div>

                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    padding: '12px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <span style={{ fontSize: '14px', color: '#475569', fontWeight: '500' }}>🔄 Güncelleme:</span>
                    <span style={{ fontSize: '14px', color: '#334155', fontWeight: '600' }}>{formatDate(project.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Başvuru Formu */}
{showApplicationForm && (
  <div 
    id="application-form"  
    style={{ 
      backgroundColor: 'white', 
      padding: '40px', 
      borderRadius: '16px', 
      marginTop: '24px',
      boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
      border: '2px solid #667eea'
    }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
      <span style={{ fontSize: '24px' }}>📝</span>
      <h3 style={{ color: '#1f2937', margin: 0, fontSize: '22px', fontWeight: '600' }}>
        {project?.title} Projesine Başvur
      </h3>
    </div>

    {/* Success Message */}
    {submitSuccess && (
      <div style={{ 
        backgroundColor: '#d4edda', 
        color: '#155724', 
        padding: '12px', 
        borderRadius: '6px', 
        marginBottom: '20px',
        border: '1px solid #c3e6cb',
        textAlign: 'center'
      }}>
        {submitSuccess}
      </div>
    )}

    {/* Error Message */}
    {submitError && (
      <div style={{ 
        backgroundColor: '#f8d7da', 
        color: '#721c24', 
        padding: '12px', 
        borderRadius: '6px', 
        marginBottom: '20px',
        border: '1px solid #f5c6cb'
      }}>
        {submitError}
      </div>
    )}

    <form onSubmit={handleSubmitApplication}>
      {/* Motivasyon Mektubu */}
      <div style={{ marginBottom: '25px' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '8px', 
          color: '#1f2937', 
          fontWeight: '600', 
          fontSize: '16px' 
        }}>
          Motivasyon Mektubu *
        </label>
        <div style={{ 
          fontSize: '14px', 
          color: '#6b7280', 
          marginBottom: '10px',
          lineHeight: '1.5'
        }}>
          Neden bu projeye başvurmak istiyorsunuz? Hangi yeteneklerinizin bu proje için uygun olduğunu düşünüyorsunuz? (En az 50 karakter)
        </div>
        <textarea
          value={applicationData.coverLetter}
          onChange={(e) => setApplicationData({ coverLetter: e.target.value })}
          disabled={submitting}
          rows={8}
          style={{ 
            width: '100%', 
            padding: '12px', 
            border: submitError && !applicationData.coverLetter.trim() ? '2px solid #e53e3e' : '1px solid #d1d5db', 
            borderRadius: '8px', 
            fontSize: '14px',
            resize: 'vertical',
            fontFamily: 'inherit',
            outline: 'none',
            backgroundColor: submitting ? '#f9fafb' : 'white'
          }}
          placeholder="Örnek: Bu projeye başvurmak istememin temel nedeni, JavaScript ve React alanındaki deneyimimin bu projede değerli katkılar sağlayabileceğine inanmam. Üniversitede aldığım yazılım geliştirme dersleri ve kişisel projelerimde edindiğim deneyimler..."
          onFocus={(e) => e.target.style.borderColor = '#667eea'}
          onBlur={(e) => e.target.style.borderColor = submitError && !applicationData.coverLetter.trim() ? '#e53e3e' : '#d1d5db'}
        />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginTop: '5px',
          fontSize: '12px',
          color: '#6b7280'
        }}>
          <span>
            {applicationData.coverLetter.length < 50 ? (
              <span style={{ color: '#dc2626' }}>En az 50 karakter gerekli ({50 - applicationData.coverLetter.length} karakter kaldı)</span>
            ) : (
              <span style={{ color: '#059669' }}>✓ Karakter sayısı uygun</span>
            )}
          </span>
          <span>{applicationData.coverLetter.length}/2000</span>
        </div>
      </div>

      {/* Proje Hakkında Bilgi Notu */}
      <div style={{ 
        backgroundColor: '#f0f9ff', 
        border: '1px solid #bae6fd',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '25px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{ fontSize: '16px' }}>💡</span>
          <span style={{ fontWeight: '600', color: '#0c4a6e' }}>Başvuru İpuçları</span>
        </div>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#0c4a6e', fontSize: '14px', lineHeight: '1.6' }}>
          <li>Projenin gereksinimlerini dikkatlice okuyun</li>
          <li>Hangi yetkinliklerinizin bu projeye uygun olduğunu belirtin</li>
          <li>Daha önce yaptığınız benzer projelerden örnekler verin</li>
          <li>Projeye nasıl değer katacağınızı açıklayın</li>
        </ul>
      </div>

      {/* Onay Checkbox */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'flex-start', 
        gap: '10px',
        marginBottom: '25px',
        padding: '12px',
        backgroundColor: '#fefce8',
        border: '1px solid #fde68a',
        borderRadius: '6px'
      }}>
        <input 
          type="checkbox" 
          id="terms-agreement"
          style={{ marginTop: '2px' }}
          required
        />
        <label htmlFor="terms-agreement" style={{ fontSize: '13px', color: '#92400e', lineHeight: '1.5' }}>
          Başvurum ile ilgili olarak şirket tarafından iletişime geçilmesini kabul ediyorum. 
          Verdiğim bilgilerin doğru olduğunu beyan ederim.
        </label>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={() => setShowApplicationForm(false)}
          disabled={submitting}
          style={{
            padding: '12px 24px',
            backgroundColor: 'white',
            color: '#374151',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            cursor: submitting ? 'not-allowed' : 'pointer',
            fontWeight: '500',
            opacity: submitting ? 0.5 : 1
          }}
        >
          İptal
        </button>
        <button
          type="submit"
          disabled={submitting || applicationData.coverLetter.length < 50}
          style={{
            padding: '12px 24px',
            backgroundColor: submitting || applicationData.coverLetter.length < 50 ? '#9ca3af' : '#059669',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: submitting || applicationData.coverLetter.length < 50 ? 'not-allowed' : 'pointer',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {submitting ? (
            <>
              <div style={{ 
                width: '16px', 
                height: '16px', 
                border: '2px solid #ffffff30', 
                borderTop: '2px solid #ffffff', 
                borderRadius: '50%', 
                animation: 'spin 1s linear infinite'
              }}></div>
              Gönderiliyor...
            </>
          ) : (
            <>
              <span>📤</span>
              Başvurumu Gönder
            </>
          )}
        </button>
      </div>
      </form>
    </div>
)}

        </div>
      </div>

{/* Loading Animation CSS */}
<style>{`
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`}</style>
    </>
  );
};

export default ProjectDetail;