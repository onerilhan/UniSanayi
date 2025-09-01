import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  return (
    <nav style={{height:64, background:'#ffffff', borderBottom:'1px solid #e5e7eb', position:'sticky', top:0, zIndex:50}}>
      <div className="container" style={{display:'flex', alignItems:'center', justifyContent:'space-between', height:'100%'}}>
        <Link to="/" style={{ textDecoration:'none', fontWeight:700, fontSize:20, color:'#2563eb' }}>UniSanayi</Link>
        <div style={{ display:'flex', gap:16 }}>
          <Link to="/" style={{ textDecoration:'none', color:'#0f172a' }}>Ana Sayfa</Link>
          <Link to="/login" style={{ textDecoration:'none', color:'#0f172a', border:'1px solid #e2e8f0', padding:'8px 14px', borderRadius:10 }}>Giriş</Link>
          <button onClick={()=>navigate('/register')} style={{ border:'none', background:'#2563eb', color:'#fff', padding:'8px 14px', borderRadius:10, fontWeight:600, cursor:'pointer' }}>
            Kayıt Ol
          </button>
        </div>
      </div>
    </nav>
  );
}
