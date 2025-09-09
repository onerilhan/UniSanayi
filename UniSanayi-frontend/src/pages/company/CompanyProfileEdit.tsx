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
          navigate('/company/dashboard');
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

  return (
    <>
      <Header />
      <Box sx={{ minHeight: '100vh', backgroundColor: '#f8f9fa', py: 3 }}>
        <Box sx={{ maxWidth: '800px', margin: '0 auto', px: 2 }}>
          
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/company/dashboard')}
              sx={{ mr: 2 }}
            >
              Geri Dön
            </Button>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
              Şirket Profili Düzenle
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
          <Paper sx={{ p: 4 }}>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Şirket Bilgileri */}
                <div>
                  <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                    Şirket Bilgileri
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
                  />

                  <TextField
                    fullWidth
                    label="Sektör"
                    name="industry"
                    value={formData.industry}
                    onChange={handleInputChange}
                    placeholder="Teknoloji, Finans, Sağlık vb."
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                  <FormControl fullWidth>
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
                  />
                </div>

                <TextField
                  fullWidth
                  label="Website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://www.sirketiniz.com"
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
                />

                {/* İletişim Bilgileri */}
                <div>
                  <Typography variant="h6" sx={{ mb: 2, mt: 2, color: 'primary.main' }}>
                    İletişim Bilgileri
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
                  />

                  <TextField
                    fullWidth
                    label="Telefon"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleInputChange}
                    placeholder="+90 532 123 45 67"
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
                />

                {/* Submit Button */}
                <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    startIcon={<Save />}
                    disabled={saving}
                    sx={{ minWidth: 150 }}
                  >
                    {saving ? 'Kaydediliyor...' : 'Kaydet'}
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/company/dashboard')}
                    disabled={saving}
                  >
                    İptal
                  </Button>
                </Box>

              </div>
            </form>
          </Paper>
        </Box>
      </Box>
    </>
  );
};

export default CompanyProfileEdit;