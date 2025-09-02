import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
        <h2 style={{ color: '#1a202c', margin: 0 }}>Şirket Kaydı</h2>
        <p style={{ color: '#718096', fontSize: '14px', margin: '5px 0 0 0' }}>
          Şirket bilgilerinizi girin ve hesabınızı oluşturun
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
        {/* Company Name */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: '#4a5568', fontWeight: '500' }}>
            Şirket Adı *
          </label>
          <input
            type="text"
            value={formData.companyName}
            onChange={(e) => handleInputChange('companyName', e.target.value)}
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '10px', 
              border: errors.companyName ? '2px solid #e53e3e' : '1px solid #e2e8f0', 
              borderRadius: '6px', 
              fontSize: '14px',
              outline: 'none'
            }}
            placeholder="Şirket Adı A.Ş."
          />
          {errors.companyName && (
            <span style={{ color: '#e53e3e', fontSize: '12px', display: 'block', marginTop: '3px' }}>
              {errors.companyName}
            </span>
          )}
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
            placeholder="info@sirketiniz.com"
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

        {/* Contact Person */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: '#4a5568', fontWeight: '500' }}>
            İletişim Kişisi *
          </label>
          <input
            type="text"
            value={formData.contactPerson}
            onChange={(e) => handleInputChange('contactPerson', e.target.value)}
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '10px', 
              border: errors.contactPerson ? '2px solid #e53e3e' : '1px solid #e2e8f0', 
              borderRadius: '6px', 
              fontSize: '14px',
              outline: 'none'
            }}
            placeholder="Ahmet Yılmaz"
          />
          {errors.contactPerson && (
            <span style={{ color: '#e53e3e', fontSize: '12px', display: 'block', marginTop: '3px' }}>
              {errors.contactPerson}
            </span>
          )}
        </div>

        {/* Industry & Company Size */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: '#4a5568', fontWeight: '500' }}>
              Sektör
            </label>
            <input
              type="text"
              value={formData.industry}
              onChange={(e) => handleInputChange('industry', e.target.value)}
              disabled={loading}
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: '1px solid #e2e8f0', 
                borderRadius: '6px', 
                fontSize: '14px',
                outline: 'none'
              }}
              placeholder="Teknoloji, Finans, vb."
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: '#4a5568', fontWeight: '500' }}>
              Şirket Büyüklüğü
            </label>
            <select
              value={formData.companySize}
              onChange={(e) => handleInputChange('companySize', e.target.value)}
              disabled={loading}
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: '1px solid #e2e8f0', 
                borderRadius: '6px', 
                fontSize: '14px',
                outline: 'none'
              }}
            >
              <option value="">Seçiniz</option>
              {companySizes.map(size => (
                <option key={size.value} value={size.value}>
                  {size.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Website & Location */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: '#4a5568', fontWeight: '500' }}>
              Website
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              disabled={loading}
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: errors.website ? '2px solid #e53e3e' : '1px solid #e2e8f0', 
                borderRadius: '6px', 
                fontSize: '14px',
                outline: 'none'
              }}
              placeholder="https://sirketiniz.com"
            />
            {errors.website && (
              <span style={{ color: '#e53e3e', fontSize: '12px', display: 'block', marginTop: '3px' }}>
                {errors.website}
              </span>
            )}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: '#4a5568', fontWeight: '500' }}>
              Şehir
            </label>
            <input
              type="text"
              value={formData.locationCity}
              onChange={(e) => handleInputChange('locationCity', e.target.value)}
              disabled={loading}
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: '1px solid #e2e8f0', 
                borderRadius: '6px', 
                fontSize: '14px',
                outline: 'none'
              }}
              placeholder="İstanbul, Ankara, vb."
            />
          </div>
        </div>

        {/* Contact Phone & Email */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: '#4a5568', fontWeight: '500' }}>
              İletişim Telefonu
            </label>
            <input
              type="tel"
              value={formData.contactPhone}
              onChange={(e) => handleInputChange('contactPhone', e.target.value)}
              disabled={loading}
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: errors.contactPhone ? '2px solid #e53e3e' : '1px solid #e2e8f0', 
                borderRadius: '6px', 
                fontSize: '14px',
                outline: 'none'
              }}
              placeholder="+90 555 123 45 67"
            />
            {errors.contactPhone && (
              <span style={{ color: '#e53e3e', fontSize: '12px', display: 'block', marginTop: '3px' }}>
                {errors.contactPhone}
              </span>
            )}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: '#4a5568', fontWeight: '500' }}>
              İletişim Email
            </label>
            <input
              type="email"
              value={formData.contactEmail}
              onChange={(e) => handleInputChange('contactEmail', e.target.value)}
              disabled={loading}
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: errors.contactEmail ? '2px solid #e53e3e' : '1px solid #e2e8f0', 
                borderRadius: '6px', 
                fontSize: '14px',
                outline: 'none'
              }}
              placeholder="iletisim@sirketiniz.com"
            />
            {errors.contactEmail && (
              <span style={{ color: '#e53e3e', fontSize: '12px', display: 'block', marginTop: '3px' }}>
                {errors.contactEmail}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: '#4a5568', fontWeight: '500' }}>
            Şirket Açıklaması
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            disabled={loading}
            rows={3}
            style={{ 
              width: '100%', 
              padding: '10px', 
              border: '1px solid #e2e8f0', 
              borderRadius: '6px', 
              fontSize: '14px',
              resize: 'vertical',
              fontFamily: 'inherit',
              outline: 'none'
            }}
            placeholder="Şirketiniz hakkında kısa bir açıklama yazın..."
          />
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

export default CompanyRegisterForm;