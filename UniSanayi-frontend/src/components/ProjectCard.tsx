import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Project } from '../types/Project';

export default function ProjectCard({ project }: { project: Project }) {
  const navigate = useNavigate();

  const handleDetailClick = () => {
    navigate(`/project/${project.id}`);
  };

  return (
    <div style={{ 
      background: '#fff', 
      border: '1px solid #e5e7eb', 
      borderRadius: 16, 
      padding: 16,
      marginBottom: 16,
      cursor: 'pointer',
      transition: 'transform 0.2s, box-shadow 0.2s'
    }}
    onMouseOver={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    }}
    onMouseOut={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
    }}
    onClick={handleDetailClick}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{project.title}</div>
          <div style={{ color: '#64748b', fontSize: 14 }}>{project.companyName}</div>
        </div>
        <span style={{ 
          fontSize: 12, 
          padding: '4px 8px', 
          borderRadius: 999, 
          background: '#ecfdf5', 
          color: '#065f46', 
          border: '1px solid #d1fae5' 
        }}>
          Aktif
        </span>
      </div>
      
      <p style={{ color: '#334155', margin: '8px 0 12px' }}>
        {project.projectType} — {project.durationDays} gün
      </p>
      
      <div style={{ display: 'flex', gap: 16, color: '#475569', fontSize: 14 }}>
        <span>📍 {project.locationCity || 'Belirtilmemiş'}</span>
        <span>💰 {project.budgetAmount?.toLocaleString('tr-TR') || 'Belirtilmemiş'} {project.currency || 'TL'}</span>
        <span>👁️ {project.viewCount} görüntülenme</span>
      </div>
      
      <div style={{ marginTop: 12, textAlign: 'right' }}>
        <button 
          onClick={(e) => {
            e.stopPropagation(); // Parent onClick'i engelle
            handleDetailClick();
          }}
          style={{ 
            padding: '10px 14px', 
            borderRadius: 12, 
            border: 'none', 
            background: '#1e293b', 
            color: '#fff', 
            fontWeight: 700, 
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#334155';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#1e293b';
          }}
        >
          Detay Gör
        </button>
      </div>
    </div>
  );
}