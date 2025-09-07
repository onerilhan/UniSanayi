import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  TextField, 
  Button, 
  MenuItem, 
  Box, 
  Typography, 
  Paper,
  Stack,
  Alert,
  IconButton
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';
import { authService } from '../../../services/authService';
import { useRegisterValidation } from '../../../hooks/useRegisterValidation';
import type { CompanyRegisterForm as CompanyFormData } from '../../../services/authService';

interface CompanyRegisterFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

const CompanyRegisterForm: React.FC<CompanyRegisterFormProps> = ({ onBack, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const { login } = useAuth();
  const { errors, validateCompanyForm, clearFieldError, setGeneralError, clearErrors } = useRegisterValidation();

  const [formData, setFormData] = useState<CompanyFormData>({
    email: '',
    password: '',
    companyName: '',
    industry: '',
    companySize: '',
    website: '',
    description: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    locationCity: '',
  });

  const handleInputChange = (field: keyof CompanyFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    clearFieldError(field);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    setSuccessMessage('');

    if (!validateCompanyForm(formData)) {
      return;
    }

    setLoading(true);
    try {
      const response = await authService.registerCompany(formData);
      
      if (response.success && response.data) {
        const { token, user, company } = response.data;
        login(token, user, company);
        setSuccessMessage('Kayıt başarılı! Dashboard\'a yönlendiriliyorsunuz...');
        onSuccess();
      } else {
        setGeneralError(response.message || 'Kayıt başarısız oldu');
      }
    } catch (error: any) {
      console.error('Register error:', error);
      if (error.response?.data?.message) {
        setGeneralError(error.response.data.message);
      } else if (error.response?.data?.errors?.length > 0) {
        setGeneralError(error.response.data.errors[0]);
      } else {
        setGeneralError('Sunucu hatası. Lütfen daha sonra tekrar deneyiniz.');
      }
    } finally {
      setLoading(false);
    }
  };

  const companySizes = [
    { value: '1-10', label: '1-10 çalışan' },
    { value: '11-50', label: '11-50 çalışan' },
    { value: '51-200', label: '51-200 çalışan' },
    { value: '201-1000', label: '201-1000 çalışan' },
    { value: '1000+', label: '1000+ çalışan' }
  ];

  return (
    <Paper 
      elevation={8}
      sx={{ 
        maxWidth: 700, 
        width: '100%', 
        p: 5, 
        borderRadius: 3,
        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)'
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <IconButton 
          onClick={onBack}
          sx={{ 
            mb: 2, 
            color: '#667eea',
            '&:hover': { bgcolor: 'rgba(102, 126, 234, 0.1)' }
          }}
        >
          <ArrowBack />
        </IconButton>
        
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 700, 
            color: '#1f2937', 
            mb: 1,
            textAlign: 'center'
          }}
        >
          🏢 Şirket Kaydı
        </Typography>
        
        <Typography 
          variant="body1" 
          sx={{ 
            color: '#6b7280', 
            textAlign: 'center' 
          }}
        >
          Şirket bilgilerinizi girin ve hesabınızı oluşturun
        </Typography>
      </Box>

      {/* Success Message */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}

      {/* Error Message */}
      {errors.general && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errors.general}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        {/* Company Name */}
        <TextField
          fullWidth
          label="Şirket Adı"
          variant="outlined"
          value={formData.companyName}
          onChange={(e) => handleInputChange('companyName', e.target.value)}
          error={!!errors.companyName}
          helperText={errors.companyName}
          disabled={loading}
          required
          sx={{ mb: 2 }}
        />

        {/* Email */}
        <TextField
          fullWidth
          label="Email"
          type="email"
          variant="outlined"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          error={!!errors.email}
          helperText={errors.email}
          disabled={loading}
          required
          sx={{ mb: 2 }}
        />

        {/* Password */}
        <TextField
          fullWidth
          label="Şifre"
          type="password"
          variant="outlined"
          value={formData.password}
          onChange={(e) => handleInputChange('password', e.target.value)}
          error={!!errors.password}
          helperText={errors.password || 'En az 8 karakter, büyük/küçük harf ve rakam'}
          disabled={loading}
          required
          sx={{ mb: 2 }}
        />

        {/* Contact Person */}
        <TextField
          fullWidth
          label="İletişim Kişisi"
          variant="outlined"
          value={formData.contactPerson}
          onChange={(e) => handleInputChange('contactPerson', e.target.value)}
          error={!!errors.contactPerson}
          helperText={errors.contactPerson}
          disabled={loading}
          required
          sx={{ mb: 2 }}
        />

        {/* Industry & Company Size */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="Sektör"
            variant="outlined"
            value={formData.industry}
            onChange={(e) => handleInputChange('industry', e.target.value)}
            disabled={loading}
            placeholder="Teknoloji, Finans, vb."
          />

          <TextField
            fullWidth
            select
            label="Şirket Büyüklüğü"
            value={formData.companySize}
            onChange={(e) => handleInputChange('companySize', e.target.value)}
            disabled={loading}
          >
            <MenuItem value="">Seçiniz</MenuItem>
            {companySizes.map(size => (
              <MenuItem key={size.value} value={size.value}>
                {size.label}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        {/* Website & Location */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="Website"
            type="url"
            variant="outlined"
            value={formData.website}
            onChange={(e) => handleInputChange('website', e.target.value)}
            error={!!errors.website}
            helperText={errors.website}
            disabled={loading}
            placeholder="https://sirketiniz.com"
          />

          <TextField
            fullWidth
            label="Şehir"
            variant="outlined"
            value={formData.locationCity}
            onChange={(e) => handleInputChange('locationCity', e.target.value)}
            disabled={loading}
            placeholder="İstanbul, Ankara, vb."
          />
        </Stack>

        {/* Contact Phone & Email */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="İletişim Telefonu"
            type="tel"
            variant="outlined"
            value={formData.contactPhone}
            onChange={(e) => handleInputChange('contactPhone', e.target.value)}
            error={!!errors.contactPhone}
            helperText={errors.contactPhone}
            disabled={loading}
            placeholder="+90 555 123 45 67"
          />

          <TextField
            fullWidth
            label="İletişim Email"
            type="email"
            variant="outlined"
            value={formData.contactEmail}
            onChange={(e) => handleInputChange('contactEmail', e.target.value)}
            error={!!errors.contactEmail}
            helperText={errors.contactEmail}
            disabled={loading}
            placeholder="iletisim@sirketiniz.com"
          />
        </Stack>

        {/* Description */}
        <TextField
          fullWidth
          label="Şirket Açıklaması"
          variant="outlined"
          multiline
          rows={3}
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          disabled={loading}
          placeholder="Şirketiniz hakkında kısa bir açıklama yazın..."
          sx={{ mb: 3 }}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={loading}
          sx={{
            py: 2,
            fontSize: '16px',
            fontWeight: 600,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
            }
          }}
        >
          {loading ? 'Kayıt oluşturuluyor...' : '🏢 Hesap Oluştur'}
        </Button>
      </Box>

      {/* Login Link */}
      <Box sx={{ textAlign: 'center', mt: 3, pt: 2, borderTop: '1px solid #e5e7eb' }}>
        <Typography variant="body2" color="text.secondary">
          Zaten hesabınız var mı?{' '}
          <Link 
            to="/login" 
            style={{ 
              color: '#667eea', 
              textDecoration: 'none', 
              fontWeight: 'bold' 
            }}
          >
            Giriş Yap
          </Link>
        </Typography>
      </Box>
    </Paper>
  );
};

export default CompanyRegisterForm;