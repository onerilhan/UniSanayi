import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/Header';

const StudentDashboard: React.FC = () => {
  const { user, student } = useAuth();

  return (
    <>
      <Header />
      <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', padding: '20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h1 style={{ color: '#1a202c', marginBottom: '10px' }}>
              Hoş Geldin, {student?.firstName} {student?.lastName}! 👨‍🎓
            </h1>
            <p style={{ color: '#4a5568', fontSize: '16px', marginBottom: '20px' }}>
              {student?.university} - {student?.department}
            </p>
            <div style={{ 
              display: 'inline-block',
              padding: '8px 16px',
              backgroundColor: student?.isAvailable ? '#d4edda' : '#f8d7da',
              color: student?.isAvailable ? '#155724' : '#721c24',
              borderRadius: '6px',
              border: student?.isAvailable ? '1px solid #c3e6cb' : '1px solid #f5c6cb',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              {student?.isAvailable ? '✅ Müsait' : '❌ Müsait Değil'}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {/* Başvurularım Card */}
            <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                <span style={{ fontSize: '24px', marginRight: '10px' }}>📄</span>
                <h3 style={{ color: '#1a202c', margin: 0 }}>Başvurularım</h3>
              </div>
              <p style={{ color: '#4a5568', marginBottom: '20px' }}>Başvuru yaptığınız projeleri görüntüleyin ve durumlarını takip edin.</p>
              <button style={{
                padding: '10px 20px',
                backgroundColor: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
                width: '100%'
              }}>
                Başvurularımı Görüntüle
              </button>
              <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f7fafc', borderRadius: '4px', fontSize: '14px', color: '#4a5568' }}>
                <strong>0</strong> aktif başvuru
              </div>
            </div>

            {/* Profilim Card */}
            <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                <span style={{ fontSize: '24px', marginRight: '10px' }}>👤</span>
                <h3 style={{ color: '#1a202c', margin: 0 }}>Profilim</h3>
              </div>
              <p style={{ color: '#4a5568', marginBottom: '20px' }}>Kişisel bilgilerinizi güncelleyin ve yetkinliklerinizi ekleyin.</p>
              <button style={{
                padding: '10px 20px',
                backgroundColor: '#48bb78',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
                width: '100%'
              }}>
                Profili Düzenle
              </button>
              <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f0fff4', borderRadius: '4px', fontSize: '14px', color: '#22543d' }}>
                Profil tamamlanma: <strong>75%</strong>
              </div>
            </div>

            {/* Yetkinliklerim Card */}
            <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                <span style={{ fontSize: '24px', marginRight: '10px' }}>🎯</span>
                <h3 style={{ color: '#1a202c', margin: 0 }}>Yetkinliklerim</h3>
              </div>
              <p style={{ color: '#4a5568', marginBottom: '20px' }}>Yetkinliklerinizi ekleyin ve seviyenizi belirtin.</p>
              <button style={{
                padding: '10px 20px',
                backgroundColor: '#ed8936',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
                width: '100%'
              }}>
                Yetkinlik Ekle
              </button>
              <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#fef5e7', borderRadius: '4px', fontSize: '14px', color: '#7c2d12' }}>
                <strong>0</strong> yetkinlik eklendi
              </div>
            </div>

            {/* Önerilen Projeler Card */}
            <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                <span style={{ fontSize: '24px', marginRight: '10px' }}>🌟</span>
                <h3 style={{ color: '#1a202c', margin: 0 }}>Önerilen Projeler</h3>
              </div>
              <p style={{ color: '#4a5568', marginBottom: '20px' }}>Size uygun projeler ve fırsatlar.</p>
              <button style={{
                padding: '10px 20px',
                backgroundColor: '#9f7aea',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
                width: '100%'
              }}>
                Projeleri Keşfet
              </button>
              <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#faf5ff', borderRadius: '4px', fontSize: '14px', color: '#553c9a' }}>
                <strong>5</strong> önerilen proje
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px', marginTop: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3 style={{ color: '#1a202c', marginBottom: '20px' }}>📊 Hızlı İstatistikler</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#edf2f7', borderRadius: '6px' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#667eea' }}>0</div>
                <div style={{ fontSize: '14px', color: '#4a5568' }}>Toplam Başvuru</div>
              </div>
              <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#f0fff4', borderRadius: '6px' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#48bb78' }}>0</div>
                <div style={{ fontSize: '14px', color: '#4a5568' }}>Kabul Edilen</div>
              </div>
              <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#fffbeb', borderRadius: '6px' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ed8936' }}>0</div>
                <div style={{ fontSize: '14px', color: '#4a5568' }}>Bekleyen</div>
              </div>
              <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#fef5e7', borderRadius: '6px' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#d69e2e' }}>0</div>
                <div style={{ fontSize: '14px', color: '#4a5568' }}>Profil Görüntülenme</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentDashboard;