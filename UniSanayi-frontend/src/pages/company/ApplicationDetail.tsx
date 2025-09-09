import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import {
  Paper,
  Typography,
  Box,
  Alert,
  Button,
  Chip,
  Divider,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import { ArrowBack, Email, School, Person, Assignment } from '@mui/icons-material';

interface ApplicationDetail {
  id: string;
  projectId: string;
  projectTitle: string;
  projectType: string;
  companyName: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  universityName: string;
  department: string;
  currentYear?: number;
  graduationYear?: number;
  gpa?: number;
  coverLetter: string;
  applicationStatus: string;
  appliedAt: string;
  reviewedAt?: string;
}

const ApplicationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [application, setApplication] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchApplication();
  }, [id]);

  const fetchApplication = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('unisanayi_token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`http://localhost:5126/api/applications/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setApplication(result.data);
      } else if (response.status === 401) {
        navigate('/login');
      } else if (response.status === 404) {
        setErrorMessage('Başvuru bulunamadı.');
      } else {
        setErrorMessage('Başvuru yüklenirken hata oluştu.');
      }
    } catch (error) {
      console.error('Error fetching application:', error);
      setErrorMessage('Bağlantı hatası oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (newStatus: string) => {
    try {
      setUpdating(true);
      setSuccessMessage('');
      setErrorMessage('');

      const token = localStorage.getItem('unisanayi_token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`http://localhost:5126/api/applications/${id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setSuccessMessage('Başvuru durumu başarıyla güncellendi!');
        fetchApplication();
      } else if (response.status === 401) {
        navigate('/login');
      } else {
        const result = await response.json();
        setErrorMessage(result.message || 'Durum güncellenirken hata oluştu.');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setErrorMessage('Bağlantı hatası oluştu.');
    } finally {
      setUpdating(false);
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
      case 'Pending': return 'Bekliyor';
      case 'Reviewed': return 'İncelendi';
      case 'Accepted': return 'Kabul Edildi';
      case 'Rejected': return 'Reddedildi';
      default: return status;
    }
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

  if (loading) {
    return (
      <>
        <Header />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </>
    );
  }

  if (!application) {
    return (
      <>
        <Header />
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '16px 16px 24px' }}>
          <Alert severity="error">Başvuru bulunamadı.</Alert>
        </div>
      </>
    );
  }

  const statusStyle = getStatusColor(application.applicationStatus);

  return (
    <>
      <Header />
      <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', padding: '24px 0' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 16px' }}>
          
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/company/dashboard')}
              sx={{ mr: 2 }}
            >
              Geri Dön
            </Button>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
              Başvuru Detayı
            </Typography>
          </div>

          {/* Messages */}
          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMessage}
            </Alert>
          )}
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}

          {/* Application Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
            
            {/* Sol Taraf - Student Info ve Cover Letter */}
            <div>
              {/* Student Info */}
              <Paper sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Person sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Öğrenci Bilgileri</Typography>
                </Box>
                
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                  {application.studentName}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  {application.studentEmail}
                </Typography>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div>
                    <Typography variant="body2" color="text.secondary">Üniversite</Typography>
                    <Typography variant="body1">{application.universityName}</Typography>
                  </div>
                  
                  <div>
                    <Typography variant="body2" color="text.secondary">Bölüm</Typography>
                    <Typography variant="body1">{application.department}</Typography>
                  </div>
                  
                  {application.currentYear && (
                    <div>
                      <Typography variant="body2" color="text.secondary">Sınıf</Typography>
                      <Typography variant="body1">{application.currentYear}. Sınıf</Typography>
                    </div>
                  )}
                  
                  {application.graduationYear && (
                    <div>
                      <Typography variant="body2" color="text.secondary">Mezuniyet Yılı</Typography>
                      <Typography variant="body1">{application.graduationYear}</Typography>
                    </div>
                  )}
                  
                  {application.gpa && (
                    <div>
                      <Typography variant="body2" color="text.secondary">GPA</Typography>
                      <Typography variant="body1">{application.gpa}/4.00</Typography>
                    </div>
                  )}
                </div>
              </Paper>

              {/* Cover Letter */}
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Assignment sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Motivasyon Mektubu</Typography>
                </Box>
                <Typography variant="body1" sx={{ lineHeight: 1.6, fontStyle: 'italic' }}>
                  "{application.coverLetter}"
                </Typography>
              </Paper>
            </div>

            {/* Sağ Taraf - Status, Actions ve Project Info */}
            <div>
              {/* Status ve Actions */}
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Başvuru Durumu</Typography>
                
                <Chip
                  label={getStatusText(application.applicationStatus)}
                  sx={{
                    backgroundColor: statusStyle.bg,
                    color: statusStyle.color,
                    border: `1px solid ${statusStyle.border}`,
                    fontWeight: 600,
                    mb: 3
                  }}
                />

                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Başvuru Tarihi
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {formatDateTime(application.appliedAt)}
                </Typography>

                {application.reviewedAt && (
                  <>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      İnceleme Tarihi
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3 }}>
                      {formatDateTime(application.reviewedAt)}
                    </Typography>
                  </>
                )}

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" sx={{ mb: 2 }}>Durum Güncelle</Typography>
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Yeni Durum</InputLabel>
                  <Select
                    value=""
                    label="Yeni Durum"
                    onChange={(e) => updateApplicationStatus(e.target.value)}
                    disabled={updating}
                  >
                    <MenuItem value="Reviewed">İncelendi</MenuItem>
                    <MenuItem value="Accepted">Kabul Et</MenuItem>
                    <MenuItem value="Rejected">Reddet</MenuItem>
                  </Select>
                </FormControl>

                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Email />}
                  href={`mailto:${application.studentEmail}`}
                  sx={{ mt: 1 }}
                >
                  Email Gönder
                </Button>
              </Paper>

              {/* Project Info */}
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Proje Bilgileri</Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Proje Adı
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {application.projectTitle}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Proje Türü
                </Typography>
                <Typography variant="body1">
                  {application.projectType}
                </Typography>
              </Paper>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default ApplicationDetail;