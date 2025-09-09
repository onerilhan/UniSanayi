import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/Header';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Box,
  Stack,
  Divider
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';

interface ProfileForm {
  firstName: string;
  lastName: string;
  studentNumber: string;
  universityName: string;
  department: string;
  currentYear: number | '';
  graduationYear: number | '';
  gpa: number | '';
  phone: string;
  locationCity: string;
  bio: string;
  linkedinUrl: string;
  githubUrl: string;
  isAvailable: boolean;
}

interface ValidationErrors {
  [key: string]: string;
}

const StudentProfileSettings: React.FC = () => {
  const { user, student, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errors, setErrors] = useState<ValidationErrors>({});
  
  const [formData, setFormData] = useState<ProfileForm>({
    firstName: '',
    lastName: '',
    studentNumber: '',
    universityName: '',
    department: '',
    currentYear: '',
    graduationYear: '',
    gpa: '',
    phone: '',
    locationCity: '',
    bio: '',
    linkedinUrl: '',
    githubUrl: '',
    isAvailable: true
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
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
          const profileData = result.data;
          
          setFormData({
            firstName: profileData.firstName || '',
            lastName: profileData.lastName || '',
            studentNumber: profileData.studentNumber || '',
            universityName: profileData.universityName || '',
            department: profileData.department || '',
            currentYear: profileData.currentYear || '',
            graduationYear: profileData.graduationYear || '',
            gpa: profileData.gpa || '',
            phone: profileData.phone || '',
            locationCity: profileData.locationCity || '',
            bio: profileData.bio || '',
            linkedinUrl: profileData.linkedinUrl || '',
            githubUrl: profileData.githubUrl || '',
            isAvailable: profileData.isAvailable ?? true
          });
        }
      } catch (error) {
        console.error('Profile fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'Ad zorunludur';
    if (!formData.lastName.trim()) newErrors.lastName = 'Soyad zorunludur';
    if (!formData.universityName.trim()) newErrors.universityName = 'Üniversite zorunludur';
    if (!formData.department.trim()) newErrors.department = 'Bölüm zorunludur';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof ProfileForm, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("FORM GÖNDERILDI");
    console.log("GPA değeri:", formData.gpa);
    setSuccessMessage('');
    setErrors({});

    

    if (!validateForm()) return;

    setSaving(true);
    try {
      const token = localStorage.getItem('unisanayi_token');
      if (!token) {
        setErrors({ general: 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.' });
        setSaving(false);
        return;
      }

      const updateData = {
        ...formData,
        currentYear: formData.currentYear || null,
        graduationYear: formData.graduationYear || null,
        gpa: formData.gpa === "" ? null : formData.gpa,
        phone: formData.phone || null,
        locationCity: formData.locationCity || null,
        bio: formData.bio === "" ? null : formData.bio,
        linkedinUrl: formData.linkedinUrl || null,
        githubUrl: formData.githubUrl || null
      };

      const response = await fetch('http://localhost:5126/api/students/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      const result = await response.json();

      if (response.ok) {
        setSuccessMessage('Profil başarıyla güncellendi!');
        
        if (student) {
          const updatedStudent = {
            ...student,
            firstName: formData.firstName,
            lastName: formData.lastName,
            university: formData.universityName,
            department: formData.department,
            isAvailable: formData.isAvailable
          };
          updateProfile(updatedStudent);
        }

        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrors({ general: result.message || 'Güncelleme başarısız oldu' });
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setErrors({ general: 'Sunucu hatası oluştu. Lütfen internet bağlantınızı kontrol edin.' });
    } finally {
      setSaving(false);
    }
  };

  const calculateProfileCompletion = (): number => {
    const requiredFields = [formData.firstName, formData.lastName, formData.universityName, formData.department];
    const optionalFields = [formData.phone, formData.locationCity, formData.graduationYear, formData.currentYear, formData.gpa, formData.bio, formData.linkedinUrl, formData.githubUrl, formData.studentNumber];

    const completedRequired = requiredFields.filter(field => field && field.toString().trim()).length;
    const completedOptional = optionalFields.filter(field => field && field.toString().trim()).length;
    
    const requiredPercentage = (completedRequired / requiredFields.length) * 60;
    const optionalPercentage = (completedOptional / optionalFields.length) * 40;
    
    return Math.round(requiredPercentage + optionalPercentage);
  };

  if (loading) {
    return (
      <>
        <Header />
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <Box textAlign="center">
              <CircularProgress size={60} sx={{ color: '#667eea' }} />
              <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
                Profil yükleniyor...
              </Typography>
            </Box>
          </Box>
        </Container>
      </>
    );
  }

  const profileCompletion = calculateProfileCompletion();

  return (
    <>
      <Header />
      <Container maxWidth="md" sx={{ py: 4 }}>
        
        {/* Header Card */}
        <Paper 
          elevation={3}
          sx={{ 
            p: 4, 
            mb: 3, 
            borderRadius: 3,
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)'
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Button 
                startIcon={<ArrowBack />}
                onClick={() => navigate('/student')} 
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
                gutterBottom 
                sx={{ 
                  fontWeight: 700, 
                  color: '#1f2937',
                  mb: 1
                }}
              >
                ⚙️ Profil Ayarları
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Kişisel bilgilerinizi güncelleyin ve profilinizi tamamlayın
              </Typography>
            </Box>
            
            <Box textAlign="center">
              <Box position="relative" display="inline-flex">
                <CircularProgress 
                  variant="determinate" 
                  value={profileCompletion} 
                  size={80} 
                  thickness={4}
                  sx={{ color: '#667eea' }}
                />
                <Box 
                  position="absolute" 
                  top={0} 
                  left={0} 
                  bottom={0} 
                  right={0} 
                  display="flex" 
                  alignItems="center" 
                  justifyContent="center"
                >
                  <Typography variant="h6" fontWeight="bold" sx={{ color: '#1f2937' }}>
                    {profileCompletion}%
                  </Typography>
                </Box>
              </Box>
              <Typography variant="caption" display="block" sx={{ mt: 1, color: '#64748b' }}>
                Tamamlanma Oranı
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* Messages */}
        {successMessage && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
            {successMessage}
          </Alert>
        )}
        {errors.general && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {errors.general}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          
          {/* Müsaitlik Durumu */}
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              mb: 3, 
              borderRadius: 3, 
              border: '2px solid #667eea',
              background: 'linear-gradient(145deg, #ffffff 0%, #f0f4ff 100%)'
            }}
          >
            <Stack spacing={2}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937' }}>
                🚦 Müsaitlik Durumu
              </Typography>
              <FormControlLabel
                control={
                  <Switch 
                    checked={formData.isAvailable} 
                    onChange={(e) => handleInputChange('isAvailable', e.target.checked)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#10b981',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#10b981',
                      },
                    }}
                  />
                }
                label={
                  <Box>
                    <Typography 
                      variant="body1" 
                      fontWeight={600} 
                      sx={{ color: formData.isAvailable ? '#059669' : '#dc2626' }}
                    >
                      {formData.isAvailable ? '✅ Müsaitim - Yeni fırsatlara açığım' : '❌ Müsait Değilim - Şu anda iş aramıyorum'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Bu ayar şirketlere profilinizin aktif olup olmadığını gösterir
                    </Typography>
                  </Box>
                }
              />
            </Stack>
          </Paper>

          {/* Kişisel Bilgiler */}
          <Paper elevation={2} sx={{ p: 4, mb: 3, borderRadius: 3 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600, 
                color: '#1f2937',
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              👤 Kişisel Bilgiler
            </Typography>
            
            <Stack spacing={3}>
              {/* Ad Soyad */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  label="Ad"
                  variant="outlined"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  error={!!errors.firstName}
                  helperText={errors.firstName}
                  disabled={saving}
                  required
                />
                <TextField
                  fullWidth
                  label="Soyad"
                  variant="outlined"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  error={!!errors.lastName}
                  helperText={errors.lastName}
                  disabled={saving}
                  required
                />
              </Stack>

              {/* Telefon ve Şehir */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  label="Telefon"
                  variant="outlined"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={saving}
                  placeholder="+90 555 123 45 67"
                />
                <TextField
                  fullWidth
                  label="Şehir"
                  variant="outlined"
                  value={formData.locationCity}
                  onChange={(e) => handleInputChange('locationCity', e.target.value)}
                  disabled={saving}
                  placeholder="İstanbul, Ankara, vb."
                />
              </Stack>

              {/* Öğrenci Numarası */}
              <TextField
                fullWidth
                label="Öğrenci Numarası"
                variant="outlined"
                value={formData.studentNumber}
                onChange={(e) => handleInputChange('studentNumber', e.target.value)}
                disabled={saving}
                placeholder="Örnek: 20190123456"
              />
            </Stack>
          </Paper>

          {/* Eğitim Bilgileri */}
          <Paper elevation={2} sx={{ p: 4, mb: 3, borderRadius: 3 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600, 
                color: '#1f2937',
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              🎓 Eğitim Bilgileri
            </Typography>
            
            <Stack spacing={3}>
              {/* Üniversite */}
              <TextField
                fullWidth
                label="Üniversite"
                variant="outlined"
                value={formData.universityName}
                onChange={(e) => handleInputChange('universityName', e.target.value)}
                error={!!errors.universityName}
                helperText={errors.universityName}
                disabled={saving}
                required
                placeholder="Örnek: İstanbul Teknik Üniversitesi"
              />

              {/* Bölüm */}
              <TextField
                fullWidth
                label="Bölüm"
                variant="outlined"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                error={!!errors.department}
                helperText={errors.department}
                disabled={saving}
                required
                placeholder="Örnek: Bilgisayar Mühendisliği"
              />

              {/* Sınıf, Mezuniyet Yılı, GPA */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  select
                  label="Sınıf"
                  variant="outlined"
                  value={formData.currentYear}
                  onChange={(e) => handleInputChange('currentYear', parseInt(e.target.value) || '')}
                  disabled={saving}
                >
                  <MenuItem value="">Seçiniz</MenuItem>
                  <MenuItem value="1">1. Sınıf</MenuItem>
                  <MenuItem value="2">2. Sınıf</MenuItem>
                  <MenuItem value="3">3. Sınıf</MenuItem>
                  <MenuItem value="4">4. Sınıf</MenuItem>
                  <MenuItem value="5">5. Sınıf</MenuItem>
                  <MenuItem value="6">6. Sınıf</MenuItem>
                </TextField>

                <TextField
                  fullWidth
                  label="Mezuniyet Yılı"
                  type="number"
                  variant="outlined"
                  value={formData.graduationYear}
                  onChange={(e) => handleInputChange('graduationYear', parseInt(e.target.value) || '')}
                  disabled={saving}
                  inputProps={{ 
                    min: new Date().getFullYear(), 
                    max: new Date().getFullYear() + 10 
                  }}
                />

                <TextField
                  fullWidth
                  label="GPA (4.0 üzerinden)"
                  type="number"
                  variant="outlined"
                  value={formData.gpa}
                  onChange={(e) => handleInputChange('gpa', parseFloat(e.target.value) || '')}
                  disabled={saving}
                  inputProps={{ 
                    min: 0, 
                    max: 4, 
                    step: 0.01 
                  }}
                  placeholder="Örnek: 3.25"
                />
              </Stack>
            </Stack>
          </Paper>

          {/* Sosyal Medya & Bio */}
          <Paper elevation={2} sx={{ p: 4, mb: 4, borderRadius: 3 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600, 
                color: '#1f2937',
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              🔗 Sosyal Medya & Hakkımda
            </Typography>
            
            <Stack spacing={3}>
              {/* LinkedIn & GitHub */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  label="LinkedIn Profili"
                  variant="outlined"
                  value={formData.linkedinUrl}
                  onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                  disabled={saving}
                  placeholder="https://www.linkedin.com/in/kullaniciadi"
                />
                <TextField
                  fullWidth
                  label="GitHub Profili"
                  variant="outlined"
                  value={formData.githubUrl}
                  onChange={(e) => handleInputChange('githubUrl', e.target.value)}
                  disabled={saving}
                  placeholder="https://github.com/kullaniciadi"
                />
              </Stack>

              {/* Bio Section */}
              <Box>
                <Typography 
                  variant="body1" 
                  fontWeight={600} 
                  sx={{ mb: 1, color: '#1f2937' }}
                >
                  Hakkımda
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ mb: 2 }}
                >
                  Kendinizi tanıtın, projelerinizi ve ilgi alanlarınızı paylaşın (opsiyonel)
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  variant="outlined"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  disabled={saving}
                  placeholder="Örnek: Merhaba, ben yazılım geliştirme konusunda tutkulu bir öğrenciyim. React, Node.js ve Python teknolojileri ile projeler geliştiriyorum..."
                  inputProps={{ maxLength: 500 }}
                  helperText={`${formData.bio.length}/500 karakter`}
                />
              </Box>
            </Stack>
          </Paper>

          {/* Action Buttons */}
          <Paper elevation={1} sx={{ p: 3, borderRadius: 3, bgcolor: '#f8fafc' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="flex-end">
              <Button 
                variant="outlined" 
                onClick={() => navigate('/student')} 
                disabled={saving}
                sx={{ 
                  minWidth: 120,
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
              <Button 
                type="submit" 
                variant="contained" 
                disabled={saving}
                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : null}
                sx={{ 
                  minWidth: 180,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                  }
                }}
              >
                {saving ? 'Kaydediliyor...' : '💾 Değişiklikleri Kaydet'}
              </Button>
            </Stack>
          </Paper>
        </Box>
      </Container>
    </>
  );
};

export default StudentProfileSettings;