import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
    <div style={{ 
      maxWidth: '600px', 
      width: '100%', 
      padding: '40px', 
      backgroundColor: 'white', 
      borderRadius: '8px', 
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <button 
          onClick={onBack}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: '#667eea', 
            cursor: 'pointer', 
            fontSize: '14px',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          ← Geri Dön
        </button>
        <h2 style={{ color: '#1a202c', margin: 0 }}>Öğrenci Kaydı</h2>
        <p style={{ color: '#718096', fontSize: '14px', margin: '5px 0 0 0' }}>
          Bilgilerinizi girin ve hesabınızı oluşturun
        </p>
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

      {/* Error Message */}
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
        {/* Name Fields */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: '#4a5568', fontWeight: '500' }}>
              Ad *
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              disabled={loading}
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: errors.firstName ? '2px solid #e53e3e' : '1px solid #e2e8f0', 
                borderRadius: '6px', 
                fontSize: '14px',
                outline: 'none'
              }}
              placeholder="Adınızı girin"
            />
            {errors.firstName && (
              <span style={{ color: '#e53e3e', fontSize: '12px', display: 'block', marginTop: '3px' }}>
                {errors.firstName}
              </span>
            )}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: '#4a5568', fontWeight: '500' }}>
              Soyad *
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              disabled={loading}
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: errors.lastName ? '2px solid #e53e3e' : '1px solid #e2e8f0', 
                borderRadius: '6px', 
                fontSize: '14px',
                outline: 'none'
              }}
              placeholder="Soyadınızı girin"
            />
            {errors.lastName && (
              <span style={{ color: '#e53e3e', fontSize: '12px', display: 'block', marginTop: '3px' }}>
                {errors.lastName}
              </span>
            )}
          </div>
        </div>

        {/* Email */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: '#4a5568', fontWeight: '500' }}>
            Email *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '10px', 
              border: errors.email ? '2px solid #e53e3e' : '1px solid #e2e8f0', 
              borderRadius: '6px', 
              fontSize: '14px',
              outline: 'none'
            }}
            placeholder="ornek@email.com"
          />
          {errors.email && (
            <span style={{ color: '#e53e3e', fontSize: '12px', display: 'block', marginTop: '3px' }}>
              {errors.email}
            </span>
          )}
        </div>

        {/* Password */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: '#4a5568', fontWeight: '500' }}>
            Şifre *
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '10px', 
              border: errors.password ? '2px solid #e53e3e' : '1px solid #e2e8f0', 
              borderRadius: '6px', 
              fontSize: '14px',
              outline: 'none'
            }}
            placeholder="En az 8 karakter, büyük/küçük harf ve rakam"
          />
          {errors.password && (
            <span style={{ color: '#e53e3e', fontSize: '12px', display: 'block', marginTop: '3px' }}>
              {errors.password}
            </span>
          )}
        </div>

        {/* University */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: '#4a5568', fontWeight: '500' }}>
            Üniversite *
          </label>
          <input
            type="text"
            value={formData.universityName}
            onChange={(e) => handleInputChange('universityName', e.target.value)}
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '10px', 
              border: errors.universityName ? '2px solid #e53e3e' : '1px solid #e2e8f0', 
              borderRadius: '6px', 
              fontSize: '14px',
              outline: 'none'
            }}
            placeholder="İstanbul Teknik Üniversitesi"
          />
          {errors.universityName && (
            <span style={{ color: '#e53e3e', fontSize: '12px', display: 'block', marginTop: '3px' }}>
              {errors.universityName}
            </span>
          )}
        </div>

        {/* Department */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: '#4a5568', fontWeight: '500' }}>
            Bölüm *
          </label>
          <input
            type="text"
            value={formData.department}
            onChange={(e) => handleInputChange('department', e.target.value)}
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '10px', 
              border: errors.department ? '2px solid #e53e3e' : '1px solid #e2e8f0', 
              borderRadius: '6px', 
              fontSize: '14px',
              outline: 'none'
            }}
            placeholder="Bilgisayar Mühendisliği"
          />
          {errors.department && (
            <span style={{ color: '#e53e3e', fontSize: '12px', display: 'block', marginTop: '3px' }}>
              {errors.department}
            </span>
          )}
        </div>

        {/* Current Year & Graduation Year */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: '#4a5568', fontWeight: '500' }}>
              Sınıf *
            </label>
            <select
              value={formData.currentYear || ''}
              onChange={(e) => handleInputChange('currentYear', parseInt(e.target.value))}
              disabled={loading}
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: errors.currentYear ? '2px solid #e53e3e' : '1px solid #e2e8f0', 
                borderRadius: '6px', 
                fontSize: '14px',
                outline: 'none'
              }}
            >
              <option value="">Seçiniz</option>
              <option value="1">1. Sınıf</option>
              <option value="2">2. Sınıf</option>
              <option value="3">3. Sınıf</option>
              <option value="4">4. Sınıf</option>
              <option value="5">5. Sınıf</option>
              <option value="6">6. Sınıf</option>
            </select>
            {errors.currentYear && (
              <span style={{ color: '#e53e3e', fontSize: '12px', display: 'block', marginTop: '3px' }}>
                {errors.currentYear}
              </span>
            )}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: '#4a5568', fontWeight: '500' }}>
              Mezuniyet Yılı *
            </label>
            <input
              type="number"
              value={formData.graduationYear || ''}
              min={currentYear}
              max={currentYear + 10}
              onChange={(e) => handleInputChange('graduationYear', parseInt(e.target.value))}
              disabled={loading}
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: errors.graduationYear ? '2px solid #e53e3e' : '1px solid #e2e8f0', 
                borderRadius: '6px', 
                fontSize: '14px',
                outline: 'none'
              }}
              placeholder={currentYear.toString()}
            />
            {errors.graduationYear && (
              <span style={{ color: '#e53e3e', fontSize: '12px', display: 'block', marginTop: '3px' }}>
                {errors.graduationYear}
              </span>
            )}
          </div>
        </div>

        {/* Submit Button */}
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
        >
          {loading ? 'Kayıt oluşturuluyor...' : 'Hesap Oluştur'}
        </button>
      </form>

      {/* Login Link */}
      <div style={{ textAlign: 'center', marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #e2e8f0' }}>
        <span style={{ color: '#718096', fontSize: '14px' }}>Zaten hesabınız var mı? </span>
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
      </div>
    </div>
  );
};

export default StudentRegisterForm;