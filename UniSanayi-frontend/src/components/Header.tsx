import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  onSearch?: (searchTerm: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

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
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/" style={{ padding: '8px 16px', background: 'transparent', color: 'white', border: '1px solid white', borderRadius: '6px', textDecoration: 'none', display: 'inline-block' }}>
            Ana Sayfa
          </Link>
          <Link to="/login" style={{ padding: '8px 16px', background: 'transparent', color: 'white', border: '1px solid white', borderRadius: '6px', textDecoration: 'none', display: 'inline-block' }}>
            Giriş
          </Link>
          <Link to="/register" style={{ padding: '8px 16px', background: 'white', color: '#667eea', border: 'none', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', display: 'inline-block' }}>
            Kayıt Ol
          </Link>
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
            fontSize: '16px'
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
            fontWeight: 'bold'
          }}
        >
          Ara
        </button>
      </div>
    </header>
  );
};

export default Header;