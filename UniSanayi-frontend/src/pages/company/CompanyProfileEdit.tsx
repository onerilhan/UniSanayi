import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/Header';
import {
  TextField,
  Button,
  Paper,
  Typography,
  Box,
  Grid,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress
} from '@mui/material';
import { Save, ArrowBack } from '@mui/icons-material';

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

const CompanyProfileEdit: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    companySize: '',
    website: '',
    description: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    locationCity: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('unisanayi_token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:5126/api/companies/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setProfile(result.data);
        setFormData({
          companyName: result.data.companyName || '',
          industry: result.data.industry || '',
          companySize: result.data.companySize || '',
          website: result.data.website || '',
          description: result.data.description || '',
          contactPerson: result.data.contactPerson || '',
          contactPhone: result.data.contactPhone || '',
          contactEmail: result.data.contactEmail || '',
          locationCity: result.data.locationCity || ''
        });
      } else if (response.status === 401) {
        navigate('/login');
      } else {
        setErrorMessage('Profil bilgileri yüklenirken hata oluştu.');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setErrorMessage('Bağlantı hatası oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setSuccessMessage('');
      setErrorMessage('');

      const token = localStorage.getItem('unisanayi_token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:5126/api/companies/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSuccessMessage('Profil başarıyla güncellendi!');
        setTimeout(() => {
          navigate('/company');
        }, 2000);
      } else if (response.status === 401) {
        navigate('/login');
      } else {
        const result = await response.json();
        setErrorMessage(result.message || 'Profil güncellenirken hata oluştu.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrorMessage('Bağlantı hatası oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const calculateProfileCompletion = () => {
    const fields = [
      formData.companyName, formData.industry, formData.contactPerson,
      formData.companySize, formData.website, formData.description,
      formData.contactPhone, formData.contactEmail, formData.locationCity
    ];
    const completed = fields.filter(field => field && field.toString().trim()).length;
    return Math.round((completed / fields.length) * 100);
  };

  if (loading) {
    return (
      <>
        <Header />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <Box textAlign="center">
            <CircularProgress size={60} sx={{ color: '#667eea' }} />
            <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
              Profil yükleniyor...
            </Typography>
          </Box>
        </Box>
      </>
    );
  }

  return (
    <>
      <Header />
      <Box sx={{ minHeight: '100vh', backgroundColor: '#f8f9fa', py: 3 }}>
        <Box sx={{ maxWidth: '800px', margin: '0 auto', px: 2 }}>
          
          {/* Header */}
          <Box sx={{ mb: 3 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/company')}
              sx={{ 
                mb: 2,
                color: '#667eea',
                '&:hover': { bgcolor: 'rgba(102, 126, 234, 0.1)' }
              }}
            >
              Dashboard'a Dön
            </Button>
            <Typography 
              variant="h4" 
              component="h1" 
              sx={{ 
                fontWeight: 600,
                color: '#1f2937',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              ⚙️ Şirket Profili Düzenle
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Şirket bilgilerinizi güncelleyin ve profilinizi tamamlayın
            </Typography>
          </Box>

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

          {/* Form */}
          <Paper sx={{ p: 4, borderRadius: 3 }}>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Şirket Bilgileri */}
                <div>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: 2, 
                      color: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    🏢 Şirket Bilgileri
                  </Typography>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                  <TextField
                    fullWidth
                    label="Şirket Adı *"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    required
                    disabled={saving}
                  />

                  <TextField
                    fullWidth
                    label="Sektör"
                    name="industry"
                    value={formData.industry}
                    onChange={handleInputChange}
                    placeholder="Teknoloji, Finans, Sağlık vb."
                    disabled={saving}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                  <FormControl fullWidth disabled={saving}>
                    <InputLabel>Şirket Büyüklüğü</InputLabel>
                    <Select
                      value={formData.companySize}
                      label="Şirket Büyüklüğü"
                      onChange={(e) => handleSelectChange('companySize', e.target.value)}
                    >
                      <MenuItem value="">Seçiniz</MenuItem>
                      <MenuItem value="1-10">1-10 kişi</MenuItem>
                      <MenuItem value="11-50">11-50 kişi</MenuItem>
                      <MenuItem value="51-200">51-200 kişi</MenuItem>
                      <MenuItem value="201-1000">201-1000 kişi</MenuItem>
                      <MenuItem value="1000+">1000+ kişi</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    label="Şehir"
                    name="locationCity"
                    value={formData.locationCity}
                    onChange={handleInputChange}
                    placeholder="İstanbul, Ankara, İzmir vb."
                    disabled={saving}
                  />
                </div>

                <TextField
                  fullWidth
                  label="Website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://www.sirketiniz.com"
                  disabled={saving}
                />

                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Şirket Açıklaması"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Şirketiniz hakkında kısa bir açıklama yazın..."
                  disabled={saving}
                />

                {/* İletişim Bilgileri */}
                <div>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: 2, 
                      mt: 2, 
                      color: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    📞 İletişim Bilgileri
                  </Typography>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                  <TextField
                    fullWidth
                    label="İletişim Kişisi *"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleInputChange}
                    required
                    disabled={saving}
                  />

                  <TextField
                    fullWidth
                    label="Telefon"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleInputChange}
                    placeholder="+90 532 123 45 67"
                    disabled={saving}
                  />
                </div>

                <TextField
                  fullWidth
                  label="İletişim Email"
                  name="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  placeholder="iletisim@sirketiniz.com"
                  disabled={saving}
                />

                {/* Submit Button */}
                <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
                    disabled={saving}
                    sx={{ 
                      minWidth: 150,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                      }
                    }}
                  >
                    {saving ? 'Kaydediliyor...' : '💾 Kaydet'}
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/company')}
                    disabled={saving}
                    sx={{
                      color: '#64748b',
                      borderColor: '#e2e8f0',
                      '&:hover': {
                        borderColor: '#cbd5e1',
                        bgcolor: '#f1f5f9'
                      }
                    }}
                  >
                    İptal
                  </Button>
                </Box>

                {/* Info Box */}
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>💡 Bilgi:</strong> Profil bilgilerinizi ne kadar eksiksiz doldurursanız, 
                    öğrenciler tarafından o kadar güvenilir görünürsünüz ve daha fazla başvuru alırsınız.
                  </Typography>
                </Alert>

              </div>
            </form>
          </Paper>

          {/* Profil Tamamlanma Kartı */}
          <Paper sx={{ p: 3, mt: 3, borderRadius: 3, bgcolor: '#f8fafc' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937', mb: 1 }}>
                  📊 Profil Tamamlanma Durumu
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Profilinizi tamamlayarak daha fazla öğrenci ile buluşun
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#667eea' }}>
                  {calculateProfileCompletion()}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Tamamlandı
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Yardım Kartı */}
          <Paper sx={{ p: 3, mt: 3, borderRadius: 3, bgcolor: '#fef3e2', border: '1px solid #fed7aa' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#c2410c', mb: 2 }}>
              🤝 Yardıma mı ihtiyacınız var?
            </Typography>
            <Typography variant="body2" sx={{ color: '#c2410c', lineHeight: 1.6 }}>
              Profil düzenleme konusunda yardıma ihtiyacınız varsa, destek ekibimizle iletişime geçebilirsiniz. 
              Ayrıca şirket doğrulaması için gerekli belgelerinizi yüklemek istiyorsanız, 
              lütfen bizimle iletişime geçin.
            </Typography>
          </Paper>
        </Box>
      </Box>
    </>
  );
};

export default CompanyProfileEdit