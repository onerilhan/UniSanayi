import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/Header';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Box,
  Typography,
  Stack,
  Alert,
  Divider
} from '@mui/material';
import { Add, Edit, Visibility, Group, TrendingUp } from '@mui/icons-material';

interface CompanyProfile {
  id: string;
  companyName: string;
  industry: string;
  companySize: string;
  website?: string;
  description?: string;
  contactPerson: string;
  contactPhone?: string;
  contactEmail?: string;
  locationCity?: string;
  isVerified: boolean;
  createdAt: string;
}

interface Project {
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
  status: string;
  viewCount: number;
  applicationsCount: number;
  createdAt: string;
  updatedAt: string;
}

interface Application {
  id: string;
  studentId: string;
  studentName: string;
  studentUniversity: string;
  studentDepartment: string;
  projectId: string;
  projectTitle: string;
  applicationStatus: string;
  coverLetter: string;
  appliedAt: string;
  reviewedAt?: string;
}

const CompanyDashboard: React.FC = () => {
  const { user, company } = useAuth();
  const navigate = useNavigate();
  
  // Profile state
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  
  // Projects state
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  
  // Applications state
  const [applications, setApplications] = useState<Application[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  
  // Tab state
  const [activeTab, setActiveTab] = useState('overview');
  
  // Messages
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Overview data'yı yükle
  useEffect(() => {
    fetchProfile();
    fetchProjectsSummary();
    fetchRecentApplications();
  }, []);

  // Tab değiştiğinde ilgili veriyi yükle
  useEffect(() => {
    if (activeTab === 'projects') {
      fetchProjects();
    } else if (activeTab === 'applications') {
      fetchApplications();
    } else if (activeTab === 'profile') {
      fetchProfile();
    }
  }, [activeTab]);

  const fetchProfile = async () => {
    try {
      setProfileLoading(true);
      const token = localStorage.getItem('unisanayi_token');
      if (!token) return;

      const response = await fetch('http://localhost:5126/api/companies/profile', {
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

  const fetchProjects = async () => {
    try {
      setProjectsLoading(true);
      const token = localStorage.getItem('unisanayi_token');
      if (!token) return;

      const response = await fetch('http://localhost:5126/api/companies/projects', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setProjects(result.data);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setProjectsLoading(false);
    }
  };

  const fetchProjectsSummary = async () => {
    try {
      const token = localStorage.getItem('unisanayi_token');
      if (!token) return;

      const response = await fetch('http://localhost:5126/api/companies/projects?summary=true', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setProjects(result.data.slice(0, 3)); // İlk 3 proje
      }
    } catch (error) {
      console.error('Error fetching projects summary:', error);
    }
  };

  const fetchApplications = async () => {
    try {
      setApplicationsLoading(true);
      const token = localStorage.getItem('unisanayi_token');
      if (!token) return;

      const response = await fetch('http://localhost:5126/api/companies/applications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setApplications(result.data);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setApplicationsLoading(false);
    }
  };

  const fetchRecentApplications = async () => {
    try {
      const token = localStorage.getItem('unisanayi_token');
      if (!token) return;

      const response = await fetch('http://localhost:5126/api/companies/applications?recent=true', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setApplications(result.data.slice(0, 5)); // İlk 5 başvuru
      }
    } catch (error) {
      console.error('Error fetching recent applications:', error);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return { bg: '#d4edda', color: '#155724', border: '#c3e6cb' };
      case 'Draft': return { bg: '#fff3cd', color: '#856404', border: '#ffeaa7' };
      case 'Closed': return { bg: '#f8d7da', color: '#721c24', border: '#f5c6cb' };
      case 'Pending': return { bg: '#cce5ff', color: '#004085', border: '#b8d4fd' };
      default: return { bg: '#e2e8f0', color: '#475569', border: '#cbd5e0' };
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Active': return 'Aktif';
      case 'Draft': return 'Taslak';
      case 'Closed': return 'Kapalı';
      case 'Pending': return 'Onay Bekliyor';
      default: return status;
    }
  };

  const getApplicationStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return { bg: '#fff3cd', color: '#856404', border: '#ffeaa7' };
      case 'Reviewed': return { bg: '#cce5ff', color: '#004085', border: '#b8d4fd' };
      case 'Accepted': return { bg: '#d4edda', color: '#155724', border: '#c3e6cb' };
      case 'Rejected': return { bg: '#f8d7da', color: '#721c24', border: '#f5c6cb' };
      default: return { bg: '#e2e8f0', color: '#475569', border: '#cbd5e0' };
    }
  };

  const getApplicationStatusText = (status: string) => {
    switch (status) {
      case 'Pending': return 'Bekliyor';
      case 'Reviewed': return 'İncelendi';
      case 'Accepted': return 'Kabul Edildi';
      case 'Rejected': return 'Reddedildi';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // İstatistikleri hesapla
  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === 'Active').length,
    totalApplications: applications.length,
    pendingApplications: applications.filter(a => a.applicationStatus === 'Pending').length,
    totalViews: projects.reduce((sum, p) => sum + p.viewCount, 0),
    avgApplicationsPerProject: projects.length > 0 ? Math.round(applications.length / projects.length) : 0
  };

  const profileCompletion = () => {
    if (!profile) return 0;
    const fields = [
      profile.companyName, profile.industry, profile.contactPerson,
      profile.companySize, profile.website, profile.description,
      profile.contactPhone, profile.contactEmail, profile.locationCity
    ];
    const completed = fields.filter(field => field && field.toString().trim()).length;
    return Math.round((completed / fields.length) * 100);
  };

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
                  Hoş Geldiniz, {company?.companyName}! 🏢
                </h1>
                <p style={{ color: '#4a5568', fontSize: '16px', marginBottom: '20px' }}>
                  {company?.industry && `${company.industry} sektörü`}
                </p>
                <div style={{ 
                  display: 'inline-block',
                  padding: '8px 16px',
                  backgroundColor: '#d4edda',
                  color: '#155724',
                  borderRadius: '6px',
                  border: '1px solid #c3e6cb',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}>
                  ✅ Aktif Şirket
                </div>
              </div>
              
              <button
                onClick={() => navigate('/company/profile')}
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
                onClick={() => setActiveTab('overview')}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  backgroundColor: activeTab === 'overview' ? '#667eea' : 'transparent',
                  color: activeTab === 'overview' ? 'white' : '#64748b',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
              >
                📊 Genel Bakış
              </button>
              <button
                onClick={() => setActiveTab('projects')}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  backgroundColor: activeTab === 'projects' ? '#667eea' : 'transparent',
                  color: activeTab === 'projects' ? 'white' : '#64748b',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
              >
                📋 Projelerim
              </button>
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
                👥 Başvurular
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
                🏢 Şirket Profili
              </button>
            </div>
          </div>

          {/* Messages */}
          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
              {successMessage}
            </Alert>
          )}
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMessage('')}>
              {errorMessage}
            </Alert>
          )}

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              {/* İstatistik Kartları */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center', border: '2px solid #e5e7eb' }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#667eea', marginBottom: '8px' }}>
                    {stats.totalProjects}
                  </div>
                  <div style={{ fontSize: '14px', color: '#64748b' }}>Toplam Proje</div>
                </div>
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center', border: '2px solid #c3e6cb' }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#48bb78', marginBottom: '8px' }}>
                    {stats.activeProjects}
                  </div>
                  <div style={{ fontSize: '14px', color: '#64748b' }}>Aktif Proje</div>
                </div>
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center', border: '2px solid #ffeaa7' }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#d69e2e', marginBottom: '8px' }}>
                    {stats.totalApplications}
                  </div>
                  <div style={{ fontSize: '14px', color: '#64748b' }}>Toplam Başvuru</div>
                </div>
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center', border: '2px solid #b8d4fd' }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#3182ce', marginBottom: '8px' }}>
                    {stats.totalViews}
                  </div>
                  <div style={{ fontSize: '14px', color: '#64748b' }}>Toplam Görüntülenme</div>
                </div>
              </div>

              {/* Quick Actions */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                {/* Yeni Proje Oluştur */}
                <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                    <span style={{ fontSize: '24px', marginRight: '10px' }}>➕</span>
                    <h3 style={{ color: '#1a202c', margin: 0 }}>Yeni Proje</h3>
                  </div>
                  <p style={{ color: '#4a5568', marginBottom: '20px' }}>Yeni proje oluşturun ve yetenekli öğrencilerle buluşun.</p>
                  <button style={{
                    padding: '12px 24px',
                    backgroundColor: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    width: '100%',
                    fontSize: '16px'
                  }}>
                    Proje Oluştur
                  </button>
                </div>

                {/* Bekleyen Başvurular */}
                <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                    <span style={{ fontSize: '24px', marginRight: '10px' }}>⏳</span>
                    <h3 style={{ color: '#1a202c', margin: 0 }}>Bekleyen Başvurular</h3>
                  </div>
                  <p style={{ color: '#4a5568', marginBottom: '20px' }}>İncelenmesi gereken başvurular var.</p>
                  <button 
                    onClick={() => setActiveTab('applications')}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#ed8936',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      width: '100%'
                    }}
                  >
                    {stats.pendingApplications} Başvuru İncele
                  </button>
                </div>

                {/* Profil Tamamlanma */}
                <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                    <span style={{ fontSize: '24px', marginRight: '10px' }}>📊</span>
                    <h3 style={{ color: '#1a202c', margin: 0 }}>Profil Durumu</h3>
                  </div>
                  <p style={{ color: '#4a5568', marginBottom: '20px' }}>Şirket profilinizi tamamlayın.</p>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '15px',
                    backgroundColor: '#f0fff4',
                    borderRadius: '8px'
                  }}>
                    <span style={{ fontWeight: '600', color: '#22543d' }}>
                      Tamamlanma: {profileCompletion()}%
                    </span>
                    <button 
                      onClick={() => setActiveTab('profile')}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#48bb78',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Düzenle
                    </button>
                  </div>
                </div>
              </div>

              {/* Son Projeler */}
              {projects.length > 0 && (
                <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, color: '#1f2937', fontSize: '18px', fontWeight: '600' }}>
                      📋 Son Projeler
                    </h3>
                    <button 
                      onClick={() => setActiveTab('projects')}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#f1f5f9',
                        color: '#475569',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Tümünü Gör
                    </button>
                  </div>
                  <div style={{ display: 'grid', gap: '16px' }}>
                    {projects.slice(0, 3).map((project) => {
                      const statusStyle = getStatusColor(project.status);
                      return (
                        <div
                          key={project.id}
                          style={{
                            padding: '16px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            backgroundColor: '#fafafa'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                <h4 style={{ margin: 0, color: '#1f2937', fontSize: '16px', fontWeight: '600' }}>
                                  {project.title}
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
                                  {getStatusText(project.status)}
                                </span>
                              </div>
                              <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#64748b' }}>
                                <span>👁️ {project.viewCount} görüntülenme</span>
                                <span>📝 {project.applicationsCount} başvuru</span>
                                <span>📅 {formatDate(project.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Son Başvurular */}
              {applications.length > 0 && (
                <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, color: '#1f2937', fontSize: '18px', fontWeight: '600' }}>
                      👥 Son Başvurular
                    </h3>
                    <button 
                      onClick={() => setActiveTab('applications')}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#f1f5f9',
                        color: '#475569',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Tümünü Gör
                    </button>
                  </div>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {applications.slice(0, 5).map((application) => {
                      const statusStyle = getApplicationStatusColor(application.applicationStatus);
                      return (
                        <div
                          key={application.id}
                          style={{
                            padding: '16px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            backgroundColor: '#fafafa'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
                                {application.studentName}
                              </div>
                              <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>
                                {application.studentUniversity} - {application.studentDepartment}
                              </div>
                              <div style={{ fontSize: '13px', color: '#94a3b8' }}>
                                {application.projectTitle} • {formatDateTime(application.appliedAt)}
                              </div>
                            </div>
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
                              {getApplicationStatusText(application.applicationStatus)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Projects Tab */}
          {activeTab === 'projects' && (
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ margin: 0, color: '#1f2937', fontSize: '20px', fontWeight: '600' }}>
                  📋 Proje Yönetimi
                </h3>
                <button 
                  onClick={() => navigate('/company/projects/new')}
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
                  Yeni Proje
                </button>
              </div>

              {projectsLoading ? (
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
                  Projeler yükleniyor...
                </div>
              ) : projects.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                  <h4 style={{ color: '#374151', marginBottom: '8px' }}>Henüz proje oluşturmamışsınız</h4>
                  <p style={{ marginBottom: '24px' }}>İlk projenizi oluşturun ve yetenekli öğrencilerle buluşun.</p>
                  <button 
                    onClick={() => navigate('/company/projects/new')}
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
                    İlk Projenizi Oluşturun
                  </button>
                </div>
              ) : (
                <div>
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
                        Toplam {projects.length} proje
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      {['Active', 'Draft', 'Closed'].map(status => {
                        const count = projects.filter(p => p.status === status).length;
                        const statusStyle = getStatusColor(status);
                        return (
                          <Chip
                            key={status}
                            label={`${getStatusText(status)}: ${count}`}
                            size="small"
                            style={{
                              backgroundColor: statusStyle.bg,
                              color: statusStyle.color,
                              fontWeight: '500',
                              border: `1px solid ${statusStyle.border}`
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gap: '16px' }}>
                    {projects.map((project) => {
                      const statusStyle = getStatusColor(project.status);
                      return (
                        <div
                          key={project.id}
                          style={{
                            padding: '24px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '12px',
                            backgroundColor: '#fafafa',
                            transition: 'transform 0.2s, box-shadow 0.2s'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                <h4 style={{ margin: 0, color: '#1f2937', fontSize: '18px', fontWeight: '600' }}>
                                  {project.title}
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
                                  {getStatusText(project.status)}
                                </span>
                              </div>
                              
                              <p style={{ color: '#4b5563', marginBottom: '12px', lineHeight: '1.5' }}>
                                {project.description.length > 150 
                                  ? `${project.description.substring(0, 150)}...` 
                                  : project.description}
                              </p>
                              
                              <div style={{ display: 'flex', gap: '24px', marginBottom: '12px', fontSize: '14px', color: '#64748b' }}>
                                <span>📋 {getProjectTypeText(project.projectType)}</span>
                                <span>⏱️ {project.durationDays} gün</span>
                                {project.budgetAmount && (
                                  <span>💰 {project.budgetAmount.toLocaleString('tr-TR')} {project.currency || 'TL'}</span>
                                )}
                                <span>📍 {project.locationCity || 'Uzaktan'}</span>
                              </div>
                              
                              <div style={{ display: 'flex', gap: '24px', fontSize: '13px', color: '#94a3b8' }}>
                                <span>👁️ {project.viewCount} görüntülenme</span>
                                <span>📝 {project.applicationsCount} başvuru</span>
                                <span>📅 {formatDate(project.createdAt)}</span>
                                {project.applicationDeadline && (
                                  <span>⏰ Son: {formatDate(project.applicationDeadline)}</span>
                                )}
                              </div>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
                              <button
                                onClick={() => navigate(`/project/${project.id}`)}
                                style={{
                                  padding: '8px 12px',
                                  backgroundColor: '#f1f5f9',
                                  color: '#475569',
                                  border: '1px solid #e2e8f0',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                                title="Projeyi Görüntüle"
                              >
                                <Visibility style={{ fontSize: '16px' }} />
                                Görüntüle
                              </button>
                              <button
                                onClick={() => navigate(`/company/projects/${project.id}/edit`)}
                                style={{
                                  padding: '8px 12px',
                                  backgroundColor: '#fef3e2',
                                  color: '#c2410c',
                                  border: '1px solid #fed7aa',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                                title="Projeyi Düzenle"
                              >
                                <Edit style={{ fontSize: '16px' }} />
                                Düzenle
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Applications Tab */}
          {activeTab === 'applications' && (
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ margin: 0, color: '#1f2937', fontSize: '20px', fontWeight: '600' }}>
                  👥 Başvuru Yönetimi
                </h3>
              </div>

              {applicationsLoading ? (
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
                  Başvurular yükleniyor...
                </div>
              ) : applications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
                  <h4 style={{ color: '#374151', marginBottom: '8px' }}>Henüz başvuru almamışsınız</h4>
                  <p style={{ marginBottom: '24px' }}>Projeleriniz yayınlandığında öğrenciler başvuru yapabilir.</p>
                </div>
              ) : (
                <div>
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
                        Toplam {applications.length} başvuru
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      {['Pending', 'Reviewed', 'Accepted', 'Rejected'].map(status => {
                        const count = applications.filter(a => a.applicationStatus === status).length;
                        const statusStyle = getApplicationStatusColor(status);
                        return (
                          <Chip
                            key={status}
                            label={`${getApplicationStatusText(status)}: ${count}`}
                            size="small"
                            style={{
                              backgroundColor: statusStyle.bg,
                              color: statusStyle.color,
                              fontWeight: '500',
                              border: `1px solid ${statusStyle.border}`
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gap: '16px' }}>
                    {applications.map((application) => {
                      const statusStyle = getApplicationStatusColor(application.applicationStatus);
                      return (
                        <div
                          key={application.id}
                          style={{
                            padding: '24px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '12px',
                            backgroundColor: '#fafafa'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                <h4 style={{ margin: 0, color: '#1f2937', fontSize: '18px', fontWeight: '600' }}>
                                  {application.studentName}
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
                                  {getApplicationStatusText(application.applicationStatus)}
                                </span>
                              </div>
                              
                              <div style={{ display: 'flex', gap: '24px', marginBottom: '12px', fontSize: '14px', color: '#64748b' }}>
                                <span>🎓 {application.studentUniversity}</span>
                                <span>📚 {application.studentDepartment}</span>
                                <span>📋 {application.projectTitle}</span>
                              </div>
                              
                              <div style={{ marginBottom: '12px' }}>
                                <strong style={{ color: '#1f2937', fontSize: '14px' }}>Motivasyon Mektubu:</strong>
                                <p style={{ 
                                  color: '#4b5563', 
                                  marginTop: '4px', 
                                  lineHeight: '1.5',
                                  fontSize: '14px',
                                  fontStyle: 'italic'
                                }}>
                                  "{application.coverLetter.length > 200 
                                    ? `${application.coverLetter.substring(0, 200)}...` 
                                    : application.coverLetter}"
                                </p>
                              </div>
                              
                              <div style={{ display: 'flex', gap: '24px', fontSize: '13px', color: '#94a3b8' }}>
                                <span>📅 Başvuru: {formatDateTime(application.appliedAt)}</span>
                                {application.reviewedAt && (
                                  <span>✅ İnceleme: {formatDateTime(application.reviewedAt)}</span>
                                )}
                              </div>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
                              <button
                                onClick={() => navigate(`/company/applications/${application.id}`)}
                                style={{
                                  padding: '8px 16px',
                                  backgroundColor: '#667eea',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '14px',
                                  fontWeight: '500'
                                }}
                              >
                                Detay İncele
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ margin: 0, color: '#1f2937', fontSize: '20px', fontWeight: '600' }}>
                  🏢 Şirket Profili
                </h3>
                <button 
                  onClick={() => navigate('/company/profile')}
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
                          Profilinizi tamamlayarak daha fazla öğrenci ile buluşun
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

                  {/* Şirket Bilgileri */}
                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ color: '#1f2937', marginBottom: '16px', fontSize: '16px' }}>
                      🏢 Şirket Bilgileri
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
                        <strong>Şirket Adı:</strong> {profile.companyName}
                      </div>
                      <div>
                        <strong>Sektör:</strong> {profile.industry || 'Belirtilmemiş'}
                      </div>
                      <div>
                        <strong>Şirket Büyüklüğü:</strong> {profile.companySize || 'Belirtilmemiş'}
                      </div>
                      <div>
                        <strong>Şehir:</strong> {profile.locationCity || 'Belirtilmemiş'}
                      </div>
                      <div>
                        <strong>Website:</strong> {profile.website ? (
                          <a href={profile.website} target="_blank" rel="noopener noreferrer" style={{ color: '#667eea' }}>
                            {profile.website}
                          </a>
                        ) : 'Belirtilmemiş'}
                      </div>
                    </div>
                  </div>

                  {/* İletişim Bilgileri */}
                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ color: '#1f2937', marginBottom: '16px', fontSize: '16px' }}>
                      📞 İletişim Bilgileri
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
                        <strong>İletişim Kişisi:</strong> {profile.contactPerson}
                      </div>
                      <div>
                        <strong>Telefon:</strong> {profile.contactPhone || 'Belirtilmemiş'}
                      </div>
                      <div>
                        <strong>Email:</strong> {profile.contactEmail || 'Belirtilmemiş'}
                      </div>
                    </div>
                  </div>

                  {/* Şirket Açıklaması */}
                  {profile.description && (
                    <div style={{ marginBottom: '24px' }}>
                      <h4 style={{ color: '#1f2937', marginBottom: '16px', fontSize: '16px' }}>
                        📝 Şirket Hakkında
                      </h4>
                      <div style={{ 
                        padding: '20px',
                        backgroundColor: '#fef3e2',
                        borderRadius: '8px'
                      }}>
                        <p style={{ 
                          margin: 0, 
                          color: '#4b5563', 
                          lineHeight: '1.6',
                          fontStyle: 'italic'
                        }}>
                          "{profile.description}"
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Doğrulama Durumu */}
                  <div style={{
                    padding: '20px',
                    backgroundColor: profile.isVerified ? '#f0fdf4' : '#fef3e2',
                    borderRadius: '8px',
                    border: `1px solid ${profile.isVerified ? '#dcfce7' : '#fed7aa'}`
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '24px' }}>
                        {profile.isVerified ? '✅' : '⏳'}
                      </span>
                      <div>
                        <h4 style={{ 
                          margin: '0 0 4px 0', 
                          color: profile.isVerified ? '#166534' : '#c2410c'
                        }}>
                          {profile.isVerified ? 'Doğrulanmış Şirket' : 'Doğrulama Bekleniyor'}
                        </h4>
                        <p style={{ 
                          margin: 0, 
                          color: profile.isVerified ? '#166534' : '#c2410c', 
                          fontSize: '14px'
                        }}>
                          {profile.isVerified 
                            ? 'Şirketiniz doğrulanmış ve öğrenciler tarafından güvenilir olarak görünüyor.'
                            : 'Şirketinizin doğrulanması için lütfen gerekli belgeleri sağlayın.'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏢</div>
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

export default CompanyDashboard;