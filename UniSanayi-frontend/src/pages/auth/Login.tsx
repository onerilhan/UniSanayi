import React, { useState, useEffect, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { Link, useNavigate } from 'react-router-dom';
import { 
  TextField, 
  Button, 
  Box, 
  Typography, 
  Paper,
  Alert,
  IconButton,
  InputAdornment
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import GoogleAuth from '../../components/GoogleAuth';

interface FormErrors {
  email?: string;
  password?: string;
  captcha?: string;
  general?: string;
}

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [captchaValue, setCaptchaValue] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState('');
  
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Zaten giriş yapılmışsa dashboard'a yönlendir
  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectTo = user.userType === 'Student' ? '/student' : '/company';
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email adresi zorunludur';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Geçerli bir email adresi giriniz';
    }

    // Password validation
    if (!password.trim()) {
      newErrors.password = 'Şifre zorunludur';
    } else if (password.length < 6) {
      newErrors.password = 'Şifre en az 6 karakter olmalıdır';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCaptchaChange = (value: string | null) => {
    setCaptchaValue(value);
    if (value && errors.captcha) {
      clearFieldError('captcha');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous messages
    setErrors({});
    setSuccessMessage('');

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // API call
      const response = await authService.login({
        email: email.trim(),
        password: password,
        captchaToken: captchaValue as string 
      });

      console.log('Login response:', response);

      // Check if login was successful
      if (response.success && response.data) {
        const { token, user: userData, student, company } = response.data;
        
        // Profile data'sını user type'a göre belirle
        const profile = userData.userType === 'Student' ? student : company;

        // AuthContext'e kaydet
        login(token, userData, profile);

        setSuccessMessage('Giriş başarılı! Yönlendiriliyorsunuz...');

        // Dashboard'a yönlendir
        setTimeout(() => {
          const redirectTo = userData.userType === 'Student' ? '/student' : '/company';
          navigate(redirectTo, { replace: true });
        }, 1500);

      } else {
        setErrors({ general: response.message || 'Giriş başarısız oldu' });
      }

    } catch (error: any) {
      console.error('Login error:', error);
      
      // API error handling
      if (error.response?.data?.message) {
        setErrors({ general: error.response.data.message });
      } else if (error.response?.data?.errors?.length > 0) {
        setErrors({ general: error.response.data.errors[0] });
      } else {
        setErrors({ general: 'Sunucu hatası. Lütfen daha sonra tekrar deneyiniz.' });
      }
    } finally {
      setLoading(false);
    }
  };

  // Google Login Handler
  const handleGoogleSuccess = async (credential: string) => {
    try {
      setGoogleLoading(true);
      setErrors({});
      
      // Backend'e Google credential'ını gönder
      console.log('Google credential:', credential);
      
      // TODO: Backend'de Google login endpoint'i oluşturulduğunda burası güncellenecek
      setErrors({ general: 'Google login henüz backend\'de yapılandırılmadı. Geleneksel login kullanın.' });
      
    } catch (error: any) {
      console.error('Google login error:', error);
      setErrors({ general: 'Google login başarısız oldu' });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = (error: string) => {
    console.error('Google auth error:', error);
    setErrors({ general: error });
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const clearFieldError = (field: string) => {
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: '#f8f9fa',
        p: 2
      }}
    >
      <Paper 
        elevation={8}
        sx={{ 
          maxWidth: 450, 
          width: '100%', 
          p: 5, 
          borderRadius: 3,
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)'
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Link 
            to="/" 
            style={{ 
              textDecoration: 'none', 
              color: '#667eea', 
              fontSize: '28px', 
              fontWeight: 'bold' 
            }}
          >
            UniSanayi
          </Link>
          
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700, 
              color: '#1f2937', 
              mt: 2, 
              mb: 1 
            }}
          >
            Giriş Yap
          </Typography>
          
          <Typography 
            variant="body1" 
            sx={{ 
              color: '#6b7280' 
            }}
          >
            Hesabınıza giriş yapın
          </Typography>
        </Box>

        {/* Success Message */}
        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {successMessage}
          </Alert>
        )}

        {/* General Error */}
        {errors.general && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errors.general}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          {/* Email */}
          <TextField
            fullWidth
            label="Email"
            type="email"
            variant="outlined"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clearFieldError('email');
            }}
            error={!!errors.email}
            helperText={errors.email}
            disabled={loading}
            required
            sx={{ mb: 2 }}
            placeholder="ornek@email.com"
          />

          {/* Password with Toggle */}
          <TextField
            fullWidth
            label="Şifre"
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              clearFieldError('password');
            }}
            error={!!errors.password}
            helperText={errors.password}
            disabled={loading}
            required
            sx={{ mb: 3 }}
            placeholder="••••••••"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    edge="end"
                    disabled={loading}
                    sx={{ color: '#667eea' }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Google reCAPTCHA */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey="6LdkocErAAAAAHc7WLco_nbK8BXZuVDEDjKfZgqu" 
              onChange={handleCaptchaChange}
              theme="light"
            />
          </Box>
          
          {errors.captcha && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.captcha}
            </Alert>
          )}

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
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                transform: 'translateY(-2px)'
              },
              '&:disabled': {
                background: '#9ca3af',
                boxShadow: 'none',
                transform: 'none'
              }
            }}
          >
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </Button>
        </Box>

        {/* Google Login - Alt kısım */}
        <Box sx={{ mt: 3, mb: 3 }}>
          <GoogleAuth
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            disabled={loading || googleLoading}
            buttonText={googleLoading ? "Google ile giriş yapılıyor..." : "Google ile Hızlı Giriş"}
          />
        </Box>

        {/* Register Link */}
        <Box sx={{ textAlign: 'center', mt: 3, pt: 2, borderTop: '1px solid #e5e7eb' }}>
          <Typography variant="body2" color="text.secondary">
            Hesabınız yok mu?{' '}
            <Link 
              to="/register" 
              style={{ 
                color: '#667eea', 
                textDecoration: 'none', 
                fontWeight: 'bold' 
              }}
            >
              Kayıt Ol
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;