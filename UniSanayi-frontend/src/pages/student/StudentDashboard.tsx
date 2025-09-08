import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { applicationService } from '../../services/apiService';
import Header from '../../components/Header';

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

const StudentDashboard: React.FC = () => {
  const { user, student } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
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

  // İstatistikleri hesapla
  const stats = {
    total: applications.length,
    pending: applications.filter(app => app.applicationStatus === 'Pending').length,
    accepted: applications.filter(app => app.applicationStatus === 'Accepted').length,
    rejected: applications.filter(app => app.applicationStatus === 'Rejected').length,
  };

  return (
    <>
      <Header />
      <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', padding: '20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Hoş Geldin Kartı - Profil Düzenle Butonu İle */}
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

          {activeTab === 'applications' && (
            <>
              {/* İstatistik Kartları - Gerçek Veriler */}
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

          {activeTab === 'profile' && (
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 24px 0', color: '#1f2937', fontSize: '20px', fontWeight: '600' }}>
                👤 Profil Bilgileri
              </h3>
              <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>👤</div>
                <h4 style={{ color: '#374151', marginBottom: '16px' }}>Profil bilgilerinizi düzenleyin</h4>
                <p style={{ marginBottom: '24px' }}>Profil sayfasında tüm bilgilerinizi güncelleyebilirsiniz.</p>
                <button 
                  onClick={() => navigate('/student/profile')}
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
                  ⚙️ Profili Düzenle
                </button>
              </div>
            </div>
          )}

          {activeTab === 'skills' && (
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 24px 0', color: '#1f2937', fontSize: '20px', fontWeight: '600' }}>
                🎯 Yetkinliklerim
              </h3>
              <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚧</div>
                <h4 style={{ color: '#374151', marginBottom: '8px' }}>Yetkinlik yönetimi yakında!</h4>
                <p>Bu özellik geliştirme aşamasında.</p>
              </div>
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

export default StudentDashboard;