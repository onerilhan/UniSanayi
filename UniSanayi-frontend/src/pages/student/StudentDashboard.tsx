import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { applicationService } from '../../services/apiService';
import Header from '../../components/Header';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Box,
  Typography,
  Stack,
  Alert,
  Divider
} from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';

interface Application {
  id: string;
  projectId: string;
  projectTitle: string;
  projectType: string;
  companyName: string;
  applicationStatus: string;
  appliedAt: string;
  reviewedAt?: string;
}

interface StudentSkill {
  id: string;
  skillId: number;
  skillName: string;
  skillCategory: string;
  proficiencyLevel: string;
  yearsOfExperience: number;
  isVerified: boolean;
  addedDate: string;
}

interface Skill {
  id: number;
  name: string;
  category: string;
  isActive: boolean;
}

interface StudentProfile {
  id: string;
  firstName: string;
  lastName: string;
  studentNumber?: string;
  universityName: string;
  department: string;
  currentYear?: number;
  graduationYear?: number;
  gpa?: number;
  phone?: string;
  locationCity?: string;
  bio?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  isAvailable: boolean;
  createdAt: string;
}

interface AddSkillForm {
  skillId: number;
  proficiencyLevel: string;
  yearsOfExperience: number;
}

const StudentDashboard: React.FC = () => {
  const { user, student } = useAuth();
  const navigate = useNavigate();
  
  // Applications state
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Profile state
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  
  // Skills state
  const [skills, setSkills] = useState<StudentSkill[]>([]);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [skillsLoading, setSkillsLoading] = useState(false);
  const [showAddSkillModal, setShowAddSkillModal] = useState(false);
  const [addSkillForm, setAddSkillForm] = useState<AddSkillForm>({
    skillId: 0,
    proficiencyLevel: '',
    yearsOfExperience: 0
  });
  const [skillError, setSkillError] = useState('');
  const [skillSuccess, setSkillSuccess] = useState('');
  
  // Tab state
  const [activeTab, setActiveTab] = useState('applications');

  // Başvuruları getir
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('unisanayi_token');
        if (token) {
          const response = await applicationService.getMyApplications(token);
          if (response.success) {
            setApplications(response.data);
          }
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  // Profil bilgilerini getir
  useEffect(() => {
    if (activeTab === 'profile') {
      fetchProfile();
    }
  }, [activeTab]);

  // Skills getir
  useEffect(() => {
    if (activeTab === 'skills') {
      fetchSkills();
      fetchAvailableSkills();
    }
  }, [activeTab]);

  const fetchProfile = async () => {
    try {
      setProfileLoading(true);
      const token = localStorage.getItem('unisanayi_token');
      if (!token) return;

      const response = await fetch('http://localhost:5126/api/students/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setProfile(result.data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchSkills = async () => {
    try {
      setSkillsLoading(true);
      const token = localStorage.getItem('unisanayi_token');
      if (!token) return;

      const response = await fetch('http://localhost:5126/api/students/skills', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setSkills(result.data);
      }
    } catch (error) {
      console.error('Error fetching skills:', error);
    } finally {
      setSkillsLoading(false);
    }
  };

  const fetchAvailableSkills = async () => {
    try {
      const response = await fetch('http://localhost:5126/api/skills');
      if (response.ok) {
        const result = await response.json();
        setAvailableSkills(result.data.filter((skill: Skill) => skill.isActive));
      }
    } catch (error) {
      console.error('Error fetching available skills:', error);
    }
  };

  const handleAddSkill = async () => {
    try {
      setSkillError('');
      
      if (!addSkillForm.skillId || !addSkillForm.proficiencyLevel) {
        setSkillError('Yetkinlik ve seviye seçimi zorunludur.');
        return;
      }

      const token = localStorage.getItem('unisanayi_token');
      if (!token) return;

      const response = await fetch('http://localhost:5126/api/students/skills', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(addSkillForm)
      });

      const result = await response.json();

      if (response.ok) {
        setSkillSuccess('Yetkinlik başarıyla eklendi!');
        setShowAddSkillModal(false);
        setAddSkillForm({ skillId: 0, proficiencyLevel: '', yearsOfExperience: 0 });
        fetchSkills(); // Listeyi yenile
        setTimeout(() => setSkillSuccess(''), 3000);
      } else {
        setSkillError(result.message || 'Yetkinlik eklenirken hata oluştu.');
      }
    } catch (error) {
      console.error('Error adding skill:', error);
      setSkillError('Sunucu hatası oluştu.');
    }
  };

  const handleDeleteSkill = async (skillId: number) => {
    if (!confirm('Bu yetkinliği silmek istediğinizden emin misiniz?')) return;

    try {
      const token = localStorage.getItem('unisanayi_token');
      if (!token) return;

      const response = await fetch(`http://localhost:5126/api/students/skills/${skillId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setSkillSuccess('Yetkinlik başarıyla silindi!');
        fetchSkills(); // Listeyi yenile
        setTimeout(() => setSkillSuccess(''), 3000);
      } else {
        const result = await response.json();
        setSkillError(result.message || 'Yetkinlik silinirken hata oluştu.');
      }
    } catch (error) {
      console.error('Error deleting skill:', error);
      setSkillError('Sunucu hatası oluştu.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return { bg: '#fff3cd', color: '#856404', border: '#ffeaa7' };
      case 'Reviewed': return { bg: '#cce5ff', color: '#004085', border: '#b8d4fd' };
      case 'Accepted': return { bg: '#d4edda', color: '#155724', border: '#c3e6cb' };
      case 'Rejected': return { bg: '#f8d7da', color: '#721c24', border: '#f5c6cb' };
      default: return { bg: '#e2e8f0', color: '#475569', border: '#cbd5e0' };
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Pending': return 'Değerlendiriliyor';
      case 'Reviewed': return 'İncelendi';
      case 'Accepted': return 'Kabul Edildi';
      case 'Rejected': return 'Reddedildi';
      default: return status;
    }
  };

  const getProjectTypeText = (type: string) => {
    switch (type) {
      case 'Internship': return 'Staj';
      case 'PartTime': return 'Yarı Zamanlı';
      case 'FullTime': return 'Tam Zamanlı';
      case 'Freelance': return 'Serbest';
      case 'Research': return 'Araştırma';
      case 'Thesis': return 'Tez';
      default: return type;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getProficiencyColor = (level: string) => {
    switch (level) {
      case 'Beginner': return '#fbbf24';
      case 'Intermediate': return '#3b82f6';
      case 'Advanced': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getProficiencyText = (level: string) => {
    switch (level) {
      case 'Beginner': return 'Başlangıç';
      case 'Intermediate': return 'Orta';
      case 'Advanced': return 'İleri';
      default: return level;
    }
  };

  // İstatistikleri hesapla
  const stats = {
    total: applications.length,
    pending: applications.filter(app => app.applicationStatus === 'Pending').length,
    accepted: applications.filter(app => app.applicationStatus === 'Accepted').length,
    rejected: applications.filter(app => app.applicationStatus === 'Rejected').length,
  };

  const profileCompletion = () => {
    if (!profile) return 0;
    const fields = [
      profile.firstName, profile.lastName, profile.universityName, profile.department,
      profile.currentYear, profile.graduationYear, profile.gpa, profile.phone,
      profile.locationCity, profile.bio, profile.linkedinUrl, profile.githubUrl
    ];
    const completed = fields.filter(field => field && field.toString().trim()).length;
    return Math.round((completed / fields.length) * 100);
  };

  // Kategorilere göre skills'leri grupla
  const skillsByCategory = skills.reduce((acc, skill) => {
    if (!acc[skill.skillCategory]) {
      acc[skill.skillCategory] = [];
    }
    acc[skill.skillCategory].push(skill);
    return acc;
  }, {} as Record<string, StudentSkill[]>);

  return (
    <>
      <Header />
      <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', padding: '20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Hoş Geldin Kartı */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '30px', 
            borderRadius: '16px', 
            marginBottom: '20px', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 style={{ color: '#1a202c', marginBottom: '10px', fontSize: '28px' }}>
                  Hoş Geldin, {student?.firstName} {student?.lastName}! 👨‍🎓
                </h1>
                <p style={{ color: '#4a5568', fontSize: '16px', marginBottom: '20px' }}>
                  {student?.university} - {student?.department}
                </p>
                <div style={{ 
                  display: 'inline-block',
                  padding: '8px 16px',
                  backgroundColor: student?.isAvailable ? '#d4edda' : '#f8d7da',
                  color: student?.isAvailable ? '#155724' : '#721c24',
                  borderRadius: '6px',
                  border: student?.isAvailable ? '1px solid #c3e6cb' : '1px solid #f5c6cb',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}>
                  {student?.isAvailable ? '✅ Müsait' : '❌ Müsait Değil'}
                </div>
              </div>
              
              <button
                onClick={() => navigate('/student/profile')}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#5a67d8'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#667eea'}
              >
                ⚙️ Profili Düzenle
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '4px', backgroundColor: 'white', borderRadius: '12px', padding: '4px' }}>
              <button
                onClick={() => setActiveTab('applications')}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  backgroundColor: activeTab === 'applications' ? '#667eea' : 'transparent',
                  color: activeTab === 'applications' ? 'white' : '#64748b',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
              >
                📄 Başvurularım
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  backgroundColor: activeTab === 'profile' ? '#667eea' : 'transparent',
                  color: activeTab === 'profile' ? 'white' : '#64748b',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
              >
                👤 Profilim
              </button>
              <button
                onClick={() => setActiveTab('skills')}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  backgroundColor: activeTab === 'skills' ? '#667eea' : 'transparent',
                  color: activeTab === 'skills' ? 'white' : '#64748b',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
              >
                🎯 Yetkinliklerim
              </button>
            </div>
          </div>

          {/* Applications Tab */}
          {activeTab === 'applications' && (
            <>
              {/* İstatistik Kartları */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center', border: '2px solid #e5e7eb' }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#667eea', marginBottom: '8px' }}>
                    {stats.total}
                  </div>
                  <div style={{ fontSize: '14px', color: '#64748b' }}>Toplam Başvuru</div>
                </div>
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center', border: '2px solid #ffeaa7' }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#d69e2e', marginBottom: '8px' }}>
                    {stats.pending}
                  </div>
                  <div style={{ fontSize: '14px', color: '#64748b' }}>Bekleyen</div>
                </div>
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center', border: '2px solid #c3e6cb' }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#48bb78', marginBottom: '8px' }}>
                    {stats.accepted}
                  </div>
                  <div style={{ fontSize: '14px', color: '#64748b' }}>Kabul Edilen</div>
                </div>
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center', border: '2px solid #f5c6cb' }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#e53e3e', marginBottom: '8px' }}>
                    {stats.rejected}
                  </div>
                  <div style={{ fontSize: '14px', color: '#64748b' }}>Reddedilen</div>
                </div>
              </div>

              {/* Başvuru Listesi */}
              <div style={{ backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <div style={{ padding: '24px 32px', borderBottom: '1px solid #e5e7eb' }}>
                  <h3 style={{ margin: 0, color: '#1f2937', fontSize: '20px', fontWeight: '600' }}>
                    Başvurularım ({applications.length})
                  </h3>
                </div>

                {loading ? (
                  <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      border: '3px solid #f3f4f6', 
                      borderTop: '3px solid #667eea', 
                      borderRadius: '50%', 
                      animation: 'spin 1s linear infinite',
                      margin: '0 auto 16px'
                    }}></div>
                    Başvurular yükleniyor...
                  </div>
                ) : applications.length === 0 ? (
                  <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
                    <h4 style={{ color: '#374151', marginBottom: '8px' }}>Henüz başvuru yapmamışsınız</h4>
                    <p style={{ marginBottom: '24px' }}>Ana sayfadan projelerimizi inceleyip başvuru yapabilirsiniz.</p>
                    <button 
                      onClick={() => navigate('/')}
                      style={{
                        padding: '12px 24px',
                        backgroundColor: '#667eea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      Projeleri Keşfet
                    </button>
                  </div>
                ) : (
                  <div style={{ padding: '0' }}>
                    {applications.map((application) => {
                      const statusStyle = getStatusColor(application.applicationStatus);
                      return (
                        <div
                          key={application.id}
                          style={{
                            padding: '24px 32px',
                            borderBottom: '1px solid #f1f5f9',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                <h4 style={{ margin: 0, color: '#1f2937', fontSize: '18px', fontWeight: '600' }}>
                                  {application.projectTitle}
                                </h4>
                                <span
                                  style={{
                                    padding: '4px 12px',
                                    backgroundColor: statusStyle.bg,
                                    color: statusStyle.color,
                                    border: `1px solid ${statusStyle.border}`,
                                    borderRadius: '20px',
                                    fontSize: '12px',
                                    fontWeight: '600'
                                  }}
                                >
                                  {getStatusText(application.applicationStatus)}
                                </span>
                              </div>
                              
                              <div style={{ display: 'flex', gap: '24px', marginBottom: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ fontSize: '16px' }}>🏢</span>
                                  <span style={{ color: '#64748b', fontSize: '14px' }}>{application.companyName}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ fontSize: '16px' }}>📋</span>
                                  <span style={{ color: '#64748b', fontSize: '14px' }}>{getProjectTypeText(application.projectType)}</span>
                                </div>
                              </div>
                              
                              <div style={{ display: 'flex', gap: '24px', fontSize: '13px', color: '#94a3b8' }}>
                                <span>📅 Başvuru: {formatDate(application.appliedAt)}</span>
                                {application.reviewedAt && (
                                  <span>✅ İnceleme: {formatDate(application.reviewedAt)}</span>
                                )}
                              </div>
                            </div>
                            
                            <button
                             onClick={() => navigate(`/project/${application.projectId}`)}
                              style={{
                                padding: '8px 16px',
                                backgroundColor: '#f1f5f9',
                                color: '#475569',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500',
                                transition: 'all 0.2s'
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = '#667eea';
                                e.currentTarget.style.color = 'white';
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = '#f1f5f9';
                                e.currentTarget.style.color = '#475569';
                              }}
                            >
                              Proje Detayı
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ margin: 0, color: '#1f2937', fontSize: '20px', fontWeight: '600' }}>
                  👤 Profil Bilgileri
                </h3>
                <button 
                  onClick={() => navigate('/student/profile')}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  ⚙️ Profili Düzenle
                </button>
              </div>

              {profileLoading ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    border: '3px solid #f3f4f6', 
                    borderTop: '3px solid #667eea', 
                    borderRadius: '50%', 
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 16px'
                  }}></div>
                  Profil bilgileri yükleniyor...
                </div>
              ) : profile ? (
                <div>
                  {/* Profil Tamamlanma */}
                  <div style={{ 
                    backgroundColor: '#f8fafc', 
                    padding: '20px', 
                    borderRadius: '12px', 
                    marginBottom: '24px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>Profil Tamamlanma</h4>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                          Profilinizi tamamlayarak daha fazla fırsat yakalayın
                        </p>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#667eea' }}>
                          {profileCompletion()}%
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>Tamamlandı</div>
                      </div>
                    </div>
                  </div>

                  {/* Kişisel Bilgiler */}
                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ color: '#1f2937', marginBottom: '16px', fontSize: '16px' }}>
                      📋 Kişisel Bilgiler
                    </h4>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                      gap: '16px',
                      padding: '20px',
                      backgroundColor: '#f9fafb',
                      borderRadius: '8px'
                    }}>
                      <div>
                        <strong>Ad Soyad:</strong> {profile.firstName} {profile.lastName}
                      </div>
                      <div>
                        <strong>Öğrenci No:</strong> {profile.studentNumber || 'Belirtilmemiş'}
                      </div>
                      <div>
                        <strong>Telefon:</strong> {profile.phone || 'Belirtilmemiş'}
                      </div>
                      <div>
                        <strong>Şehir:</strong> {profile.locationCity || 'Belirtilmemiş'}
                      </div>
                    </div>
                  </div>

                  {/* Eğitim Bilgileri */}
                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ color: '#1f2937', marginBottom: '16px', fontSize: '16px' }}>
                      🎓 Eğitim Bilgileri
                    </h4>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                      gap: '16px',
                      padding: '20px',
                      backgroundColor: '#f0f9ff',
                      borderRadius: '8px'
                    }}>
                      <div>
                        <strong>Üniversite:</strong> {profile.universityName}
                      </div>
                      <div>
                        <strong>Bölüm:</strong> {profile.department}
                      </div>
                      <div>
                        <strong>Sınıf:</strong> {profile.currentYear ? `${profile.currentYear}. Sınıf` : 'Belirtilmemiş'}
                      </div>
                      <div>
                        <strong>Mezuniyet Yılı:</strong> {profile.graduationYear || 'Belirtilmemiş'}
                      </div>
                      <div>
                        <strong>GPA:</strong> {profile.gpa ? `${profile.gpa}/4.0` : 'Belirtilmemiş'}
                      </div>
                    </div>
                  </div>

                  {/* Sosyal Medya & Bio */}
                  {(profile.linkedinUrl || profile.githubUrl || profile.bio) && (
                    <div style={{ marginBottom: '24px' }}>
                      <h4 style={{ color: '#1f2937', marginBottom: '16px', fontSize: '16px' }}>
                        🔗 Sosyal Medya & Hakkımda
                      </h4>
                      <div style={{ 
                        padding: '20px',
                        backgroundColor: '#fef3e2',
                        borderRadius: '8px'
                      }}>
                        {profile.linkedinUrl && (
                          <div style={{ marginBottom: '12px' }}>
                            <strong>LinkedIn:</strong>{' '}
                            <a 
                              href={profile.linkedinUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ color: '#667eea', textDecoration: 'none' }}
                            >
                              {profile.linkedinUrl}
                            </a>
                          </div>
                        )}
                        {profile.githubUrl && (
                          <div style={{ marginBottom: '12px' }}>
                            <strong>GitHub:</strong>{' '}
                            <a 
                              href={profile.githubUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ color: '#667eea', textDecoration: 'none' }}
                            >
                              {profile.githubUrl}
                            </a>
                          </div>
                        )}
                        {profile.bio && (
                          <div>
                            <strong>Hakkımda:</strong>
                            <p style={{ 
                              margin: '8px 0 0 0', 
                              color: '#4b5563', 
                              lineHeight: '1.6',
                              fontStyle: 'italic'
                            }}>
                              "{profile.bio}"
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>👤</div>
                  <h4 style={{ color: '#374151', marginBottom: '16px' }}>Profil bilgileri yüklenemedi</h4>
                  <button 
                    onClick={fetchProfile}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#667eea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Tekrar Dene
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Skills Tab */}
          {activeTab === 'skills' && (
            <div>
              {/* Skills Messages */}
              {skillSuccess && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {skillSuccess}
                </Alert>
              )}
              {skillError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {skillError}
                </Alert>
              )}

              <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h3 style={{ margin: 0, color: '#1f2937', fontSize: '20px', fontWeight: '600' }}>
                    🎯 Yetkinlik Yönetimi
                  </h3>
                  <button 
                    onClick={() => setShowAddSkillModal(true)}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Add style={{ fontSize: '18px' }} />
                    Yetkinlik Ekle
                  </button>
                </div>

                {skillsLoading ? (
                  <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      border: '3px solid #f3f4f6', 
                      borderTop: '3px solid #667eea', 
                      borderRadius: '50%', 
                      animation: 'spin 1s linear infinite',
                      margin: '0 auto 16px'
                    }}></div>
                    Yetkinlikler yükleniyor...
                  </div>
                ) : skills.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
                    <h4 style={{ color: '#374151', marginBottom: '8px' }}>Henüz yetkinlik eklememişsiniz</h4>
                    <p style={{ marginBottom: '24px' }}>Yetkinliklerinizi ekleyerek profilinizi güçlendirin ve daha fazla fırsat yakalayın.</p>
                    <button 
                      onClick={() => setShowAddSkillModal(true)}
                      style={{
                        padding: '12px 24px',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        margin: '0 auto'
                      }}
                    >
                      <Add style={{ fontSize: '18px' }} />
                      İlk Yetkinliğinizi Ekleyin
                    </button>
                  </div>
                ) : (
                  <div>
                    {/* Skills istatistiği */}
                    <div style={{ 
                      backgroundColor: '#f8fafc', 
                      padding: '16px', 
                      borderRadius: '8px', 
                      marginBottom: '24px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <span style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
                          Toplam {skills.length} yetkinlik
                        </span>
                        <span style={{ color: '#64748b', marginLeft: '16px' }}>
                          {Object.keys(skillsByCategory).length} kategori
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        {['Beginner', 'Intermediate', 'Advanced'].map(level => {
                          const count = skills.filter(s => s.proficiencyLevel === level).length;
                          return (
                            <Chip
                              key={level}
                              label={`${getProficiencyText(level)}: ${count}`}
                              size="small"
                              style={{
                                backgroundColor: getProficiencyColor(level),
                                color: 'white',
                                fontWeight: '500'
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>

                    {/* Skills by Category */}
                    {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                      <div key={category} style={{ marginBottom: '32px' }}>
                        <h4 style={{ 
                          color: '#1f2937', 
                          marginBottom: '16px', 
                          fontSize: '16px',
                          borderBottom: '2px solid #e5e7eb',
                          paddingBottom: '8px'
                        }}>
                          {category} ({categorySkills.length})
                        </h4>
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                          gap: '16px' 
                        }}>
                          {categorySkills.map((skill) => (
                            <div
                              key={skill.id}
                              style={{
                                padding: '16px',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                backgroundColor: '#fafafa',
                                position: 'relative'
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ flex: 1 }}>
                                  <h5 style={{ 
                                    margin: '0 0 8px 0', 
                                    color: '#1f2937', 
                                    fontSize: '16px',
                                    fontWeight: '600'
                                  }}>
                                    {skill.skillName}
                                    {skill.isVerified && (
                                      <span style={{ 
                                        marginLeft: '8px',
                                        fontSize: '14px',
                                        color: '#10b981'
                                      }}>
                                        ✓
                                      </span>
                                    )}
                                  </h5>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                    <Chip
                                      label={getProficiencyText(skill.proficiencyLevel)}
                                      size="small"
                                      style={{
                                        backgroundColor: getProficiencyColor(skill.proficiencyLevel),
                                        color: 'white',
                                        fontWeight: '500'
                                      }}
                                    />
                                    <span style={{ fontSize: '14px', color: '#64748b' }}>
                                      {skill.yearsOfExperience} yıl deneyim
                                    </span>
                                  </div>
                                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                                    Eklendi: {formatDate(skill.addedDate)}
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleDeleteSkill(skill.skillId)}
                                  style={{
                                    padding: '8px',
                                    backgroundColor: '#fee2e2',
                                    color: '#dc2626',
                                    border: '1px solid #fecaca',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '12px'
                                  }}
                                  title="Yetkinliği Sil"
                                >
                                  <Delete style={{ fontSize: '16px' }} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Skill Modal */}
      <Dialog 
        open={showAddSkillModal} 
        onClose={() => setShowAddSkillModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" component="div" style={{ fontWeight: '600' }}>
            🎯 Yeni Yetkinlik Ekle
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            {skillError && (
              <Alert severity="error">{skillError}</Alert>
            )}
            
            <FormControl fullWidth>
              <InputLabel>Yetkinlik Seç</InputLabel>
              <Select
                value={addSkillForm.skillId}
                onChange={(e) => setAddSkillForm(prev => ({ ...prev, skillId: Number(e.target.value) }))}
                label="Yetkinlik Seç"
              >
                <MenuItem value={0}>Seçiniz</MenuItem>
                {availableSkills
                  .filter(skill => !skills.some(s => s.skillId === skill.id))
                  .map(skill => (
                    <MenuItem key={skill.id} value={skill.id}>
                      {skill.name} ({skill.category})
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Seviye</InputLabel>
              <Select
                value={addSkillForm.proficiencyLevel}
                onChange={(e) => setAddSkillForm(prev => ({ ...prev, proficiencyLevel: e.target.value }))}
                label="Seviye"
              >
                <MenuItem value="">Seçiniz</MenuItem>
                <MenuItem value="Beginner">Başlangıç</MenuItem>
                <MenuItem value="Intermediate">Orta</MenuItem>
                <MenuItem value="Advanced">İleri</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Deneyim Yılı"
              type="number"
              value={addSkillForm.yearsOfExperience}
              onChange={(e) => setAddSkillForm(prev => ({ ...prev, yearsOfExperience: Number(e.target.value) }))}
              inputProps={{ min: 0, max: 20 }}
              helperText="Bu yetkinlikte kaç yıl deneyiminiz var?"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setShowAddSkillModal(false)}
            color="inherit"
          >
            İptal
          </Button>
          <Button 
            onClick={handleAddSkill}
            variant="contained"
            style={{ backgroundColor: '#10b981' }}
          >
            Ekle
          </Button>
        </DialogActions>
      </Dialog>

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

export default StudentDashboard;