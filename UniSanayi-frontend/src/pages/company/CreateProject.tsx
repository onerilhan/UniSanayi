import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import {
  TextField,
  Button,
  Paper,
  Typography,
  Box,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment
} from '@mui/material';
import { Save, ArrowBack } from '@mui/icons-material';

const CreateProject: React.FC = () => {
  const navigate = useNavigate();
  
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectType: '',
    durationDays: '',
    budgetAmount: '',
    currency: 'TRY',
    locationCity: '',
    locationRequirement: 'Remote',
    maxApplicants: '30',
    applicationDeadline: '',
    projectStartDate: ''
  });

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

      const projectData = {
        title: formData.title,
        description: formData.description,
        projectType: formData.projectType,
        durationDays: parseInt(formData.durationDays),
        budgetAmount: formData.budgetAmount ? parseFloat(formData.budgetAmount) : null,
        currency: formData.currency,
        locationCity: formData.locationCity || null,
        locationRequirement: formData.locationRequirement,
        maxApplicants: parseInt(formData.maxApplicants),
        applicationDeadline: formData.applicationDeadline ? new Date(formData.applicationDeadline).toISOString() : null,
        projectStartDate: formData.projectStartDate ? new Date(formData.projectStartDate).toISOString() : null
      };

      const response = await fetch('http://localhost:5126/api/projects', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(projectData)
      });

      if (response.ok) {
        setSuccessMessage('Proje başarıyla oluşturuldu!');
        setTimeout(() => {
          navigate('/company');
        }, 2000);
      } else if (response.status === 401) {
        navigate('/login');
      } else {
        const result = await response.json();
        setErrorMessage(result.message || 'Proje oluşturulurken hata oluştu.');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      setErrorMessage('Bağlantı hatası oluştu.');
    } finally {
      setSaving(false);
    }
  };

  // Örnek proje başlıkları
  const exampleTitles = [
    "React.js Frontend Geliştirici Aranıyor",
    "Node.js Backend API Geliştirme Projesi",
    "Mobile App UI/UX Tasarım Stajı",
    "Python Veri Analizi ve Makine Öğrenmesi",
    "Full Stack E-ticaret Platformu Geliştirilmesi",
    "DevOps ve Cloud Infrastructure Projesi",
    "Blockchain ve Kripto Para Uygulaması",
    "AI Chatbot Geliştirme Projesi"
  ];

  // Örnek açıklamalar
  const exampleDescriptions = [
    "UniSanayi projesi kapsamında öğrenciler ve şirketler arasında köprü kuran platform geliştirilecektir. Modern web teknolojileri kullanılarak responsive ve kullanıcı dostu bir arayüz tasarlanacak.",
    "E-ticaret platformu için RESTful API geliştirme projesi. Mikroservis mimarisi kullanılarak ölçeklenebilir backend sistemi oluşturulacak. Docker, Kubernetes ve AWS teknolojileri kullanılacak.",
    "Fintech startup'ı için mobil bankacılık uygulaması geliştirilecek. React Native kullanılarak iOS ve Android platformları için cross-platform uygulama oluşturulacak.",
    "Büyük veri analizi projesi kapsamında machine learning algoritmaları geliştirilecek. Python, Pandas, TensorFlow kullanılarak predictive analytics sistemi kurulacak."
  ];

  const getRandomExample = (examples: string[]) => {
    return examples[Math.floor(Math.random() * examples.length)];
  };

  return (
    <>
      <Header />
      <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', padding: '24px 0' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 16px' }}>
          
          {/* Header */}
          <div style={{ marginBottom: '24px' }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/company')}
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
              component="h1" 
              sx={{ 
                fontWeight: 600,
                color: '#1f2937',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              ➕ Yeni Proje Oluştur
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Yeni proje oluşturun ve yetenekli öğrencilerle buluşun
            </Typography>
          </div>

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
          <Paper sx={{ p: 4, borderRadius: 3 }}>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Temel Bilgiler */}
                <div>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: 2, 
                      color: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    📋 Proje Bilgileri
                  </Typography>
                </div>

                <TextField
                  fullWidth
                  label="Proje Başlığı *"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  disabled={saving}
                  placeholder={getRandomExample(exampleTitles)}
                  helperText="Projenizi en iyi tanımlayan açıklayıcı bir başlık yazın"
                />

                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  label="Proje Açıklaması *"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  disabled={saving}
                  placeholder={getRandomExample(exampleDescriptions)}
                  helperText="Projenin detaylarını, kullanılacak teknolojileri ve beklentilerinizi açıklayın"
                />

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                  <FormControl fullWidth required disabled={saving}>
                    <InputLabel>Proje Türü</InputLabel>
                    <Select
                      value={formData.projectType}
                      label="Proje Türü"
                      onChange={(e) => handleSelectChange('projectType', e.target.value)}
                    >
                      <MenuItem value="Internship">🎓 Staj</MenuItem>
                      <MenuItem value="PartTime">⏰ Yarı Zamanlı</MenuItem>
                      <MenuItem value="FullTime">💼 Tam Zamanlı</MenuItem>
                      <MenuItem value="Freelance">🆓 Serbest Çalışma</MenuItem>
                      <MenuItem value="Research">🔬 Araştırma Projesi</MenuItem>
                      <MenuItem value="Thesis">📚 Tez Projesi</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    label="Proje Süresi (Gün) *"
                    name="durationDays"
                    type="number"
                    value={formData.durationDays}
                    onChange={handleInputChange}
                    required
                    disabled={saving}
                    InputProps={{ inputProps: { min: 1, max: 730 } }}
                    placeholder="30"
                    helperText="1-730 gün arası"
                  />
                </div>

                {/* Bütçe ve Lokasyon */}
                <div>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: 2, 
                      mt: 2, 
                      color: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    💰 Bütçe ve Lokasyon
                  </Typography>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                  <TextField
                    fullWidth
                    label="Bütçe (Opsiyonel)"
                    name="budgetAmount"
                    type="number"
                    value={formData.budgetAmount}
                    onChange={handleInputChange}
                    disabled={saving}
                    placeholder="5000"
                    helperText="Proje için ayırdığınız toplam bütçe"
                    InputProps={{
                      inputProps: { min: 0 },
                      endAdornment: (
                        <InputAdornment position="end">
                          <FormControl variant="standard" sx={{ minWidth: 60 }}>
                            <Select
                              value={formData.currency}
                              onChange={(e) => handleSelectChange('currency', e.target.value)}
                              disabled={saving}
                            >
                              <MenuItem value="TRY">₺ TL</MenuItem>
                              <MenuItem value="USD">$ USD</MenuItem>
                              <MenuItem value="EUR">€ EUR</MenuItem>
                            </Select>
                          </FormControl>
                        </InputAdornment>
                      )
                    }}
                  />

                  <FormControl fullWidth disabled={saving}>
                    <InputLabel>Çalışma Şekli</InputLabel>
                    <Select
                      value={formData.locationRequirement}
                      label="Çalışma Şekli"
                      onChange={(e) => handleSelectChange('locationRequirement', e.target.value)}
                    >
                      <MenuItem value="Remote">🏠 Uzaktan</MenuItem>
                      <MenuItem value="On-site">🏢 Ofiste</MenuItem>
                      <MenuItem value="Hybrid">🔄 Hibrit</MenuItem>
                    </Select>
                  </FormControl>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                  <TextField
                    fullWidth
                    label="Şehir (Opsiyonel)"
                    name="locationCity"
                    value={formData.locationCity}
                    onChange={handleInputChange}
                    disabled={saving}
                    placeholder="İstanbul"
                    helperText="Ofiste çalışma gerekiyorsa şehri belirtin"
                  />

                  <TextField
                    fullWidth
                    label="Maksimum Başvuru Sayısı"
                    name="maxApplicants"
                    type="number"
                    value={formData.maxApplicants}
                    onChange={handleInputChange}
                    disabled={saving}
                    InputProps={{ inputProps: { min: 1, max: 1000 } }}
                    placeholder="30"
                    helperText="Kabul edeceğiniz maksimum başvuru sayısı"
                  />
                </div>

                {/* Tarihler */}
                <div>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: 2, 
                      mt: 2, 
                      color: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    📅 Tarihler
                  </Typography>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                  <TextField
                    fullWidth
                    label="Başvuru Son Tarihi"
                    name="applicationDeadline"
                    type="datetime-local"
                    value={formData.applicationDeadline}
                    onChange={handleInputChange}
                    disabled={saving}
                    InputLabelProps={{ shrink: true }}
                    helperText="Başvuruların kapanacağı tarih"
                  />

                  <TextField
                    fullWidth
                    label="Proje Başlangıç Tarihi"
                    name="projectStartDate"
                    type="datetime-local"
                    value={formData.projectStartDate}
                    onChange={handleInputChange}
                    disabled={saving}
                    InputLabelProps={{ shrink: true }}
                    helperText="Projenin başlayacağı tarih"
                  />
                </div>

                {/* Info Box */}
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>💡 Bilgi:</strong> Proje oluşturulduktan sonra "Taslak" durumunda olacaktır. 
                    Yayınlamak için projeyi düzenleyip durumunu "Aktif" yapmanız gerekir.
                  </Typography>
                </Alert>

                {/* Submit Buttons */}
                <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    startIcon={<Save />}
                    disabled={saving}
                    sx={{ 
                      minWidth: 150,
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                      }
                    }}
                  >
                    {saving ? 'Oluşturuluyor...' : '🚀 Proje Oluştur'}
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/company')}
                    disabled={saving}
                    sx={{
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
                </Box>

                {/* Tips Box */}
                <Alert severity="success" sx={{ mt: 2, bgcolor: '#f0fdf4', border: '1px solid #dcfce7' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                    🎯 Başarılı Proje İlanı İçin İpuçları:
                  </Typography>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: '#166534' }}>
                    <li>Açık ve net bir proje başlığı kullanın</li>
                    <li>Gerekli teknolojileri ve yetenekleri belirtin</li>
                    <li>Proje hedeflerini ve beklentilerinizi açıklayın</li>
                    <li>Öğrenci için sağlayacağınız destek ve mentorluktan bahsedin</li>
                    <li>Gerçekçi bir süre ve bütçe belirleyin</li>
                  </ul>
                </Alert>

              </div>
            </form>
          </Paper>
        </div>
      </div>
    </>
  );
};

export default CreateProject