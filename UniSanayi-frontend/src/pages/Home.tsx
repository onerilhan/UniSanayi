import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import ProjectCard from '../components/ProjectCard';
import { Project } from '../types/Project';
import { projectService } from '../services/apiService';

const Home: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await projectService.getActiveProjects();
        
        if (response.success) {
          const projectsData = response.data.projects || response.data;
          
          // Backend'den status field'ı gelmediği için tüm projeleri göster
          setProjects(projectsData);
          setFilteredProjects(projectsData);
        } else {
          setError(response.message || 'Projeler yüklenemedi');
        }
      } catch (error: any) {
        setError('API bağlantı hatası: ' + error.message);
        console.error('API Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setFilteredProjects(projects);
      return;
    }

    const filtered = projects.filter(project => 
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.companyName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setFilteredProjects(filtered);
  };

  if (loading) {
    return (
      <>
        <Header onSearch={handleSearch} />
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div style={{ 
            width: '50px', 
            height: '50px', 
            border: '4px solid #f3f4f6', 
            borderTop: '4px solid #667eea', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ color: '#667eea', fontSize: '18px', fontWeight: '500' }}>
            Projeler yükleniyor...
          </p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header onSearch={handleSearch} />
        <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
          <div style={{ fontSize: '60px', marginBottom: '20px' }}>⚠️</div>
          <h3 style={{ color: '#e53e3e', marginBottom: '15px' }}>Projeler Yüklenemedi</h3>
          <p style={{ color: '#6b7280', marginBottom: '20px' }}>Hata: {error}</p>
          <p style={{ color: '#6b7280' }}>Backend API'nin çalıştığından emin olun: http://localhost:5126</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '12px 24px',
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            🔄 Tekrar Dene
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Header onSearch={handleSearch} />
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
        {/* Sol sidebar - Filtreler */}
        <aside style={{ width: '300px', padding: '20px', backgroundColor: '#fff', borderRight: '1px solid #e5e7eb' }}>
          <h3 style={{ color: '#1f2937', marginBottom: '20px' }}>🔍 Filtreler</h3>
          
          {/* İl Filtresi */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ color: '#374151', marginBottom: '12px', fontSize: '16px' }}>📍 İl</h4>
            <select 
              style={{ 
                width: '100%', 
                padding: '8px 12px', 
                borderRadius: '6px', 
                border: '1px solid #d1d5db',
                backgroundColor: 'white',
                fontSize: '14px'
              }}
              onChange={(e) => {
                const city = e.target.value;
                if (city === '') {
                  setFilteredProjects(projects);
                } else {
                  const filtered = projects.filter(project => 
                    project.locationCity?.toLowerCase().includes(city.toLowerCase())
                  );
                  setFilteredProjects(filtered);
                }
              }}
            >
              <option value="">Tüm İller</option>
              <option value="İstanbul">İstanbul</option>
              <option value="Ankara">Ankara</option>
              <option value="İzmir">İzmir</option>
              <option value="Bursa">Bursa</option>
              <option value="Antalya">Antalya</option>
            </select>
          </div>
          
          {/* Proje Türü Filtresi */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ color: '#374151', marginBottom: '12px', fontSize: '16px' }}>📋 Proje Türü</h4>
            <select 
              style={{ 
                width: '100%', 
                padding: '8px 12px', 
                borderRadius: '6px', 
                border: '1px solid #d1d5db',
                backgroundColor: 'white',
                fontSize: '14px'
              }}
              onChange={(e) => {
                const type = e.target.value;
                if (type === '') {
                  setFilteredProjects(projects);
                } else {
                  const filtered = projects.filter(project => project.projectType === type);
                  setFilteredProjects(filtered);
                }
              }}
            >
              <option value="">Tüm Türler</option>
              <option value="Internship">🎓 Staj</option>
              <option value="PartTime">⏰ Yarı Zamanlı</option>
              <option value="FullTime">💼 Tam Zamanlı</option>
              <option value="Freelance">🆓 Serbest Çalışma</option>
              <option value="Research">🔬 Araştırma</option>
              <option value="Thesis">📚 Tez</option>
            </select>
          </div>

          {/* Yetenek Arama */}
          <div>
            <h4 style={{ color: '#374151', marginBottom: '12px', fontSize: '16px' }}>🎯 Yetenek Ara</h4>
            <input 
              type="text" 
              placeholder="React, Python, Java..." 
              style={{ 
                width: '100%', 
                padding: '8px 12px', 
                borderRadius: '6px', 
                border: '1px solid #d1d5db',
                fontSize: '14px',
                outline: 'none'
              }}
              onChange={(e) => {
                const skill = e.target.value.toLowerCase();
                if (skill === '') {
                  setFilteredProjects(projects);
                } else {
                  const filtered = projects.filter(project => 
                    project.title.toLowerCase().includes(skill) ||
                    project.description.toLowerCase().includes(skill)
                  );
                  setFilteredProjects(filtered);
                }
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
            <p style={{ 
              fontSize: '12px', 
              color: '#6b7280', 
              marginTop: '8px',
              lineHeight: '1.4'
            }}>
              Proje başlığı ve açıklamasında arama yapar
            </p>
          </div>
        </aside>

        {/* Ana içerik */}
        <main style={{ flex: 1, padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ color: '#1f2937', margin: '0 0 8px 0' }}>
                Projeler
              </h2>
              <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
                Başvuru için hazır projeler
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ 
                color: '#667eea', 
                fontWeight: '600',
                fontSize: '18px'
              }}>
                {filteredProjects.length} proje
              </span>
            </div>
          </div>

          {/* Projeler Listesi */}
          <div>
            {filteredProjects.length > 0 ? (
              filteredProjects.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '60px 40px', 
                color: '#6b7280',
                backgroundColor: 'white',
                borderRadius: '16px',
                border: '2px dashed #e5e7eb'
              }}>
                <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔍</div>
                <h3 style={{ color: '#374151', marginBottom: '12px' }}>
                  Filtrelere uygun proje bulunamadı
                </h3>
                <p style={{ marginBottom: '24px', lineHeight: '1.6' }}>
                  Filtreleri değiştirerek daha fazla proje keşfedebilirsiniz.
                </p>
                <button 
                  onClick={() => {
                    setFilteredProjects(projects);
                    const selects = document.querySelectorAll('select');
                    const inputs = document.querySelectorAll('input[type="text"]');
                    selects.forEach(select => (select as HTMLSelectElement).value = '');
                    inputs.forEach(input => (input as HTMLInputElement).value = '');
                  }}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#5a67d8'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#667eea'}
                >
                  🔄 Tüm Filtreleri Temizle
                </button>
              </div>
            )}
          </div>

          {/* Boş durumda gösterilecek mesaj - hiç proje yoksa */}
          {projects.length === 0 && !loading && (
            <div style={{ 
              textAlign: 'center', 
              padding: '80px 40px', 
              color: '#6b7280',
              backgroundColor: 'white',
              borderRadius: '16px',
              border: '2px dashed #e5e7eb'
            }}>
              <div style={{ fontSize: '72px', marginBottom: '24px' }}>📋</div>
              <h2 style={{ color: '#374151', marginBottom: '16px' }}>
                Henüz proje bulunmuyor
              </h2>
              <p style={{ marginBottom: '32px', lineHeight: '1.6', maxWidth: '500px', margin: '0 auto 32px' }}>
                Şu anda proje yok. Yeni projeler eklendikçe burada görünecek.
              </p>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: '16px',
                flexWrap: 'wrap'
              }}>
                <button 
                  onClick={() => window.location.reload()}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  🔄 Yenile
                </button>
                <button 
                  onClick={() => window.open('/register', '_blank')}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  🏢 Şirket Olarak Kayıt Ol
                </button>
              </div>
            </div>
          )}
        </main>
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

export default Home;