import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9fa' }}>
      <div style={{ maxWidth: '400px', width: '100%', padding: '40px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <Link to="/" style={{ textDecoration: 'none', color: '#667eea', fontSize: '24px', fontWeight: 'bold' }}>
            UniSanayi
          </Link>
          <h2 style={{ color: '#1a202c', marginTop: '10px', marginBottom: '5px' }}>Giriş Yap</h2>
          <p style={{ color: '#718096', fontSize: '14px' }}>Hesabınıza giriş yapın</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div style={{ 
            backgroundColor: '#d4edda', 
            color: '#155724', 
            padding: '12px', 
            borderRadius: '6px', 
            marginBottom: '20px',
            border: '1px solid #c3e6cb',
            textAlign: 'center'
          }}>
            {successMessage}
          </div>
        )}

        {/* General Error */}
        {errors.general && (
          <div style={{ 
            backgroundColor: '#f8d7da', 
            color: '#721c24', 
            padding: '12px', 
            borderRadius: '6px', 
            marginBottom: '20px',
            border: '1px solid #f5c6cb'
          }}>
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#4a5568', fontWeight: '500' }}>
              Email *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
              }}
              disabled={loading}
              style={{ 
                width: '100%', 
                padding: '12px', 
                border: errors.email ? '2px solid #e53e3e' : '1px solid #e2e8f0', 
                borderRadius: '6px', 
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              placeholder="ornek@email.com"
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = errors.email ? '#e53e3e' : '#e2e8f0'}
            />
            {errors.email && <span style={{ color: '#e53e3e', fontSize: '14px', marginTop: '5px', display: 'block' }}>{errors.email}</span>}
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#4a5568', fontWeight: '500' }}>
              Şifre *
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
              }}
              disabled={loading}
              style={{ 
                width: '100%', 
                padding: '12px', 
                border: errors.password ? '2px solid #e53e3e' : '1px solid #e2e8f0', 
                borderRadius: '6px', 
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              placeholder="••••••••"
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = errors.password ? '#e53e3e' : '#e2e8f0'}
            />
            {errors.password && <span style={{ color: '#e53e3e', fontSize: '14px', marginTop: '5px', display: 'block' }}>{errors.password}</span>}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '14px', 
              backgroundColor: loading ? '#a0aec0' : '#667eea', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px', 
              fontSize: '16px', 
              fontWeight: 'bold', 
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#5a67d8';
            }}
            onMouseOut={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#667eea';
            }}
          >
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '25px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
          <span style={{ color: '#718096' }}>Hesabınız yok mu? </span>
          <Link to="/register" style={{ color: '#667eea', textDecoration: 'none', fontWeight: 'bold' }}>
            Kayıt Ol
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;