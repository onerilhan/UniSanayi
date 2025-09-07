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
import type { StudentRegisterForm as StudentFormData } from '../../../services/authService';

interface StudentRegisterFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

const StudentRegisterForm: React.FC<StudentRegisterFormProps> = ({ onBack, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const { login } = useAuth();
  const { errors, validateStudentForm, clearFieldError, setGeneralError, clearErrors } = useRegisterValidation();

  const [formData, setFormData] = useState<StudentFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    universityName: '',
    department: '',
    currentYear: 1,
    graduationYear: new Date().getFullYear() + 4,
  });

  const handleInputChange = (field: keyof StudentFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    clearFieldError(field);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    setSuccessMessage('');

    if (!validateStudentForm(formData)) {
      return;
    }

    setLoading(true);
    try {
      const response = await authService.registerStudent(formData);
      
      if (response.success && response.data) {
        const { token, user, student } = response.data;
        login(token, user, student);
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

  const currentYear = new Date().getFullYear();

  return (
    <Paper 
      elevation={8}
      sx={{ 
        maxWidth: 600, 
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
          🎓 Öğrenci Kaydı
        </Typography>
        
        <Typography 
          variant="body1" 
          sx={{ 
            color: '#6b7280', 
            textAlign: 'center' 
          }}
        >
          Bilgilerinizi girin ve hesabınızı oluşturun
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
        {/* Name Fields */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="Ad"
            variant="outlined"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            error={!!errors.firstName}
            helperText={errors.firstName}
            disabled={loading}
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
            disabled={loading}
            required
          />
        </Stack>

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

        {/* University */}
        <TextField
          fullWidth
          label="Üniversite"
          variant="outlined"
          value={formData.universityName}
          onChange={(e) => handleInputChange('universityName', e.target.value)}
          error={!!errors.universityName}
          helperText={errors.universityName}
          disabled={loading}
          required
          sx={{ mb: 2 }}
        />

        {/* Department */}
        <TextField
          fullWidth
          label="Bölüm"
          variant="outlined"
          value={formData.department}
          onChange={(e) => handleInputChange('department', e.target.value)}
          error={!!errors.department}
          helperText={errors.department}
          disabled={loading}
          required
          sx={{ mb: 2 }}
        />

        {/* Current Year & Graduation Year */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
          <TextField
            fullWidth
            select
            label="Sınıf"
            value={formData.currentYear || ''}
            onChange={(e) => handleInputChange('currentYear', parseInt(e.target.value))}
            error={!!errors.currentYear}
            helperText={errors.currentYear}
            disabled={loading}
            required
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
            value={formData.graduationYear || ''}
            onChange={(e) => handleInputChange('graduationYear', parseInt(e.target.value))}
            error={!!errors.graduationYear}
            helperText={errors.graduationYear}
            disabled={loading}
            inputProps={{ min: currentYear, max: currentYear + 10 }}
            required
          />
        </Stack>

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
          {loading ? 'Kayıt oluşturuluyor...' : '🎯 Hesap Oluştur'}
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

export default StudentRegisterForm;