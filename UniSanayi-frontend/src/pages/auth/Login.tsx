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
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  MenuItem,
  Select,
  FormControl,
  InputLabel
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

interface GoogleUserInfo {
  credential: string;
  email: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
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
  
  // Google modal states
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleUserInfo, setGoogleUserInfo] = useState<GoogleUserInfo | null>(null);
  const [userType, setUserType] = useState<'Student' | 'Company' | ''>('');
  const [googleFormData, setGoogleFormData] = useState({
    universityName: '',
    department: '',
    currentYear: '',
    graduationYear: '',
    companyName: '',
    contactPerson: '',
    industry: '',
    companySize: ''
  });
  
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

  // Google Login Handler - Mevcut kullanıcı kontrolü
  const handleGoogleSuccess = async (credential: string) => {
    try {
      setGoogleLoading(true);
      setErrors({});
      
      console.log('Google credential received:', credential);
      
      // Önce mevcut kullanıcı olup olmadığını kontrol et
      try {
        const response = await authService.googleLogin({
          googleToken: credential,
          userType: 'Student' // Geçici, backend kontrol edecek
        });

        if (response.success && response.data) {
          // Mevcut kullanıcı, direkt giriş yap
          const { token, user: userData, student, company } = response.data;
          const profile = userData.userType === 'Student' ? student : company;
          
          login(token, userData, profile);
          setSuccessMessage('Google ile giriş başarılı! Yönlendiriliyorsunuz...');
          
          setTimeout(() => {
            const redirectTo = userData.userType === 'Student' ? '/student' : '/company';
            navigate(redirectTo, { replace: true });
          }, 1500);
        }
      } catch (error: any) {
        // Yeni kullanıcı ise modal aç
        if (error.response?.status === 404 || error.response?.data?.message?.includes('bulunamadı')) {
          // Google token'dan kullanıcı bilgilerini çıkar (decode etmeden sadece payload'ı al)
          const tokenParts = credential.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            setGoogleUserInfo({
              credential,
              email: payload.email,
              name: payload.name,
              given_name: payload.given_name,
              family_name: payload.family_name,
              picture: payload.picture
            });
            setShowGoogleModal(true);
          }
        } else {
          throw error;
        }
      }
      
    } catch (error: any) {
      console.error('Google login error:', error);
      setErrors({ 
        general: error.response?.data?.message || 'Google ile giriş başarısız oldu' 
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  // Google yeni kullanıcı kaydı
  const handleGoogleRegister = async () => {
    if (!googleUserInfo || !userType) return;

    try {
      setGoogleLoading(true);
      
      const requestData = {
        googleToken: googleUserInfo.credential,
        userType,
        firstName: googleUserInfo.given_name,
        lastName: googleUserInfo.family_name,
        ...(userType === 'Student' ? {
          universityName: googleFormData.universityName,
          department: googleFormData.department,
          currentYear: googleFormData.currentYear ? parseInt(googleFormData.currentYear) : undefined,
          graduationYear: googleFormData.graduationYear ? parseInt(googleFormData.graduationYear) : undefined
        } : {
          companyName: googleFormData.companyName,
          contactPerson: googleFormData.contactPerson || googleUserInfo.name,
          industry: googleFormData.industry,
          companySize: googleFormData.companySize
        })
      };

      const response = await authService.googleLogin(requestData);
      
      if (response.success && response.data) {
        const { token, user: userData, student, company } = response.data;
        const profile = userData.userType === 'Student' ? student : company;
        
        login(token, userData, profile);
        setSuccessMessage('Google ile kayıt başarılı! Yönlendiriliyorsunuz...');
        setShowGoogleModal(false);
        
        setTimeout(() => {
          const redirectTo = userData.userType === 'Student' ? '/student' : '/company';
          navigate(redirectTo, { replace: true });
        }, 1500);
      }
    } catch (error: any) {
      console.error('Google register error:', error);
      setErrors({ 
        general: error.response?.data?.message || 'Google ile kayıt başarısız oldu' 
      });
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

  const resetGoogleModal = () => {
    setShowGoogleModal(false);
    setGoogleUserInfo(null);
    setUserType('');
    setGoogleFormData({
      universityName: '',
      department: '',
      currentYear: '',
      graduationYear: '',
      companyName: '',
      contactPerson: '',
      industry: '',
      companySize: ''
    });
  };

  const isGoogleFormValid = () => {
    if (userType === 'Student') {
      return googleFormData.universityName && googleFormData.department;
    } else if (userType === 'Company') {
      return googleFormData.companyName && googleFormData.contactPerson;
    }
    return false;
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

      {/* Google User Type Selection Modal */}
      <Dialog 
        open={showGoogleModal} 
        onClose={resetGoogleModal}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#1f2937' }}>
            🎉 Hoş Geldiniz!
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7280', mt: 1 }}>
            {googleUserInfo?.name}, hesap türünüzü seçin
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ px: 3, pb: 3 }}>
          {!userType ? (
            // User Type Selection
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setUserType('Student')}
                sx={{
                  py: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  borderColor: '#667eea',
                  color: '#667eea',
                  '&:hover': {
                    borderColor: '#5a67d8',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)'
                  }
                }}
              >
                <Typography variant="h4">🎓</Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Öğrenci</Typography>
                <Typography variant="caption" sx={{ textAlign: 'center' }}>
                  Projelere başvur ve deneyim kazan
                </Typography>
              </Button>
              
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setUserType('Company')}
                sx={{
                  py: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  borderColor: '#667eea',
                  color: '#667eea',
                  '&:hover': {
                    borderColor: '#5a67d8',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)'
                  }
                }}
              >
                <Typography variant="h4">🏢</Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Şirket</Typography>
                <Typography variant="caption" sx={{ textAlign: 'center' }}>
                  Proje oluştur ve yetenekli öğrenciler bul
                </Typography>
              </Button>
            </Box>
          ) : userType === 'Student' ? (
            // Student Form
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <Typography variant="h6" sx={{ color: '#1f2937', mb: 1 }}>
                🎓 Öğrenci Bilgileri
              </Typography>
              
              <TextField
                fullWidth
                label="Üniversite *"
                value={googleFormData.universityName}
                onChange={(e) => setGoogleFormData(prev => ({ ...prev, universityName: e.target.value }))}
                placeholder="İstanbul Teknik Üniversitesi"
                required
              />
              
              <TextField
                fullWidth
                label="Bölüm *"
                value={googleFormData.department}
                onChange={(e) => setGoogleFormData(prev => ({ ...prev, department: e.target.value }))}
                placeholder="Bilgisayar Mühendisliği"
                required
              />
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Sınıf</InputLabel>
                  <Select
                    value={googleFormData.currentYear}
                    onChange={(e) => setGoogleFormData(prev => ({ ...prev, currentYear: e.target.value }))}
                    label="Sınıf"
                  >
                    <MenuItem value="">Seçiniz</MenuItem>
                    <MenuItem value="1">1. Sınıf</MenuItem>
                    <MenuItem value="2">2. Sınıf</MenuItem>
                    <MenuItem value="3">3. Sınıf</MenuItem>
                    <MenuItem value="4">4. Sınıf</MenuItem>
                    <MenuItem value="5">5. Sınıf</MenuItem>
                    <MenuItem value="6">6. Sınıf</MenuItem>
                  </Select>
                </FormControl>
                
                <TextField
                  fullWidth
                  label="Mezuniyet Yılı"
                  type="number"
                  value={googleFormData.graduationYear}
                  onChange={(e) => setGoogleFormData(prev => ({ ...prev, graduationYear: e.target.value }))}
                  inputProps={{ min: new Date().getFullYear(), max: new Date().getFullYear() + 10 }}
                />
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button
                  onClick={() => setUserType('')}
                  variant="outlined"
                  sx={{ color: '#6b7280', borderColor: '#d1d5db' }}
                >
                  Geri
                </Button>
                <Button
                  onClick={handleGoogleRegister}
                  variant="contained"
                  disabled={!isGoogleFormValid() || googleLoading}
                  sx={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:disabled': { background: '#9ca3af' }
                  }}
                >
                  {googleLoading ? 'Kaydediliyor...' : '🚀 Hesap Oluştur'}
                </Button>
              </Box>
            </Box>
          ) : (
            // Company Form
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <Typography variant="h6" sx={{ color: '#1f2937', mb: 1 }}>
                🏢 Şirket Bilgileri
              </Typography>
              
              <TextField
                fullWidth
                label="Şirket Adı *"
                value={googleFormData.companyName}
                onChange={(e) => setGoogleFormData(prev => ({ ...prev, companyName: e.target.value }))}
                placeholder="ABC Teknoloji A.Ş."
                required
              />
              
              <TextField
                fullWidth
                label="İletişim Kişisi *"
                value={googleFormData.contactPerson}
                onChange={(e) => setGoogleFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
                placeholder={googleUserInfo?.name}
                required
              />
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Sektör"
                  value={googleFormData.industry}
                  onChange={(e) => setGoogleFormData(prev => ({ ...prev, industry: e.target.value }))}
                  placeholder="Teknoloji, Finans, Sağlık..."
                />
                
                <FormControl fullWidth>
                  <InputLabel>Şirket Büyüklüğü</InputLabel>
                  <Select
                    value={googleFormData.companySize}
                    onChange={(e) => setGoogleFormData(prev => ({ ...prev, companySize: e.target.value }))}
                    label="Şirket Büyüklüğü"
                  >
                    <MenuItem value="">Seçiniz</MenuItem>
                    <MenuItem value="1-10">1-10 kişi</MenuItem>
                    <MenuItem value="11-50">11-50 kişi</MenuItem>
                    <MenuItem value="51-200">51-200 kişi</MenuItem>
                    <MenuItem value="201-1000">201-1000 kişi</MenuItem>
                    <MenuItem value="1000+">1000+ kişi</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button
                  onClick={() => setUserType('')}
                  variant="outlined"
                  sx={{ color: '#6b7280', borderColor: '#d1d5db' }}
                >
                  Geri
                </Button>
                <Button
                  onClick={handleGoogleRegister}
                  variant="contained"
                  disabled={!isGoogleFormValid() || googleLoading}
                  sx={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:disabled': { background: '#9ca3af' }
                  }}
                >
                  {googleLoading ? 'Kaydediliyor...' : '🚀 Hesap Oluştur'}
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Login;