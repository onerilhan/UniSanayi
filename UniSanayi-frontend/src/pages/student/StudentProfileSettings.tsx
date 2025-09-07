import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/Header';

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

  // Profile verilerini yükle
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

    // Required fields
    if (!formData.firstName.trim()) newErrors.firstName = 'Ad zorunludur';
    if (!formData.lastName.trim()) newErrors.lastName = 'Soyad zorunludur';
    if (!formData.universityName.trim()) newErrors.universityName = 'Üniversite zorunludur';
    if (!formData.department.trim()) newErrors.department = 'Bölüm zorunludur';

    // Phone validation
    if (formData.phone && !/^(\+90|0)?[1-9]\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Geçerli bir telefon numarası giriniz';
    }

    // GPA validation
    if (formData.gpa && (formData.gpa < 0 || formData.gpa > 4)) {
      newErrors.gpa = 'GPA 0-4 arasında olmalıdır';
    }

    // Year validations
    if (formData.currentYear && (formData.currentYear < 1 || formData.currentYear > 6)) {
      newErrors.currentYear = 'Sınıf 1-6 arasında olmalıdır';
    }

    const currentYear = new Date().getFullYear();
    if (formData.graduationYear && formData.graduationYear < currentYear) {
      newErrors.graduationYear = 'Mezuniyet yılı geçmiş olamaz';
    }

    // URL validations
    if (formData.linkedinUrl && !formData.linkedinUrl.includes('linkedin.com')) {
      newErrors.linkedinUrl = 'Geçerli bir LinkedIn URL\'i giriniz';
    }
    if (formData.githubUrl && !formData.githubUrl.includes('github.com')) {
      newErrors.githubUrl = 'Geçerli bir GitHub URL\'i giriniz';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof ProfileForm, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async () => {
    setSuccessMessage('');

    if (!validateForm()) return;

    setSaving(true);
    try {
      const token = localStorage.getItem('unisanayi_token');
      if (!token) return;

      // Prepare data for backend
      const updateData = {
        ...formData,
        currentYear: formData.currentYear || null,
        graduationYear: formData.graduationYear || null,
        gpa: formData.gpa || null,
        phone: formData.phone || null,
        locationCity: formData.locationCity || null,
        bio: formData.bio || null,
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
        setSuccessMessage('Profil başarıyla güncellendi! 🎉');
        
        // Update AuthContext if needed
        const updatedStudent = {
        ...student,
        id: student?.id || '',
        firstName: formData.firstName,
        lastName: formData.lastName,
        university: formData.universityName,
        department: formData.department,
        isAvailable: formData.isAvailable
        };
        updateProfile(updatedStudent);

        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrors({ general: result.message || 'Güncelleme başarısız oldu' });
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setErrors({ general: 'Sunucu hatası oluştu' });
    } finally {
      setSaving(false);
    }
  };

  const calculateProfileCompletion = (): number => {
    const fields = [
      formData.firstName, formData.lastName, formData.universityName, formData.department,
      formData.phone, formData.locationCity, formData.graduationYear, formData.currentYear
    ];
    const completed = fields.filter(field => field && field.toString().trim()).length;
    return Math.round((completed / fields.length) * 100);
  };

  if (loading) {
    return (
      <>
        <Header />
        <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '50px', 
              height: '50px', 
              border: '4px solid #f3f4f6', 
              borderTop: '4px solid #667eea', 
              borderRadius: '50%', 
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }}></div>
            <div>Profil yükleniyor...</div>
          </div>
        </div>
      </>
    );
  }

  const profileCompletion = calculateProfileCompletion();

  return (
    <>
      <Header />
      <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', padding: '20px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          
          {/* Header Card */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '30px', 
            borderRadius: '16px', 
            marginBottom: '24px', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 style={{ margin: '0 0 8px 0', color: '#1f2937', fontSize: '28px' }}>
                  👤 Profil Ayarları
                </h1>
                <p style={{ margin: 0, color: '#64748b' }}>
                  Kişisel bilgilerinizi güncelleyin ve profilinizi tamamlayın
                </p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  borderRadius: '50%', 
                  background: `conic-gradient(#667eea 0% ${profileCompletion}%, #e5e7eb ${profileCompletion}% 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '8px'
                }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    color: '#667eea'
                  }}>
                    {profileCompletion}%
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Tamamlanma</div>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div style={{ 
              backgroundColor: '#d4edda', 
              color: '#155724', 
              padding: '16px', 
              borderRadius: '8px', 
              marginBottom: '24px',
              border: '1px solid #c3e6cb',
              textAlign: 'center',
              fontWeight: '500'
            }}>
              {successMessage}
            </div>
          )}

          {/* General Error */}
          {errors.general && (
            <div style={{ 
              backgroundColor: '#f8d7da', 
              color: '#721c24', 
              padding: '16px', 
              borderRadius: '8px', 
              marginBottom: '24px',
              border: '1px solid #f5c6cb'
            }}>
              {errors.general}
            </div>
          )}

          <div>
            
            {/* Availability Toggle - Top Priority */}
            <div style={{ 
              backgroundColor: 'white', 
              padding: '24px', 
              borderRadius: '12px', 
              marginBottom: '16px',
              border: '2px solid #667eea'
            }}>
              <h3 style={{ margin: '0 0 16px 0', color: '#1f2937', fontSize: '18px' }}>
                🚦 Müsaitlik Durumu
              </h3>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                cursor: 'pointer',
                padding: '16px',
                borderRadius: '8px',
                backgroundColor: '#f8fafc'
              }}>
                <input
                  type="checkbox"
                  checked={formData.isAvailable}
                  onChange={(e) => handleInputChange('isAvailable', e.target.checked)}
                  style={{ transform: 'scale(1.2)' }}
                />
                <div>
                  <div style={{ fontWeight: '600', color: formData.isAvailable ? '#059669' : '#dc2626' }}>
                    {formData.isAvailable ? '✅ Müsaitim - Yeni fırsatlara açığım' : '❌ Müsait Değilim - Şu anda iş aramıyorum'}
                  </div>
                  <div style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
                    Bu ayar şirketlere profilinizin aktif olup olmadığını gösterir
                  </div>
                </div>
              </label>
            </div>

            {/* Personal Information */}
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', marginBottom: '16px' }}>
              <h3 style={{ margin: '0 0 20px 0', color: '#1f2937', fontSize: '18px' }}>
                👨‍🎓 Kişisel Bilgiler
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', color: '#374151', fontWeight: '500' }}>
                    Ad *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: errors.firstName ? '2px solid #e53e3e' : '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    placeholder="Adınızı girin"
                  />
                  {errors.firstName && <span style={{ color: '#e53e3e', fontSize: '12px' }}>{errors.firstName}</span>}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', color: '#374151', fontWeight: '500' }}>
                    Soyad *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: errors.lastName ? '2px solid #e53e3e' : '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    placeholder="Soyadınızı girin"
                  />
                  {errors.lastName && <span style={{ color: '#e53e3e', fontSize: '12px' }}>{errors.lastName}</span>}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', color: '#374151', fontWeight: '500' }}>
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: errors.phone ? '2px solid #e53e3e' : '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    placeholder="+90 555 123 45 67"
                  />
                  {errors.phone && <span style={{ color: '#e53e3e', fontSize: '12px' }}>{errors.phone}</span>}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', color: '#374151', fontWeight: '500' }}>
                    Şehir
                  </label>
                  <input
                    type="text"
                    value={formData.locationCity}
                    onChange={(e) => handleInputChange('locationCity', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    placeholder="İstanbul, Ankara, vb."
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', color: '#374151', fontWeight: '500' }}>
                  Öğrenci Numarası
                </label>
                <input
                  type="text"
                  value={formData.studentNumber}
                  onChange={(e) => handleInputChange('studentNumber', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                  placeholder="123456789"
                />
              </div>
            </div>

            {/* Education Information */}
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', marginBottom: '16px' }}>
              <h3 style={{ margin: '0 0 20px 0', color: '#1f2937', fontSize: '18px' }}>
                🎓 Eğitim Bilgileri
              </h3>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', color: '#374151', fontWeight: '500' }}>
                  Üniversite *
                </label>
                <input
                  type="text"
                  value={formData.universityName}
                  onChange={(e) => handleInputChange('universityName', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: errors.universityName ? '2px solid #e53e3e' : '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                  placeholder="İstanbul Teknik Üniversitesi"
                />
                {errors.universityName && <span style={{ color: '#e53e3e', fontSize: '12px' }}>{errors.universityName}</span>}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', color: '#374151', fontWeight: '500' }}>
                  Bölüm *
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: errors.department ? '2px solid #e53e3e' : '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                  placeholder="Bilgisayar Mühendisliği"
                />
                {errors.department && <span style={{ color: '#e53e3e', fontSize: '12px' }}>{errors.department}</span>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', color: '#374151', fontWeight: '500' }}>
                    Sınıf
                  </label>
                  <select
                    value={formData.currentYear}
                    onChange={(e) => handleInputChange('currentYear', parseInt(e.target.value) || '')}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: errors.currentYear ? '2px solid #e53e3e' : '1px solid #d1d5db',
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
                  {errors.currentYear && <span style={{ color: '#e53e3e', fontSize: '12px' }}>{errors.currentYear}</span>}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', color: '#374151', fontWeight: '500' }}>
                    Mezuniyet Yılı
                  </label>
                  <input
                    type="number"
                    value={formData.graduationYear}
                    onChange={(e) => handleInputChange('graduationYear', parseInt(e.target.value) || '')}
                    min={new Date().getFullYear()}
                    max={new Date().getFullYear() + 10}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: errors.graduationYear ? '2px solid #e53e3e' : '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    placeholder="2025"
                  />
                  {errors.graduationYear && <span style={{ color: '#e53e3e', fontSize: '12px' }}>{errors.graduationYear}</span>}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', color: '#374151', fontWeight: '500' }}>
                    GPA (4.0 üzerinden)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="4"
                    value={formData.gpa}
                    onChange={(e) => handleInputChange('gpa', parseFloat(e.target.value) || '')}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: errors.gpa ? '2px solid #e53e3e' : '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    placeholder="3.25"
                  />
                  {errors.gpa && <span style={{ color: '#e53e3e', fontSize: '12px' }}>{errors.gpa}</span>}
                </div>
              </div>
            </div>

            {/* Social Links & Bio */}
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', marginBottom: '24px' }}>
              <h3 style={{ margin: '0 0 20px 0', color: '#1f2937', fontSize: '18px' }}>
                🔗 Sosyal Medya & Bio
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', color: '#374151', fontWeight: '500' }}>
                    LinkedIn Profili
                  </label>
                  <input
                    type="url"
                    value={formData.linkedinUrl}
                    onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: errors.linkedinUrl ? '2px solid #e53e3e' : '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    placeholder="https://www.linkedin.com/in/kullaniciadi"
                  />
                  {errors.linkedinUrl && <span style={{ color: '#e53e3e', fontSize: '12px' }}>{errors.linkedinUrl}</span>}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', color: '#374151', fontWeight: '500' }}>
                    GitHub Profili
                  </label>
                  <input
                    type="url"
                    value={formData.githubUrl}
                    onChange={(e) => handleInputChange('githubUrl', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: errors.githubUrl ? '2px solid #e53e3e' : '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    placeholder="https://github.com/kullaniciadi"
                  />
                  {errors.githubUrl && <span style={{ color: '#e53e3e', fontSize: '12px' }}>{errors.githubUrl}</span>}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', color: '#374151', fontWeight: '500' }}>
                  Hakkımda
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    outline: 'none'
                  }}
                  placeholder="Kendiniz hakkında kısa bir açıklama yazın..."
                  maxLength={500}
                />
                <div style={{ textAlign: 'right', fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                  {formData.bio.length}/500 karakter
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => window.history.back()}
                style={{
                  padding: '14px 24px',
                  backgroundColor: 'white',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '16px'
                }}
              >
                İptal
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                style={{
                  padding: '14px 32px',
                  backgroundColor: saving ? '#9ca3af' : '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {saving ? (
                  <>
                    <div style={{ 
                      width: '16px', 
                      height: '16px', 
                      border: '2px solid #ffffff30', 
                      borderTop: '2px solid #ffffff', 
                      borderRadius: '50%', 
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    💾 Değişiklikleri Kaydet
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Animation CSS */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default StudentProfileSettings;