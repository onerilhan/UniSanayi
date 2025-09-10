import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  InputAdornment,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Save, ArrowBack, Add, Delete, Edit as EditIcon } from '@mui/icons-material';

interface Project {
  id: string;
  title: string;
  description: string;
  projectType: string;
  durationDays: number;
  budgetAmount?: number;
  currency?: string;
  locationCity?: string;
  locationRequirement?: string;
  maxApplicants?: number;
  applicationDeadline?: string;
  projectStartDate?: string;
  status: string;
  viewCount: number;
  applicationsCount: number;
  createdAt: string;
  updatedAt: string;
}

interface SkillRequirement {
  skillId: number;
  skillName: string;
  skillCategory: string;
  requiredLevel: string;
  isMandatory: boolean;
  weightPercentage?: number;
}

interface Skill {
  id: number;
  name: string;
  category: string;
  isActive: boolean;
}

const ProjectEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [project, setProject] = useState<Project | null>(null);
  const [skills, setSkills] = useState<SkillRequirement[]>([]);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Skill Modal State
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [newSkill, setNewSkill] = useState({
    skillId: 0,
    requiredLevel: '',
    isMandatory: false,
    weightPercentage: 100
  });

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
    projectStartDate: '',
    status: 'Draft'
  });

  useEffect(() => {
    if (id) {
      fetchProject();
      fetchProjectSkills();
      fetchAvailableSkills();
    }
  }, [id]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('unisanayi_token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`http://localhost:5126/api/projects/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        const projectData = result.data;
        setProject(projectData);
        
        // Form data'yı doldur
        setFormData({
          title: projectData.title || '',
          description: projectData.description || '',
          projectType: projectData.projectType || '',
          durationDays: projectData.durationDays?.toString() || '',
          budgetAmount: projectData.budgetAmount?.toString() || '',
          currency: projectData.currency || 'TRY',
          locationCity: projectData.locationCity || '',
          locationRequirement: projectData.locationRequirement || 'Remote',
          maxApplicants: projectData.maxApplicants?.toString() || '30',
          applicationDeadline: projectData.applicationDeadline ? 
            new Date(projectData.applicationDeadline).toISOString().slice(0, 16) : '',
          projectStartDate: projectData.projectStartDate ? 
            new Date(projectData.projectStartDate).toISOString().slice(0, 16) : '',
          status: projectData.status || 'Draft'
        });
      } else if (response.status === 401) {
        navigate('/login');
      } else {
        setErrorMessage('Proje yüklenirken hata oluştu.');
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      setErrorMessage('Bağlantı hatası oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectSkills = async () => {
    try {
      const token = localStorage.getItem('unisanayi_token');
      if (!token) return;

      const response = await fetch(`http://localhost:5126/api/projects/${id}/skills`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setSkills(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching project skills:', error);
    }
  };

  const fetchAvailableSkills = async () => {
    try {
      const response = await fetch('http://localhost:5126/api/skills');
      if (response.ok) {
        const result = await response.json();
        setAvailableSkills(result.data.filter((skill: Skill) => skill.isActive));
      }
    } catch (error) {
      console.error('Error fetching available skills:', error);
    }
  };

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

      const updateData = {
        title: formData.title,
        description: formData.description,
        projectType: formData.projectType,
        durationDays: parseInt(formData.durationDays),
        budgetAmount: formData.budgetAmount ? parseFloat(formData.budgetAmount) : null,
        currency: formData.currency,
        locationCity: formData.locationCity || null,
        locationRequirement: formData.locationRequirement,
        maxApplicants: parseInt(formData.maxApplicants),
        applicationDeadline: formData.applicationDeadline ? 
          new Date(formData.applicationDeadline).toISOString() : null,
        projectStartDate: formData.projectStartDate ? 
          new Date(formData.projectStartDate).toISOString() : null,
        status: formData.status
      };

      const response = await fetch(`http://localhost:5126/api/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        setSuccessMessage('Proje başarıyla güncellendi!');
        setTimeout(() => {
          navigate('/company');
        }, 2000);
      } else if (response.status === 401) {
        navigate('/login');
      } else {
        const result = await response.json();
        setErrorMessage(result.message || 'Proje güncellenirken hata oluştu.');
      }
    } catch (error) {
      console.error('Error updating project:', error);
      setErrorMessage('Bağlantı hatası oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = async () => {
    try {
      if (!newSkill.skillId || !newSkill.requiredLevel) {
        setErrorMessage('Yetkinlik ve seviye seçimi zorunludur.');
        return;
      }

      const token = localStorage.getItem('unisanayi_token');
      if (!token) return;

      const response = await fetch(`http://localhost:5126/api/projects/${id}/skills`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          skillId: newSkill.skillId,
          requiredLevel: newSkill.requiredLevel,
          isMandatory: newSkill.isMandatory,
          weightPercentage: newSkill.weightPercentage
        })
      });

      if (response.ok) {
        setSuccessMessage('Yetkinlik başarıyla eklendi!');
        setShowSkillModal(false);
        setNewSkill({ skillId: 0, requiredLevel: '', isMandatory: false, weightPercentage: 100 });
        fetchProjectSkills();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const result = await response.json();
        setErrorMessage(result.message || 'Yetkinlik eklenirken hata oluştu.');
      }
    } catch (error) {
      console.error('Error adding skill:', error);
      setErrorMessage('Sunucu hatası oluştu.');
    }
  };

  const handleDeleteSkill = async (skillId: number) => {
    if (!confirm('Bu yetkinliği silmek istediğinizden emin misiniz?')) return;

    try {
      const token = localStorage.getItem('unisanayi_token');
      if (!token) return;

      const response = await fetch(`http://localhost:5126/api/projects/${id}/skills/${skillId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setSuccessMessage('Yetkinlik başarıyla silindi!');
        fetchProjectSkills();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const result = await response.json();
        setErrorMessage(result.message || 'Yetkinlik silinirken hata oluştu.');
      }
    } catch (error) {
      console.error('Error deleting skill:', error);
      setErrorMessage('Sunucu hatası oluştu.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return '#10b981';
      case 'Draft': return '#f59e0b';
      case 'Closed': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Active': return 'Aktif';
      case 'Draft': return 'Taslak';
      case 'Closed': return 'Kapalı';
      default: return status;
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case 'Beginner': return 'Başlangıç';
      case 'Intermediate': return 'Orta';
      case 'Advanced': return 'İleri';
      default: return level;
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <Box textAlign="center">
            <div style={{ 
              width: '50px', 
              height: '50px', 
              border: '4px solid #f3f4f6', 
              borderTop: '4px solid #667eea', 
              borderRadius: '50%', 
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }}></div>
            <Typography variant="h6" color="text.secondary">
              Proje yükleniyor...
            </Typography>
          </Box>
        </Box>
      </>
    );
  }

  if (!project) {
    return (
      <>
        <Header />
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '16px 16px 24px' }}>
          <Alert severity="error">Proje bulunamadı.</Alert>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', padding: '24px 0' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 16px' }}>
          
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
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
                  <EditIcon /> Proje Düzenle
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                  Proje bilgilerini güncelleyin ve durumunu değiştirin
                </Typography>
              </div>
              
              {/* Status Badge */}
              <Chip
                label={getStatusText(formData.status)}
                sx={{
                  backgroundColor: getStatusColor(formData.status),
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '14px',
                  padding: '8px 16px'
                }}
              />
            </div>
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

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
            
            {/* Sol Taraf - Proje Formu */}
            <Paper sx={{ p: 4, borderRadius: 3 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 3, 
                  color: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                📋 Proje Bilgileri
              </Typography>
              
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  
                  <TextField
                    fullWidth
                    label="Proje Başlığı *"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    disabled={saving}
                  />

                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Proje Açıklaması *"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    disabled={saving}
                  />

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
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
                    />

                    <FormControl fullWidth required disabled={saving}>
                      <InputLabel>Proje Durumu</InputLabel>
                      <Select
                        value={formData.status}
                        label="Proje Durumu"
                        onChange={(e) => handleSelectChange('status', e.target.value)}
                      >
                        <MenuItem value="Draft">📝 Taslak</MenuItem>
                        <MenuItem value="Active">✅ Aktif</MenuItem>
                        <MenuItem value="Closed">❌ Kapalı</MenuItem>
                      </Select>
                    </FormControl>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                    <TextField
                      fullWidth
                      label="Bütçe"
                      name="budgetAmount"
                      type="number"
                      value={formData.budgetAmount}
                      onChange={handleInputChange}
                      disabled={saving}
                      InputProps={{
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

                    <TextField
                      fullWidth
                      label="Max. Başvuru"
                      name="maxApplicants"
                      type="number"
                      value={formData.maxApplicants}
                      onChange={handleInputChange}
                      disabled={saving}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                    <TextField
                      fullWidth
                      label="Şehir"
                      name="locationCity"
                      value={formData.locationCity}
                      onChange={handleInputChange}
                      disabled={saving}
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

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <TextField
                      fullWidth
                      label="Başvuru Son Tarihi"
                      name="applicationDeadline"
                      type="datetime-local"
                      value={formData.applicationDeadline}
                      onChange={handleInputChange}
                      disabled={saving}
                      InputLabelProps={{ shrink: true }}
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
                    />
                  </div>

                  <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
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
                      {saving ? 'Kaydediliyor...' : '💾 Kaydet'}
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => navigate('/company')}
                      disabled={saving}
                    >
                      İptal
                    </Button>
                  </Box>
                </div>
              </form>
            </Paper>

            {/* Sağ Taraf - Skills Management */}
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  🎯 Gerekli Yetkinlikler
                </Typography>
                <Button
                  startIcon={<Add />}
                  onClick={() => setShowSkillModal(true)}
                  size="small"
                  variant="contained"
                  sx={{ backgroundColor: '#10b981' }}
                >
                  Ekle
                </Button>
              </div>

              {skills.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    Henüz yetkinlik eklenmemiş
                  </Typography>
                  <Button
                    startIcon={<Add />}
                    onClick={() => setShowSkillModal(true)}
                    variant="outlined"
                    size="small"
                  >
                    İlk Yetkinliği Ekle
                  </Button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {skills.map((skill) => (
                    <div
                      key={skill.skillId}
                      style={{
                        padding: '12px',
                        border: skill.isMandatory ? '2px solid #ef4444' : '1px solid #e5e7eb',
                        borderRadius: '8px',
                        backgroundColor: skill.isMandatory ? '#fef2f2' : '#f9fafb'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                            {skill.skillName}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                            {skill.skillCategory}
                          </div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <Chip
                              label={getLevelText(skill.requiredLevel)}
                              size="small"
                              sx={{ backgroundColor: '#667eea', color: 'white', fontSize: '11px' }}
                            />
                            {skill.isMandatory && (
                              <Chip
                                label="ZORUNLU"
                                size="small"
                                sx={{ backgroundColor: '#dc2626', color: 'white', fontSize: '10px' }}
                              />
                            )}
                          </div>
                        </div>
                        <IconButton
                          onClick={() => handleDeleteSkill(skill.skillId)}
                          size="small"
                          sx={{ color: '#dc2626' }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Proje İstatistikleri */}
              <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <Typography variant="body2" sx={{ fontWeight: '600', mb: 1 }}>
                  📊 Proje İstatistikleri
                </Typography>
                <div style={{ display: 'grid', gap: '8px', fontSize: '14px', color: '#64748b' }}>
                  <div>👁️ {project.viewCount} görüntülenme</div>
                  <div>📝 {project.applicationsCount} başvuru</div>
                  <div>📅 Oluşturulma: {new Date(project.createdAt).toLocaleDateString('tr-TR')}</div>
                  <div>🔄 Güncelleme: {new Date(project.updatedAt).toLocaleDateString('tr-TR')}</div>
                </div>
              </div>
            </Paper>
          </div>
        </div>
      </div>

      {/* Add Skill Modal */}
      <Dialog 
        open={showSkillModal} 
        onClose={() => setShowSkillModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" component="div">
            🎯 Yetkinlik Ekle
          </Typography>
        </DialogTitle>
        <DialogContent>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            <FormControl fullWidth>
              <InputLabel>Yetkinlik Seç</InputLabel>
              <Select
                value={newSkill.skillId}
                onChange={(e) => setNewSkill(prev => ({ ...prev, skillId: Number(e.target.value) }))}
                label="Yetkinlik Seç"
              >
                <MenuItem value={0}>Seçiniz</MenuItem>
                {availableSkills
                  .filter(skill => !skills.some(s => s.skillId === skill.id))
                  .map(skill => (
                    <MenuItem key={skill.id} value={skill.id}>
                      {skill.name} ({skill.category})
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Seviye</InputLabel>
              <Select
                value={newSkill.requiredLevel}
                onChange={(e) => setNewSkill(prev => ({ ...prev, requiredLevel: e.target.value }))}
                label="Seviye"
              >
                <MenuItem value="">Seçiniz</MenuItem>
                <MenuItem value="Beginner">Başlangıç</MenuItem>
                <MenuItem value="Intermediate">Orta</MenuItem>
                <MenuItem value="Advanced">İleri</MenuItem>
              </Select>
            </FormControl>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={newSkill.isMandatory}
                onChange={(e) => setNewSkill(prev => ({ ...prev, isMandatory: e.target.checked }))}
              />
              <label style={{ fontSize: '14px' }}>Zorunlu yetkinlik</label>
            </div>

            <TextField
              fullWidth
              label="Ağırlık (%)"
              type="number"
              value={newSkill.weightPercentage}
              onChange={(e) => setNewSkill(prev => ({ ...prev, weightPercentage: Number(e.target.value) }))}
              inputProps={{ min: 1, max: 100 }}
              helperText="Bu yetkinliğin değerlendirmedeki ağırlığı"
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setShowSkillModal(false)}
            color="inherit"
          >
            İptal
          </Button>
          <Button 
            onClick={handleAddSkill}
            variant="contained"
            style={{ backgroundColor: '#10b981' }}
          >
            Ekle
          </Button>
        </DialogActions>
      </Dialog>

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

export default ProjectEdit;