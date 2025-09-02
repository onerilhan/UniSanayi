import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/Header';

const CompanyDashboard: React.FC = () => {
  const { user, company } = useAuth();

  return (
    <>
      <Header />
      <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', padding: '20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h1 style={{ color: '#1a202c', marginBottom: '10px' }}>
              Hoş Geldiniz, {company?.companyName}! 🏢
            </h1>
            <p style={{ color: '#4a5568', fontSize: '16px', marginBottom: '20px' }}>
              {company?.industry && `${company.industry} sektörü`}
            </p>
            <div style={{ 
              display: 'inline-block',
              padding: '8px 16px',
              backgroundColor: company?.isVerified ? '#d4edda' : '#fff3cd',
              color: company?.isVerified ? '#155724' : '#856404',
              borderRadius: '6px',
              border: company?.isVerified ? '1px solid #c3e6cb' : '1px solid #ffeaa7',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              {company?.isVerified ? '✅ Doğrulanmış Şirket' : '⏳ Doğrulama Bekleniyor'}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {/* Yeni Proje Oluştur Card */}
            <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                <span style={{ fontSize: '24px', marginRight: '10px' }}>➕</span>
                <h3 style={{ color: '#1a202c', margin: 0 }}>Yeni Proje</h3>
              </div>
              <p style={{ color: '#4a5568', marginBottom: '20px' }}>Yeni proje oluşturun ve yetenekli öğrencilerle buluşun.</p>
              <button style={{
                padding: '12px 24px',
                backgroundColor: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
                width: '100%',
                fontSize: '16px'
              }}>
                Proje Oluştur
              </button>
            </div>

            {/* Projelerim Card */}
            <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                <span style={{ fontSize: '24px', marginRight: '10px' }}>📋</span>
                <h3 style={{ color: '#1a202c', margin: 0 }}>Projelerim</h3>
              </div>
              <p style={{ color: '#4a5568', marginBottom: '20px' }}>Mevcut projelerinizi yönetin ve düzenleyin.</p>
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
                Projeleri Görüntüle
              </button>
              <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f0fff4', borderRadius: '4px', fontSize: '14px', color: '#22543d' }}>
                <strong>0</strong> aktif proje
              </div>
            </div>

            {/* Başvurular Card */}
            <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                <span style={{ fontSize: '24px', marginRight: '10px' }}>👥</span>
                <h3 style={{ color: '#1a202c', margin: 0 }}>Başvurular</h3>
              </div>
              <p style={{ color: '#4a5568', marginBottom: '20px' }}>Projelerinize gelen başvuruları inceleyin ve değerlendirin.</p>
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
                Başvuruları İncele
              </button>
              <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#fef5e7', borderRadius: '4px', fontSize: '14px', color: '#7c2d12' }}>
                <strong>0</strong> yeni başvuru
              </div>
            </div>

            {/* Şirket Profili Card */}
            <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                <span style={{ fontSize: '24px', marginRight: '10px' }}>🏢</span>
                <h3 style={{ color: '#1a202c', margin: 0 }}>Şirket Profili</h3>
              </div>
              <p style={{ color: '#4a5568', marginBottom: '20px' }}>Şirket bilgilerinizi güncelleyin ve profilinizi güçlendirin.</p>
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
                Profili Düzenle
              </button>
              <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#faf5ff', borderRadius: '4px', fontSize: '14px', color: '#553c9a' }}>
                Profil tamamlanma: <strong>85%</strong>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px', marginTop: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3 style={{ color: '#1a202c', marginBottom: '20px' }}>📊 Şirket İstatistikleri</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#edf2f7', borderRadius: '6px' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#667eea' }}>0</div>
                <div style={{ fontSize: '14px', color: '#4a5568' }}>Toplam Proje</div>
              </div>
              <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#f0fff4', borderRadius: '6px' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#48bb78' }}>0</div>
                <div style={{ fontSize: '14px', color: '#4a5568' }}>Aktif Proje</div>
              </div>
              <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#fffbeb', borderRadius: '6px' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ed8936' }}>0</div>
                <div style={{ fontSize: '14px', color: '#4a5568' }}>Toplam Başvuru</div>
              </div>
              <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#fef5e7', borderRadius: '6px' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#d69e2e' }}>0</div>
                <div style={{ fontSize: '14px', color: '#4a5568' }}>Tamamlanan Proje</div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px', marginTop: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3 style={{ color: '#1a202c', marginBottom: '20px' }}>🕒 Son Aktiviteler</h3>
            <div style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
              <p>Henüz aktivite bulunmuyor.</p>
              <p style={{ fontSize: '14px' }}>İlk projenizi oluşturun ve öğrencilerle buluşmaya başlayın!</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CompanyDashboard;