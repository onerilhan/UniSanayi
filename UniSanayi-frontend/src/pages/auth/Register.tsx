import React from 'react';
import { Link } from 'react-router-dom';

const Register: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9fa' }}>
      <div style={{ maxWidth: '500px', width: '100%', padding: '40px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <Link to="/" style={{ textDecoration: 'none', color: '#667eea', fontSize: '24px', fontWeight: 'bold' }}>
            UniSanayi
          </Link>
          <h2 style={{ color: '#1a202c', marginTop: '10px' }}>Kayıt Ol</h2>
          <p style={{ color: '#718096' }}>Hesap türünüzü seçin</p>
        </div>

        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ flex: 1, padding: '30px', border: '2px solid #e2e8f0', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s' }}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>🎓</div>
            <h3 style={{ color: '#1a202c', marginBottom: '10px' }}>Öğrenci</h3>
            <p style={{ color: '#718096', fontSize: '14px' }}>Projelere başvur ve deneyim kazan</p>
          </div>

          <div style={{ flex: 1, padding: '30px', border: '2px solid #e2e8f0', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s' }}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>🏢</div>
            <h3 style={{ color: '#1a202c', marginBottom: '10px' }}>Şirket</h3>
            <p style={{ color: '#718096', fontSize: '14px' }}>Proje oluştur ve yetenekli öğrenciler bul</p>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <span style={{ color: '#718096' }}>Zaten hesabınız var mı? </span>
          <Link to="/login" style={{ color: '#667eea', textDecoration: 'none', fontWeight: 'bold' }}>
            Giriş Yap
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;