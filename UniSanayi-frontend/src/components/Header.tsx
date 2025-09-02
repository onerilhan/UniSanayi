import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  onSearch?: (searchTerm: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { isAuthenticated, user, student, company, logout } = useAuth();
  const navigate = useNavigate();

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchTerm);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const getDashboardLink = () => {
    return user?.userType === 'Student' ? '/student' : '/company';
  };

  const getUserDisplayName = () => {
    if (user?.userType === 'Student' && student) {
      return `${student.firstName} ${student.lastName}`;
    }
    if (user?.userType === 'Company' && company) {
      return company.companyName;
    }
    return user?.email || 'Kullanıcı';
  };

  return (
    <header style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '60px 20px',
      color: 'white',
      textAlign: 'center'
    }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
          <h2 style={{ margin: 0 }}>UniSanayi</h2>
        </Link>

        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <Link 
            to="/" 
            style={{ 
              padding: '8px 16px', 
              background: 'transparent', 
              color: 'white', 
              border: '1px solid white', 
              borderRadius: '6px', 
              textDecoration: 'none', 
              display: 'inline-block',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Ana Sayfa
          </Link>

          {isAuthenticated ? (
            <>
              <Link 
                to={getDashboardLink()} 
                style={{ 
                  padding: '8px 16px', 
                  background: 'transparent', 
                  color: 'white', 
                  border: '1px solid white', 
                  borderRadius: '6px', 
                  textDecoration: 'none', 
                  display: 'inline-block',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                Dashboard
              </Link>

              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                padding: '8px 16px', 
                background: 'rgba(255,255,255,0.1)', 
                borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.3)'
              }}>
                <span style={{ fontSize: '14px', opacity: 0.9 }}>
                  {user?.userType === 'Student' ? '👨‍🎓' : '🏢'} {getUserDisplayName()}
                </span>
              </div>

              <button
                onClick={handleLogout}
                style={{ 
                  padding: '8px 16px', 
                  background: '#e53e3e', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '6px', 
                  fontWeight: 'bold', 
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#c53030';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#e53e3e';
                }}
              >
                Çıkış Yap
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                style={{ 
                  padding: '8px 16px', 
                  background: 'transparent', 
                  color: 'white', 
                  border: '1px solid white', 
                  borderRadius: '6px', 
                  textDecoration: 'none', 
                  display: 'inline-block',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                Giriş
              </Link>
              <Link 
                to="/register" 
                style={{ 
                  padding: '8px 16px', 
                  background: 'white', 
                  color: '#667eea', 
                  border: 'none', 
                  borderRadius: '6px', 
                  textDecoration: 'none', 
                  fontWeight: 'bold', 
                  display: 'inline-block',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                }}
              >
                Kayıt Ol
              </Link>
            </>
          )}
        </div>
      </nav>
      
      <h1 style={{ fontSize: '3rem', marginBottom: '10px', fontWeight: 'bold' }}>
        Üniversite-Sanayi İşbirliği
      </h1>
      <p style={{ fontSize: '1.2rem', opacity: 0.9, marginBottom: '30px' }}>
        Öğrenciler ve şirketler arasında köprü kuran platform
      </p>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', maxWidth: '600px', margin: '0 auto' }}>
        <input
          type="text"
          placeholder="Proje ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          style={{ 
            flex: 1, 
            padding: '12px 16px', 
            border: 'none', 
            borderRadius: '6px',
            fontSize: '16px',
            outline: 'none'
          }}
        />
        <button 
          onClick={handleSearch}
          style={{ 
            padding: '12px 24px', 
            background: '#f8f9fa', 
            color: '#495057', 
            border: 'none', 
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#e9ecef';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#f8f9fa';
          }}
        >
          Ara
        </button>
      </div>
    </header>
  );
};

export default Header;