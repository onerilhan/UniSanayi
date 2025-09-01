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
          <p>Projeler yükleniyor...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header onSearch={handleSearch} />
        <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
          <p>Hata: {error}</p>
          <p>Backend API'nin çalıştığından emin olun: http://localhost:5126</p>
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
          <h3>Filtreler</h3>
          <div style={{ marginBottom: '20px' }}>
            <h4>İl</h4>
            <select style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }}>
              <option>Tüm İller</option>
              <option>İstanbul</option>
              <option>Ankara</option>
              <option>İzmir</option>
            </select>
          </div>
          
          <div>
            <h4>Yetenekler</h4>
            <input 
              type="text" 
              placeholder="Yetenek ara..." 
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }}
            />
          </div>
        </aside>

        {/* Ana içerik */}
        <main style={{ flex: 1, padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Aktif Projeler</h2>
            <span style={{ color: '#6b7280' }}>{filteredProjects.length} proje bulundu</span>
          </div>

          <div>
            {filteredProjects.length > 0 ? (
              filteredProjects.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                <p>Aradığınız kriterlere uygun proje bulunamadı.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default Home;